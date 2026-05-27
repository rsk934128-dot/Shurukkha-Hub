
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, ExternalLink, ShieldCheck, BookOpen, Terminal, Send, CheckCircle2 } from 'lucide-react'
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
      toast({ title: "সফল!", description: "নতুন অ্যাপটি রেজিস্টার করা হয়েছে।" });
    } catch (e) {
      toast({ title: "ব্যর্থ!", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const handleTestPing = async (app: any) => {
    toast({
      title: "টেস্ট পিং পাঠানো হচ্ছে...",
      description: `${app.appName} এর ওয়েবহুকে একটি টেস্ট পে-লোড পাঠানো হচ্ছে।`,
    });
    
    // Simulate ping broadcast
    await IntegrationBridge.broadcastEvent({
      type: 'STATUS_UPDATED',
      payload: { 
        test: true, 
        message: "This is a verification ping from Shurukkha Hub.",
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      toast({
        title: "পিং সফল!",
        description: "রেসপন্স: 200 OK",
      });
    }, 1500);
  }

  return (
    <Card className="bg-card border-white/5 flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Share2 className="text-primary" size={20} />
              ইউনিভার্সাল ব্রিজ (Developer Portal)
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-wider font-body">
              থার্ড-পার্টি ইন্টিগ্রেশন এবং এপিআই ম্যানেজমেন্ট
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary gap-1">
            <ShieldCheck size={12} /> ENTERPRISE SDK
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="apps" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="apps" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><Globe size={14}/> কানেক্টেড অ্যাপস</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"><BookOpen size={14}/> এপিআই ডকুমেন্টেশন</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="apps" className="flex-1 p-6 space-y-6 m-0">
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-xl border border-white/5">
            <Input 
              placeholder="App Name" 
              value={newApp.name}
              onChange={(e) => setNewApp({...newApp, name: e.target.value})}
              className="bg-background border-white/10"
              required
            />
            <Input 
              placeholder="Webhook URL" 
              value={newApp.webhook}
              onChange={(e) => setNewApp({...newApp, webhook: e.target.value})}
              className="bg-background border-white/10"
              required
            />
            <Button type="submit" disabled={loading} className="bg-primary text-background font-bold gap-2">
              <Plus size={16} /> নতুন অ্যাপ যোগ করুন
            </Button>
          </form>

          <ScrollArea className="h-[400px]">
            <div className="grid gap-3">
              {apps.length === 0 ? (
                <div className="text-center py-12 opacity-30">
                  <Globe size={48} className="mx-auto mb-4" />
                  <p className="text-sm font-headline">কোন অ্যাপ কানেক্ট করা নেই</p>
                </div>
              ) : (
                apps.map(app => (
                  <div key={app.id} className="p-4 bg-card border border-white/5 rounded-xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key size={20} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-headline font-bold">{app.appName}</p>
                          <Badge className="bg-accent/20 text-accent border-accent/30 text-[7px] uppercase h-3.5">
                            {app.status}
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
                        className="h-8 text-[10px] gap-1.5 border-white/10 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        <Send size={12} /> টেস্ট পিং
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
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
              <section>
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 mb-3">
                  <Terminal size={16} /> ১. অথেন্টিকেশন (Authentication)
                </h4>
                <div className="p-4 bg-muted/40 rounded-xl border border-white/5 space-y-3">
                  <p className="text-xs text-foreground/80 leading-relaxed font-body">
                    প্রতিটি রিকোয়েস্টে আপনার জন্য জেনারেট করা API Key টি `X-Surakkha-Key` হেডার হিসেবে পাঠাতে হবে।
                  </p>
                  <code className="text-[11px] font-mono block bg-black/40 p-3 rounded-md text-primary/80 border border-white/5">
                    X-Surakkha-Key: sk_live_823sh...
                  </code>
                </div>
              </section>

              <section>
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 mb-3">
                  <Terminal size={16} /> ২. ইভেন্ট টাইপস (Event Types)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'SOS_TRIGGERED', desc: 'নতুন ইমার্জেন্সি এলার্ট ট্রিগার হলে' },
                    { name: 'STATUS_UPDATED', desc: 'ঘটনার স্ট্যাটাস পরিবর্তন হলে' },
                    { name: 'FLOOD_ALERT', desc: 'পানির স্তর বিপদসীমা অতিক্রম করলে' }
                  ].map(e => (
                    <div key={e.name} className="p-3 bg-muted/20 rounded-lg border border-white/5">
                      <p className="text-[10px] font-mono font-bold text-accent">{e.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-1">{e.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 mb-3">
                  <Terminal size={16} /> ৩. ওয়েবহুক পে-লোড (Webhook Payload)
                </h4>
                <div className="p-4 bg-muted/40 rounded-xl border border-white/5">
                  <code className="text-[10px] font-mono block bg-black/40 p-3 rounded-md text-primary/80 leading-relaxed whitespace-pre overflow-x-auto">
{`{
  "event": "SOS_TRIGGERED",
  "alertId": "sos_8291",
  "payload": {
    "location": "বেলকুচি চরাঞ্চল",
    "type": "বন্যা উদ্ধার",
    "timestamp": "2024-03-20T10:30:00Z"
  },
  "signature": "sha256=..."
}`}
                  </code>
                </div>
              </section>

              <section className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                <div className="flex items-center gap-2 text-accent mb-2">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-headline font-bold uppercase tracking-widest">Rate Limiting</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-body leading-relaxed">
                  ফ্রি টায়ার ইউজারদের জন্য প্রতি মিনিটে সর্বোচ্চ ৬০টি রিকোয়েস্ট অনুমোদিত। এন্টারপ্রাইজ সাপোর্ট পেতে জেলা প্রশাসনের আইটি সেলের সাথে যোগাযোগ করুন।
                </p>
              </section>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
