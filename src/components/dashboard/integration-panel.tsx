
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu, Zap, Database, Code2, Link, Map, Search, ArrowRightLeft, ShieldAlert, Activity, RefreshCw, Rocket, History, TrendingUp, ShieldX, Eye, Filter, Skull, UserX, AlertTriangle } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [suspects, setSuspects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', webhook: '' })
  const [isHandshaking, setIsHandshaking] = useState(false)
  
  const discoveryMap = [
    { id: 1, name: 'Payment Webhook', path: '/api/webhook/bkash', status: 'v25_active', redundancy: 'Primary' },
    { id: 2, name: 'SOS Signal Hub', path: '/api/v1/sos', status: 'v25_active', redundancy: 'Backup' },
    { id: 3, name: 'Honeypot Trap', path: '/api/v1/decoy-trap', status: 'TRAP_ACTIVE', redundancy: 'Security' }
  ]
  
  const guardStats = SovereignGuard.getStats();
  const traffic = SovereignGuard.getLiveTraffic();
  const { toast } = useToast()

  useEffect(() => {
    const appsQ = query(collection(db, "integrations"));
    const unsubApps = onSnapshot(appsQ, (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const suspectsQ = query(collection(db, "suspect_profiles"), orderBy("timestamp", "desc"), limit(10));
    const unsubSuspects = onSnapshot(suspectsQ, (snapshot) => {
      setSuspects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubApps();
      unsubSuspects();
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
      const result = await SovereignConnector.authorizeAction('SYSTEM_HANDSHAKE', {
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

  return (
    <Card className="bg-card border-primary/20 flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Cpu className="text-primary" size={20} />
              SOVEREIGN API COMMAND CENTER
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              API Interceptor • Adaptive Guard • Honeypot Matrix
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/5 gap-1.5 py-1">
              <ShieldAlert size={12} className="animate-pulse" /> TRAP_ENGAGED
            </Badge>
            <Button 
              size="sm" 
              onClick={handleSovereignHandshake}
              disabled={isHandshaking}
              className="h-7 text-[9px] bg-accent text-background font-bold gap-1"
            >
              <ShieldCheck size={12} /> HANDSHAKE
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="guard" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="guard" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><ShieldX size={14}/> গার্ড ও ইন্টারসেপ্টর</TabsTrigger>
            <TabsTrigger value="intelligence" className="text-xs gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold"><Skull size={14}/> ইন্টেলিজেন্স ইউনিট</TabsTrigger>
            <TabsTrigger value="apps" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> পার্টনার্স</TabsTrigger>
            <TabsTrigger value="discovery" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Search size={14}/> ডিকয় ও ট্র্যাপ</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guard" className="flex-1 p-6 space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-1">
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Total Requests</p>
              <p className="text-xl font-headline font-bold text-primary">{guardStats.totalRequests.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-1">
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Intercepted</p>
              <p className="text-xl font-headline font-bold text-destructive">{guardStats.intercepted}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-1">
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Active Rules</p>
              <p className="text-xl font-headline font-bold text-accent">{guardStats.activeRules}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-1">
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Captured</p>
              <p className="text-xl font-headline font-bold text-destructive">{guardStats.suspectsCaptured}</p>
            </div>
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-1">
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Avg Latency</p>
              <p className="text-xl font-headline font-bold text-primary">{guardStats.avgResponseTime}ms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity size={14} className="text-accent animate-pulse" /> LIVE API INTERCEPTOR LOG
              </h4>
              <ScrollArea className="h-[250px] border border-white/5 rounded-xl bg-black/40">
                <div className="p-2 space-y-1">
                  {traffic.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border-b border-white/5 last:border-none">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'PASSED' ? 'bg-accent' : 'bg-destructive animate-pulse'}`} />
                        <div>
                          <p className="text-[10px] font-bold text-foreground">{req.origin}</p>
                          <p className="text-[8px] font-mono text-muted-foreground">{req.endpoint}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`text-[7px] h-4 ${req.status === 'PASSED' ? 'border-accent/30 text-accent' : 'border-destructive/30 text-destructive'}`}>
                          {req.status}
                        </Badge>
                        <p className="text-[7px] text-muted-foreground font-mono mt-0.5">{req.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Filter size={14} className="text-primary" /> ADAPTIVE GUARD RULES
              </h4>
              <div className="space-y-2">
                {SovereignGuard.activeRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-muted/20 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-primary" />
                      <span className="text-[11px] font-bold">{rule.name}</span>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] h-4">ACTIVE</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="flex-1 p-6 space-y-6 m-0">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-2">
            <h4 className="text-xs font-headline font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
              <Skull size={18} /> CAPTURED ATTACKERS (SUSPECT PROFILES)
            </h4>
            <p className="text-[10px] text-muted-foreground">এআই ইন্টেলিজেন্স ইউনিট দ্বারা শনাক্তকৃত সন্দেহভাজন আক্রমণকারীদের তালিকা।</p>
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="grid gap-3">
              {suspects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-30">
                  <UserX size={48} className="mb-2" />
                  <p className="text-sm font-headline">কোন সন্দেহভাজন প্রোফাইল নেই</p>
                </div>
              ) : (
                suspects.map(suspect => (
                  <div key={suspect.id} className="p-4 bg-card/60 border border-destructive/20 rounded-xl flex items-center justify-between group hover:border-destructive/40 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${suspect.status === 'blacklisted' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                        <Skull size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono font-bold">{suspect.ipAddress}</p>
                          <Badge variant={suspect.threatLevel === 'critical' ? 'destructive' : 'outline'} className="text-[7px] h-4">
                            {suspect.threatLevel.toUpperCase()} THREAT
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Violations: {suspect.violationCount} | Captured: {suspect.capturedAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={suspect.status === 'blacklisted' ? 'bg-destructive text-destructive-foreground' : 'bg-yellow-500 text-black'}>
                        {suspect.status.toUpperCase()}
                      </Badge>
                      <p className="text-[8px] text-muted-foreground mt-1">Last: {new Date(suspect.lastIncident).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="apps" className="flex-1 p-6 space-y-6 m-0">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <Input 
              placeholder="Partner App Name" 
              value={newApp.name}
              onChange={(e) => setNewApp({...newApp, name: e.target.value})}
              className="bg-background/50 border-white/10"
              required
            />
            <Input 
              placeholder="Universal Webhook URL" 
              value={newApp.webhook}
              onChange={(e) => setNewApp({...newApp, webhook: e.target.value})}
              className="bg-background/50 border-white/10"
              required
            />
            <Button type="submit" disabled={loading} className="bg-primary text-background font-bold gap-2">
              <Plus size={16} /> পার্টনার যোগ করুন
            </Button>
          </form>

          <ScrollArea className="h-[200px]">
            <div className="grid gap-3">
              {apps.map(app => (
                <div key={app.id} className="p-3 bg-card/60 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Key size={20} className="text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-headline font-bold">{app.appName}</p>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[7px] uppercase h-4 px-1.5">
                          {app.partnershipLevel || 'Standard'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{app.webhookUrl}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="discovery" className="flex-1 p-6 m-0 space-y-6">
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
            <h4 className="text-xs font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2 mb-2">
              <Zap size={18} /> HONEYPOT DECOY MATRIX
            </h4>
            <p className="text-[10px] text-muted-foreground">আক্রমণকারীদের বিভ্রান্ত করতে এবং তাদের ডিজিটাল ফিঙ্গারপ্রিন্ট সংগ্রহ করতে এই 'ডিকয়' এন্ডপয়েন্টগুলো ব্যবহার করা হয়।</p>
          </div>
          <div className="grid gap-3">
            {discoveryMap.map((ep: any) => (
              <div key={ep.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ep.status === 'TRAP_ACTIVE' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-accent/10 border-accent/20 text-accent'}`}>
                    {ep.status === 'TRAP_ACTIVE' ? <Skull size={18} /> : <Link size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-headline font-bold">{ep.name}</h3>
                      <Badge variant="outline" className="text-[7px] border-primary/20 text-primary">{ep.redundancy}</Badge>
                    </div>
                    <code className="text-[10px] font-mono text-accent/80 bg-black/40 px-2 py-0.5 rounded">
                      {ep.path}
                    </code>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[8px] h-5 gap-1 ${ep.status === 'TRAP_ACTIVE' ? 'border-destructive/40 text-destructive animate-pulse' : 'border-accent/40 text-accent'}`}>
                  {ep.status === 'TRAP_ACTIVE' ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />} {ep.status}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
