
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu, Zap, Database, Code2, Link, Map, Search, ArrowRightLeft, ShieldAlert, Activity, RefreshCw, Rocket, History, TrendingUp, ShieldX, Eye, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { SovereignConnector } from '@/lib/sovereign-connector'
import { PaymentHandler } from '@/lib/payment-handler'
import { SovereignGuard } from '@/lib/sovereign-guard'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', webhook: '' })
  const [isHandshaking, setIsHandshaking] = useState(false)
  const [isTestingFailover, setIsTestingFailover] = useState(false)
  const discoveryMap = IntegrationBridge.getDiscoveryMap ? IntegrationBridge.getDiscoveryMap() : [
    { id: 1, name: 'Payment Webhook', path: '/api/webhook/bkash', status: 'v21_active', redundancy: 'Primary' },
    { id: 2, name: 'SOS Signal Hub', path: '/api/v1/sos', status: 'v21_active', redundancy: 'Backup' },
    { id: 3, name: 'Audit Forensic Port', path: '/api/v1/audit', status: 'v21_active', redundancy: 'Mirror' }
  ]
  const redundancyMatrix = IntegrationBridge.getRedundancyMatrix ? IntegrationBridge.getRedundancyMatrix() : {
    primary: { url: 'api.sheikh-empire.com/v1', status: 'ACTIVE', load: '12%' },
    backup: { url: 'backup.sheikh-empire.com/v1', status: 'STANDBY', load: '0%' }
  }
  const guardStats = SovereignGuard.getStats();
  const traffic = SovereignGuard.getLiveTraffic();
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "integrations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
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
      
      await IntegrationBridge.broadcastEvent({
        type: 'SOVEREIGN_HANDSHAKE',
        payload: result,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Sovereign Handshake ACTIVE",
        description: `NoorAI/FusionPay এর সাথে ডিজিটাল সেতু স্থাপিত হয়েছে। TXID: ${result.transactionId}`,
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
              API Interceptor • Guard Engine • Sovereign Identity v2.0
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5 gap-1.5 py-1">
              <Zap size={12} className="fill-accent" /> GUARD_ACTIVE
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
            <TabsTrigger value="apps" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> পার্টনার্স</TabsTrigger>
            <TabsTrigger value="discovery" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Search size={14}/> URL ডিসকভারি</TabsTrigger>
            <TabsTrigger value="future" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Rocket size={14}/> রোডম্যাপ</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="guard" className="flex-1 p-6 space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <p className="text-[9px] uppercase font-bold text-muted-foreground">Avg Latency</p>
              <p className="text-xl font-headline font-bold text-primary">{guardStats.avgResponseTime}ms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity size={14} className="text-accent animate-pulse" /> LIVE API INTERCEPTOR LOG
              </h4>
              <ScrollArea className="h-[250px] border border-white/5 rounded-xl bg-black/40">
                <div className="p-2 space-y-1">
                  {traffic.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors border-b border-white/5 last:border-none">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'PASSED' ? 'bg-accent' : 'bg-destructive'}`} />
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

            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Filter size={14} className="text-primary" /> ACTIVE GUARD RULES
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
          <div className="grid gap-3">
            {discoveryMap.map((ep: any) => (
              <div key={ep.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                    <Link size={18} className="text-accent" />
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
                <Badge variant="outline" className="text-[8px] h-5 border-accent/40 text-accent gap-1">
                  <CheckCircle2 size={10} /> {ep.status}
                </Badge>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="future" className="flex-1 p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { phase: 'Phase 25.0', title: 'Direct Settlement', desc: 'বিকাশ ও স্ট্রাইপের সাথে সরাসরি ফান্ডিং লজিক।', icon: Database },
              { phase: 'Phase 26.0', title: 'Two-Way Sync', desc: 'আউটবাউন্ড সিগন্যালিং এবং গেটওয়ে কন্ট্রোল।', icon: ArrowRightLeft },
              { phase: 'Phase 27.0', title: 'Predictive Traffic', desc: 'NoorAI ব্যবহার করে ট্র্যাফিক ফোরকাস্টিং।', icon: TrendingUp },
            ].map((step, idx) => (
              <div key={idx} className="p-5 bg-card/60 border border-white/5 rounded-2xl space-y-3 group hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between">
                  <step.icon size={20} className="text-primary" />
                  <Badge variant="outline" className="text-[8px] h-4 border-primary/20 text-primary">{step.phase}</Badge>
                </div>
                <h4 className="text-sm font-headline font-bold">{step.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
