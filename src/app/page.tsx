"use client"

import React, { useEffect, useState } from 'react'
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
  ShieldAlert,
  ShieldCheck,
  Server,
  Fingerprint,
  Swords,
  ChevronRight,
  Sparkles,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'
import { useUser } from '@/firebase'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { PlaceHolderImages } from '@/lib/placeholder-images'
import Image from 'next/image'

export default function WelcomeLanding() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToFeatures = () => {
    const element = document.getElementById('modules');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const banners = [
    {
      img: PlaceHolderImages.find(i => i.id === 'hero-banner-river')?.imageUrl || "https://picsum.photos/seed/42/1200/600",
      title: "যমুনা পাড়ের অজেয় সুরক্ষা",
      desc: "এআই চালিত বন্যা পূর্বাভাস এবং রিয়েল-টাইম ডিসপ্যাচ কমান্ড সেন্টার।",
      badge: "RIVER INTELLIGENCE"
    },
    {
      img: PlaceHolderImages.find(i => i.id === 'hero-banner-command')?.imageUrl || "https://picsum.photos/seed/43/1200/600",
      title: "রাজকীয় প্রশাসনিক কমান্ড",
      desc: "৪২টি ডিস্ট্রিবিউটেড নোডের মাধ্যমে জেলা শাসনের ডিজিটাল সার্বভৌমত্ব।",
      badge: "SOVEREIGN GRID"
    },
    {
      img: PlaceHolderImages.find(i => i.id === 'hero-banner-rescue')?.imageUrl || "https://picsum.photos/seed/44/1200/600",
      title: "অটোনোমাস রেসকিউ নেটওয়ার্ক",
      desc: "এক ক্লিকে SOS ট্রিগার এবং এআই ভিডিও রিকন সাপোর্ট সিস্টেম।",
      badge: "MISSION CRITICAL"
    },
    {
      img: PlaceHolderImages.find(i => i.id === 'hero-banner-treasury')?.imageUrl || "https://picsum.photos/seed/45/1200/600",
      title: "গ্লোবাল ট্রেজারি ও ফিন্যান্স",
      desc: "১৫৫+ দেশের ব্যাংকিং নোড এবং ক্রিপ্টো সেটলমেন্টের সমন্বিত ব্যবস্থা।",
      badge: "IMPERIAL TREASURY"
    }
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body overflow-x-hidden selection:bg-primary/30">
      {/* Immersive Background Effects */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      {/* Persistent Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 border-b ${scrolled ? 'bg-background/80 backdrop-blur-xl border-white/10 py-4' : 'bg-transparent border-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:blur-2xl transition-all rounded-full" />
              <AppLogo size={48} className="relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold tracking-tighter uppercase leading-none">SHURUKKHA HUB</h1>
              <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em] mt-1">Sovereign Infrastructure</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-8 mr-8">
              {['Home', 'Modules', 'Security', 'Anycast'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <Link href={user ? "/dashboard" : "/login"}>
              <Button className="h-10 px-6 bg-primary text-background font-bold text-xs rounded-full gap-2 shadow-[0_0_20px_rgba(117,151,255,0.3)] hover:scale-105 transition-transform active:scale-95">
                {user ? "OPEN DASHBOARD" : "ENTER EMPIRE"} <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Dynamic Banner Carousel Section */}
        <section id="home" className="relative w-full overflow-hidden">
          <Carousel 
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
            className="w-full h-[100vh]"
          >
            <CarouselContent>
              {banners.map((banner, index) => (
                <CarouselItem key={index} className="relative h-[100vh] w-full p-0">
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={banner.img} 
                      alt={banner.title} 
                      fill 
                      className="object-cover brightness-50 contrast-125 transition-transform duration-[10000ms] scale-110 group-hover:scale-100" 
                      priority
                      data-ai-hint="cinematic background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05070a]/60 via-transparent to-[#05070a]/60" />
                  </div>
                  
                  <div className="container mx-auto px-6 h-full flex flex-col justify-center items-center text-center relative z-10 mt-10 md:mt-20">
                    <Badge variant="outline" className="mb-6 border-accent/50 text-accent py-1.5 px-6 gap-2 bg-accent/5 uppercase font-bold tracking-widest text-[10px] md:text-xs animate-in slide-in-from-top-4 duration-700">
                      <Star size={14} fill="currentColor" /> {banner.badge}
                    </Badge>
                    
                    <h2 className="text-4xl md:text-8xl font-headline font-bold leading-tight mb-6 tracking-tighter text-white animate-in fade-in slide-in-from-bottom-6 duration-1000">
                      {banner.title.split(':').map((part, i) => (
                        <span key={i}>
                          {part} {i === 0 && <br className="hidden md:block" />}
                        </span>
                      ))}
                    </h2>
                    
                    <p className="max-w-3xl mx-auto text-muted-foreground text-sm md:text-2xl mb-12 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      {banner.desc}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                      <Link href={user ? "/dashboard" : "/login"} className="w-full sm:w-auto">
                        <Button size="lg" className="h-16 px-10 md:h-20 md:px-12 bg-primary text-background font-bold text-lg md:text-2xl rounded-[2rem] gap-4 w-full shadow-[0_0_60px_rgba(117,151,255,0.4)] transition-all hover:scale-105 active:scale-95 group">
                          {user ? "ড্যাশবোর্ডে ফিরে যান" : "সাম্রাজ্যে প্রবেশ করুন"} <Zap size={28} className="fill-current group-hover:rotate-12 transition-transform" />
                        </Button>
                      </Link>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={scrollToFeatures}
                        className="h-16 px-10 md:h-20 md:px-12 border-white/10 font-bold text-lg md:text-2xl rounded-[2rem] gap-4 w-full sm:w-auto bg-white/5 hover:bg-white/10 transition-all border-dashed"
                      >
                        বিস্তারিত দেখুন <ChevronRight size={28} />
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-4 no-print">
               <CarouselPrevious className="relative static translate-y-0 h-12 w-12 md:h-16 md:w-16 bg-black/40 border-white/10 text-white hover:bg-primary hover:text-background transition-all rounded-2xl" />
               <CarouselNext className="relative static translate-y-0 h-12 w-12 md:h-16 md:w-16 bg-black/40 border-white/10 text-white hover:bg-primary hover:text-background transition-all rounded-2xl" />
            </div>
          </Carousel>
        </section>

        {/* Floating Quick Stats Over Carousel */}
        <div className="relative -mt-20 z-30 container mx-auto px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-[#05070a]/60 backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
              {[
                { label: 'Network Latency', val: '0.004ms', icon: Zap },
                { label: 'Uptime Protocol', val: 'Sovereign', icon: ShieldCheck },
                { label: 'Grid Distribution', val: '42 Nodes', icon: Globe },
                { label: 'Data Integrity', val: '100% Pure', icon: Activity }
              ].map((stat, idx) => (
                <div key={idx} className="text-center md:text-left space-y-1">
                   <div className="flex items-center justify-center md:justify-start gap-2 text-primary/60">
                      <stat.icon size={14} />
                      <p className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</p>
                   </div>
                   <p className="text-xl md:text-3xl font-headline font-bold text-white mt-1">{stat.val}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Feature Showcase Grid */}
        <section id="modules" className="container mx-auto px-6 py-40 border-t border-white/5 relative bg-white/[0.01]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] opacity-10 pointer-events-none" />
          
          <div className="text-center mb-32">
            <Badge variant="outline" className="mb-4 border-primary/20 text-primary py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Command Center Core</Badge>
            <h3 className="text-4xl md:text-6xl font-headline font-bold mb-6 uppercase tracking-widest">অজেয় প্রতিরক্ষা মডিউল</h3>
            <div className="w-32 h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Module 1: Flood Intelligence */}
            <FeatureCard 
              icon={Waves}
              title="River Intelligence"
              tag="AI Powered"
              desc="যমুনা নদীর রিয়েল-টাইম পানির স্তর মনিটরিং এবং জেমিনি ২.৫ ফ্ল্যাশ এআই ব্যবহার করে জীবন রক্ষাকারী লোকাল ফ্লাড অ্যাডভাইস জেনারেশন।"
              cases={["লোকাল ফ্লাড অ্যাডভাইস", "বিপদসীমা সতর্কতা", "অফলাইন ইন্টেলিজেন্স"]}
              color="text-cyan-400"
              glow="shadow-cyan-500/20"
            />

            {/* Module 2: SOS & Dispatch */}
            <FeatureCard 
              icon={Radio}
              title="Autonomous Dispatcher"
              tag="Mission Critical"
              desc="এক ক্লিকে SOS ট্রিগার এবং এআই-চালিত অটোনোমাস ডিসপ্যাচ ইঞ্জিন যা সঠিক রেসপন্ডারকে ঘটনাস্থলে দ্রুত পাঠিয়ে দেয়।"
              cases={["১-ক্লিক ইমার্জেন্সি রেসকিউ", "স্মার্ট রেসপন্ডার সিলেকশন", "লাইভ ভিডিও HUD"]}
              color="text-red-400"
              glow="shadow-red-500/20"
            />

            {/* Module 3: Sovereign Economy */}
            <FeatureCard 
              icon={Landmark}
              title="Sovereign Treasury"
              tag="Imperial Tax"
              desc="১.৫% সার্ভিস ফি সহ মার্চেন্ট ট্রানজেকশন ইঞ্জিন। স্ট্রাইপ এবং বিকাশ ইন্টিগ্রেশনের মাধ্যমে ১৫৫+ দেশের ব্যাংকিং নোড কানেক্টিভিটি।"
              cases={["অটোমেটেড রেভিনিউ কালেকশন", "গ্লোবাল ব্যাংকিং ডিরেক্টরি", "এটমিক সেটলমেন্ট"]}
              color="text-amber-400"
              glow="shadow-amber-500/20"
            />

            {/* Module 4: Imperial Security */}
            <FeatureCard 
              icon={Lock}
              title="Sentinel Matrix"
              tag="RSA v2 Bridge"
              desc="SHA256withRSA ডিজিটাল সিগনেচার এবং টিওটিপি (Google Authenticator) দ্বারা সুরক্ষিত ইমিউটেবল অডিট ট্রেইল ও সিকিউরিটি গার্ড।"
              cases={["২-স্তরীয় সুরক্ষা (2FA)", "ডিজিটাল ফরেনসিক স্ন্যাপশট", "অটো-লকডাউন প্রোটোকল"]}
              color="text-blue-400"
              glow="shadow-blue-500/20"
            />

            {/* Module 5: Intelligence Unit */}
            <FeatureCard 
              icon={BrainCircuit}
              title="Counter Intelligence"
              tag="Offensive Mode"
              desc="আক্রমণকারীদের ডিজিটাল ডিএনএ (Fingerprint) ম্যাপ করা এবং তাদের বিরুদ্ধে অটোনোমাস কাউন্টার-স্ট্রাইক ও লজিক ট্র্যাপ সক্রিয় করা।"
              cases={["সন্দেহভাজন প্রোফাইলিং", "আইডেন্টিটি কোরিলেশন", "লাইভ থ্রেট ভেক্টর ম্যাপ"]}
              color="text-purple-400"
              glow="shadow-purple-500/20"
            />

            {/* Module 6: Global Grid */}
            <FeatureCard 
              icon={Globe}
              title="Anycast Network"
              tag="Project 42"
              desc="৪২টি ডিস্ট্রিবিউটেড নোডের মাধ্যমে core.sheikh ডোমেইন পরিচালনা এবং সেল্ফ-হিলিং নেটওয়ার্ক অটোমেশন।"
              cases={["প্রাইভেট DNS ম্যানেজমেন্ট", "নোড হেলথ মনিটরিং", "লো-ল্যাটেন্সি গ্লোবাল ব্রিজ"]}
              color="text-green-400"
              glow="shadow-green-500/20"
            />
          </div>
        </section>

        {/* Technical Specification Section */}
        <section id="security" className="container mx-auto px-6 py-40 relative">
          <div className="max-w-5xl mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <h4 className="text-primary font-bold uppercase tracking-[0.4em] text-xs flex items-center gap-3">
                         <ShieldCheck size={18} /> IMPERIAL SECURITY PROTOCOL
                      </h4>
                      <h3 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
                         আপনার সাম্রাজ্য, <br />
                         আপনার <span className="text-primary italic">নিয়ম</span>।
                      </h3>
                   </div>
                   <p className="text-muted-foreground text-lg leading-relaxed font-light">
                      আমরা কোনো সাধারণ হোস্টিং বা ক্লাউড ব্যবহার করি না। আপনার প্রতিটি ডেটা ৪২টি ডিস্ট্রিবিউটেড নোডে এনক্রিপ্ট হয়ে জমা থাকে। এটি এমন এক সার্বভৌম নেটওয়ার্ক যা কোনো বাহ্যিক আক্রমণ বা সেন্সরশিপের ঊর্ধ্বে।
                   </p>
                   <div className="grid gap-6">
                      {[
                        { icon: Fingerprint, title: "Identity Fingerprinting", desc: "ডিভাইস আইডি এবং বায়োমেট্রিক দিয়ে প্রতিটি সেশন ভেরিফাই করা হয়।" },
                        { icon: Server, title: "Decentralized Ledger", desc: "কোনো সেন্ট্রাল সার্ভার নেই, পুরো নেটওয়ার্কই আপনার সার্ভার।" },
                        { icon: Activity, title: "Zero-Latency Dispatch", desc: "মিলি-সেকেন্ডের ব্যবধানে আপনার নির্দেশ মাঠপর্যায়ে পৌঁছে যায়।" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex gap-5 items-start">
                           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shrink-0">
                              <item.icon size={24} />
                           </div>
                           <div>
                              <h5 className="font-headline font-bold text-lg">{item.title}</h5>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="relative group">
                   <div className="absolute -inset-10 bg-primary/20 blur-[100px] animate-pulse rounded-full opacity-50" />
                   <Card className="bg-card/40 backdrop-blur-3xl border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl relative z-10 p-2">
                      <div className="aspect-square bg-slate-950 rounded-[2.5rem] relative flex items-center justify-center overflow-hidden border border-white/5">
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
                         <AppLogo size={350} className="opacity-80" />
                         <div className="absolute bottom-10 left-10 right-10">
                            <div className="p-6 bg-black/60 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                                     <Cpu className="text-accent animate-pulse" />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-bold text-accent uppercase tracking-widest">System Integrity</p>
                                     <p className="text-lg font-headline font-bold">100.0% PURE</p>
                                  </div>
                               </div>
                               <Badge className="bg-accent text-background font-bold">ACTIVE</Badge>
                            </div>
                         </div>
                      </div>
                   </Card>
                </div>
             </div>
          </div>
        </section>

        {/* Global Grid Stats Section */}
        <section id="anycast" className="container mx-auto px-6 py-40 border-t border-white/5 bg-primary/[0.02]">
           <div className="max-w-4xl mx-auto text-center space-y-20">
              <div className="space-y-6">
                 <h3 className="text-3xl md:text-5xl font-headline font-bold uppercase tracking-widest">Global Anycast Distribution</h3>
                 <p className="text-muted-foreground text-lg max-w-2xl mx-auto">সিরাজগঞ্জ সুরক্ষা এখন একটি বৈশ্বিক নোড নেটওয়ার্কের মাধ্যমে পরিচালিত। আপনার প্রতিটি রিকোয়েস্ট নিকটতম সভারেন নোড থেকে প্রসেস হয়।</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                 {[
                   { icon: Globe, label: 'Global Nodes', val: '42' },
                   { icon: Zap, label: 'Execution', val: '0.004ms' },
                   { icon: ShieldAlert, label: 'Threat Blocks', val: '1.2M+' },
                   { icon: ShieldCheck, label: 'Core Version', val: 'v31.0' }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-4 group">
                      <div className="w-20 h-20 bg-card/60 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto group-hover:border-primary/40 transition-all duration-500 shadow-xl">
                        <stat.icon className="text-primary group-hover:scale-110 transition-transform" size={32} />
                      </div>
                      <div className="space-y-1">
                         <p className="text-2xl font-headline font-bold">{stat.val}</p>
                         <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</p>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="p-8 bg-card/40 backdrop-blur-xl border border-white/5 rounded-[3rem] relative overflow-hidden">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                       <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse rounded-full" />
                          <AppLogo size={64} />
                       </div>
                       <div className="text-left">
                          <h4 className="text-xl font-headline font-bold">Ready to take command?</h4>
                          <p className="text-sm text-muted-foreground">আপনার ডিজিটাল পরিচয় নিশ্চিত করে সাম্রাজ্যে প্রবেশ করুন।</p>
                       </div>
                    </div>
                    <Link href={user ? "/dashboard" : "/login"}>
                       <Button size="lg" className="h-16 px-10 bg-primary text-background font-bold text-xl rounded-full gap-3 shadow-2xl hover:scale-105 transition-all">
                          {user ? "ড্যাশবোর্ডে প্রবেশ" : "সাম্রাজ্যে প্রবেশ"} <Sparkles size={20} />
                       </Button>
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-20 border-t border-white/5 text-center relative">
          <div className="flex flex-col items-center gap-8">
            <AppLogo size={80} className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer" />
            <div className="space-y-4">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-bold text-muted-foreground">Developed with Sovereign Pride for Sirajganj District Administration</p>
              <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] uppercase font-bold tracking-widest text-primary/40">
                 <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
                 <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
                 <Link href="/security-policy" className="hover:text-primary transition-colors">Security Policy</Link>
                 <Link href="/audit" className="hover:text-primary transition-colors">Forensic Audit</Link>
                 <Link href="/partnerships" className="hover:text-primary transition-colors">Partnership Hub</Link>
              </div>
              <p className="text-[8px] font-mono text-primary/20 uppercase tracking-[0.2em] mt-8">PROJECT_ID: 42ND_ARCHIVE_SHEIKH_CODE_EXCHANGE | VERSION: 31.0_SOVEREIGN</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, tag, desc, cases, color, glow }: any) {
  return (
    <Card className={`bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-700 rounded-[3rem] group relative overflow-hidden flex flex-col h-full hover:shadow-2xl ${glow}`}>
      {/* Dynamic Background Pattern */}
      <div className={`absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.05] transition-all duration-1000 pointer-events-none transform group-hover:-translate-x-4 group-hover:translate-y-4`}>
        <Icon size={240} />
      </div>
      
      <CardContent className="p-12 space-y-10 relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <div className={`w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-700 ${color} shadow-lg`}>
            <Icon size={40} className="group-hover:scale-110 transition-transform" />
          </div>
          <Badge variant="secondary" className="text-[9px] uppercase tracking-[0.2em] font-bold bg-white/5 border-white/10 px-4 py-1.5 rounded-full">
            {tag}
          </Badge>
        </div>
        
        <div className="space-y-4 flex-1">
          <h4 className="text-3xl font-headline font-bold group-hover:text-primary transition-colors tracking-tight leading-tight">{title}</h4>
          <p className="text-base text-muted-foreground leading-relaxed font-light">
            {desc}
          </p>
        </div>
        
        <div className="space-y-4 pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-0.3em text-primary/60">Capabilities:</p>
          <div className="grid gap-3">
            {cases.map((c: string, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm text-foreground/80 group/item">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary/30 transition-colors">
                   <CheckCircle2 size={12} className="text-primary" />
                </div>
                <span className="font-medium">{c}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-6">
           <Link href="/login">
            <Button variant="ghost" className="p-0 text-xs font-bold uppercase tracking-widest text-primary hover:bg-transparent group-hover:gap-3 gap-2 transition-all">
                Learn More <ArrowRight size={14} />
            </Button>
           </Link>
        </div>
      </CardContent>
    </Card>
  )
}
