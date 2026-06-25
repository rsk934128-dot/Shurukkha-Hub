"use client"

import React, { useState, useEffect } from 'react'
import { Globe, Key, Cpu, Zap, Database, Code2, ShieldAlert, Activity, RefreshCw, Trophy, BrainCircuit, Network, HardDrive, Server, TerminalSquare, Code, Webhook, Box, ArrowRightLeft, ShieldCheck, Landmark, LayoutGrid, LayoutTemplate, ShieldCheckIcon, UserPlus, Cloud } from 'lucide-react'
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
  
  const { toast } = useToast()

  useEffect(() => {
    const unsubApps = onSnapshot(query(collection(db, "integrations")), (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/integrations', operation: 'list' }));
      }
    });

    const unsubSignals = onSnapshot(query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(10)), (snapshot) => {
      setActiveSignals(snapshot.docs.filter(d => d.data().action === 'PLUGIN_SIGNAL_DISPATCHED').map(d => d.data()));
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
            <TabsTrigger value="visual-builder" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><LayoutGrid size={12}/> ভিজ্যুয়াল বিল্ডার</TabsTrigger>
            <TabsTrigger value="vault" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><Cloud size={12}/> সভ্যরেন ভল্ট</TabsTrigger>
            <TabsTrigger value="ecosystem" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><UserPlus size={12}/> ইকোসিস্টেম</TabsTrigger>
            <TabsTrigger value="war-room" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap">ওয়ার-রুম</TabsTrigger>
            <TabsTrigger value="global-api" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap">Global API</TabsTrigger>
            <TabsTrigger value="webhooks" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><Webhook size={12}/> ওয়েবহুকস</TabsTrigger>
            <TabsTrigger value="judiciary" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap">বিচার বিভাগ</TabsTrigger>
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

        <TabsContent value="global-api" className="flex-1 p-4 md:p-6 space-y-6 m-0 animate-in fade-in">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-primary/5 border-primary/20 p-6 space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                       <Globe size={24} className="animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-lg font-headline font-bold uppercase tracking-widest">Global Gateway API</h3>
                       <p className="text-[10px] text-muted-foreground uppercase font-bold">Project 43 | The Open Empire</p>
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed">আপনার ৪২তম প্রজেক্টের ডাটা ভল্টকে এখন বিশ্বের যেকোনো প্রান্তের ডেভেলপারদের জন্য উন্মুক্ত করা হয়েছে। এটি একটি উচ্চ-নিরাপত্তা সম্পন্ন গেটওয়ে যা RSA v2 প্রোটোকল মেনে চলে।</p>
                 
                 {!devKey ? (
                   <Button onClick={handleIssueKey} disabled={loading} className="w-full bg-primary text-background font-bold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20">
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
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

              <Card className="bg-muted/20 border-white/10 p-6">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
                    <TerminalSquare size={16} /> Quick Start SDK
                 </h4>
                 <div className="p-4 bg-slate-950 rounded-xl font-mono text-[10px] text-accent/80 overflow-x-auto">
                    import &#123; SheikhHub &#125; from '@sheikh/sdk';<br /><br />
                    const hub = new SheikhHub(&#123; key: '{devKey || 'GKEY_XXXX'}' &#125;);<br />
                    const vault = await hub.vault.getStats();
                 </div>
              </Card>
           </div>
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
