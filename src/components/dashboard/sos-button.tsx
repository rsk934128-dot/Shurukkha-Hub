"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ShieldAlert, Loader2, Video, VideoOff, PhoneOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { DisasterStorage } from '@/lib/disaster-storage'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { Badge } from '@/components/ui/badge'

export function SOSButton() {
  const [isActivating, setIsActivating] = useState(false)
  const [activeSosId, setActiveSosId] = useState<string | null>(null)
  const [isCalling, setIsCalling] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream])

  // Cleanup on unmount or SOS reset
  useEffect(() => {
    return () => {
      endCall();
    }
  }, [])

  const handleSOS = async () => {
    setIsActivating(true)
    
    let userLocation = null;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (e) {
      console.warn("Could not get precise location for SOS.");
    }

    const sosData = {
      timestamp: serverTimestamp(),
      location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "অজ্ঞাত স্থান",
      coordinates: userLocation,
      status: 'pending',
      type: 'জরুরি উদ্ধার প্রয়োজন (Emergency SOS)',
      reporterId: 'citizen_node_' + Math.random().toString(36).substring(7)
    }

    try {
      const docRef = await addDoc(collection(db, "sos_alerts"), sosData);
      setActiveSosId(docRef.id);
      
      toast({
        title: "জরুরি সংকেত পাঠানো হয়েছে",
        description: "সাহায্য আসছে। এখন আপনি সরাসরি ভিডিও কল শুরু করতে পারেন।",
        variant: "destructive",
      })
    } catch (error) {
      console.error("SOS Sync Error:", error);
      DisasterStorage.setSOS(true);
      toast({
        title: "অফলাইন মোডে সংরক্ষিত",
        variant: "destructive",
      })
    } finally {
      setIsActivating(false)
    }
  }

  const startLiveCall = async () => {
    if (!activeSosId) return;
    setIsCalling(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      webrtcRef.current = new WebRTCManager(activeSosId);
      await webrtcRef.current.createCall(stream, (remote) => {
        console.log("[SOS Call] Remote stream received");
      });

      toast({ title: "লাইভ ভিডিও ফিড শুরু হয়েছে" });
    } catch (e) {
      setIsCalling(false);
      toast({ title: "ক্যামেরা এক্সেস করা সম্ভব হয়নি", variant: "destructive" });
    }
  }

  const endCall = () => {
    // Explicitly stop hardware tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`[SOS Kill-Switch] Hardware track stopped: ${track.kind}`);
      });
      setLocalStream(null);
    }
    
    webrtcRef.current?.dispose();
    setIsCalling(false);
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-destructive/20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-destructive/5 group-hover:bg-destructive/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        {!activeSosId ? (
          <div className="relative">
            <div className="absolute inset-0 bg-destructive rounded-full blur-2xl opacity-20 animate-sos-pulse" />
            <Button 
              onClick={handleSOS} 
              disabled={isActivating}
              className={`w-32 h-32 rounded-full border-8 border-background bg-destructive hover:bg-destructive/90 transition-all flex flex-col gap-1 items-center justify-center shadow-2xl ${isActivating ? 'scale-95 opacity-80' : 'animate-sos-pulse'}`}
            >
              {isActivating ? <Loader2 size={48} className="text-white animate-spin" /> : <ShieldAlert size={48} className="text-white" />}
              <span className="font-headline font-bold text-xl tracking-tighter text-white">SOS</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold uppercase">সংকেত পাঠানো হয়েছে</span>
            </div>

            {isCalling ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-2xl border-2 border-accent overflow-hidden relative">
                   <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                   <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse text-[8px]">LIVE_FEED</Badge>
                </div>
                <Button onClick={endCall} variant="destructive" className="w-full h-12 gap-2 rounded-xl font-bold">
                  <PhoneOff size={18} /> কল শেষ করুন
                </Button>
              </div>
            ) : (
              <Button onClick={startLiveCall} className="w-full h-16 bg-accent text-background hover:bg-accent/90 gap-3 rounded-2xl shadow-lg shadow-accent/20 font-bold text-lg animate-pulse">
                <Video size={24} /> লাইভ ভিডিও স্ট্রিমিং শুরু করুন
              </Button>
            )}
            
            <Button variant="ghost" onClick={() => { endCall(); setActiveSosId(null); }} className="w-full text-[10px] uppercase font-bold text-muted-foreground">
              নতুন সংকেত পাঠান
            </Button>
          </div>
        )}
        
        {!activeSosId && (
          <div className="text-center">
            <h3 className="text-xl font-headline font-bold text-destructive">জরুরি সহায়তা</h3>
            <p className="text-sm text-muted-foreground font-body leading-none mt-1">সাহায্যের জন্য এখানে টিপুন</p>
          </div>
        )}
      </div>
    </div>
  )
}