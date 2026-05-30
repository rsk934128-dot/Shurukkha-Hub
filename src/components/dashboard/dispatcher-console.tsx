
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Radio, MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2, BrainCircuit, Video, Clock, History, Send, ClipboardList, Zap, Phone, PhoneOff, Maximize2, Minimize2, Activity, Target, LayoutDashboard, Database, ShieldCheck, MessageSquare, Globe, Volume2, Mic, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, serverTimestamp, addDoc, getDoc } from 'firebase/firestore'
import { suggestResponder, type SuggestResponderOutput } from '@/ai/flows/suggest-responder-flow'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { ResourceMap } from './resource-map'
import { CommunicationConsole } from './communication-console'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/tabs'
import { MediaControls } from './media-controls'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

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
  const [activeTab, setActiveTab] = useState<'map' | 'comm'>('map')
  
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
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
          toast({ title: "NEW EMERGENCY SIGNAL!", variant: "destructive" });
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
  }, [selectedAlert]);

  const handleCall = async () => {
    if (!selectedAlert) return;
    setIsCalling(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: WebRTCManager.getAudioConstraints() 
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      webrtcRef.current = new WebRTCManager(selectedAlert.id);
      await webrtcRef.current.answerCall(stream, (remote) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
      });
      
      await updateDoc(doc(db, 'webrtc_sessions', selectedAlert.id), { status: 'connected' });
    } catch (e) {
      setIsCalling(false);
      toast({ title: "Signal Link Failure", variant: "destructive" });
    }
  }

  const endCall = async () => {
    if (selectedAlert) {
      try {
        await updateDoc(doc(db, 'webrtc_sessions', selectedAlert.id), { status: 'ended' });
      } catch (e) {}
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    webrtcRef.current?.dispose();
    setIsCalling(false);
  }

  const handleAnalyze = async (alert: any) => {
    setSelectedAlert(alert)
    if (alert.status === 'dispatched') {
      setRecommendation(null);
      return;
    }
    setAnalyzing(true)
    try {
      const result = await suggestResponder({
        sosType: alert.type || "Emergency",
        location: alert.location || "Unknown",
        availableResponders: MOCK_RESPONDERS.map(r => ({ ...r, type: r.type as any }))
      })
      setRecommendation(result)
    } catch (error) {
      toast({ title: "AI Strategy Error", variant: "destructive" })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDispatch = async (responderId: string) => {
    if (!selectedAlert) return;
    const responder = MOCK_RESPONDERS.find(r => r.id === responderId);
    const alertRef = doc(db, "sos_alerts", selectedAlert.id);
    await updateDoc(alertRef, {
      status: 'dispatched',
      assignedResponder: responderId,
      timeline: arrayUnion({
        status: 'dispatched',
        note: `${responder?.name} deployed.`,
        timestamp: new Date().toISOString(),
        purity: 'VERIFIED_IMPERIAL'
      })
    });
    toast({ title: `Command Executed: ${responder?.name} Dispatched.` });
    setRecommendation(null);
  }

  return (
    <div className={`h-full flex flex-col gap-4 transition-all duration-700 ${isCalling ? 'call-active-glow' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Left: Alerts */}
        <div className="lg:col-span-3 flex flex-col min-h-0 order-2 lg:order-1">
           <Card className="bg-card/40 border-primary/20 flex flex-col flex-1 overflow-hidden neon-glow-primary">
              <CardHeader className="bg-primary/10 border-b border-white/5 py-3">
                <CardTitle className="text-xs font-headline flex items-center gap-2 uppercase tracking-widest text-primary">
                  <Activity size={14} className="animate-pulse" /> Live_Signals
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                   {alerts.map((alert) => (
                     <div 
                       key={alert.id} 
                       onClick={() => handleAnalyze(alert)}
                       className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedAlert?.id === alert.id ? 'bg-primary/20 border-primary ring-1 ring-primary/40' : 'bg-card/60 border-white/5 hover:border-primary/40'}`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <Badge className={`text-[7px] h-4 uppercase font-bold ${alert.status === 'pending' ? 'bg-destructive animate-pulse' : 'bg-accent text-background'}`}>
                              {alert.status}
                           </Badge>
                           <span className="text-[8px] font-mono text-muted-foreground">{alert.timestamp?.toDate ? alert.timestamp.toDate().toLocaleTimeString() : '0.0s'}</span>
                        </div>
                        <p className="text-[11px] font-bold text-foreground line-clamp-1">{alert.location}</p>
                     </div>
                   ))}
                </div>
              </ScrollArea>
           </Card>
        </div>

        {/* Center: Map/Comms */}
        <div className="lg:col-span-6 flex flex-col min-h-0 order-1 lg:order-2">
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-black/40 border border-white/5 p-1 h-10 rounded-2xl">
                <TabsTrigger value="map" className="text-[10px] gap-2 rounded-xl data-[state=active]:bg-primary font-bold uppercase tracking-widest px-4"><Globe size={12} /> Map</TabsTrigger>
                <TabsTrigger value="comm" className="text-[10px] gap-2 rounded-xl data-[state=active]:bg-accent font-bold uppercase tracking-widest px-4"><MessageSquare size={12} /> Comms</TabsTrigger>
              </TabsList>
              <Badge variant="outline" className="border-accent/40 text-accent text-[8px] animate-pulse">GRID_STABLE</Badge>
            </div>
            
            <TabsContent value="map" className="flex-1 mt-0 relative min-h-0 rounded-2xl overflow-hidden border border-white/5">
               <ResourceMap />
               {isCalling && (
                 <div className="absolute inset-0 z-50 bg-slate-950/40 backdrop-blur-sm animate-in fade-in">
                    <div className="absolute top-4 right-4 w-64 md:w-80 aspect-video bg-black rounded-3xl border-2 border-accent shadow-2xl overflow-hidden group">
                       <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                       <div className="absolute bottom-2 right-2 w-16 md:w-24 aspect-video bg-black border border-white/20 rounded-lg overflow-hidden">
                          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                       </div>
                       <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse text-[7px] border-none px-2 h-4">SECURE_RECON</Badge>
                    </div>
                    <div className="absolute inset-x-0 bottom-8 flex justify-center px-4">
                      <MediaControls onHangUp={endCall} className="w-full max-w-xs" />
                    </div>
                 </div>
               )}
            </TabsContent>
            <TabsContent value="comm" className="flex-1 mt-0 min-h-0"><CommunicationConsole /></TabsContent>
          </Tabs>
        </div>

        {/* Right: Tactical */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0 order-3">
          <Card className="bg-card/40 border-accent/20 flex-1 flex flex-col overflow-hidden relative neon-glow-accent">
             <CardHeader className="bg-accent/10 border-b border-white/5 py-4">
                <CardTitle className="text-xs font-headline flex items-center gap-2 uppercase tracking-widest text-accent">
                   <Target size={16} /> Command_Module
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 flex flex-col">
                {selectedAlert ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="aspect-video bg-black/60 relative m-4 rounded-3xl border border-white/5 overflow-hidden flex flex-col items-center justify-center space-y-2">
                       {isCalling ? <Volume2 className="text-accent animate-bounce" size={24} /> : <Video className="text-white/10" size={24} />}
                       <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">{isCalling ? 'LINK_ACTIVE' : 'NO_SIGNAL'}</p>
                    </div>
                    <ScrollArea className="flex-1 px-4">
                       <div className="space-y-4 pb-4">
                          <div>
                             <h3 className="text-lg font-headline font-bold text-foreground uppercase">{selectedAlert.location}</h3>
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{selectedAlert.type}</p>
                          </div>
                          <Button onClick={handleCall} disabled={isCalling} className="w-full bg-accent text-background font-bold gap-2 rounded-xl h-10 text-xs">
                             <Phone size={14} /> {isCalling ? 'SESSION ACTIVE' : 'Initiate Secure Link'}
                          </Button>
                          <div className="pt-4 border-t border-white/5">
                             {analyzing ? (
                               <div className="py-8 text-center space-y-2">
                                  <Loader2 className="animate-spin text-accent mx-auto" size={24} />
                                  <p className="text-[8px] font-mono text-accent uppercase animate-pulse">Processing Strategy...</p>
                               </div>
                             ) : recommendation ? (
                               <div className="p-4 bg-primary/10 rounded-2xl border border-primary/30 space-y-3">
                                  <div className="flex items-center gap-2 text-primary">
                                     <BrainCircuit size={16} />
                                     <span className="text-[10px] font-bold uppercase tracking-widest">AI Strategy</span>
                                  </div>
                                  <p className="text-[11px] text-foreground/80 leading-relaxed italic">"{recommendation.reasoning}"</p>
                                  <Button onClick={() => handleDispatch(recommendation.recommendedResponderId)} className="w-full bg-primary text-background font-bold text-xs h-9 rounded-xl">
                                     AUTHORIZE DEPLOYMENT
                                  </Button>
                               </div>
                             ) : selectedAlert.status === 'dispatched' ? (
                               <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center gap-2 text-accent">
                                  <CheckCircle2 size={16} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">Responder Deployed</span>
                                </div>
                             ) : (
                               <Button onClick={() => handleAnalyze(selectedAlert)} className="w-full bg-muted/40 hover:bg-muted/60 text-white font-bold h-11 rounded-xl gap-2 text-xs">
                                  <Zap size={14} className="text-accent" /> Run Tactical AI Analysis
                               </Button>
                             )}
                          </div>
                       </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
                     <LayoutDashboard size={48} className="text-muted-foreground mb-4" />
                     <p className="font-headline font-bold uppercase tracking-[0.2em] text-xs">Awaiting Command Signal</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
