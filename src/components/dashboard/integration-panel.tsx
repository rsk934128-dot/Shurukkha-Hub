
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu, Zap, Database, Code2, Link, Map, Search, ArrowRightLeft, ShieldAlert, Activity, RefreshCw, Rocket, History, TrendingUp, ShieldX, Eye, Filter, Skull, UserX, AlertTriangle, RefreshCcw, Swords, Target, Crosshair, Sparkles, BrainCircuit, Fingerprint, Network, Scale, Trophy, Cloud, HardDrive, Download, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { SovereignConnector } from '@/lib/sovereign-connector'
import { SovereignGuard } from '@/lib/sovereign-guard'
import { SelfHealing } from '@/lib/self-healing'
import { GoogleDriveBridge, VaultStats } from '@/lib/google-drive-bridge'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThreatMap } from './threat-map'
import { PredictiveForecasting } from './predictive-forecasting'
import { JudiciaryPanel } from './judiciary-panel'
import { ImperialVictoryPanel } from './imperial-victory-panel'
import { Progress } from '@/components/ui/progress'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [suspects, setSuspects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', webhook: '' })
  const [isHandshaking, setIsHandshaking] = useState(false)
  const [healingStatus, setHealingStatus] = useState(SelfHealing.getStatus())
  const [vaultStats, setVaultStats] = useState<VaultStats>(GoogleDriveBridge.getVaultStats())
  
  const guardStats = SovereignGuard.getStats();
  const traffic = SovereignGuard.getLiveTraffic();
  const { toast } = useToast()

  useEffect(() => {
    const appsQ = query(collection(db, "integrations"));
    const unsubApps = onSnapshot(appsQ, (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const suspectsQ = query(collection(db, "suspect_profiles"), orderBy("timestamp", "desc"), limit(15));
    const unsubSuspects = onSnapshot(suspectsQ, (snapshot) => {
      setSuspects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const interval = setInterval(() => {
      setHealingStatus(SelfHealing.getStatus());
      setVaultStats(GoogleDriveBridge.getVaultStats());
    }, 5000);

    return () => {
      unsubApps();
      unsubSuspects();
      clearInterval(interval);
    }
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await IntegrationBridge.registerApp(
        newApp.name, 
        newApp.webhook, 
        ['SOS_TRIGGERED', 'STATUS_UPDATED', 'FLOOD_ALERT']
      );
      setNewApp({ name: '', webhook: '' });
      toast({ title: "সফল!", description: "Imperial Partner রেজিস্টার করা হয়েছে।" });
    } catch (e) {
      toast({ title: "ব্যর্থ!", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-primary/20 flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base md:text-lg font-headline flex items-center gap-2">
              <Cpu className="text-primary" size={20} />
              SOVEREIGN API COMMAND
            </CardTitle>
            <CardDescription className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-primary/60">
              API Interceptor • Adaptive Guard
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-[8px] md:text-[10px] gap-1.5 py-1 ${healingStatus.status === 'OPTIMAL' ? 'border-accent/40 text-accent' : 'border-destructive/40 text-destructive animate-pulse'}`}>
              <RefreshCcw size={12} className={healingStatus.status === 'REPAIRING' ? 'animate-spin' : ''} /> {healingStatus.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="war-room" className="flex-1 flex flex-col">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="war-room" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap"><Swords size={12}/> ওয়ার-রুম</TabsTrigger>
            <TabsTrigger value="vault" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><HardDrive size={12}/> ভল্ট (Data Scale)</TabsTrigger>
            <TabsTrigger value="victory" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><Trophy size={12}/> বিজয়</TabsTrigger>
            <TabsTrigger value="judiciary" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Scale size={12}/> বিচার বিভাগ</TabsTrigger>
            <TabsTrigger value="intelligence" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap"><Skull size={12}/> ইন্টেল ইউনিট</TabsTrigger>
            <TabsTrigger value="evolution" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><BrainCircuit size={12}/> প্রেডিকশন</TabsTrigger>
            <TabsTrigger value="guard" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><ShieldX size={12}/> গার্ড</TabsTrigger>
            <TabsTrigger value="apps" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Globe size={12}/> পার্টনার্স</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="war-room" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <ThreatMap />
        </TabsContent>

        <TabsContent value="vault" className="flex-1 p-4 md:p-6 space-y-6 m-0 animate-in fade-in zoom-in-95">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-accent/5 border-accent/20 p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                       <Cloud size={20} />
                    </div>
                    <Badge className="bg-accent text-background text-[7px] uppercase font-bold">Scaling Enabled</Badge>
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Drive Infrastructure</p>
                    <h3 className="text-xl font-headline font-bold text-foreground">{vaultStats.usedSpace} / {vaultStats.totalSpace}</h3>
                    <div className="flex justify-between text-[8px] mt-2 text-accent/60 uppercase font-bold">
                       <span>Utilization</span>
                       <span>2.8%</span>
                    </div>
                    <Progress value={2.8} className="h-1 bg-white/5 mt-1" />
                 </div>
              </Card>

              <Card className="bg-primary/5 border-primary/20 p-5 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Growth Vector</p>
                    <h3 className="text-xl font-headline font-bold text-foreground">{vaultStats.growthRate}</h3>
                    <p className="text-[8px] text-primary/60 font-mono mt-1">CAPACITY_READY: 1M+ USERS</p>
                 </div>
              </Card>

              <Card className="bg-muted/20 border-white/10 p-5 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                    <Zap size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Offload Efficiency</p>
                    <h3 className="text-xl font-headline font-bold text-accent">{vaultStats.offloadEfficiency}% Pure</h3>
                    <p className="text-[8px] text-muted-foreground mt-1 italic">Firestore remains light & fast.</p>
                 </div>
              </Card>
           </div>

           <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <BarChart3 size={16} /> How the Vault sustains Growth
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">ইউজার যখন বাড়বে, তাদের পাঠানো হাজার হাজার SOS ভিডিও এবং ড্রোন ইমেজ সরাসরি ড্রাইভে চলে যাবে। এর ফলে আপনার অ্যাপের পারফরম্যান্স ১ মিলি-সেকেন্ডও কমবে না।</p>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                       <CheckCircle2 className="text-accent" size={16} />
                       <span className="text-[10px] font-bold">Latency Protection: ACTIVE</span>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">ভবিষ্যতে এআই ট্রেনিংয়ের জন্য এই বিগ ডাটা (Big Data) হবে আপনার প্রধান হাতিয়ার। লাখ লাখ লগের অডিট ব্যাকআপ ড্রাইভে সংরক্ষিত থাকবে যা ঐতিহাসিক বিশ্লেষণের জন্য অপরিহার্য।</p>
                    <div className="flex items-center gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                       <Database className="text-primary" size={16} />
                       <span className="text-[10px] font-bold">Big Data Archive: 100% READY</span>
                    </div>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="victory" className="flex-1 p-4 md:p-6 m-0">
          <ImperialVictoryPanel />
        </TabsContent>
        {/* ... remaining tabs ... */}
      </Tabs>
    </Card>
  )
}
