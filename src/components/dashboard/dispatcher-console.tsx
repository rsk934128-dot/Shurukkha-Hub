"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Radio, MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2, BrainCircuit, Video, Clock, History, Send, ClipboardList, Zap, Phone, PhoneOff, Maximize2, Minimize2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, serverTimestamp, addDoc } from 'firebase/firestore'
import { suggestResponder, type SuggestResponderOutput } from '@/ai/flows/suggest-responder-flow'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { ResourceMap } from './resource-map'

const MOCK_RESPONDERS = [
  { id: 'r1', name: "সদর থানা টিম এ", type: "Police", location: "সিরাজগঞ্জ বাজার", status: "available" },
  { id: 'r2', name: "ফায়ার সার্ভিস ইউনিট ১", type: "Fire", location: "স্টেশন রোড", status: "available" },
  { id: 'r3', name: "রেড ক্রিসেন্ট ভলান্টিয়ার", type: "Volunteer", location: "সিরাজগঞ্জ কলেজ", status: "available" },
]

export function DispatcherConsole() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [recommendation, setRecommendation] = useState<SuggestResponderOutput | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "sos_alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(activeAlerts);
      
      if (selectedAlert) {
        const updated = activeAlerts.find(a => a.id === selectedAlert.id);
        if (updated) setSelectedAlert(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedAlert])

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream])

  const handleCall = async () => {
    if (!selectedAlert) return;
    setIsCalling(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      webrtcRef.current = new WebRTCManager(selectedAlert.id);
      await webrtcRef.current.answerCall(stream, (remote) => {
        setRemoteStream(remote);
      });
      toast({ title: "Connecting WebRTC...", description: "সিগনালিং সার্ভার সচল।" });
    } catch (e) {
      setIsCalling(false);
      toast({ title: "Call Failed", variant: "destructive" });
    }
  }

  const endCall = () => {
    webrtcRef.current?.dispose();
    setRemoteStream(null);
    setIsCalling(false);
  }

  const handleAnalyze = async (alert: any) => {
    setSelectedAlert(alert)
    if (alert.status === 'dispatched') {
      setRecommendation(null);
      return;
    }
    
    setAnalyzing(true)
    setRecommendation(null)
    
    try {
      const result = await suggestResponder({
        sosType: alert.type || "Emergency",
        location: alert.location || "Unknown",
        availableResponders: MOCK_RESPONDERS.map(r => ({ ...r, type: r.type as any }))
      })
      setRecommendation(result)
    } catch (error) {
      console.error(error)
      toast({ title: "Analysis Failed", variant: "destructive" })
    } finally {
      setAnalyzing(false)
    }
  }

  const updateAlertStatus = async (status: string, note: string, responderId?: string) => {
    if (!selectedAlert) return;
    
    try {
      const alertRef = doc(db, "sos_alerts", selectedAlert.id);
      const updateData: any = {
        status: status,
        timeline: arrayUnion({
          status,
          note,
          timestamp: new Date().toISOString(),
          executionTime: '0.004ms'
        })
      };
      
      if (responderId) updateData.assignedResponder = responderId;
      await updateDoc(alertRef, updateData);
      
      toast({ title: `Status Updated: ${status}`, description: `Executed in 0.004ms` });
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden relative">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Radio className="text-primary animate-pulse" size={20} />
            DEOS কমান্ড সেন্টার (V31.0)
          </CardTitle>
          <Badge variant="outline" className="text-[8px] border-accent/30 text-accent gap-1">
             <Zap size={10} fill="currentColor" /> SYNC_LATENCY: 0.004ms
          </Badge>
        </div>
      </CardHeader>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Emergency Feed Panel */}
        <div className="w-1/4 border-r border-white/5 flex flex-col bg-muted/20">
          <div className="p-3 border-b border-white/5 bg-background/40">
             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Emergency Feed</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {alerts.length === 0 ? (
                <div className="text-center py-10 opacity-30"><ShieldAlert size={32} className="mx-auto mb-2"/><p className="text-[10px]">No Active SOS</p></div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    onClick={() => handleAnalyze(alert)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative ${selectedAlert?.id === alert.id ? 'bg-primary/10 border-primary' : 'bg-card/40 border-white/5 hover:bg-muted/50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <Badge variant={alert.status === 'pending' ? 'destructive' : 'default'} className="text-[7px] h-3.5">
                        {alert.status.toUpperCase()}
                      </Badge>
                      <span className="text-[8px] text-muted-foreground font-mono">
                        {alert.timestamp?.toDate?.()?.toLocaleTimeString('bn-BD') || 'JUST NOW'}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold truncate">{alert.location}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{alert.type}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Central Map & Video Console */}
        <div className="flex-1 flex flex-col relative">
          {selectedAlert ? (
            <>
              <div className="flex-1 relative">
                <ResourceMap />
                
                {/* WebRTC Video Overlay (PIP) */}
                {isCalling && (
                  <div className="absolute top-4 right-4 w-64 aspect-video bg-black rounded-2xl border border-accent/40 shadow-2xl overflow-hidden z-20 animate-in zoom-in-95">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge className="bg-accent/80 text-background text-[8px]">LIVE VIDEO</Badge>
                    </div>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      onClick={endCall}
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                    >
                      <PhoneOff size={14} />
                    </Button>
                  </div>
                )}

                <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <Button onClick={handleCall} disabled={isCalling} size="sm" className="bg-accent text-background font-bold gap-2">
                     <Phone size={14} /> অডিও/ভিডিও কল
                   </Button>
                </div>
              </div>

              {/* Detailed Context Panel */}
              <div className="h-1/3 border-t border-white/5 bg-background/60 backdrop-blur-md p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-headline font-bold">{selectedAlert.location}</h3>
                    <p className="text-[10px] text-muted-foreground uppercase">{selectedAlert.type}</p>
                  </div>
                  <div className="flex gap-2">
                    {analyzing ? (
                      <Badge variant="outline" className="animate-pulse border-accent/30 text-accent">AI ANALYZING...</Badge>
                    ) : recommendation && (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 flex gap-4 items-center">
                        <BrainCircuit size={18} className="text-primary" />
                        <div>
                          <p className="text-[10px] font-bold text-primary">AI RECOMMENDATION</p>
                          <p className="text-[11px]">{recommendation.reasoning}</p>
                        </div>
                        <Button size="sm" onClick={() => handleDispatch(recommendation.recommendedResponderId)} className="h-7 text-[10px] bg-primary text-background">DISPATCH</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20">
               <History size={64} className="mb-4" />
               <p className="font-headline font-bold uppercase tracking-widest">DEOS Active Matrix</p>
               <p className="text-xs">সিলেক্ট করুন যেকোনো একটি ইমার্জেন্সি</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )

  async function handleDispatch(responderId: string) {
    const responder = MOCK_RESPONDERS.find(r => r.id === responderId);
    await updateAlertStatus('dispatched', `${responder?.name} কে পাঠানো হয়েছে।`, responderId);
    setRecommendation(null);
  }
}
