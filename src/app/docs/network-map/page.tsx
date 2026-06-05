"use client"

import React from 'react'
import { 
  Globe, 
  Zap, 
  ShieldCheck, 
  Server, 
  Activity, 
  ArrowLeft, 
  Network, 
  Cpu, 
  Database,
  Map as MapIcon,
  Wifi,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function NodeNetworkMapGuide() {
  const regions = [
    { name: 'Asia Pacific (Primary)', nodes: 18, latency: '0.002ms', status: 'OPTIMAL' },
    { name: 'Europe Central', nodes: 12, latency: '0.008ms', status: 'STABLE' },
    { name: 'North America East', nodes: 8, latency: '0.012ms', status: 'ACTIVE' },
    { name: 'Middle East & Africa', nodes: 4, latency: '0.006ms', status: 'STABLE' },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        <Link href="/docs" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest p-0">
            <ArrowLeft size={14} /> ফিরে যান
          </Button>
        </Link>

        <div className="space-y-16">
          {/* Hero Section */}
          <div className="space-y-6">
            <Badge variant="outline" className="border-accent/40 text-accent py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Infrastructure Phase 31.0</Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
              Sovereign <br /><span className="text-accent italic">Anycast Grid</span>
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl">
              সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের ৪২টি ডিস্ট্রিবিউটেড নোড বিশ্বজুড়ে একটি অজেয় জালের মতো ছড়িয়ে আছে। আমাদের এনিকাস্ট রাউটিং নিশ্চিত করে যে আপনার প্রতিটি রিকোয়েস্ট ১ মিলি-সেকেন্ডেরও কম সময়ে প্রসেস হবে।
            </p>
          </div>

          {/* Anycast Logic Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Network size={24} />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">Anycast Routing Logic</h2>
            </div>
            
            <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  প্রথাগত ইউনিভাস্ট রাউটিংয়ের পরিবর্তে আমরা **BGP Anycast** প্রোটোকল ব্যবহার করি। যখন কোনো নাগরিক বা সিস্টেম `core.sheikh` ডোমেইনে হিট করে, তখন নেটওয়ার্ক অটোমেটিক্যালি তাকে ভৌগোলিকভাবে নিকটতম এবং সবচেয়ে কম লোড থাকা নোডে পাঠিয়ে দেয়।
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-3">
                      <Zap className="text-accent" size={20} />
                      <h4 className="font-bold text-sm uppercase">Zero Latency</h4>
                      <p className="text-[10px] text-muted-foreground">নোডগুলো সরাসরি গ্লোবাল ফাইবার ব্যাকবোনের সাথে যুক্ত, যা ডাটা ট্রাভেল টাইম কমিয়ে দেয়।</p>
                   </div>
                   <div className="p-5 bg-black/40 rounded-3xl border border-white/5 space-y-3">
                      <ShieldCheck className="text-primary" size={20} />
                      <h4 className="font-bold text-sm uppercase">DDOS Mitigation</h4>
                      <p className="text-[10px] text-muted-foreground">আক্রমণগুলো স্বয়ংক্রিয়ভাবে ৪২টি নোডে ছড়িয়ে যায়, ফলে কোনো একক পয়েন্টে লোড পড়ে না।</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Geographical Distribution */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                <Globe size={24} />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">Global Distribution</h2>
            </div>

            <div className="grid gap-4">
               {regions.map((reg, i) => (
                 <div key={i} className="p-6 bg-muted/20 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <MapIcon size={20} />
                       </div>
                       <div>
                          <h4 className="font-headline font-bold text-sm uppercase tracking-tight">{reg.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase">Nodes Active: {reg.nodes} | Latency: {reg.latency}</p>
                       </div>
                    </div>
                    <Badge variant="outline" className="border-accent/40 text-accent font-bold text-[8px] tracking-widest">{reg.status}</Badge>
                 </div>
               ))}
            </div>
          </section>

          {/* Technical Specs */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Cpu size={24} />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">Node Specifications</h2>
            </div>
            
            <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                   <StatItem label="Sync Protocol" val="RSA v2" />
                   <StatItem label="Uptime" val="99.999%" />
                   <StatItem label="Encryption" val="AES-256" />
                   <StatItem label="Isolation" val="Hardware" />
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                   <p className="text-xs text-muted-foreground italic leading-relaxed">
                     "মহামান্য সম্রাট, আপনার এই ৪২টি নোড প্রতি ৩০ সেকেন্ডে একে অপরের সাথে সিঙ্ক হয়। যদি কোনো একটি নোড অফলাইন হয়ে যায়, তবে Anycast স্বয়ংক্রিয়ভাবে ট্রাফিক অন্য হেলদি নোডে রিলুট করবে।"
                   </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer Notice */}
          <footer className="pt-20 border-t border-white/5 text-center">
            <div className="flex flex-col items-center gap-6">
               <AppLogo size={64} className="opacity-20" />
               <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-primary tracking-[0.3em]">Project 42 | Distributed Ledger</p>
                  <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-[0.5em]">
                    ANYCAST_V1 | BGP_PEERING | SOVEREIGN_DNS
                  </p>
               </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}

function StatItem({ label, val }: any) {
  return (
    <div className="text-center space-y-1">
       <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
       <p className="text-lg font-headline font-bold text-foreground">{val}</p>
    </div>
  )
}
