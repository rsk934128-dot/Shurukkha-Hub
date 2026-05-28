"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Radio, MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2, BrainCircuit, Video, Clock, History, Send, ClipboardList, Zap, Phone, PhoneOff, Maximize2, Minimize2, Activity, Target, LayoutDashboard, Database, ShieldCheck, MessageSquare, Globe, Volume2, Mic, Settings } from 'lucide-react'
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
import { CommunicationConsole } from './communication-console'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MediaControls } from './media-controls'
import { useAudioEngine } from '@/hooks/use-audio-engine'

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
  const [activeTab, setActiveTab] = useState<'map' | 'comm'>('map')
  const videoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const lastAlertId = useRef<string | null>(null)
  
  const { toast } = useToast()
  const { playAlertSound } = useAudioEngine()

  useEffect(() => {
    const q = query(collection(db, "sos_alerts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (activeAlerts.length > 0 && activeAlerts[0].id !== lastAlertId.current) {
        if (activeAlerts[0].status === 'pending') {
          playAlertSound();
          toast({ title: "নতুন জরুরি সংকেত!", variant: "destructive" });
        }
        lastAlertId.current = activeAlerts[0].id;
      }

      setAlerts(activeAlerts);
      
      if (selectedAlert) {
        const updated = activeAlerts.find(a => a.id === selectedAlert.id);
        if (updated) setSelectedAlert(updated);
      }
    });
    return () => {
      unsubscribe();
      endCall();
    };
  }, [selectedAlert, playAlertSound, toast])

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
      localStreamRef.current = stream;
      webrtcRef.current = new WebRTCManager(selectedAlert.id);
      await webrtcRef.current.answerCall(stream, (remote) => {
        setRemoteStream(remote);
      });
    } catch (e) {
      setIsCalling(false);
      toast({ title: "Encryption Failed", variant: "destructive" });
    }
  }

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
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
      toast({ title: "AI Strategy Error", variant: "destructive" })
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
          executionTime: '0.004ms',
          purity: 'VERIFIED_IMPERIAL'
        })
      };
      
      if (responderId) updateData.assignedResponder = responderId;
      await updateDoc(alertRef, updateData);
      toast({ title: `Command Executed: ${status.toUpperCase()}` });
    } catch (error) { console.error(error); }
  }

  return (
    <div className={`h-full flex flex-col gap-4 md:gap-6 transition-all duration-1000 ${isCalling ? 'call-active-glow' : 'animate-in fade-in'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-full min-h-0">
        
        {/* Left: Emergency Feed - Optimized for scroll on mobile */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6 flex flex-col min-h-0 order-2 lg:order-1">
           <Card className="bg-card/40 border-primary/20 flex flex-col flex-1 overflow-hidden neon-glow-primary min-h-[300px] lg:min-h-[400px]">
              <CardHeader className="bg-primary/10 border-b border-white/5 py-2 md:py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] md:text-xs font-headline flex items-center gap-2 uppercase tracking-widest neon-text-primary">
                  <Activity className="w-3 h-3 md:w-[14px] md:h-[14px] animate-pulse" /> Live_Feed
                </CardTitle>
                <Badge variant="outline" className="text-[6px] md:text-[7px] border-primary/40 text-primary">{alerts.length} ACTIVE</Badge>
              </CardHeader>
              <ScrollArea className="flex-1 bg-black/20">
                <div className="p-2 md:p-3 space-y-2 md:space-y-3">
                   {alerts.map((alert) => (
                     <div 
                       key={alert.id} 
                       onClick={() => handleAnalyze(alert)}
                       className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all cursor-pointer relative group ${selectedAlert?.id === alert.id ? 'bg-primary/20 border-primary ring-1 ring-primary/40' : 'bg-card/60 border-white/5 hover:border-primary/40'}`}
                     >
                        <div className="flex justify-between items-start mb-1 md:mb-2">
                           <Badge className={`text-[6px] md:text-[7px] h-3 md:h-4 uppercase font-bold ${alert.status === 'pending' ? 'bg-destructive animate-pulse' : 'bg-accent text-background'}`}>
                              {alert.status}
                           </Badge>
                           <span className="text-[7px] md:text-[8px] font-mono text-muted-foreground">[{alert.timestamp?.toDate ? alert.timestamp.toDate().toLocaleTimeString() : '0.00s'}]</span>
                        </div>
                        <p className="text-[10px] md:text-[11px] font-bold text-foreground line-clamp-1">{alert.location}</p>
                        <p className="text-[8px] md:text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{alert.type}</p>
                     </div>
                   ))}
                </div>
              </ScrollArea>
           </Card>
        </div>

        {/* Center: Strategic Panel - Higher visibility on mobile */}
        <div className="lg:col-span-6 flex flex-col min-h-[400px] md:min-h-0 order-1 lg:order-2">
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-black/40 border border-white/5 p-1 h-9 md:h-10 rounded-xl md:rounded-2xl">
                <TabsTrigger value="map" className="text-[8px] md:text-[10px] gap-1.5 md:gap-2 rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-background font-bold uppercase tracking-widest px-3 md:px-4">
                  <Globe size={12} /> Map
                </TabsTrigger>
                <TabsTrigger value="comm" className="text-[8px] md:text-[10px] gap-1.5 md:gap-2 rounded-lg md:rounded-xl data-[state=active]:bg-accent data-[state=active]:text-background font-bold uppercase tracking-widest px-3 md:px-4">
                  <MessageSquare size={12} /> Comms
                </TabsTrigger>
              </TabsList>
              <Badge variant="outline" className="border-accent/40 text-accent text-[7px] md:text-[8px] animate-pulse">GRID_SYNC</Badge>
            </div>
            
            <TabsContent value="map" className="flex-1 mt-0 relative min-h-0 rounded-2xl overflow-hidden border border-white/5">
               <ResourceMap />
               {isCalling && (
                 <div className="absolute inset-x-0 bottom-4 md:bottom-8 flex justify-center z-[70] animate-in slide-in-from-bottom-5 px-4">
                   <MediaControls onHangUp={endCall} className="w-full max-w-xs" />
                 </div>
               )}
               {isCalling && remoteStream && (
                 <div className="absolute top-2 right-2 md:top-4 md:right-4 w-40 md:w-64 aspect-video bg-black rounded-xl md:rounded-3xl border-2 border-accent shadow-2xl overflow-hidden z-[60] animate-in zoom-in-95">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse text-[6px] md:text-[7px] border-none">HUD</Badge>
                 </div>
               )}
            </TabsContent>

            <TabsContent value="comm" className="flex-1 mt-0 min-h-0">
               <CommunicationConsole />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Tactical Ops - Action panel */}
        <div className="lg:col-span-3 flex flex-col gap-4 md:gap-6 min-h-0 order-3">
          <Card className="bg-card/40 border-accent/20 flex-1 flex flex-col overflow-hidden relative neon-glow-accent min-h-[300px] lg:min-h-[400px]">
             <CardHeader className="bg-accent/10 border-b border-white/5 py-3 md:py-4">
                <CardTitle className="text-xs md:text-sm font-headline flex items-center gap-2 uppercase tracking-[0.2em] neon-text-accent">
                   <Target className="w-4 h-4 md:w-[18px] md:h-[18px]" /> Tactical_Ops
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 flex flex-col">
                {selectedAlert ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="aspect-video bg-black/60 relative m-2 md:m-4 rounded-xl md:rounded-3xl border border-white/5 overflow-hidden">
                       {isCalling ? (
                         <div className="w-full h-full flex flex-col items-center justify-center space-y-2 md:space-y-3 bg-accent/5">
                            <Volume2 className="text-accent animate-bounce w-6 h-6 md:w-8 md:h-8" />
                            <p className="text-[8px] md:text-[9px] font-mono text-accent uppercase tracking-[0.3em] animate-pulse">Session Active</p>
                         </div>
                       ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                            <Video className="text-white/10 w-6 h-6 md:w-8 md:h-8" />
                            <p className="text-[8px] md:text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">No Signal</p>
                         </div>
                       )}
                    </div>

                    <ScrollArea className="flex-1 px-3 md:px-4">
                       <div className="space-y-4 pb-4">
                          <div className="space-y-1">
                             <h3 className="text-sm md:text-lg font-headline font-bold neon-text-accent">{selectedAlert.location}</h3>
                             <p className="text-[8px] md:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{selectedAlert.type}</p>
                          </div>

                          <div className="flex gap-2">
                             <Button 
                               onClick={handleCall} 
                               disabled={isCalling} 
                               size="sm" 
                               className="bg-accent text-background font-bold gap-2 flex-1 rounded-xl h-9 md:h-10 text-[10px]"
                             >
                               <Phone size={14} /> {isCalling ? 'ACTIVE' : 'Start Link'}
                             </Button>
                          </div>

                          <div className="pt-3 border-t border-white/5">
                             {analyzing ? (
                               <div className="py-4 text-center space-y-2">
                                  <Loader2 className="animate-spin text-accent mx-auto" size={20} />
                                  <p className="text-[8px] font-mono text-accent uppercase animate-pulse">Computing...</p>
                               </div>
                             ) : recommendation ? (
                               <div className="p-3 md:p-4 bg-primary/10 rounded-xl md:rounded-2xl border border-primary/30 space-y-2 md:space-y-3">
                                  <div className="flex items-center gap-2">
                                     <BrainCircuit size={16} className="text-primary" />
                                     <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary">Strategy</span>
                                  </div>
                                  <p className="text-[10px] md:text-[11px] text-foreground/80 leading-relaxed italic">"{recommendation.reasoning}"</p>
                                  <Button onClick={() => handleDispatch(recommendation.recommendedResponderId)} className="w-full bg-primary text-background font-bold text-[9px] md:text-[10px] h-8 md:h-9 rounded-xl">
                                     AUTHORIZE
                                  </Button>
                               </div>
                             ) : selectedAlert.status === 'dispatched' ? (
                               <div className="p-3 bg-accent/5 rounded-xl border border-accent/20 flex items-center justify-center gap-2">
                                  <CheckCircle2 className="text-accent" size={16} />
                                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-accent">Deployed</span>
                                </div>
                             ) : (
                               <Button onClick={() => handleAnalyze(selectedAlert)} className="w-full bg-muted/40 hover:bg-muted/60 text-white font-bold text-[9px] md:text-[10px] h-9 md:h-10 rounded-xl gap-2">
                                  <Zap size={14} className="text-accent" /> Run AI Analysis
                               </Button>
                             )}
                          </div>
                       </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
                     <LayoutDashboard size={40} className="text-muted-foreground mb-4" />
                     <p className="font-headline font-bold uppercase tracking-[0.2em] text-[10px]">Awaiting Signal</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  async function handleDispatch(responderId: string) {
    const responder = MOCK_RESPONDERS.find(r => r.id === responderId);
    await updateAlertStatus('dispatched', `${responder?.name} কে পাঠানো হয়েছে।`, responderId);
    setRecommendation(null);
  }
}
