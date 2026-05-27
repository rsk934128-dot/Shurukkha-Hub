
"use client"

import React, { useState, useEffect } from 'react'
import { Share2, Plus, Globe, Key, Trash2, ExternalLink, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { useToast } from '@/hooks/use-toast'

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
      toast({ title: "App Registered Successfully", description: "API Key has been generated." });
    } catch (e) {
      toast({ title: "Registration Failed", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-white/5 flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Share2 className="text-primary" size={20} />
              ইউনিভার্সাল ব্রিজ (API Gateway)
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-wider font-body">
              থার্ড-পার্টি অ্যাপ কানেক্টিভিটি ম্যানেজমেন্ট
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary gap-1">
            <ShieldCheck size={12} /> SECURE SDK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-xl border border-white/5">
          <Input 
            placeholder="App Name (e.g. HealthApp)" 
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
            <Plus size={16} /> কানেক্ট করুন
          </Button>
        </form>

        <div className="space-y-4">
          <h4 className="text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Globe size={12} /> একটিভ ইন্টিগ্রেশনসমূহ
          </h4>
          <div className="grid gap-3">
            {apps.length === 0 ? (
              <div className="text-center py-8 opacity-30">
                <Globe size={40} className="mx-auto mb-2" />
                <p className="text-xs">কোন অ্যাপ কানেক্ট করা নেই</p>
              </div>
            ) : (
              apps.map(app => (
                <div key={app.id} className="p-4 bg-card border border-white/5 rounded-xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Key size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-headline font-bold">{app.appName}</p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{app.webhookUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] uppercase">
                      {app.status}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ExternalLink size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <h5 className="text-[10px] font-headline font-bold text-primary uppercase mb-2">Developer Quickstart</h5>
          <code className="text-[9px] font-mono block bg-black/40 p-3 rounded-md text-primary/80 leading-relaxed whitespace-pre">
            {"// Sirajganj Surakkha SDK Example\n"}
            {"const client = new SurakkhaBridge('YOUR_API_KEY');\n"}
            {"client.on('SOS_TRIGGERED', (alert) => {\n"}
            {"  console.log('Emergency in:', alert.location);\n"}
            {"});"}
          </code>
        </div>
      </CardContent>
    </Card>
  )
}
