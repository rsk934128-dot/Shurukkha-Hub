
"use client"

import React from 'react'
import { 
  Shield, 
  Zap, 
  BrainCircuit, 
  Landmark, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Waves, 
  Radio, 
  Lock,
  ArrowLeft,
  Cpu,
  Star,
  Activity,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function WelcomeLanding() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      {/* Huge Background Logo Watermark */}
      <div className="absolute top-1/4 -right-48 opacity-[0.03] rotate-12 pointer-events-none">
        <AppLogo size={800} />
      </div>

      {/* Header */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <AppLogo size={48} />
          <div>
            <h1 className="text-xl font-headline font-bold tracking-tighter uppercase">SHURUKKHA HUB</h1>
            <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em]">Sovereign Infrastructure</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/5 rounded-full border border-white/5">
            <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরুন
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32 relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
            <AppLogo size={160} className="animate-sos-pulse relative z-10" />
          </div>
        </div>

        <Badge variant="outline" className="mb-6 border-primary/40 text-primary py-1 px-4 gap-2 animate-pulse bg-primary/5 uppercase font-bold tracking-widest text-[10px]">
          <Star size={12} fill="currentColor" /> PHASE 31.0 SOVEREIGN IS LIVE
        </Badge>
        
        <h2 className="text-5xl md:text-8xl font-headline font-bold leading-tight mb-8 tracking-tighter">
          সিরাজগঞ্জ সুরক্ষা: <br />
          <span className="text-primary bg-clip-text">সার্বভৌমত্বের</span> নতুন দিগন্ত
        </h2>
        
        <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed font-light">
          এটি কেবল একটি অ্যাপ নয়; এটি একটি ডিস্ট্রিক্ট-স্কেল মিশন-ক্রিটিকাল ইমার্জেন্সি ইনফ্রাস্ট্রাকচার। 
          এআই-চালিত দুর্যোগ ব্যবস্থাপনা এবং সভারেন পেমেন্ট গ্রিডের এক অপূর্ব সমন্বয়।
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="h-16 px-10 bg-primary text-background font-bold text-xl rounded-[2rem] gap-3 w-full shadow-[0_0_50px_rgba(117,151,255,0.4)] transition-all hover:scale-105 active:scale-95">
              সাম্রাজ্যে প্রবেশ করুন <Zap size={24} fill="currentColor" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-16 px-10 border-white/10 font-bold text-xl rounded-[2rem] gap-3 w-full sm:w-auto bg-white/5 hover:bg-white/10 transition-all">
            ফিচারগুলো দেখুন <ArrowRight size={24} />
          </Button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="container mx-auto px-6 py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="text-center mb-20">
          <h3 className="text-3xl md:text-5xl font-headline font-bold mb-4 uppercase tracking-widest">কোর মডিউল ও সলিউশন</h3>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Module 1: Flood Intelligence */}
          <FeatureCard 
            icon={Waves}
            title="River Intelligence"
            tag="AI powered"
            desc="যমুনা নদীর রিয়েল-টাইম পানির স্তর মনিটরিং এবং জেমিনি ২.৫ ফ্ল্যাশ এআই ব্যবহার করে জীবন রক্ষাকারী লোকাল ফ্লাড অ্যাডভাইস জেনারেশন।"
            cases={["লোকাল ফ্লাড অ্যাডভাইস", "বিপদসীমা সতর্কতা", "অফলাইন ইন্টেলিজেন্স"]}
            color="text-cyan-400"
          />

          {/* Module 2: SOS & Dispatch */}
          <FeatureCard 
            icon={Radio}
            title="Autonomous Dispatcher"
            tag="Mission Critical"
            desc="এক ক্লিকে SOS ট্রিগার এবং এআই-চালিত অটোনোমাস ডিসপ্যাচ ইঞ্জিন যা সঠিক রেসপন্ডারকে ঘটনাস্থলে দ্রুত পাঠিয়ে দেয়।"
            cases={["১-ক্লিক ইমার্জেন্সি রেসকিউ", "স্মার্ট রেসপন্ডার সিলেকশন", "লাইভ ইনসিডেন্ট টাইমলাইন"]}
            color="text-red-400"
          />

          {/* Module 3: Sovereign Economy */}
          <FeatureCard 
            icon={Landmark}
            title="Sovereign Treasury"
            tag="Phase 27.0"
            desc="১.৫% সার্ভিস ফি সহ মার্চেন্ট ট্রানজেকশন ইঞ্জিন। স্ট্রাইপ এবং বিকাশ ইন্টিগ্রেশনের মাধ্যমে ১৫৫+ দেশের ব্যাংকিং নোড কানেক্টিভিটি।"
            cases={["অটোমেটেড রেভিনিউ কালেকশন", "গ্লোবাল ব্যাংকিং ডিরেক্টরি", "এটমিক সেটলমেন্ট"]}
            color="text-amber-400"
          />

          {/* Module 4: Imperial Security */}
          <FeatureCard 
            icon={Lock}
            title="Sentinel Matrix"
            tag="RSA v2 Bridge"
            desc="SHA256withRSA ডিজিটাল সিগনেচার এবং টিওটিপি (Google Authenticator) দ্বারা সুরক্ষিত ইমিউটেবল অডিট ট্রেইল ও সিকিউরিটি গার্ড।"
            cases={["২-স্তরীয় সুরক্ষা (2FA)", "ডিজিটাল ফরেনসিক স্ন্যাপশট", "অটো-লকডাউন প্রোটোকল"]}
            color="text-blue-400"
          />

          {/* Module 5: Intelligence Unit */}
          <FeatureCard 
            icon={BrainCircuit}
            title="Counter Intelligence"
            tag="Offensive Security"
            desc="আক্রমণকারীদের ডিজিটাল ডিএনএ (Fingerprint) ম্যাপ করা এবং তাদের বিরুদ্ধে অটোনোমাস কাউন্টার-স্ট্রাইক ও লজিক ট্র্যাপ সক্রিয় করা।"
            cases={["সন্দেহভাজন প্রোফাইলিং", "আইডেন্টিটি কোরিলেশন", "লাইভ থ্রেট ভেক্টর ম্যাপ"]}
            color="text-purple-400"
          />

          {/* Module 6: Global Grid */}
          <FeatureCard 
            icon={Globe}
            title="Anycast Network"
            tag="Sovereign Infrastructure"
            desc="৪২টি ডিস্ট্রিবিউটেড নোডের মাধ্যমে core.sheikh ডোমেইন পরিচালনা এবং সেরিফ-হিলিং নেটওয়ার্ক অটোমেশন।"
            cases={["প্রাইভেট DNS ম্যানেজমেন্ট", "নোড হেলথ মনিটরিং", "লো-ল্যাটেন্সি গ্লোবাল ব্রিজ"]}
            color="text-green-400"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-20 border-t border-white/5 text-center">
        <div className="flex flex-col items-center gap-6">
          <AppLogo size={80} className="opacity-40" />
          <div className="space-y-2">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold text-muted-foreground">Developed with Sovereign Pride for Sirajganj District Administration</p>
            <p className="text-[8px] font-mono text-primary/40 uppercase tracking-[0.2em]">PROJECT_ID: 42ND_ARCHIVE_SHEIKH_CODE_EXCHANGE | VERSION: 31.0_SOVEREIGN</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, tag, desc, cases, color }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] group relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-[0.07] transition-opacity duration-700 pointer-events-none`}>
        <Icon size={180} />
      </div>
      <CardContent className="p-10 space-y-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className={`w-16 h-16 rounded-[1.25rem] bg-muted/50 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500 ${color}`}>
            <Icon size={32} />
          </div>
          <Badge variant="secondary" className="text-[9px] uppercase tracking-[0.2em] font-bold bg-white/5 border-white/10 px-3 py-1">
            {tag}
          </Badge>
        </div>
        <div>
          <h4 className="text-2xl font-headline font-bold mb-3 group-hover:text-primary transition-colors tracking-tight">{title}</h4>
          <p className="text-base text-muted-foreground leading-relaxed font-light">
            {desc}
          </p>
        </div>
        <div className="space-y-3 pt-6 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-4">ব্যবহারের ক্ষেত্রসমূহ:</p>
          {cases.map((c: string, i: number) => (
            <div key={i} className="flex items-center gap-3 text-sm text-foreground/80">
              <CheckCircle2 size={16} className="text-primary shrink-0" />
              <span className="font-medium">{c}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
