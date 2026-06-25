
"use client"

import React, { useState, useEffect } from 'react'
import { Globe, Key, Cpu, Zap, Database, Code2, ShieldAlert, Activity, RefreshCw, Trophy, BrainCircuit, Network, HardDrive, Server, TerminalSquare, Code, Webhook, Box, ArrowRightLeft, ShieldCheck, Landmark, LayoutGrid, LayoutTemplate, ShieldCheckIcon, UserPlus, Cloud, Swords, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { SelfHealing } from '@/lib/self-healing'
import { GoogleDriveBridge, VaultStats } from '@/lib/google-drive-bridge'
import { SovereignAudit } from '@/lib/sovereign-audit'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ThreatMap } from './threat-map'
import { PredictiveForecasting } from './predictive-forecasting'
import { JudiciaryPanel } from './judiciary-panel'
import { ImperialVictoryPanel } from './imperial-victory-panel'
import { VisualPluginBuilder } from './visual-plugin-builder'
import { DeveloperInvitation } from './developer-invitation'
import { VaultManager } from './vault-manager'
import { Progress } from '@/components/ui/progress'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [healingStatus, setHealingStatus] = useState(SelfHealing.getStatus())
  const [vaultStats, setVaultStats] = useState<VaultStats>(GoogleDriveBridge.getVaultStats())
  const [devKey, setDevKey] = useState<string | null>(null)
  const [activeSignals, setActiveSignals] = useState<any[]>([])
  const [hasPermissionError, setHasPermissionError] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    const unsubApps = onSnapshot(query(collection(db, "integrations")), (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setHasPermissionError(false);
    }, (err) => {
      console.error("[Sovereign Guard] Apps Permission Error:", err);
      if (err.code === 'permission-denied') {
        setHasPermissionError(true);
      }
    });

    const unsubSignals = onSnapshot(query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(10)), (snapshot) => {
      setActiveSignals(snapshot.docs.filter(d => d.data().action === 'PLUGIN_SIGNAL_DISPATCHED').map(d => d.data()));
    }, (err) => {
      console.warn("[Sovereign Guard] Signals Permission Error (Suppressed for non-admins)");
    });

    const interval = setInterval(() => {
      setHealingStatus(SelfHealing.getStatus());
      setVaultStats(GoogleDriveBridge.getVaultStats());
    }, 5000);

    return () => {
      unsubApps();
      unsubSignals();
      clearInterval(interval);
    }
  }, [])

  const handleIssueKey = async () => {
    setLoading(true);
    try {
      const key = await IntegrationBridge.generateEphemeralToken();
      setDevKey(key);
      toast({ title: "PROJECT 43 ACTIVE", description: "Global API Gateway access granted." });
    } catch (e) {
      toast({ title: "GATEWAY ERROR", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (hasPermissionError) {
    return (
      <Card className="bg-card border-destructive/20 p-12 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/20">
          <Lock className="text-destructive" size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-headline font-bold text-white uppercase tracking-widest">Access Restricted</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
            "মহামান্য সম্রাট, এই প্যানেলটি শুধুমাত্র উচ্চপদস্থ কর্মকর্তাদের জন্য সংরক্ষিত। আপনার আইডেন্টিটি র্যাঙ্ক অনুযায়ী এই ডাটা প্যাকেটগুলো এক্সেস করার অনুমতি নেই।"
          </p>
        </div>
        <Button variant="outline" className="border-primary/20 text-primary" onClick={() => window.location.reload()}>
          <RefreshCw size={16} className="mr-2" /> RE-AUTHENTICATE
        </Button>
      </Card>
    );
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
              API Interceptor • Unified Aggregator • v35.0
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={`text-[8px] md:text-[10px] gap-1.5 py-1 ${healingStatus.status === 'OPTIMAL' ? 'border-accent/40 text-accent' : 'border-destructive/40 text-destructive animate-pulse'}`}>
              <RefreshCw size={12} className={healingStatus.status === 'REPAIRING' ? 'animate-spin' : ''} /> {healingStatus.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="visual-builder" className="flex-1 flex flex-col">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="visual-builder" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap uppercase tracking-widest"><LayoutGrid size={12}/> Visual Builder</TabsTrigger>
            <TabsTrigger value="vault" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap uppercase tracking-widest"><Cloud size={12}/> Vault</TabsTrigger>
            <TabsTrigger value="ecosystem" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap uppercase tracking-widest"><UserPlus size={12}/> Ecosystem</TabsTrigger>
            <TabsTrigger value="war-room" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap uppercase tracking-widest"><Swords size={12}/> War Room</TabsTrigger>
            <TabsTrigger value="victory" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap uppercase tracking-widest"><Trophy size={12}/> Victory HUD</TabsTrigger>
            <TabsTrigger value="webhooks" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap uppercase tracking-widest"><Webhook size={12}/> Webhooks</TabsTrigger>
            <TabsTrigger value="judiciary" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap uppercase tracking-widest">Judiciary</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual-builder" className="flex-1 p-4 md:p-6 m-0">
          <VisualPluginBuilder />
        </TabsContent>

        <TabsContent value="vault" className="flex-1 p-4 md:p-6 m-0">
          <VaultManager />
        </TabsContent>

        <TabsContent value="ecosystem" className="flex-1 p-4 md:p-6 m-0">
          <DeveloperInvitation />
        </TabsContent>

        <TabsContent value="war-room" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <ThreatMap />
        </TabsContent>

        <TabsContent value="victory" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <ImperialVictoryPanel />
        </TabsContent>

        <TabsContent value="webhooks" className="flex-1 p-4 md:p-6 m-0 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4 space-y-4">
                 <Card className="bg-accent/5 border-accent/20 p-5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Webhook className="text-accent" size={24} />
                       <h4 className="text-xs font-bold uppercase">Signal Dispatcher</h4>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">আপনার সিস্টেম থেকে থার্ড-পার্টি অ্যাপে পাঠানো লাইভ সিগন্যালগুলো এখানে মনিটর করুন।</p>
                 </Card>
              </div>
              <div className="md:col-span-8">
                 <Card className="bg-black/40 border-white/5 rounded-2xl overflow-hidden flex flex-col h-[300px]">
                    <div className="p-3 bg-muted/20 border-b border-white/5 flex justify-between items-center">
                       <span className="text-[10px] font-bold uppercase text-accent">Active Webhook Signals</span>
                       <Badge variant="outline" className="text-[7px] border-accent/40 text-accent">LIVE_FEED</Badge>
                    </div>
                    <ScrollArea className="flex-1 p-3 font-mono text-[10px]">
                       {activeSignals.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Activity size={32} />
                            <p className="mt-2 uppercase tracking-widest">Awaiting Dispatches...</p>
                         </div>
                       ) : (
                         activeSignals.map((sig, i) => (
                           <div key={i} className="py-1 border-b border-white/5 flex justify-between animate-in slide-in-from-left-2">
                              <span className="text-accent">[{new Date(sig.timestamp?.seconds * 1000).toLocaleTimeString()}]</span>
                              <span className="text-primary truncate mx-2">SIGNAL_DISPATCHED_TO_PLUGINS</span>
                              <span className="text-white/60">SIZE: {sig.details?.dataSize}B</span>
                           </div>
                         ))
                       )}
                    </ScrollArea>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="judiciary" className="flex-1 p-4 md:p-6 m-0">
          <JudiciaryPanel />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
