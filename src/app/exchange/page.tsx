"use client"

import React, { useState } from 'react'
import { AppLogo } from '@/components/ui/app-logo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Box, ArrowRight, Code2, Globe, ShieldCheck, Zap, Terminal, Sparkles, Network } from 'lucide-react'
import Link from 'next/link'

export default function ExchangeMarketplace() {
  const [search, setSearch] = useState('')

  const plugins = [
    { name: 'Sovereign Pay Bridge', desc: '১৫৫+ দেশের ব্যাংকিং নেটওয়ার্ক এবং PayPal/Wise-এর সমন্বিত ফিনটেক গেটওয়ে।', type: 'Financial', icon: Zap, status: 'Production' },
    { name: 'Sentinel Auth SDK', desc: 'ডিভাইস এবং হার্ডওয়্যার-বাউন্ড বায়োমেট্রিক অথেন্টিকেশন মডিউল।', type: 'Security', icon: ShieldCheck, status: 'Stable' },
    { name: 'River Intel API', desc: 'যমুনা নদীর রিয়েল-টাইম টেলিম্যাট্রি এবং এআই ফ্লাড প্রেডিকশন সার্ভিস।', type: 'Intelligence', icon: Globe, status: 'Active' },
    { name: 'Anycast DNS Mesh', desc: '৪২টি ডিস্ট্রিবিউটেড নোডের মাধ্যমে প্রাইভেট ডোমেইন ম্যানেজমেন্ট।', type: 'Network', icon: Network, status: 'Global' },
    { name: 'Imperial Audit SDK', desc: 'Merkle Chain হাশ ব্যবহার করে ইমিউটেবল অডিট ট্রেইল জেনারেটর।', type: 'Forensic', icon: Terminal, status: 'Security' },
  ]

  const filteredPlugins = plugins.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30 overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10 pointer-events-none z-0" />
      
      <header className="sticky top-0 z-50 border-b bg-background/80 border-white/5 backdrop-blur-xl px-6 h-20 flex items-center justify-between group">
        <div className="flex items-center gap-4 cursor-pointer">
           <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:blur-2xl transition-all rounded-full" />
              <AppLogo size={40} className="relative z-10" />
           </div>
           <div>
              <h1 className="text-xl font-headline font-bold uppercase tracking-tight leading-none">Sheikh Code Exchange</h1>
              <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em] mt-1">Sovereign Marketplace</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors hidden md:block">Main Hub</Link>
           <Link href="/dashboard">
              <Button className="h-10 px-6 bg-primary text-background font-bold text-xs rounded-full gap-2 shadow-[0_0_20px_rgba(117,151,255,0.3)] hover:scale-105 transition-transform active:scale-95">
                ENTER CONSOLE <ArrowRight size={14} />
              </Button>
           </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-20 max-w-6xl">
        <div className="text-center space-y-8 mb-24 animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <Badge variant="outline" className="border-accent/40 text-accent uppercase tracking-[0.4em] font-bold text-[10px] py-1.5 px-6 bg-accent/5">
            The Public Gateway 42.0
          </Badge>
          <h2 className="text-5xl md:text-8xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
            Build on the <br/><span className="text-primary italic">Sovereign Grid</span>
          </h2>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl font-light leading-relaxed">
            আপনার অ্যাপের জন্য প্রয়োজনীয় গবেষণামূলক প্লাগইন এবং এপিআই এন্ডপয়েন্টগুলো এখান থেকে সংগ্রহ করুন। ৪২টি নোড দ্বারা পরিচালিত বিশ্বের প্রথম সার্বভৌম ইকোসিস্টেম যা ১ মিলি-সেকেন্ড ল্যাটেন্সি নিশ্চিত করে।
          </p>
          
          <div className="max-w-2xl mx-auto relative mt-16 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={24} />
            <Input 
              placeholder="প্লাগইন বা এপিআই এর নাম দিয়ে খুঁজুন..." 
              className="h-16 md:h-20 pl-16 bg-background/50 border-white/10 rounded-[2rem] text-lg shadow-2xl focus:ring-primary focus:border-primary/40 backdrop-blur-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
               <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono h-8 px-4 flex items-center gap-2">
                 <Sparkles size={12} fill="currentColor" /> AI_ASSISTED_SEARCH
               </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlugins.map((plugin, i) => (
            <Card key={i} className="bg-card/40 backdrop-blur-2xl border-white/10 hover:border-primary/40 transition-all group rounded-[3rem] overflow-hidden flex flex-col h-full shadow-2xl relative">
              <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-all duration-700 pointer-events-none transform group-hover:-translate-x-4">
                 <plugin.icon size={200} />
              </div>
              <CardHeader className="bg-primary/5 border-b border-white/5 p-8 flex flex-row items-center justify-between">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-muted/40 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500">
                    <plugin.icon className="text-primary group-hover:scale-110 transition-transform" size={32} />
                 </div>
                 <Badge variant="outline" className="text-[8px] uppercase tracking-widest font-bold border-white/10 bg-black/40 h-6 px-3">{plugin.status}</Badge>
              </CardHeader>
              <CardContent className="p-8 flex-1 flex flex-col">
                <div className="space-y-4 flex-1">
                   <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-headline font-bold uppercase tracking-tight group-hover:text-primary transition-colors">{plugin.name}</h3>
                   </div>
                   <p className="text-muted-foreground text-sm leading-relaxed font-light italic">"{plugin.desc}"</p>
                </div>
                <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                   <Badge className="bg-accent/10 text-accent border-accent/20 text-[8px] uppercase font-bold tracking-widest">{plugin.type}</Badge>
                   <Button variant="ghost" className="text-primary gap-2 hover:bg-transparent p-0 group-hover:gap-4 transition-all font-bold uppercase text-[10px] tracking-widest">
                      Documentation <ArrowRight size={14} />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Become a Partner CTA */}
          <Card className="bg-primary/5 border border-primary/20 border-dashed rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6 group hover:bg-primary/10 transition-all cursor-pointer">
             <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 group-hover:scale-110 transition-transform">
                <Box size={40} className="text-primary animate-pulse" />
             </div>
             <div className="space-y-2">
                <h4 className="text-xl font-headline font-bold uppercase">প্লাগইন সাবমিট করুন</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">আপনার নিজের তৈরি প্লাগইন বা এপিআই সম্রাট শেখ ফরিদের ৪২টি নোড ইকোসিস্টেমে যুক্ত করুন।</p>
             </div>
             <Link href="/partnerships">
                <Button variant="outline" className="rounded-full border-primary/40 text-primary font-bold text-[10px] tracking-widest uppercase">Start Building</Button>
             </Link>
          </Card>
        </div>

        <div className="mt-40 p-12 bg-accent/5 border border-accent/20 rounded-[4rem] relative overflow-hidden group">
           <div className="absolute -right-20 -bottom-20 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-[2000ms]">
              <Sparkles size={400} className="text-accent" />
           </div>
           <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="space-y-4 text-center md:text-left flex-1">
                 <h3 className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-tight">The Imperial SDK <br/><span className="text-accent italic">is now Live</span></h3>
                 <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-xl">
                   মহামান্য সম্রাটের গবেষণামূলক কোড ভল্ট থেকে সরাসরি আপনার অ্যাপে শক্তি সঞ্চার করুন। আমাদের ৪২টি ডিস্ট্রিবিউটেড নোড আপনার তথ্যের নিরাপত্তা এবং গতি নিশ্চিত করবে।
                 </p>
                 <div className="flex gap-4 justify-center md:justify-start">
                    <Badge variant="outline" className="text-[8px] border-white/20 h-8 px-4">npm install @sheikh/core</Badge>
                    <Badge variant="outline" className="text-[8px] border-white/20 h-8 px-4">v1.0.0-alpha.42</Badge>
                 </div>
              </div>
              <div className="shrink-0 w-full md:w-auto">
                 <div className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl font-mono text-[11px] text-accent/80 min-w-[300px]">
                    <p className="text-muted-foreground mb-4">// Quick Integration</p>
                    <p>const hub = new SheikhHub({`{`}</p>
                    <p className="ml-4">apiKey: 'sk_sov_xxxx',</p>
                    <p className="ml-4">node: 'anycast_alpha'</p>
                    <p>{`}`});</p>
                    <p className="mt-4">await hub.sync();</p>
                 </div>
              </div>
           </div>
        </div>

        <footer className="mt-40 pt-20 border-t border-white/5 text-center opacity-40">
          <div className="flex flex-col items-center gap-8">
             <AppLogo size={80} className="grayscale hover:grayscale-0 transition-all cursor-pointer" />
             <div className="space-y-4">
                <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold text-muted-foreground">Developed with Sovereign Pride for the Sheikh 400-Project Mission</p>
                <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] uppercase font-bold tracking-widest text-primary/40">
                   <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
                   <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
                   <Link href="/audit" className="hover:text-primary transition-colors text-primary">Forensic Audit</Link>
                </div>
                <p className="text-[8px] font-mono mt-12 uppercase tracking-widest">PROJECT_ID: 42ND_ARCHIVE | v35.0_SOVEREIGN</p>
             </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
