"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu, Zap, Database, Code2, Link, Map, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { SovereignConnector } from '@/lib/sovereign-connector'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', webhook: '' })
  const [isHandshaking, setIsHandshaking] = useState(false)
  const discoveryMap = IntegrationBridge.getDiscoveryMap()
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
              DEVELOPER PORTAL V21.0
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              Sovereign API Access ACTIVE • NoorAI & FusionPay Bridge
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5 gap-1.5 py-1">
              <Zap size={12} className="fill-accent" /> SANDBOX_V2
            </Badge>
            <Button 
              size="sm" 
              onClick={handleSovereignHandshake}
              disabled={isHandshaking}
              className="h-7 text-[9px] bg-accent text-background font-bold gap-1"
            >
              {isHandshaking ? <Database size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
              HANDSHAKE TEST
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="apps" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="apps" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> কানেক্টেড পার্টনার্স</TabsTrigger>
            <TabsTrigger value="discovery" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Search size={14}/> URL ডিসকভারি</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Code2 size={14}/> এপিআই ডকস (Sovereign)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="apps" className="flex-1 p-6 space-y-6 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <Lock size={10} /> Public App Key (X-R-AK)
              </p>
              <code className="text-xs font-mono text-primary truncate block bg-black/40 p-2 rounded">X-R-AK-SURAKKHA-2024</code>
            </div>
            <div className="p-4 bg-muted/30 border border-white/5 rounded-xl space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck size={10} /> Imperial Secret Key
              </p>
              <code className="text-xs font-mono text-accent truncate block bg-black/40 p-2 rounded">sk_imperial_master_key_v21</code>
            </div>
          </div>

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

          <ScrollArea className="h-[350px]">
            <div className="grid gap-3">
              {apps.length === 0 ? (
                <div className="text-center py-12 opacity-20">
                  <Cpu size={48} className="mx-auto mb-4" />
                  <p className="text-xs font-headline font-bold uppercase tracking-widest">No Partners Linked</p>
                </div>
              ) : (
                apps.map(app => (
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
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="discovery" className="flex-1 p-6 m-0 space-y-6">
          <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
            <h4 className="text-sm font-headline font-bold text-accent flex items-center gap-2 mb-2 uppercase tracking-widest">
              <Map size={18} /> URL Mapping & Discovery Protocol
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              আপনার সাম্রাজ্যের এই URL গুলো বিকাশের মতো ফিনটেক ইকোসিস্টেমে সরাসরি সার্চেবল। প্রতিটি পাথ RSA ভেরিফাইড এবং সভারেন গ্রিডে ম্যাপ করা হয়েছে।
            </p>
          </div>

          <div className="grid gap-3">
            {discoveryMap.map(ep => (
              <div key={ep.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-accent/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                    <Link size={18} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-headline font-bold">{ep.name}</h3>
                    <code className="text-[10px] font-mono text-accent/80 bg-black/40 px-2 py-0.5 rounded">
                      {IntegrationBridge.baseSovereignUrl}{ep.path}
                    </code>
                  </div>
                </div>
                <Badge variant="outline" className="text-[8px] h-5 border-accent/40 text-accent gap-1">
                  <CheckCircle2 size={10} /> {ep.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-primary fill-primary" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Auto-Discovery Active</h4>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              সিস্টেম এখন বৈশ্বিক গ্রিডে আপনার URL গুলো পুশ করছে। বিকাশের সার্চ ইনডেক্সে আপনার "Imperial Identity" স্বীকৃত হওয়ার প্রক্রিয়া চলমান।
            </p>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 p-6 m-0">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              <section className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 mb-3 uppercase tracking-widest">
                  <Terminal size={18} /> Imperial SDK Integration
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed font-body mb-4">
                  নূরআই এবং ফিউশনপে-এর সাথে আপনার সিস্টেমকে যুক্ত করার জন্য নিচের প্রোটোকল অনুসরণ করুন। প্রতিটি রিকোয়েস্টে ডিজিটাল সিগনেচার বাধ্যতামূলক।
                </p>
                <div className="p-4 bg-black/60 rounded-xl border border-white/5 overflow-x-auto">
                  <pre className="text-[10px] font-mono text-accent/80 leading-relaxed">
{`// Sovereign Handshake Example
const response = await fetch('https://api.noorai.io/v1/handshake', {
  method: 'POST',
  headers: {
    'X-R-AK': 'X-R-AK-SURAKKHA-2024',
    'X-R-TS': Date.now().toString(),
    'X-R-Signature': generateSignature(payload, secretKey)
  },
  body: JSON.stringify({ action: 'AUTHORIZE_PAYMENT' })
});`}
                  </pre>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                  <ShieldCheck size={18} /> Webhook Subscription
                </h4>
                <div className="p-4 bg-muted/40 rounded-xl border border-white/5 space-y-2">
                  <p className="text-[11px] font-bold text-foreground">Supported Events:</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {['SOS_TRIGGERED', 'STATUS_UPDATED', 'FLOOD_ALERT', 'ORCHESTRATION_EVENT'].map(ev => (
                      <li key={ev} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 size={10} className="text-accent" /> {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                <p className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Security Audit Note:</p>
                <p className="text-[10px] text-muted-foreground font-body leading-relaxed italic">
                  প্রতিটি এপিআই রিকোয়েস্ট সার্বভৌম অডিট রেজিস্ট্রিতে (RSA v2) সিগনেচার সহ সংরক্ষিত হয়। নূরআই থ্রেশহোল্ড অতিক্রম করলে সিস্টেম অটোমেটিক রিভোক হবে।
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
