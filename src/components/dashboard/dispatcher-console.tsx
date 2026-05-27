
"use client"

import React, { useState, useEffect } from 'react'
import { Radio, MapPin, ShieldAlert, CheckCircle2, Navigation, Loader2, BrainCircuit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where, orderBy, updateDoc, doc } from 'firebase/firestore'
import { suggestResponder, type SuggestResponderOutput } from '@/ai/flows/suggest-responder-flow'
import { useToast } from '@/hooks/use-toast'

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
    });
    return () => unsubscribe();
  }, [])

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
    } catch (error) {
      console.error(error)
      toast({ title: "Analysis Failed", variant: "destructive" })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDispatch = async (responderId: string) => {
    if (!selectedAlert) return;
    
    try {
      const alertRef = doc(db, "sos_alerts", selectedAlert.id);
      await updateDoc(alertRef, {
        status: 'dispatched',
        assignedResponder: responderId
      });
      
      toast({
        title: "Responder Dispatched",
        description: `টিমকে ঘটনাস্থলে পাঠানো হয়েছে।`,
      })
      setSelectedAlert(null)
      setRecommendation(null)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Radio className="text-primary animate-pulse" size={20} />
          ডিসপ্যাচ কন্ট্রোল সেন্টার (Authorities Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {alerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center py-12">
              <ShieldAlert size={48} className="mb-2" />
              <p className="text-sm font-headline">কোন সক্রিয় SOS অ্যালার্ট নেই</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                onClick={() => handleAnalyze(alert)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedAlert?.id === alert.id ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-white/5 hover:bg-muted/50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={alert.status === 'pending' ? 'destructive' : 'default'} className="uppercase text-[9px]">
                    {alert.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {alert.timestamp?.toDate?.()?.toLocaleTimeString('bn-BD') || 'Just now'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={14} className="text-primary" />
                  <p className="text-sm font-headline font-bold">{alert.location}</p>
                </div>
                <p className="text-xs text-muted-foreground font-body">টাইপ: {alert.type}</p>
              </div>
            ))
          )}
        </div>

        {selectedAlert && (
          <div className="border-t border-primary/20 bg-background/80 backdrop-blur-md p-4 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-wider">মিশন অ্যানালাইসিস</h4>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setSelectedAlert(null)}>×</Button>
            </div>

            {analyzing ? (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-xs font-body italic text-muted-foreground">এআই রিস্পন্স ক্যালকুলেট করছে...</p>
              </div>
            ) : recommendation ? (
              <div className="space-y-4">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <BrainCircuit size={16} />
                    <span className="text-xs font-headline font-bold">এআই সুপারিশ</span>
                  </div>
                  <p className="text-xs font-body leading-relaxed">{recommendation.reasoning}</p>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-destructive uppercase">প্রায়োরিটি: {recommendation.priority}</span>
                    <span className="text-accent">ETA: {recommendation.estimatedArrivalTime}</span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  {MOCK_RESPONDERS.map(responder => (
                    <Button 
                      key={responder.id}
                      onClick={() => handleDispatch(responder.id)}
                      variant={recommendation.recommendedResponderId === responder.id ? "default" : "outline"}
                      className={`w-full justify-between h-10 ${recommendation.recommendedResponderId === responder.id ? 'bg-primary' : 'border-white/10'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Navigation size={14} />
                        <span className="text-xs">{responder.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[8px]">{responder.type}</Badge>
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
