"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ShieldAlert, Loader2, Video, VideoOff, PhoneOff, CheckCircle2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc, onSnapshot, deleteDoc, updateDoc } from 'firebase/firestore'
import { DisasterStorage } from '@/lib/disaster-storage'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { Badge } from '@/components/ui/badge'

export function SOSButton() {
  const [isActivating, setIsActivating] = useState(false)
  const [activeSosId, setActiveSosId] = useState<string | null>(null)
  const [isCalling, setIsCalling] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  
  const { toast } = useToast()

  /**
   * CRITICAL: Aggressive hardware purge for SOS grid.
   */
  const cleanupStreams = () => {
    console.warn("[SOS Grid] Executing high-priority hardware resource purge...");
    
    // 1. Reset video UI
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // 2. Kill local tracks
    if (localStreamRef.current) {
      WebRTCManager.stopMediaStream(localStreamRef.current);
      localStreamRef.current = null;
    }
    
    // 3. Dispose manager
    if (webrtcRef.current) {
      webrtcRef.current.dispose();
      webrtcRef.current = null;
    }
    
    setIsCalling(false);
    console.log("[SOS Grid] Purge success.");
  }

  useEffect(() => {
    if (activeSosId) {
      const sessionRef = doc(db, 'webrtc_sessions', activeSosId);
      const unsubscribe = onSnapshot(sessionRef, (snap) => {
        if (!snap.exists() || snap.data()?.status === 'ended') {
          cleanupStreams();
        }
      });
      return () => {
        unsubscribe();
        cleanupStreams();
      };
    }
  }, [activeSosId]);

  const handleSOS = async () => {
    setIsActivating(true)
    let userLocation = null;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
    } catch (e) {}

    const sosData = {
      timestamp: serverTimestamp(),
      location: userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "অজ্ঞাত স্থান",
      status: 'pending',
      type: 'Emergency SOS',
      reporterId: 'citizen_' + Math.random().toString(36).substring(7)
    }

    try {
      const docRef = await addDoc(collection(db, "sos_alerts"), sosData);
      setActiveSosId(docRef.id);
      toast({ title: "জরুরি সংকেত পাঠানো হয়েছে", variant: "destructive" });
    } catch (error) {
      DisasterStorage.setSOS(true);
      toast({ title: "অফলাইন মোডে সংরক্ষিত", variant: "destructive" });
    } finally {
      setIsActivating(false)
    }
  }

  const startLiveCall = async () => {
    if (!activeSosId) return;
    setIsCalling(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: WebRTCManager.getAudioConstraints() 
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      webrtcRef.current = new WebRTCManager(activeSosId);
      await webrtcRef.current.createCall(stream, (remote) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remote;
        }
      });
      toast({ title: "লাইভ ভিডিও HUD সক্রিয়" });
    } catch (e) {
      setIsCalling(false);
      toast({ title: "ক্যামেরা ত্রুটি", variant: "destructive" });
    }
  }

  const endCall = async () => {
    if (activeSosId) {
      const sessionRef = doc(db, 'webrtc_sessions', activeSosId);
      try {
        await updateDoc(sessionRef, { status: 'ended' });
      } catch(e) {}
    }
    cleanupStreams();
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border border-destructive/20 rounded-2xl relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        {!activeSosId ? (
          <Button 
            onClick={handleSOS} 
            disabled={isActivating}
            className={`w-32 h-32 rounded-full border-8 border-background bg-destructive hover:bg-destructive/90 transition-all shadow-2xl ${isActivating ? 'scale-95' : 'animate-sos-pulse'}`}
          >
            {isActivating ? <Loader2 size={48} className="animate-spin" /> : <ShieldAlert size={48} />}
            <span className="font-headline font-bold text-xl text-white">SOS</span>
          </Button>
        ) : (
          <div className="space-y-4 w-full">
            <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500">
              <CheckCircle2 size={20} />
              <span className="text-xs font-bold uppercase">Signal Dispatched</span>
            </div>

            {isCalling ? (
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-2xl border-2 border-accent overflow-hidden relative">
                   <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                   <div className="absolute bottom-3 right-3 w-24 aspect-video bg-black rounded-lg border border-white/20 overflow-hidden">
                      <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                   </div>
                   <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse text-[8px] h-4 uppercase">Live Recon</Badge>
                </div>
                <Button onClick={endCall} variant="destructive" className="w-full h-12 gap-2 rounded-xl font-bold shadow-lg">
                  <PhoneOff size={18} /> কল শেষ করুন
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button onClick={startLiveCall} className="w-full h-16 bg-accent text-background hover:bg-accent/90 gap-3 rounded-2xl shadow-lg font-bold text-lg animate-pulse">
                  <Video size={24} /> ভিডিও রিকন শুরু করুন
                </Button>
                <Button variant="ghost" onClick={() => { cleanupStreams(); setActiveSosId(null); }} className="w-full h-10 border border-white/5 rounded-xl text-[10px] uppercase font-bold text-muted-foreground hover:bg-white/5">
                  নতুন সংকেত পাঠান (Reset)
                </Button>
              </div>
            )}
          </div>
        )}
        {!activeSosId && (
          <div className="text-center">
            <h3 className="text-xl font-headline font-bold text-destructive uppercase tracking-tighter">Emergency Assist</h3>
            <p className="text-xs text-muted-foreground mt-1 italic">এক ক্লিকে সাহায্য পৌঁছাবে আপনার কাছে</p>
          </div>
        )}
      </div>
    </div>
  )
}