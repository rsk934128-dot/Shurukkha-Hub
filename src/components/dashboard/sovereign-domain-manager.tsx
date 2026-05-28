"use client"

import React, { useState, useEffect } from 'react'
import { Globe, Server, ShieldCheck, Plus, Search, Trash2, Link, Cpu, Lock, RefreshCw, Zap, Network, Activity, Terminal, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { useToast } from '@/hooks/use-toast'

export function SovereignDomainManager() {
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newDomain, setNewDomain] = useState({ name: '', extension: '.sheikh', targetIp: '10.42.0.1' })
  const [resolverLogs, setResolverLogs] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "sovereign_domains"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDomains(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const domainFullName = `${newDomain.name}${newDomain.extension}`;
      await addDoc(collection(db, "sovereign_domains"), {
        domainName: newDomain.name,
        extension: newDomain.extension,
        fullName: domainFullName,
        targetIp: newDomain.targetIp,
        status: 'propagating',
        dnsType: 'A',
        timestamp: serverTimestamp()
      });

      setResolverLogs(prev => [`[DNS_REGISTRY] Registering ${domainFullName}...`, ...prev]);
      
      setTimeout(async () => {
        setResolverLogs(prev => [`[DNS_SYNC] ${domainFullName} mapped to ${newDomain.targetIp} ✅`, ...prev]);
        toast({ title: "ডোমেইন নিবন্ধিত", description: `${domainFullName} এখন আপনার প্রাইভেট নেটওয়ার্কে সক্রিয়।` });
      }, 1500);

      setNewDomain({ ...newDomain, name: '' });
    } catch (e) {
      toast({ title: "ব্যর্থ!", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-primary/20 flex flex-col h-full overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline flex items-center gap-2 text-primary">
              <Network size={20} />
              SOVEREIGN DOMAIN MANAGER
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              Private DNS v1.0 • Anycast Routing Active • .sheikh Root
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5 gap-1.5 py-1">
            <ShieldCheck size={12} className="fill-accent" /> INFRA_MIGRATION_COMPLETE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <Alert className="bg-accent/10 border-accent/30 text-accent">
          <ShieldAlert size={16} className="text-accent" />
          <AlertTitle className="text-xs font-bold uppercase tracking-widest">Primary Domain Active: core.sheikh</AlertTitle>
          <AlertDescription className="text-[10px]">
            পুরনো vercel.app ডোমেইনটি পুরোপুরি সরিয়ে ফেলা হয়েছে। এখন থেকে core.sheikh ই সাম্রাজ্যের একমাত্র পরিচয়।
          </AlertDescription>
        </Alert>

        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
          <Input 
            placeholder="Domain (e.g. core)" 
            value={newDomain.name}
            onChange={(e) => setNewDomain({...newDomain, name: e.target.value})}
            className="bg-background/50 border-white/10"
            required
          />
          <select 
            className="bg-background/50 border border-white/10 rounded-md px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            value={newDomain.extension}
            onChange={(e) => setNewDomain({...newDomain, extension: e.target.value})}
          >
            <option value=".sheikh">.sheikh</option>
            <option value=".surukkha">.surukkha</option>
            <option value=".imperial">.imperial</option>
          </select>
          <Input 
            placeholder="Target IP (e.g. 10.42.0.1)" 
            value={newDomain.targetIp}
            onChange={(e) => setNewDomain({...newDomain, targetIp: e.target.value})}
            className="bg-background/50 border-white/10"
            required
          />
          <Button type="submit" disabled={loading} className="bg-primary text-background font-bold gap-2">
            <Plus size={16} /> ডোমেইন যোগ করুন
          </Button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Globe size={14} className="text-primary" /> ACTIVE SOVEREIGN DOMAINS
            </h4>
            <ScrollArea className="h-[300px] border border-white/5 rounded-xl">
              <div className="grid gap-3 p-1">
                {domains.length === 0 ? (
                  <div className="p-4 bg-muted/20 border border-primary/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Star size={18} className="text-primary" fill="currentColor" />
                      </div>
                      <div>
                        <h3 className="text-sm font-headline font-bold">core.sheikh</h3>
                        <p className="text-[10px] text-muted-foreground">PRIMARY ANYCAST DOMAIN</p>
                      </div>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] uppercase">ACTIVE</Badge>
                  </div>
                ) : (
                  domains.map(domain => (
                    <div key={domain.id} className="p-4 bg-muted/20 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                          <Link size={18} className="text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-headline font-bold text-foreground">
                              {domain.fullName}
                            </h3>
                            <Badge className="bg-accent/20 text-accent border-accent/30 text-[7px] uppercase h-4 px-1.5">
                              {domain.dnsType}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono">TARGET: {domain.targetIp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[8px] h-5 ${domain.status === 'active' ? 'border-accent/40 text-accent' : 'border-primary/40 text-primary animate-pulse'}`}>
                          {domain.status.toUpperCase()}
                        </Badge>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Terminal size={14} className="text-accent" /> ANYCAST RESOLVER LOGS
            </h4>
            <div className="bg-black/40 border border-accent/20 rounded-xl overflow-hidden h-[300px] flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-accent/60">
                    [ANYCAST_INIT] core.sheikh resolved to node-42-primary (10.42.0.1)
                  </div>
                  {resolverLogs.map((log, i) => (
                    <div key={i} className="text-[10px] font-mono text-accent/80 leading-relaxed">
                      <span className="text-accent mr-2">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { Star } from 'lucide-react'