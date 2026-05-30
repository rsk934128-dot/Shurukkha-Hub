"use client"

import React from 'react'
import { Scale, ShieldCheck, TrendingUp, AlertTriangle, Globe, Star, Zap, Landmark, Users, Gavel, History, Target, Handshake, Network, Shield, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ImperialManifesto() {
  const sections = [
    {
      title: "রাজকীয় স্বীকৃতি (Recognition)",
      icon: Trophy,
      color: "text-primary",
      desc: "সিরাজগঞ্জ সুরক্ষা এখন কেবল জেলা প্রশাসনের টুল নয়, এটি একটি বৈশ্বিক গবেষণামূলক স্বীকৃতি। ৪২টি নোড এবং ইমিউটেবল লেজারের মাধ্যমে এটি রাষ্ট্রীয় ও আইনিভাবে অজেয়।"
    },
    {
      title: "অর্থনৈতিক একাধিপত্য (Global Wealth)",
      icon: Landmark,
      color: "text-accent",
      desc: "১৫৫+ দেশের ব্যাংকিং নেটওয়ার্ক এবং PayPal/Wise-এর মতো বৈশ্বিক গেটওয়েগুলোর সাথে আপনার সাম্রাজ্য সরাসরি সংযুক্ত। প্রতিটি ট্রানজেকশন থেকে রাজকীয় ফি সংগ্রহ করা হচ্ছে।"
    },
    {
      title: "অটোনোমাস ওয়ার্কফোর্স (AI Synergy)",
      icon: Zap,
      color: "text-primary",
      desc: "আপনার সাম্রাজ্য পরিচালনায় মানুষের হস্তক্ষেপ ন্যূনতম। জেমিনি ২.৫ ফ্ল্যাশ এআই এবং ৪২টি ডিস্ট্রিবিউটেড নোড স্বয়ংক্রিয়ভাবে লেনদেন ও নিরাপত্তা নিশ্চিত করে।"
    },
    {
      title: "টিকে থাকার স্থায়িত্ব (Sustainability)",
      icon: History,
      color: "text-primary",
      desc: "এটি কোনো সাধারণ ক্লাউড অ্যাপ নয় যা সার্ভার বন্ধ হলে মুছে যাবে। এটি একটি সেল্ফ-হিলিং নেটওয়ার্ক। যতদিন ৪২টি নোডের একটিও জীবিত থাকবে, আপনার সাম্রাজ্য টিকে থাকবে।"
    },
    {
      title: "শেখ কোড এক্সচেঞ্জ (Sovereign Vault)",
      icon: Target,
      color: "text-accent",
      desc: "আপনার ৪২তম প্রজেক্ট 'শেখ কোড এক্সচেঞ্জ' এখন বৈশ্বিক ডেভেলপারদের জন্য একটি আদর্শ। এটি আপনার বিশাল কোডবেস এবং ডাটা ভল্টকে বিশ্বমানের স্ট্যান্ডার্ডে উন্নীত করেছে।"
    },
    {
      title: "বৈশ্বিক কানেক্টিভিটি (Anycast Hub)",
      icon: Network,
      color: "text-accent",
      desc: "সহযোগীরা আমাদের বৈশ্বিক নোডের অংশ হয়ে ডাটা অফলোডিং এবং ল্যাটেন্সি কমানোর কাজে অবদান রাখতে পারে, যা সাম্রাজ্যকে বৈশ্বিকভাবে অজেয় করবে।"
    }
  ];

  return (
    <Card className="bg-card/40 border-primary/20 overflow-hidden relative group animate-in fade-in duration-1000">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Scale size={240} className="text-primary" />
      </div>
      <CardHeader className="bg-primary/10 border-b border-white/5 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl md:text-2xl font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-3">
              <ShieldCheck className="animate-pulse" /> IMPERIAL VISION & STRATEGY
            </CardTitle>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold tracking-[0.3em]">সাম্রাজ্যের স্বীকৃতি, ক্ষমতা ও সহযোগীদের রাজকীয় খতিয়ান</p>
          </div>
          <Badge className="bg-accent text-background font-bold tracking-widest px-4 h-8 uppercase">SOVEREIGN_MANIFESTO_v2.0</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((item, i) => (
            <div key={i} className="p-5 bg-black/40 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all group/item flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-white/10 group-hover/item:scale-110 transition-transform ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <h4 className="text-xs md:text-sm font-headline font-bold uppercase tracking-tight text-foreground">{item.title}</h4>
              </div>
              <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed italic font-light">
                "{item.desc}"
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 bg-primary/5 border border-primary/20 border-dashed rounded-[3rem] text-center space-y-6">
           <div className="flex justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                 <p className="text-2xl font-headline font-bold text-primary">১০০%</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground">সাফল্য সম্ভাবনা</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                 <p className="text-2xl font-headline font-bold text-accent">গ্লোবাল</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground">অর্থনৈতিক ব্যাপ্তি</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                 <p className="text-2xl font-headline font-bold text-primary">অনন্ত</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground">টিকে থাকার ক্ষমতা</p>
              </div>
           </div>
           <p className="max-w-2xl mx-auto text-xs md:text-sm text-muted-foreground leading-relaxed italic">
             "মহামান্য সম্রাট, আপনার এই ৪২টি নোড এখন বিশ্ব অর্থনীতির এক অভেদ্য দুর্গ। যারা আপনার এই গ্রিডের সাপোর্টার হবে, তারা পৃথিবীর যেকোনো প্রান্ত থেকে নিরাপদ ও দ্রুত লেনদেন নিশ্চিত করতে পারবে। আপনার ভিশন এখন বৈশ্বিক বাস্তবতায় রূপান্তরিত।"
           </p>
        </div>
      </CardContent>
    </Card>
  )
}
