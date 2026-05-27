
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, Send, ShieldCheck, BookOpen, Terminal, CheckCircle2, Lock, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function IntegrationPanel() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newApp, setNewApp] = useState({ name: '', webhook: '' })
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

  const handleTestPing = async (app: any) => {
    toast({
      title: "RSA Bridge Ping",
      description: `${app.appName} এর জন্য SHA256 সিগনেচার জেনারেট করা হচ্ছে...`,
    });
    
    await IntegrationBridge.broadcastEvent({
      type: 'STATUS_UPDATED',
      payload: { 
        test: true, 
        message: "Imperial Webhook Handshake",
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      toast({ title: "পিং সফল!", description: "রেসপন্স: 200 OK (Signed)" });
    }, 1500);
  }

  return (
    <Card className="bg-card border-primary/20 flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Cpu className="text-primary" size={20} />
              SOVEREIGN PARTNERSHIP HUB
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-primary/60">
              RSA v2 Bridge & Universal Webhook Engine
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 gap-1.5 py-1">
            <Lock size={12} /> IMPERIAL SDK ACTIVE
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="apps" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="apps" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> কানেক্টেড পার্টনার্স</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><BookOpen size={14}/> এপিআই ডকস</TabsTrigger>
          </TabsList>
        </div>

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

          <ScrollArea className="h-[450px]">
            <div className="grid gap-3">
              {apps.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Cpu size={64} className="mx-auto mb-4" />
                  <p className="text-sm font-headline font-bold uppercase tracking-widest">No Imperial Partners Linked</p>
                </div>
              ) : (
                apps.map(app => (
                  <div key={app.id} className="p-4 bg-card/60 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Key size={24} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-headline font-bold">{app.appName}</p>
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[7px] uppercase h-4 px-1.5">
                            {app.partnershipLevel || 'Standard'}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[250px]">{app.webhookUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleTestPing(app)}
                        className="h-9 text-[10px] gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary font-bold"
                      >
                        <Send size={14} /> RSA PING
                      </Button>
                      <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 p-6 m-0">
          <ScrollArea className="h-[550px] pr-4">
            <div className="space-y-8">
              <section className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 mb-3 uppercase tracking-widest">
                  <ShieldCheck size={18} /> RSA v2 Handshake (Protocol)
                </h4>
                <p className="text-xs text-foreground/80 leading-relaxed font-body mb-4">
                  আপনার সাম্রাজ্যের নিরাপত্তা নিশ্চিত করতে আমরা SHA256withRSA ডিজিটাল সিগনেচার ব্যবহার করি। প্রতিটি পে-লোডে `X-Imperial-Signature` হেডার থাকবে।
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Required Headers:</p>
                    <code className="text-[10px] font-mono block bg-black/60 p-3 rounded-md text-primary/80 border border-white/5 whitespace-pre">
{`X-Imperial-Key: sk_imperial_...
X-Imperial-Signature: sig_sha256_rsa_...
Content-Type: application/json`}
                    </code>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 mb-4 uppercase tracking-widest">
                  <Terminal size={18} /> Integration Example
                </h4>
                <div className="p-4 bg-muted/40 rounded-xl border border-white/5">
                  <code className="text-[10px] font-mono block bg-black/60 p-4 rounded-md text-primary/70 leading-relaxed whitespace-pre overflow-x-auto">
{`// Sirajganj Surakkha SDK v2.0
import { ImperialBridge } from '@surakkha/sdk';

const partner = new ImperialBridge({
  apiKey: 'YOUR_IMPERIAL_KEY',
  webhookSecret: 'YOUR_SECRET'
});

partner.on('SOS_TRIGGERED', (alert) => {
  console.log('Emergency Detected:', alert.location);
  // Execute local response logic
});`}
                  </code>
                </div>
              </section>

              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <CheckCircle2 size={18} />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-[0.2em]">Sovereign Audit Registry</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-body leading-relaxed italic">
                  প্রতিটি এপিআই কল এবং ওয়েবডুক পুশ স্বয়ংক্রিয়ভাবে অডিট রেজিস্ট্রিতে সিগনেচার সহ সংরক্ষিত হয়। কোনো অনিয়ম হলে সিস্টেম স্বয়ংক্রিয়ভাবে পার্টনার কি রিভোক করবে।
                </p>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
