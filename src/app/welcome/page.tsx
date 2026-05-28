
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

      {/* Header */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <AppLogo size={40} />
          <div>
            <h1 className="text-xl font-headline font-bold tracking-tighter uppercase">SHURUKKHA HUB</h1>
            <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em]">Sovereign Infrastructure</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-xs font-bold uppercase tracking-widest hover:bg-white/5">
            <ArrowLeft size={16} /> ড্যাশবোর্ডে ফিরুন
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-32 relative z-10 text-center">
        <Badge variant="outline" className="mb-6 border-primary/40 text-primary py-1 px-4 gap-2 animate-pulse">
          <Star size={12} fill="currentColor" /> PHASE 31.0 IS LIVE
        </Badge>
        <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight mb-8 tracking-tighter">
          সিরাজগঞ্জ সুরক্ষা: <br />
          <span className="text-primary bg-clip-text">ডিজিটাল সার্বভৌমত্বের</span> নতুন দিগন্ত
        </h2>
        <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-12 leading-relaxed">
          এটি কেবল একটি অ্যাপ নয়; এটি একটি ডিস্ট্রিক্ট-স্কেল মিশন-ক্রিটিকাল ইমার্জেন্সি ইনফ্রাস্ট্রাকচার। 
          এআই-চালিত দুর্যোগ ব্যবস্থাপনা এবং সভারেন পেমেন্ট গ্রিডের এক অনন্য সমন্বয়।
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 bg-primary text-background font-bold text-lg rounded-2xl gap-3 w-full sm:w-auto shadow-[0_0_30px_rgba(117,151,255,0.3)]">
              লগইন করুন <Zap size={20} />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 border-white/10 font-bold text-lg rounded-2xl gap-3 w-full sm:w-auto bg-white/5">
            ফিচারগুলো দেখুন <ArrowRight size={20} />
          </Button>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="container mx-auto px-6 py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="text-center mb-20">
          <h3 className="text-3xl font-headline font-bold mb-4 uppercase tracking-widest">কোর মডিউল ও সলিউশন</h3>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
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

      {/* Tech Stack Banner */}
      <section className="container mx-auto px-6 py-24">
        <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <AppLogo size={200} />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-3xl font-headline font-bold mb-6 uppercase">প্রযুক্তিগত উৎকর্ষতা</h4>
              <p className="text-muted-foreground mb-8">
                আমরা ব্যবহার করছি বিশ্বের আধুনিকতম টেকনোলজি স্ট্যাক, যা আপনার নিরাপত্তা এবং সিস্টেমের স্থায়িত্ব নিশ্চিত করে।
              </p>
              <div className="grid grid-cols-2 gap-4">
                <TechItem label="Next.js 15" />
                <TechItem label="Google Genkit AI" />
                <TechItem label="Firebase Auth/Store" />
                <TechItem label="RSA v2 Encryption" />
                <TechItem label="Tailwind & ShadCN" />
                <TechItem label="Stripe Financial" />
              </div>
            </div>
            <div className="bg-black/40 rounded-3xl p-8 border border-white/5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center border border-accent/40 text-accent">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-accent">System Uptime</p>
                  <p className="text-3xl font-headline font-bold">৯৯.৯৯% সভারেন</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase">
                  <span>Security Integrity</span>
                  <span>১০০%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-full animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                "সিরাজগঞ্জ সুরক্ষা পোর্টালটি এখন সরাসরি নূরআই এবং ফিউশনপে গ্রিডের সাথে যুক্ত।"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/5 text-center opacity-60">
        <p className="text-[10px] uppercase tracking-[0.5em] mb-4">Developed with Sovereign Pride for Sirajganj District Administration</p>
        <p className="text-[8px] font-mono">PROJECT_ID: 42ND_ARCHIVE_SHEIKH_CODE_EXCHANGE | VERSION: 31.0_SOVEREIGN</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, tag, desc, cases, color }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2rem] group relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500`}>
        <Icon size={120} />
      </div>
      <CardContent className="p-8 space-y-6 relative z-10">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-500 ${color}`}>
            <Icon size={28} />
          </div>
          <Badge variant="secondary" className="text-[8px] uppercase tracking-[0.2em] font-bold bg-white/5 border-white/10">
            {tag}
          </Badge>
        </div>
        <div>
          <h4 className="text-xl font-headline font-bold mb-2 group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {desc}
          </p>
        </div>
        <div className="space-y-2 pt-4 border-t border-white/5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary/60 mb-3">ব্যবহারের ক্ষেত্রসমূহ:</p>
          {cases.map((c: string, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
              <CheckCircle2 size={14} className="text-primary" />
              <span>{c}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TechItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
      {label}
    </div>
  )
}
