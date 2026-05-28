"use client"

import React from 'react'
import { ShieldCheck, Database, Lock, Eye, History, ArrowLeft, Zap, FileSearch, Globe, Activity, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function ForensicAudit() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30">
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
        <Link href="/" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest">
            <ArrowLeft size={14} /> প্রচ্ছদ পাতায় ফিরে যান
          </Button>
        </Link>

        <div className="space-y-12">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AuditCard 
              icon={Database}
              title="Immutable Audit Trail"
              desc="আমাদের ৪২টি নোড প্রতি মুহূর্তে একটি 'Consensus Hash' তৈরি করে। এর ফলে কোনো অ্যাডমিনও কোনো লগ মুছে ফেলতে বা পরিবর্তন করতে পারে না।"
            />
            <AuditCard 
              icon={Lock}
              title="RSA v2 Verification"
              desc="প্রতিটি ট্রানজেকশন এবং SOS অ্যালার্ট SHA256withRSA অ্যালগরিদম দ্বারা স্বাক্ষরিত। এটি তথ্যের উৎস এবং বিশুদ্ধতা নিশ্চিত করে।"
            />
            <AuditCard 
              icon={Globe}
              title="Global Heartbeat"
              desc="প্রতি ৩০ সেকেন্ডে ৪২টি ডিস্ট্রিবিউটেড নোড একে অপরের স্বাস্থ্য এবং ডেটা সিঙ্ক্রোনাইজেশন অডিট করে।"
            />
            <AuditCard 
              icon={Activity}
              title="Purity Verification"
              desc="সিস্টেমের বর্তমান বিশুদ্ধতা বা Purity স্কোর ১০০.০%। যেকোনো বিচ্যুতি দেখা দিলে AI স্বয়ংক্রিয়ভাবে সেলফ-হিলিং প্রোটোকল ট্রিগার করে।"
            />
          </div>

          <div className="bg-black/60 border border-accent/20 rounded-[2.5rem] overflow-hidden">
             <div className="p-6 bg-accent/5 border-b border-accent/10 flex items-center justify-between">
                <h3 className="text-sm font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={18} /> Live Integrity Monitor
                </h3>
                <Badge className="bg-accent text-background font-bold animate-pulse">OPTIMAL</Badge>
             </div>
             <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   <Stat val="100.0%" label="System Purity" />
                   <Stat val="0.004ms" label="Audit Latency" />
                   <Stat val="42/42" label="Sync Nodes" />
                   <Stat val="v31.0" label="Core Protocol" />
                </div>
                <div className="p-4 bg-muted/20 rounded-xl font-mono text-[10px] text-accent/60 leading-relaxed overflow-x-auto no-scrollbar">
                   [AUDIT_SENTINEL]: Master Hash Verified for Block #424242...<br />
                   [RSA_V2]: Signature match confirmed for core.sheikh...<br />
                   [INTEGRITY]: All 42 nodes report 100% data consistency...<br />
                   [STATUS]: Sovereign purity verified. Registry locked.
                </div>
             </div>
          </div>
        </div>

        <footer className="mt-20 pt-12 border-t border-white/5 text-center opacity-40">
           <div className="flex justify-center gap-8 text-[9px] uppercase font-bold tracking-widest text-primary/40 mb-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
              <Link href="/audit" className="hover:text-primary transition-colors text-primary">Forensic Audit</Link>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em]">Powered by RSA v2 Protocol & Shurukkha Hub Architecture</p>
        </footer>
      </main>
    </div>
  )
}

function AuditCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2rem] overflow-hidden group">
      <CardContent className="p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20 group-hover:bg-accent/20 transition-all duration-500">
          <Icon size={28} />
        </div>
        <h3 className="text-lg font-headline font-bold text-foreground uppercase tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-light">
          {desc}
        </p>
      </CardContent>
    </Card>
  )
}

function Stat({ val, label }: any) {
  return (
    <div className="text-center">
       <p className="text-2xl font-headline font-bold text-foreground">{val}</p>
       <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
    </div>
  )
}
