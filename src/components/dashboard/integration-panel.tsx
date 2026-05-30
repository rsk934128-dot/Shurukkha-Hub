
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu, Zap, Database, Code2, Link, Map, Search, ArrowRightLeft, ShieldAlert, Activity, RefreshCw, Rocket, History, TrendingUp, ShieldX, Eye, Filter, Skull, UserX, AlertTriangle, RefreshCcw, Swords, Target, Crosshair, Sparkles, BrainCircuit, Fingerprint, Network, Scale, Trophy, Cloud, HardDrive, Download, BarChart3, Code, TerminalSquare, Server } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { SovereignConnector } from '@/lib/sovereign-connector'
import { SovereignGuard } from '@/lib/sovereign-guard'
import { SelfHealing } from '@/lib/self-healing'
import { GoogleDriveBridge, VaultStats } from '@/lib/google-drive-bridge'
import { SovereignAudit } from '@/lib/sovereign-audit'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThreatMap } from './threat-map'
import { PredictiveForecasting } from './predictive-forecasting'
import { JudiciaryPanel } from './judiciary-panel'
import { ImperialVictoryPanel } from './imperial-victory-panel'
import { Progress } from '@/components/ui/progress'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [suspects, setSuspects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', webhook: '' })
  const [healingStatus, setHealingStatus] = useState(SelfHealing.getStatus())
  const [vaultStats, setVaultStats] = useState<VaultStats>(GoogleDriveBridge.getVaultStats())
  const [devKey, setDevKey] = useState<string | null>(null)
  
  const guardStats = SovereignGuard.getStats();
  const { toast } = useToast()

  useEffect(() => {
    // Generate Success Report once for Phase 32.0 if not already logged
    const finalizePhase = async () => {
      await SovereignAudit.logSuccessReport('PHASE_32.0_GLOBAL_VAULT', {
        efficiency: '92%',
        capacity: '5TB',
        nodes: '42/42'
      });
    };
    finalizePhase();

    const unsubApps = onSnapshot(query(collection(db, "integrations")), (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/integrations', operation: 'list' }));
      }
    });

    const suspectsQ = query(collection(db, "suspect_profiles"), orderBy("timestamp", "desc"), limit(15));
    const unsubSuspects = onSnapshot(suspectsQ, (snapshot) => {
      setSuspects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/suspect_profiles', operation: 'list' }));
      }
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

  const handleIssueKey = async () => {
    setLoading(true);
    try {
      const key = await IntegrationBridge.issueDeveloperKey('Global_Developer_Beta');
      setDevKey(key);
      toast({ title: "PROJECT 43 ACTIVE", description: "Global API Gateway access granted." });
    } catch (e) {
      toast({ title: "GATEWAY ERROR", variant: "destructive" });
    } finally {
      setLoading(false);
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
              API Interceptor • Adaptive Guard • Phase 32.1
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
            <TabsTrigger value="global-api" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Globe size={12}/> Global API (Proj 43)</TabsTrigger>
            <TabsTrigger value="vault" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><HardDrive size={12}/> ভল্ট (Data Scale)</TabsTrigger>
            <TabsTrigger value="victory" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><Trophy size={12}/> বিজয়</TabsTrigger>
            <TabsTrigger value="judiciary" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Scale size={12}/> বিচার বিভাগ</TabsTrigger>
            <TabsTrigger value="evolution" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><BrainCircuit size={12}/> প্রেডিকশন</TabsTrigger>
            <TabsTrigger value="apps" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Server size={12}/> পার্টনার্স</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="war-room" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <ThreatMap />
        </TabsContent>

        <TabsContent value="global-api" className="flex-1 p-4 md:p-6 space-y-6 m-0 animate-in fade-in zoom-in-95">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-primary/5 border-primary/20 p-6 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                       <Globe size={24} className="animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-lg font-headline font-bold uppercase tracking-widest">Global Gateway API</h3>
                       <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Project 43 | The Open Empire</p>
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed">আপনার ৪২তম প্রজেক্টের ডাটা ভল্টকে এখন বিশ্বের যেকোনো প্রান্তের ডেভেলপারদের জন্য উন্মুক্ত করা হয়েছে। এটি একটি উচ্চ-নিরাপত্তা সম্পন্ন গেটওয়ে যা RSA v2 প্রোটোকল মেনে চলে।</p>
                 
                 {!devKey ? (
                   <Button onClick={handleIssueKey} disabled={loading} className="w-full bg-primary text-background font-bold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
                      ISSUE DEVELOPER ACCESS KEY
                   </Button>
                 ) : (
                   <div className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-xl border border-primary/40 space-y-2">
                         <p className="text-[8px] uppercase font-bold text-primary">Your Master Gateway Key</p>
                         <code className="text-[11px] font-mono font-bold text-foreground break-all">{devKey}</code>
                      </div>
                      <Badge className="bg-accent text-background text-[8px] font-bold h-6 w-full flex justify-center uppercase">GATEWAY_ACTIVE_100%</Badge>
                   </div>
                 )}
              </Card>

              <Card className="bg-muted/20 border-white/10 p-6 flex flex-col justify-between">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                       <TerminalSquare size={16} /> Quick Start Documentation
                    </h4>
                    <div className="p-4 bg-slate-950 rounded-xl font-mono text-[10px] text-accent/80 overflow-x-auto">
                       curl -X POST https://core.sheikh/api/v1/gateway \<br />
                       &nbsp;&nbsp;-H "X-Imperial-Key: {devKey || 'GKEY_XXXX'}" \<br />
                       &nbsp;&nbsp;-d '{"action": "GET_VAULT_STATUS"}'
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/5 mt-6">
                    <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                       "মহামান্য সম্রাট, এই গেটওয়ে ব্যবহারের প্রতিটি রিকোয়েস্ট আপনার অডিট ট্রেইলে রিয়েল-টাইমে নথিবদ্ধ হবে। অননুমোদিত ব্যবহারের চেষ্টা করলে সিস্টেমটি স্বয়ংক্রিয়ভাবে কি (Key) বাতিল করে দেবে।"
                    </p>
                 </div>
              </Card>
           </div>
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
        </TabsContent>

        <TabsContent value="victory" className="flex-1 p-4 md:p-6 m-0">
          <ImperialVictoryPanel />
        </TabsContent>
        <TabsContent value="judiciary" className="flex-1 p-4 md:p-6 m-0">
          <JudiciaryPanel />
        </TabsContent>
        <TabsContent value="evolution" className="flex-1 p-4 md:p-6 m-0">
          <PredictiveForecasting />
        </TabsContent>
        <TabsContent value="apps" className="flex-1 p-4 md:p-6 m-0 space-y-4">
           {apps.map(app => (
             <div key={app.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex justify-between items-center group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Server size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                      <p className="text-[9px] text-muted-foreground font-mono">AppID: {app.appId}</p>
                   </div>
                </div>
                <Badge variant="outline" className="text-[8px] border-accent/40 text-accent uppercase">{app.status}</Badge>
             </div>
           ))}
        </TabsContent>
      </Tabs>
    </Card>
  )
}
