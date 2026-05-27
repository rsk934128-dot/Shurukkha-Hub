
"use client"

import React, { useState, useEffect } from 'react'
import { Radio, MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2, BrainCircuit, Video, Clock, History, Send, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, serverTimestamp, addDoc } from 'firebase/firestore'
import { suggestResponder, type SuggestResponderOutput } from '@/ai/flows/suggest-responder-flow'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

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

  const logAuditAction = async (action: string, details: any) => {
    try {
      await addDoc(collection(db, "audit_trails"), {
        action,
        details,
        timestamp: serverTimestamp(),
        performedBy: 'authority_admin_01'
      });
    } catch (e) {
      console.error("Audit Logging Failed", e);
    }
  }

  const handleAnalyze = async (alert: any) => {
    setSelectedAlert(alert)
    setAnalyzing(true)
    setRecommendation(null)
    
    try {
      const result = await suggestResponder({
        sosType: alert.type || "Emergency",
        location: alert.location || "Unknown",
        availableResponders: MOCK_RESPONDERS.map(r => ({ ...r, type: r.type as any }))
      })
      setRecommendation(result)
      await logAuditAction('AI_ANALYSIS_TRIGGERED', { alertId: alert.id, result: result.recommendedResponderId });
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
          timestamp: new Date().toISOString()
        })
      };
      
      if (responderId) updateData.assignedResponder = responderId;

      await updateDoc(alertRef, updateData);
      await logAuditAction('STATUS_UPDATE', { alertId: selectedAlert.id, status, note, responderId });
      
      toast({
        title: `Status Updated: ${status}`,
        description: note,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleDispatch = async (responderId: string) => {
    const responder = MOCK_RESPONDERS.find(r => r.id === responderId);
    await updateAlertStatus('dispatched', `${responder?.name} কে ঘটনাস্থলে পাঠানো হয়েছে।`, responderId);
    setRecommendation(null);
  }

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Radio className="text-primary animate-pulse" size={20} />
          ডিসপ্যাচ কন্ট্রোল সেন্টার
        </CardTitle>
      </CardHeader>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-white/5 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center opacity-30 text-center py-12">
                  <ShieldAlert size={40} className="mb-2" />
                  <p className="text-xs font-headline">কোন সক্রিয় SOS নেই</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    onClick={() => handleAnalyze(alert)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${selectedAlert?.id === alert.id ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-white/5 hover:bg-muted/50'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={alert.status === 'pending' ? 'destructive' : 'default'} className="uppercase text-[8px] h-4">
                        {alert.status}
                      </Badge>
                      <span className="text-[9px] text-muted-foreground">
                        {alert.timestamp?.toDate?.()?.toLocaleTimeString('bn-BD') || 'Just now'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin size={12} className="text-primary" />
                      <p className="text-xs font-headline font-bold truncate">{alert.location}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col bg-background/50">
          {selectedAlert ? (
            <>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-headline font-bold">{selectedAlert.location}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{selectedAlert.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-[10px] gap-1 border-primary/30 text-primary">
                    <Video size={14} /> ভেরিফাই
                  </Button>
                  {selectedAlert.status === 'dispatched' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateAlertStatus('resolved', 'উদ্ধার অভিযান সফলভাবে সম্পন্ন হয়েছে।')}
                      className="h-8 text-[10px] bg-accent text-background font-bold"
                    >
                      <CheckCircle2 size={14} className="mr-1" /> রিজলভ
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                        <ClipboardList size={12} /> ইনসিডেন্ট টাইমলাইন (Forensic Log)
                      </h4>
                      <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                        <div className="relative pl-6">
                          <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                          <p className="text-xs font-bold text-destructive">SOS ট্রিগার করা হয়েছে</p>
                          <p className="text-[10px] text-muted-foreground">
                            {selectedAlert.timestamp?.toDate?.()?.toLocaleString('bn-BD')}
                          </p>
                        </div>
                        
                        {selectedAlert.timeline?.map((event: any, idx: number) => (
                          <div key={idx} className="relative pl-6">
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                            <p className="text-xs font-bold text-primary uppercase">{event.status}</p>
                            <p className="text-[10px] text-foreground/80">{event.note}</p>
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString('bn-BD')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analyzing ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <p className="text-xs font-body italic text-muted-foreground">এআই রিস্পন্স জেনারেট করছে...</p>
                      </div>
                    ) : recommendation ? (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <BrainCircuit size={16} />
                          <span className="text-xs font-headline font-bold">এআই ডেসপ্যাচ সাজেশন</span>
                        </div>
                        <p className="text-xs font-body leading-relaxed">{recommendation.reasoning}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {MOCK_RESPONDERS.map(responder => (
                            <Button 
                              key={responder.id}
                              onClick={() => handleDispatch(responder.id)}
                              variant={recommendation.recommendedResponderId === responder.id ? "default" : "outline"}
                              className={`h-9 text-[10px] justify-between ${recommendation.recommendedResponderId === responder.id ? 'bg-primary' : 'border-white/10'}`}
                            >
                              <span>{responder.name}</span>
                              <Badge variant="outline" className="text-[7px] px-1 h-3">{responder.type}</Badge>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </ScrollArea>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center p-8">
              <History size={64} className="mb-4" />
              <p className="font-headline font-bold">অ্যালার্ট সিলেক্ট করুন</p>
              <p className="text-xs">টাইমলাইন এবং ডিসপ্যাচ অপশন দেখতে বামদিকের তালিকা থেকে বেছে নিন</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
