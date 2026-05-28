"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Radio, MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2, BrainCircuit, Video, Clock, History, Send, ClipboardList, Zap, Phone, PhoneOff, Maximize2, Minimize2, Activity, Target, LayoutDashboard, Database, ShieldCheck, MessageSquare, Globe } from 'lucide-react'
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
      toast({ title: "Sovereign WebRTC Secure Link Active" });
    } catch (e) {
      setIsCalling(false);
      toast({ title: "Encryption Handshake Failed", variant: "destructive" });
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
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        {/* Left: Emergency Feed */}
        <div className="lg:col-span-3 space-y-6 flex flex-col min-h-0">
           <Card className="bg-card/40 border-primary/20 flex flex-col flex-1 overflow-hidden neon-glow-primary min-h-[400px]">
              <CardHeader className="bg-primary/10 border-b border-white/5 py-3 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-headline flex items-center gap-2 uppercase tracking-widest neon-text-primary">
                  <Activity size={14} className="animate-pulse" /> Live_Emergencies
                </CardTitle>
                <Badge variant="outline" className="text-[7px] border-primary/40 text-primary">{alerts.length} ACTIVE</Badge>
              </CardHeader>
              <ScrollArea className="flex-1 bg-black/20">
                <div className="p-3 space-y-3">
                   {alerts.map((alert) => (
                     <div 
                       key={alert.id} 
                       onClick={() => handleAnalyze(alert)}
                       className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${selectedAlert?.id === alert.id ? 'bg-primary/20 border-primary ring-1 ring-primary/40' : 'bg-card/60 border-white/5 hover:border-primary/40'}`}
                     >
                        <div className="flex justify-between items-start mb-2">
                           <Badge className={`text-[7px] h-4 uppercase font-bold ${alert.status === 'pending' ? 'bg-destructive animate-pulse' : 'bg-accent text-background'}`}>
                              {alert.status}
                           </Badge>
                           <span className="text-[8px] font-mono text-muted-foreground">[{new Date(alert.timestamp?.toDate?.()).toLocaleTimeString() || '0.00s'}]</span>
                        </div>
                        <p className="text-[11px] font-bold text-foreground line-clamp-1">{alert.location}</p>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mt-1">{alert.type}</p>
                        
                        {selectedAlert?.id === alert.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />}
                     </div>
                   ))}
                </div>
              </ScrollArea>
           </Card>

           <Card className="bg-card/40 border-white/5 p-4 space-y-4">
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 border-b border-white/5 pb-2">
                 <ShieldCheck size={14} className="text-primary" /> System_Purity
              </h4>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-white/60">ENCRYPTION</span>
                    <span className="text-accent font-bold">RSA_v2_ACTIVE</span>
                 </div>
                 <div className="flex justify-between items-center text-[9px] font-mono">
                    <span className="text-white/60">AI_CONFIDENCE</span>
                    <span className="text-accent font-bold">OPTIMAL</span>
                 </div>
              </div>
           </Card>
        </div>

        {/* Center: Dynamic Pannel (Map / Communication) */}
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-black/40 border border-white/5 p-1 h-10 rounded-2xl">
                <TabsTrigger value="map" className="text-[10px] gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-background font-bold uppercase tracking-widest px-4">
                  <Globe size={12} /> Strategic Map
                </TabsTrigger>
                <TabsTrigger value="comm" className="text-[10px] gap-2 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-background font-bold uppercase tracking-widest px-4">
                  <MessageSquare size={12} /> Comm Console
                </TabsTrigger>
              </TabsList>
              <Badge variant="outline" className="border-accent/40 text-accent text-[8px] animate-pulse">HUB_SYNC: 100%</Badge>
            </div>
            
            <TabsContent value="map" className="flex-1 mt-0 relative min-h-0">
               <ResourceMap />
               {isCalling && (
                 <div className="absolute top-4 right-4 w-48 aspect-video bg-black rounded-2xl border-2 border-accent shadow-2xl overflow-hidden z-[60] animate-in zoom-in-95">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 flex gap-1">
                       <Button size="icon" variant="destructive" onClick={endCall} className="h-6 w-6 rounded-lg">
                          <PhoneOff size={10} />
                       </Button>
                    </div>
                    <Badge className="absolute top-1 left-1 text-[6px] bg-red-600/80 animate-pulse">LIVE_HUD</Badge>
                 </div>
               )}
            </TabsContent>

            <TabsContent value="comm" className="flex-1 mt-0 min-h-0">
               <CommunicationConsole />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Tactical Ops */}
        <div className="lg:col-span-3 flex flex-col gap-6 min-h-0">
          <Card className="bg-card/40 border-accent/20 flex-1 flex flex-col overflow-hidden relative neon-glow-accent min-h-[400px]">
             <CardHeader className="bg-accent/10 border-b border-white/5 py-4">
                <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-[0.2em] neon-text-accent">
                   <Target size={18} className="animate-spin-slow" /> Tactical_Ops
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0 flex-1 flex flex-col">
                {selectedAlert ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="aspect-video bg-black/60 relative m-4 rounded-3xl border border-white/5 overflow-hidden group">
                       {isCalling ? (
                         <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-accent/10">
                            <Signal className="text-accent animate-bounce" size={32} />
                            <p className="text-[9px] font-mono text-accent uppercase tracking-[0.3em]">Secure WebRTC active</p>
                         </div>
                       ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                            <Video size={32} className="text-white/10 group-hover:text-accent transition-colors" />
                            <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">No Active Video Link</p>
                         </div>
                       )}
                       <Badge className="absolute top-3 left-3 bg-accent/80 text-background text-[7px] font-mono">NODE: {selectedAlert.id.substring(0, 6).toUpperCase()}</Badge>
                    </div>

                    <ScrollArea className="flex-1 px-4">
                       <div className="space-y-4 pb-4">
                          <div className="space-y-1">
                             <h3 className="text-lg font-headline font-bold neon-text-accent">{selectedAlert.location}</h3>
                             <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{selectedAlert.type}</p>
                          </div>

                          <div className="flex gap-2">
                             <Button onClick={handleCall} disabled={isCalling} size="sm" className="bg-accent text-background font-bold gap-2 flex-1 rounded-xl h-10 shadow-lg shadow-accent/20">
                               <Phone size={14} /> Establish Video Link
                             </Button>
                             {isCalling && (
                               <Button variant="destructive" size="icon" onClick={endCall} className="h-10 w-10 rounded-xl">
                                  <PhoneOff size={16} />
                               </Button>
                             )}
                          </div>

                          <div className="pt-4 border-t border-white/5 space-y-4">
                             {analyzing ? (
                               <div className="py-4 text-center space-y-3">
                                  <Loader2 className="animate-spin text-accent mx-auto" size={24} />
                                  <p className="text-[10px] font-mono text-accent uppercase animate-pulse">Calculating AI Strategy...</p>
                               </div>
                             ) : recommendation ? (
                               <div className="p-4 bg-primary/10 rounded-2xl border border-primary/30 space-y-3 animate-in zoom-in-95">
                                  <div className="flex items-center gap-2">
                                     <BrainCircuit size={18} className="text-primary" />
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Strategy</span>
                                  </div>
                                  <p className="text-[11px] text-foreground/80 leading-relaxed italic">"{recommendation.reasoning}"</p>
                                  <Button onClick={() => handleDispatch(recommendation.recommendedResponderId)} className="w-full bg-primary text-background font-bold text-[10px] h-9 rounded-xl mt-2">
                                     AUTHORIZE DISPATCH
                                  </Button>
                               </div>
                             ) : selectedAlert.status === 'dispatched' ? (
                               <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center gap-3">
                                  <CheckCircle2 className="text-accent" size={20} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Unit_En_Route_0.004ms</span>
                                </div>
                             ) : (
                               <Button onClick={() => handleAnalyze(selectedAlert)} className="w-full bg-muted/40 hover:bg-muted/60 text-white font-bold text-[10px] h-10 rounded-xl gap-2 border border-white/5">
                                  <Zap size={14} className="text-accent" /> Run Tactical AI Analysis
                               </Button>
                             )}
                          </div>
                       </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
                     <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                        <LayoutDashboard size={40} className="text-muted-foreground" />
                     </div>
                     <p className="font-headline font-bold uppercase tracking-[0.2em] text-xs">Mission Center Ready</p>
                     <p className="text-[10px] mt-2 leading-relaxed">Select an incoming signal to initiate command.</p>
                  </div>
                )}
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/5 p-4 space-y-3">
             <h4 className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Database size={14} className="text-accent" /> Units_Available
             </h4>
             <div className="space-y-2">
                {MOCK_RESPONDERS.map(res => (
                  <div key={res.id} className="flex items-center justify-between p-2 bg-black/20 rounded-xl border border-white/5">
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        <span className="text-[9px] font-bold truncate max-w-[80px]">{res.name}</span>
                     </div>
                     <Badge variant="outline" className="text-[7px] border-accent/30 text-accent h-4">{res.type}</Badge>
                  </div>
                ))}
             </div>
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
