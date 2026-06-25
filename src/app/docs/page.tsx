
"use client"

import React, { useState } from 'react'
import { 
  BookOpen, 
  Code2, 
  Terminal, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Cpu, 
  Lock, 
  FileText, 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  Activity, 
  Copy, 
  CheckCircle2,
  Database,
  Network,
  Trophy,
  Star,
  Layers,
  Fingerprint,
  Server,
  DollarSign,
  TrendingUp,
  Wallet,
  Box,
  Braces,
  Smartphone,
  LayoutGrid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'
import { useToast } from '@/hooks/use-toast'

export default function DocumentationHub() {
  const [search, setSearch] = useState('')
  const [activeItem, setActiveItem] = useState('intro')
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "কোড কপি করা হয়েছে", description: "আপনার ক্লিপবোর্ডে রাজকীয় কোডটি সংরক্ষিত।" })
  }

  const sections = [
    {
      id: 'get-started',
      title: 'শুরু করার নির্দেশিকা',
      icon: Zap,
      items: [
        { title: 'সাম্রাজ্যের পরিচয়', id: 'intro' },
        { title: 'এপিআই এক্সেস কী (Key)', id: 'auth' },
        { title: 'এনভায়রনমেন্ট সেটআপ', id: 'setup' }
      ]
    },
    {
      id: 'integration',
      title: 'ইন্টিগ্রেশন গাইড',
      icon: Globe,
      items: [
        { title: 'পাবলিক আইডি লিঙ্ক', id: 'public-link' },
        { title: 'ওয়েবসাইট এমবেড (Embed)', id: 'embed' },
        { title: 'মোবাইল ডিপ লিঙ্কিং', id: 'deep-link' }
      ]
    },
    {
      id: 'api-ref',
      title: 'এপিআই রেফারেন্স',
      icon: Code2,
      items: [
        { title: 'Sovereign Gateway', id: 'gateway' },
        { title: 'Sovereign Pay Bridge', id: 'payouts' },
        { title: 'SOS Signal Hub', id: 'sos-api' }
      ]
    }
  ]

  const renderContent = () => {
    switch (activeItem) {
      case 'intro':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-primary/40 text-primary py-1.5 px-4 bg-primary/5 text-[10px] font-bold tracking-widest uppercase">
                Imperial Identity v35.0
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                সাম্রাজ্যের <br/><span className="text-primary italic">পরিচয় ও শক্তি</span>
              </h2>
              <p className="max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                সিরাজগঞ্জ সুরক্ষা (Shurukkha Hub) কেবল একটি সফটওয়্যার নয়; এটি সম্রাট শেখ ফরিদের ৪২টি ডিস্ট্রিবিউটেড নোড দ্বারা পরিচালিত একটি সার্বভৌম ডিজিটাল পরিকাঠামো। এর মূল লক্ষ্য হলো নাগরিক নিরাপত্তা এবং অর্থনৈতিক স্বচ্ছতাকে এক অভেদ্য দুর্গে পরিণত করা।
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-card/40 border-white/5 p-8 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                     <Globe size={100} className="text-primary" />
                  </div>
                  <h4 className="text-xl font-headline font-bold uppercase text-primary">৪২টি ডিস্ট্রিবিউটেড নোড</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    সাম্রাজ্যের তথ্য কোনো কেন্দ্রীয় সার্ভারে নয়, বরং বিশ্বজুড়ে ছড়িয়ে থাকা ৪২টি সভারেন নোডে এনক্রিপ্ট হয়ে সংরক্ষিত থাকে। এর ফলে সিস্টেমটি ডিডিওএস (DDoS) এবং সেন্সরশিপ থেকে শতভাগ মুক্ত।
                  </p>
               </Card>
               <Card className="bg-card/40 border-white/5 p-8 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform">
                     <ShieldCheck size={100} className="text-accent" />
                  </div>
                  <h4 className="text-xl font-headline font-bold uppercase text-accent">ডিজিটাল সার্বভৌমত্ব</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    আপনার প্রতিটি লেনদেন এবং সিগন্যাল RSA v2 সিগনেচার দ্বারা সংরক্ষিত। "The Code is the Law"—এই মূলমন্ত্রে পরিচালিত আমাদের গ্রিডে তথ্যের বিশুদ্ধতা প্রশ্নাতীত।
                  </p>
               </Card>
            </div>

            <section className="p-10 bg-primary/5 border border-primary/20 rounded-[3rem] relative overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <AppLogo size={400} />
               </div>
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                     <Trophy className="text-primary" size={24} />
                     <h3 className="text-2xl font-headline font-bold uppercase tracking-widest">৪০০-প্রজেক্টের মহাযাত্রা</h3>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                    "পরিশ্রম ভাগ্যকে বদলে দেয়"—এই মূলমন্ত্রে উজ্জীবিত সম্রাট শেখ ফরিদের ৪০০টি প্রজেক্ট সম্পন্ন করার যে ঐতিহাসিক মিশন, তার ৪২তম মাইলফলক হলো এই 'শেখ কোড এক্সচেঞ্জ'। এটি সাম্রাজ্যের সকল জ্ঞান এবং প্রযুক্তিগত উৎকর্ষতাকে একীভূত করার একটি গবেষণামূলক প্রয়াস।
                  </p>
                  <div className="flex gap-4">
                     <Badge variant="outline" className="border-primary/30 text-primary">Project 42: Active</Badge>
                     <Badge variant="outline" className="border-accent/30 text-accent">Mission Progress: 10.5%</Badge>
                  </div>
               </div>
            </section>
          </div>
        )
      case 'public-link':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-accent/40 text-accent py-1.5 px-4 bg-accent/5 text-[10px] font-bold tracking-widest uppercase">
                Direct Integration v1.0
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Public <br/><span className="text-accent italic">Identity Links</span>
              </h2>
              <p className="max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                হোয়াটসঅ্যাপ বা টেলিগ্রামের মতো আপনার রাজকীয় প্রোফাইল এখন একটি সরাসরি লিঙ্কের মাধ্যমে শেয়ার করা সম্ভব। এটি যেকোনো সোশ্যাল মিডিয়া বা ওয়েবসাইটে সম্রাট এবং তাঁর মার্চেন্টদের সত্যতা প্রমাণ করবে।
              </p>
            </section>

            <div className="p-8 bg-black/40 border border-white/10 rounded-[2.5rem] space-y-6">
               <div className="space-y-2">
                  <h4 className="text-sm font-bold text-primary uppercase">URL Format:</h4>
                  <code className="block p-4 bg-muted/20 rounded-xl text-accent font-mono text-xs">
                    https://core.sheikh/v/[YOUR_USER_ID]
                  </code>
               </div>
               <p className="text-xs text-muted-foreground leading-relaxed italic">
                 "এই লিঙ্কটি ওপেন করলে আপনার ফিউচারিস্টিক আইডি কার্ড প্রদর্শিত হবে এবং ভিজিটররা সরাসরি সেখান থেকে আপনার সাথে সিকিউরড চ্যাট শুরু করতে পারবে।"
               </p>
            </div>
          </div>
        )
      case 'embed':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-primary/40 text-primary py-1.5 px-4 bg-primary/5 text-[10px] font-bold tracking-widest uppercase">
                Widget Protocol v1.2
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Website <br/><span className="text-primary italic">Embed (Iframe)</span>
              </h2>
              <p className="max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                আপনার সাম্রাজ্যের ভেরিফাইড পরিচয়পত্র এখন যেকোনো ওয়েবসাইটে লাইভ প্রদর্শন করা সম্ভব। নিচের কোডটি ব্যবহার করে আপনি আপনার বিজনেস ওয়েবসাইটে আপনার সার্বভৌম স্ট্যাটাস দেখাতে পারেন।
              </p>
            </section>

            <div className="space-y-6">
               <div className="p-6 bg-muted/20 rounded-3xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-3 text-accent">
                    <Code2 size={20} />
                    <h4 className="font-headline font-bold text-sm uppercase tracking-widest">HTML Snippet</h4>
                  </div>
                  <div className="relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 text-white/40 hover:text-white"
                      onClick={() => copyToClipboard(`<iframe src="https://core.sheikh/v/YOUR_ID" width="400" height="600" frameborder="0"></iframe>`)}
                    >
                      <Copy size={14} />
                    </Button>
                    <pre className="p-6 bg-slate-950 rounded-2xl border border-white/5 font-mono text-[10px] text-accent/80 overflow-x-auto">
                      <code>{`<iframe 
  src="https://core.sheikh/v/YOUR_ID" 
  width="400" 
  height="600" 
  style="border:none; border-radius:32px; box-shadow:0 20px 40px rgba(0,0,0,0.4);"
></iframe>`}</code>
                    </pre>
                  </div>
               </div>
            </div>
          </div>
        )
      case 'gateway':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-accent/40 text-accent py-1.5 px-4 bg-accent/5 text-[10px] font-bold tracking-widest uppercase">
                Public API v1.0
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Sovereign <br/><span className="text-accent italic">Gateway API</span>
              </h2>
              <p className="max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                সভাৱেন গেটওয়ে হলো বহিরাগত ডেভেলপারদের জন্য সাম্রাজ্যের ৪২টি নোড গ্রিডের প্রবেশদ্বার। এর মাধ্যমে আপনি সরাসরি **Sovereign Vault** এর ডেটা এবং নেটওয়ার্ক স্ট্যাটাস অ্যাক্সেস করতে পারবেন।
              </p>
            </section>

            <div className="space-y-8">
              <div className="p-6 bg-muted/20 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-primary">
                  <Server size={20} />
                  <h4 className="font-headline font-bold text-sm uppercase tracking-widest">API Endpoint</h4>
                </div>
                <code className="block p-4 bg-black/40 rounded-xl text-accent font-mono text-xs border border-accent/20">
                  POST https://core.sheikh/api/v1/gateway
                </code>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="py-20 text-center opacity-30">
            <Layers size={64} className="mx-auto mb-4" />
            <p className="font-headline font-bold uppercase tracking-widest">Select a topic from the sidebar</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <header className="sticky top-0 z-50 border-b bg-background/80 border-white/5 backdrop-blur-xl px-6 h-20 flex items-center justify-between group">
        <div className="flex items-center gap-4 cursor-pointer">
           <Link href="/" className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:blur-2xl transition-all rounded-full" />
                <AppLogo size={40} className="relative z-10" />
              </div>
              <div>
                <h1 className="text-xl font-headline font-bold uppercase tracking-tight leading-none">Imperial Documentation</h1>
                <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em] mt-1">Project 42 | Global Standard</p>
              </div>
           </Link>
        </div>
        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="hidden md:block">
              <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary">
                Return to Command
              </Button>
           </Link>
           <Link href="/exchange">
              <Button className="h-10 px-6 bg-primary text-background font-bold text-xs rounded-full gap-2 shadow-[0_0_20px_rgba(117,151,255,0.3)]">
                VIEW EXCHANGE
              </Button>
           </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search Docs..." 
                className="pl-10 h-11 bg-background/50 border-white/10 rounded-xl text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-6">
              {sections.map(sec => (
                <div key={sec.id} className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                    <sec.icon size={14} className="text-primary" /> {sec.title}
                  </h4>
                  <ul className="space-y-1">
                    {sec.items.map(item => (
                      <li key={item.id}>
                        <button 
                          onClick={() => setActiveItem(item.id)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-between group ${activeItem === item.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
                        >
                          {item.title}
                          <ChevronRight size={12} className={`transition-opacity ${activeItem === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {renderContent()}

            {/* Footer Notice */}
            <footer className="mt-20 pt-12 border-t border-white/5 space-y-6 text-center lg:text-left">
               <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <AppLogo size={64} className="opacity-20" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Sovereign Compliance</p>
                      <p className="text-xs italic text-muted-foreground/60">"The code is the law, and the law is sovereign."</p>
                    </div>
                  </div>
               </div>
               <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-[0.5em]">
                 PROJECT_ID: 42ND_ARCHIVE | v35.0_SOVEREIGN | LICENSED_TO_SHEIKH
               </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  )
}
