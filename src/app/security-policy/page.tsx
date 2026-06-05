"use client"

import React from 'react'
import { ShieldCheck, Lock, ShieldAlert, Zap, ArrowLeft, Globe, Database, Fingerprint, Activity, Swords, Eye, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function SecurityPolicy() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30 overflow-x-hidden">
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
        <Link href="/" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest p-0">
            <ArrowLeft size={14} /> ফিরে যান
          </Button>
        </Link>

        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
               <ShieldCheck size={120} className="relative z-10 text-primary animate-sos-pulse" />
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="border-accent/40 text-accent py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Defense Directive 31.0</Badge>
              <h1 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Security <br /><span className="text-primary italic">Policy Directive</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
              সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের নিরাপত্তা কেবল একটি ফিচার নয়, এটি আমাদের অস্তিত্বের মূল ভিত্তি। আমাদের ৪২টি নোড গ্রিড প্রতিটি সেকেন্ডে আক্রমণের বিরুদ্ধে অজেয় ঢাল হিসেবে কাজ করে।
            </p>
          </div>

          {/* Core Defense Pillars */}
          <div className="grid gap-8">
            <PolicySection 
              icon={Lock}
              title="১. জিরো-ট্রাস্ট আর্কিটেকচার (Zero Trust)"
              desc="সাম্রাজ্যের নেটওয়ার্কে প্রবেশের প্রতিটি অনুরোধকে ডিফল্টভাবে 'অবিশ্বস্ত' মনে করা হয়। পরিচয় নিশ্চিত না হওয়া পর্যন্ত কোনো নোড বা এপিআই ডেটা সরবরাহ করবে না। প্রতিটি সেশন হার্ডওয়্যার-বাউন্ড বায়োমেট্রিক এবং ২-স্তরীয় (2FA) যাচাইকরণ বাধ্যতামূলক।"
              tech="Identity DNA Verification"
            />

            <PolicySection 
              icon={Globe}
              title="২. ৪২-নোড রিডানডেন্সি (Distributed Defense)"
              desc="আপনার ডেটা কোনো একটি নির্দিষ্ট পয়েন্টে থাকে না। এটি বিশ্বজুড়ে ৪২টি ডিস্ট্রিবিউটেড নোডে এনক্রিপ্ট হয়ে ছড়িয়ে থাকে। একটি নোড আক্রান্ত হলে Anycast প্রোটোকল স্বয়ংক্রিয়ভাবে ট্রাফিককে ১ মিলি-সেকেন্ডের মধ্যে অন্য হেলদি নোডে রিলুট করবে।"
              tech="Anycast Multi-Node Sync"
            />

            <PolicySection 
              icon={Swords}
              title="৩. কাউন্টার-স্ট্রাইক প্রোটোকল (Offensive Defense)"
              desc="সিস্টেম যদি কোনো নিশ্চিত আক্রমণকারীকে শনাক্ত করে, তবে এটি কেবল তাকে ব্লক করে না, বরং তার সেশনকে একটি 'Logic Loop' বা ট্র্যাপে আটকে দেয়। এটি আক্রমণকারীর রিসোর্সকে নিঃশেষ করে সাম্রাজ্যকে সুরক্ষিত রাখে।"
              tech="Logic Trap Engagement"
            />

            <PolicySection 
              icon={Database}
              title="৪. ইমিউটেবল অডিট ট্রেইল (Immutable Ledger)"
              desc="সাম্রাজ্যের প্রতিটি সেকেন্ডের রেকর্ড Merkle Chain হাশ ব্যবহার করে সংরক্ষিত হয়। এই লগগুলো কোনো অ্যাডমিন বা বাহ্যিক শক্তি পরিবর্তন বা মুছে ফেলতে পারবে না, যা তথ্যের ফরেনসিক বিশুদ্ধতা নিশ্চিত করে।"
              tech="Merkle Chain Integrity"
            />
          </div>

          {/* Defense Status Widget */}
          <Card className="bg-primary/5 border border-primary/20 rounded-[3rem] overflow-hidden">
             <CardContent className="p-10 text-center space-y-6">
                <div className="flex justify-center items-center gap-6">
                   <div className="text-center space-y-1">
                      <p className="text-3xl font-headline font-bold text-primary">100.0%</p>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Purity Score</p>
                   </div>
                   <div className="w-px h-12 bg-white/10" />
                   <div className="text-center space-y-1">
                      <p className="text-3xl font-headline font-bold text-accent">Active</p>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Sentinel Matrix</p>
                   </div>
                   <div className="w-px h-12 bg-white/10" />
                   <div className="text-center space-y-1">
                      <p className="text-3xl font-headline font-bold text-primary">v31.0</p>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Shield Protocol</p>
                   </div>
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed max-w-xl mx-auto">
                  "নিরাপত্তা নীতি লঙ্ঘনকারীকে সাম্রাজ্যের ফরেনসিক অডিট লগের ভিত্তিতে যেকোনো সময় 'Permanent Exile' বা চিরস্থায়ী ব্ল্যাকলিস্টে অন্তর্ভুক্ত করার অধিকার সম্রাট শেখ ফরিদ সংরক্ষণ করেন।"
                </p>
             </CardContent>
          </Card>

          <footer className="mt-20 pt-12 border-t border-white/5 text-center opacity-40">
           <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] uppercase font-bold tracking-widest text-primary/40 mb-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
              <Link href="/security-policy" className="hover:text-primary transition-colors text-primary">Security Policy</Link>
              <Link href="/audit" className="hover:text-primary transition-colors">Forensic Audit</Link>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em]">Developed with Pride for Sirajganj District Administration</p>
           <p className="text-[8px] font-mono mt-2 uppercase tracking-widest">Project: 42ND_ARCHIVE | v31.0_SOVEREIGN</p>
        </footer>
        </div>
      </main>
    </div>
  )
}

function PolicySection({ icon: Icon, title, desc, tech }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden group">
      <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:bg-primary/20 transition-all duration-500">
          <Icon size={32} />
        </div>
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl md:text-2xl font-headline font-bold text-foreground uppercase tracking-tight">{title}</h3>
            <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] h-5 px-3">PROTECTED</Badge>
          </div>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-light">
            {desc}
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Zap size={14} className="text-accent" />
            <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-widest">Protocol: {tech}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
