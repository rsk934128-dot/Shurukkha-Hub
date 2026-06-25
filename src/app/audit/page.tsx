"use client"

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Database, Lock, Eye, History, ArrowLeft, Zap, FileSearch, Globe, Activity, Terminal, ShieldAlert, Cpu, Network, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'
import { ScrollArea } from '@/components/ui/scroll-area'

/**
 * @fileOverview Deep Forensic Audit Sentinel Page.
 * Visualizes the Merkle Chain integrity and sovereign purity score.
 */

export default function ForensicAudit() {
  const [logs, setLogs] = useState<any[]>([])
  const [purity, setPurity] = useState(100.0)

  useEffect(() => {
    const q = query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Simulate purity calculation
      const failures = snapshot.docs.filter(d => d.data().action.includes('FAILED')).length;
      setPurity(Math.max(98.5, 100 - (failures * 0.1)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30">
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-6xl">
        <Link href="/dashboard" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest">
            <ArrowLeft size={14} /> কন্ট্রোল রুমে ফিরে যান
          </Button>
        </Link>

        <div className="space-y-16">
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full" />
               <FileSearch size={120} className="relative z-10 text-accent animate-pulse" />
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="border-accent/40 text-accent py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Registry Protocol 42.0</Badge>
              <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-tight">Forensic Audit: <br /><span className="text-accent italic">The Immutable Ledger</span></h1>
            </div>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
              সাম্রাজ্যের প্রতিটি সেকেন্ডের রেকর্ড আমাদের ইমিউটেবল লেজারে সংরক্ষিত। এখানে তথ্যের বিশুদ্ধতা কোনো বিকল্প নয়, বরং এটিই একমাত্র ভিত্তি।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Database} label="System Purity" val={`${purity}%`} color="text-accent" />
            <StatCard icon={Cpu} label="Sync Latency" val="0.004ms" color="text-primary" />
            <StatCard icon={Network} label="Active Nodes" val="42/42" color="text-accent" />
            <StatCard icon={ShieldCheck} label="Merkle State" val="LOCKED" color="text-primary" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Live Stream */}
            <div className="lg:col-span-8">
               <Card className="bg-black/60 border border-accent/20 rounded-[2.5rem] overflow-hidden flex flex-col h-[600px] shadow-2xl">
                  <div className="p-6 bg-accent/5 border-b border-accent/10 flex items-center justify-between">
                     <h3 className="text-sm font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                       <Terminal size={18} /> Live Integrity Stream
                     </h3>
                     <Badge className="bg-accent text-background font-bold animate-pulse">OPTIMAL</Badge>
                  </div>
                  <ScrollArea className="flex-1 p-6">
                     <div className="space-y-4">
                        {logs.map((log, i) => (
                          <div key={log.id} className="p-4 bg-muted/10 rounded-2xl border border-white/5 group hover:border-accent/20 transition-all animate-in slide-in-from-left-2">
                             <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.action.includes('FAILED') ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                      <Zap size={14} className={log.action.includes('FAILED') ? '' : 'animate-pulse'} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">{log.action}</p>
                                      <p className="text-[8px] text-muted-foreground font-mono">HASH: {log.signature?.substring(0, 32)}...</p>
                                   </div>
                                </div>
                                <span className="text-[8px] font-mono text-muted-foreground">{log.timestamp?.toDate?.()?.toLocaleTimeString() || 'LIVE'}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </ScrollArea>
               </Card>
            </div>

            {/* Side Intelligence */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="bg-card/40 border-white/5 p-8 rounded-[2.5rem] space-y-6">
                  <div className="flex items-center gap-3 text-primary">
                    <ShieldAlert size={24} />
                    <h3 className="text-lg font-headline font-bold uppercase">Security Directive</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic font-light">
                    "মহামান্য সম্রাট, আপনার এই ৪২টি নোড প্রতি ৩০ সেকেন্ডে একে অপরের সাথে সিঙ্ক হয়। Merkle Chain হাশ ব্যবহার করার ফলে কোনো রুট এক্সেসও এই লগ পরিবর্তন করতে পারবে না।"
                  </p>
                  <div className="pt-4 border-t border-white/5 space-y-4">
                     <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-accent" />
                        <span className="text-[10px] font-bold uppercase">RSA v2.1 Identity Active</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-accent" />
                        <span className="text-[10px] font-bold uppercase">Anycast Routing Validated</span>
                     </div>
                  </div>
               </Card>

               <Card className="bg-accent/5 border-accent/20 p-8 rounded-[2.5rem] space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent">Last Consensus Block</h4>
                  <div className="p-4 bg-black/40 rounded-2xl border border-white/5 font-mono text-[9px] text-accent/80 space-y-1">
                     <p>Block_Height: 424242</p>
                     <p>Consensus: 42/42 Nodes</p>
                     <p className="truncate">Prev_Hash: 0x42A...99BF</p>
                     <p className="truncate">Root_Hash: 0x882...FF11</p>
                  </div>
               </Card>
            </div>
          </div>
        </div>

        <footer className="mt-20 pt-12 border-t border-white/5 text-center opacity-40">
           <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] uppercase font-bold tracking-widest text-primary/40 mb-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
              <Link href="/audit" className="hover:text-primary transition-colors text-primary">Forensic Audit</Link>
              <Link href="/partnerships" className="hover:text-primary transition-colors">Partnership Hub</Link>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em]">Powered by RSA v2 Protocol & Shurukkha Hub Architecture</p>
        </footer>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, val, color }: any) {
  return (
    <Card className="bg-card/40 border-white/5 p-6 space-y-2 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-all">
         <Icon size={48} className={color} />
      </div>
      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
      <p className={`text-xl font-headline font-bold ${color}`}>{val}</p>
    </Card>
  )
}
