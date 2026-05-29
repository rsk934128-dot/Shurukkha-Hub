
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu, Zap, Database, Code2, Link, Map, Search, ArrowRightLeft, ShieldAlert, Activity, RefreshCw, Rocket, History, TrendingUp, ShieldX, Eye, Filter, Skull, UserX, AlertTriangle, RefreshCcw, Swords, Target, Crosshair, Sparkles, BrainCircuit, Fingerprint, Network, Scale, Trophy, Cloud, HardDrive, Download } from 'lucide-react'
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

  const handleSovereignHandshake = async () => {
    setIsHandshaking(true)
    try {
      await SovereignConnector.authorizeAction('SYSTEM_HANDSHAKE', {
        source: 'SIRAJGANJ_SURAKKHA_HUB',
        target: 'NOORAI_FUSIONPAY_GRID'
      });
      toast({
        title: "Sovereign Handshake ACTIVE",
        description: `NoorAI/FusionPay এর সাথে ডিজিটাল সেতু স্থাপিত হয়েছে।`,
      });
    } catch (e) {
      toast({ title: "Handshake Failed", variant: "destructive" });
    } finally {
      setIsHandshaking(false)
    }
  }

  const handleManualBackup = () => {
    toast({ title: "ব্য়াকআপ শুরু হয়েছে", description: "গুগল ড্রাইভ ভল্টে ডাটা আর্কাইভ করা হচ্ছে..." });
    setTimeout(() => {
      toast({ title: "ব্য়াকআপ সফল", description: "আপনার অডিট লগ এখন সুরক্ষিত।" });
    }, 2000);
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
            <Button 
              size="sm" 
              onClick={handleSovereignHandshake}
              disabled={isHandshaking}
              className="h-7 text-[8px] md:text-[9px] bg-accent text-background font-bold gap-1"
            >
              <ShieldCheck size={12} /> <span className="hidden xs:inline">HANDSHAKE</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="war-room" className="flex-1 flex flex-col">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="war-room" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap"><Swords size={12}/> ওয়ার-রুম</TabsTrigger>
            <TabsTrigger value="vault" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><HardDrive size={12}/> ভল্ট (Drive)</TabsTrigger>
            <TabsTrigger value="victory" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><Trophy size={12}/> বিজয়</TabsTrigger>
            <TabsTrigger value="judiciary" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Scale size={12}/> বিচার বিভাগ</TabsTrigger>
            <TabsTrigger value="intelligence" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap"><Skull size={12}/> ইন্টেল ইউনিট</TabsTrigger>
            <TabsTrigger value="evolution" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><BrainCircuit size={12}/> প্রেডিকশন</TabsTrigger>
            <TabsTrigger value="guard" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><ShieldX size={12}/> গার্ড</TabsTrigger>
            <TabsTrigger value="apps" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Globe size={12}/> পার্টনার্স</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="war-room" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <ThreatMap />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Target size={12} /> COUNTER-INTEL STATS
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[9px] md:text-[10px]">
                    <span className="text-muted-foreground">Latency Traps Active</span>
                    <span className="text-accent font-bold">14 Active</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] md:text-[10px]">
                    <span className="text-muted-foreground">Logic Loops Triggered</span>
                    <span className="text-accent font-bold">42 Instances</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="vault" className="flex-1 p-4 md:p-6 space-y-6 m-0 animate-in fade-in zoom-in-95">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-accent/5 border-accent/20 p-5 space-y-4">
                 <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                       <Cloud size={20} />
                    </div>
                    <Badge className="bg-accent text-background text-[7px] uppercase font-bold">Optimal</Badge>
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Drive Vault Storage</p>
                    <h3 className="text-xl font-headline font-bold text-foreground">{vaultStats.usedSpace} / {vaultStats.totalSpace}</h3>
                    <Progress value={2} className="h-1 bg-white/5 mt-2" />
                 </div>
              </Card>

              <Card className="bg-primary/5 border-primary/20 p-5 space-y-4">
                 <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <Database size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Archived Signals</p>
                    <h3 className="text-xl font-headline font-bold text-foreground">{vaultStats.fileCount.toLocaleString()} Files</h3>
                    <p className="text-[8px] text-primary/60 font-mono mt-1">LAST_SYNC: {new Date(vaultStats.lastBackup).toLocaleTimeString()}</p>
                 </div>
              </Card>

              <Card className="bg-muted/20 border-white/10 p-5 flex flex-col justify-center items-center text-center gap-3">
                 <p className="text-[10px] font-bold text-muted-foreground">Force Manual Archive</p>
                 <Button onClick={handleManualBackup} className="w-full bg-accent text-background font-bold gap-2 rounded-xl h-10 text-xs">
                    <RefreshCw size={14} /> SYNC DRIVE
                 </Button>
              </Card>
           </div>

           <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <History size={16} /> Recent Drive Operations
              </h4>
              <div className="space-y-2">
                 {[
                   { name: 'monthly_revenue_report_may.pdf', size: '2.4 MB', time: '12m ago', status: 'ARCHIVED' },
                   { name: 'drone_recon_alpha_01.mp4', size: '842 MB', time: '1h ago', status: 'ARCHIVED' },
                   { name: 'audit_log_snapshot_v31.json', size: '124 KB', time: '3h ago', status: 'ENCRYPTED' }
                 ].map((op, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 hover:border-accent/40 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-muted/40 rounded-lg flex items-center justify-center">
                            <HardDrive size={14} className="text-muted-foreground" />
                         </div>
                         <div>
                            <p className="text-[11px] font-bold text-foreground">{op.name}</p>
                            <p className="text-[8px] text-muted-foreground uppercase">{op.size} • {op.time}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <Badge variant="outline" className="text-[7px] border-accent/20 text-accent">{op.status}</Badge>
                         <Button size="icon" variant="ghost" className="h-7 w-7 text-primary">
                            <Download size={12} />
                         </Button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </TabsContent>

        <TabsContent value="victory" className="flex-1 p-4 md:p-6 m-0">
          <ImperialVictoryPanel />
        </TabsContent>

        <TabsContent value="judiciary" className="flex-1 p-4 md:p-6 m-0">
          <JudiciaryPanel />
        </TabsContent>

        <TabsContent value="intelligence" className="flex-1 p-4 md:p-6 space-y-6 m-0">
          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-xl mb-4">
            <p className="text-[10px] text-destructive font-bold uppercase tracking-widest flex items-center gap-2">
              <Network size={14} /> Identity Correlation Matrix
            </p>
            <p className="text-[9px] text-muted-foreground mt-1">সিস্টেমটি একই ডিজিটাল ফিঙ্গারপ্রিন্ট ব্যবহারকারী একাধিক আক্রমণকারীকে স্বয়ংক্রিয়ভাবে লিঙ্ক করছে।</p>
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="grid gap-3">
              {suspects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-30">
                  <UserX size={32} className="mb-2" />
                  <p className="text-xs font-headline">কোন সন্দেহভাজন নেই</p>
                </div>
              ) : (
                suspects.map(suspect => (
                  <div key={suspect.id} className="p-3 md:p-4 bg-card/60 border border-destructive/20 rounded-xl flex flex-col gap-3 group hover:border-destructive/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border ${suspect.status === 'blacklisted' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                          <Skull size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] md:text-sm font-mono font-bold truncate max-w-[100px] md:max-w-none">{suspect.ipAddress}</p>
                            <Badge variant={suspect.threatLevel === 'critical' ? 'destructive' : 'outline'} className="text-[6px] h-3 px-1">
                              {suspect.threatLevel}
                            </Badge>
                          </div>
                          <p className="text-[8px] md:text-[10px] text-muted-foreground truncate max-w-[150px]">Capture Point: <span className="text-foreground uppercase">{suspect.capturedAt}</span></p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <Badge className={`text-[7px] ${suspect.status === 'blacklisted' ? 'bg-destructive' : 'bg-yellow-500 text-black'}`}>
                          {suspect.status.toUpperCase()}
                        </Badge>
                        <span className="text-[7px] font-mono text-muted-foreground">{new Date(suspect.lastIncident).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[7px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Fingerprint size={8} /> Digital Fingerprint</p>
                        <code className="text-[8px] text-accent font-mono bg-black/40 px-1.5 py-0.5 rounded block truncate">
                          {suspect.fingerprint || 'GENERATING...'}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[7px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Link size={8} /> Linked Identites</p>
                        <div className="flex flex-wrap gap-1">
                          {suspect.linkedIdentities?.length > 0 ? (
                            suspect.linkedIdentities.map((id: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[6px] h-3 border-destructive/30 text-destructive">{id}</Badge>
                            ))
                          ) : (
                            <span className="text-[8px] text-muted-foreground italic">No links found.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="evolution" className="flex-1 p-4 md:p-6 m-0">
          <PredictiveForecasting />
        </TabsContent>

        <TabsContent value="guard" className="flex-1 p-4 md:p-6 space-y-6 m-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Req', val: guardStats.totalRequests.toLocaleString(), color: 'text-primary' },
              { label: 'Intercepted', val: guardStats.intercepted, color: 'text-destructive' },
              { label: 'Active Rules', val: guardStats.activeRules, color: 'text-accent' },
              { label: 'Captured', val: guardStats.suspectsCaptured, color: 'text-destructive' },
              { label: 'Latency', val: `${guardStats.avgResponseTime}ms`, color: 'text-primary' }
            ].map((s, idx) => (
              <div key={idx} className="p-3 bg-muted/30 border border-white/5 rounded-xl space-y-1">
                <p className="text-[8px] uppercase font-bold text-muted-foreground truncate">{s.label}</p>
                <p className={`text-sm md:text-xl font-headline font-bold ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity size={12} className="text-accent animate-pulse" /> LIVE LOG
              </h4>
              <ScrollArea className="h-[250px] border border-white/5 rounded-xl bg-black/40">
                <div className="p-2 space-y-1">
                  {traffic.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border-b border-white/5 last:border-none">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'PASSED' ? 'bg-accent' : 'bg-destructive animate-pulse'}`} />
                        <div>
                          <p className="text-[9px] md:text-[10px] font-bold text-foreground truncate max-w-[100px]">{req.origin}</p>
                          <p className="text-[7px] md:text-[8px] font-mono text-muted-foreground truncate max-w-[120px]">{req.endpoint}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`text-[6px] md:text-[7px] h-4 ${req.status === 'PASSED' ? 'border-accent/30 text-accent' : 'border-destructive/30 text-destructive'}`}>
                          {req.status}
                        </Badge>
                        <p className="text-[6px] md:text-[7px] text-muted-foreground font-mono mt-0.5">{req.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Filter size={12} className="text-primary" /> ADAPTIVE RULES
              </h4>
              <div className="space-y-2">
                {SovereignGuard.activeRules.slice(0, 4).map((rule) => (
                  <div key={rule.id} className="p-3 bg-muted/20 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className="text-primary" />
                      <span className="text-[9px] md:text-[11px] font-bold truncate max-w-[120px]">{rule.name}</span>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-[7px] h-4">ACTIVE</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="apps" className="flex-1 p-4 md:p-6 space-y-6 m-0">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Input 
              placeholder="Partner Name" 
              value={newApp.name}
              onChange={(e) => setNewApp({...newApp, name: e.target.value})}
              className="bg-background/50 border-white/10 h-9 text-xs"
              required
            />
            <Input 
              placeholder="Webhook URL" 
              value={newApp.webhook}
              onChange={(e) => setNewApp({...newApp, webhook: e.target.value})}
              className="bg-background/50 border-white/10 h-9 text-xs"
              required
            />
            <Button type="submit" disabled={loading} className="bg-primary text-background font-bold gap-2 h-9 text-xs">
              <Plus size={14} /> যোগ করুন
            </Button>
          </form>

          <ScrollArea className="h-[200px]">
            <div className="grid gap-3">
              {apps.map(app => (
                <div key={app.id} className="p-3 bg-card/60 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Key size={14} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-headline font-bold truncate max-w-[120px]">{app.appName}</p>
                      <p className="text-[8px] md:text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">{app.webhookUrl}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
