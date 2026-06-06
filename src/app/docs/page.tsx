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
  Braces
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
      id: 'api-ref',
      title: 'এপিআই রেফারেন্স',
      icon: Code2,
      items: [
        { title: 'Sovereign Gateway', id: 'gateway' },
        { title: 'Sovereign Pay Bridge', id: 'payouts' },
        { title: 'SOS Signal Hub', id: 'sos-api' }
      ]
    },
    {
      id: 'sdk',
      title: 'Sovereign SDK',
      icon: Terminal,
      items: [
        { title: 'Node.js SDK', id: 'nodejs' },
        { title: 'React Hooks', id: 'react-hooks' },
        { title: 'Mobile Bridge', id: 'mobile' }
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
      case 'auth':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <h2 className="text-4xl md:text-6xl font-headline font-bold uppercase tracking-tight">API এক্সেস কী (Key)</h2>
            <Card className="bg-black/40 border-white/10 p-8 space-y-6 rounded-[2.5rem]">
               <p className="text-sm text-muted-foreground leading-relaxed">
                 সাম্রাজ্যের ৪২টি নোড এক্সেস করার জন্য আপনাকে অবশ্যই একটি **Sovereign Ephemeral Token** ব্যবহার করতে হবে। প্রতিটি টোকেন ৩০ মিনিট মেয়াদী এবং হার্ডওয়্যার ডিএনএ দ্বারা সুরক্ষিত।
               </p>
               <div className="p-6 bg-muted/20 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                     <Lock size={18} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Security Best Practice</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic">"কখনও আপনার মাস্টার সিক্রেট কী অন্য কারো সাথে শেয়ার করবেন না। এটি হারানো মানে আপনার সার্বভৌমত্ব হুমকির মুখে পড়া।"</p>
               </div>
            </Card>
          </div>
        )
      case 'gateway':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-accent/40 text-accent py-1 px-4 bg-accent/5 text-[10px] font-bold tracking-widest uppercase">
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

              <div className="space-y-4">
                <h4 className="text-lg font-headline font-bold uppercase flex items-center gap-2">
                  <ShieldCheck className="text-accent" /> Authentication Headers
                </h4>
                <div className="bg-black/40 rounded-2xl border border-white/10 p-6 space-y-3 font-mono text-[11px]">
                  <p className="text-muted-foreground">// Required for every request</p>
                  <p><span className="text-primary">X-Imperial-Key:</span> sk_sov_your_access_token</p>
                  <p><span className="text-primary">Content-Type:</span> application/json</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-headline font-bold uppercase flex items-center gap-2">
                  <Activity className="text-primary" /> Supported Actions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/40 border-white/5 p-5 space-y-2">
                    <p className="text-xs font-bold text-foreground">GET_VAULT_STATUS</p>
                    <p className="text-[10px] text-muted-foreground">সাম্রাজ্যের ভল্টের বর্তমান ধারণক্ষমতা এবং নোড স্ট্যাটাস প্রদান করে।</p>
                  </Card>
                  <Card className="bg-card/40 border-white/5 p-5 space-y-2">
                    <p className="text-xs font-bold text-foreground">PUSH_DATA_PACKET</p>
                    <p className="text-[10px] text-muted-foreground">আপনার অ্যাপ থেকে ৪২টি নোড গ্রিডে ডেটা অফলোড করার জন্য।</p>
                  </Card>
                </div>
              </div>

              <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] space-y-6">
                <h4 className="text-xl font-headline font-bold uppercase tracking-widest text-primary">Sample Request (JavaScript)</h4>
                <div className="relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-4 right-4 h-8 w-8 text-white/40 hover:text-white"
                    onClick={() => copyToClipboard(`fetch('https://core.sheikh/api/v1/gateway', {
  method: 'POST',
  headers: {
    'X-Imperial-Key': 'YOUR_KEY_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'GET_VAULT_STATUS' })
})`)}
                  >
                    <Copy size={14} />
                  </Button>
                  <pre className="p-6 bg-slate-950 rounded-2xl border border-white/5 font-mono text-[10px] text-accent/80 overflow-x-auto">
                    <code>{`const response = await fetch('https://core.sheikh/api/v1/gateway', {
  method: 'POST',
  headers: {
    'X-Imperial-Key': 'YOUR_KEY_HERE',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ action: 'GET_VAULT_STATUS' })
});

const data = await response.json();
console.log(data.payload.status); // "OPTIMAL"`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )
      case 'payouts':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-primary/40 text-primary py-1.5 px-4 bg-primary/5 text-[10px] font-bold tracking-widest uppercase">
                Financial Protocol v3.0
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Sovereign <br/><span className="text-primary italic">Pay Bridge</span>
              </h2>
              <p className="max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                সভাৱেন পে ব্রিজ হলো সম্রাটের ফিনটেক সাম্রাজ্যের মেরুদণ্ড। এটি ১৫৫+ দেশের ব্যাংকিং নেটওয়ার্ক এবং PayPal/Wise-এর সমন্বিত গেটওয়ে যা ১ মিলি-সেকেন্ড ল্যাটেন্সিতে লেনদেন নিশ্চিত করে।
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="p-6 bg-card/40 border border-white/5 rounded-3xl space-y-3">
                  <Globe className="text-accent" size={24} />
                  <h4 className="font-bold text-sm uppercase">Global Coverage</h4>
                  <p className="text-[10px] text-muted-foreground">১৫৫টিরও বেশি দেশে সরাসরি ব্যাংকিং নোড এবং ক্রিপ্টো সেটলমেন্ট সাপোর্ট।</p>
               </div>
               <div className="p-6 bg-card/40 border border-white/5 rounded-3xl space-y-3">
                  <Zap className="text-primary" size={24} />
                  <h4 className="font-bold text-sm uppercase">Atomic Settlement</h4>
                  <p className="text-[10px] text-muted-foreground">জিরো-ল্যাটেন্সি ফান্ড ট্রান্সফার যা রিয়েল-টাইমে ট্রেজারি লেজারে আপডেট হয়।</p>
               </div>
               <div className="p-6 bg-card/40 border border-white/5 rounded-3xl space-y-3">
                  <ShieldCheck className="text-accent" size={24} />
                  <h4 className="font-bold text-sm uppercase">Fraud Shield</h4>
                  <p className="text-[10px] text-muted-foreground">এআই-চালিত রিস্ক অ্যানালাইসিস যা প্রতিটি ট্রানজেকশনের ফরেনসিক ভেরিফিকেশন করে।</p>
               </div>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-muted/20 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Code2 size={20} />
                  <h4 className="font-headline font-bold text-sm uppercase tracking-widest">Payout Intent Structure</h4>
                </div>
                <pre className="p-6 bg-black/40 rounded-2xl border border-accent/20 font-mono text-[10px] text-accent/80 overflow-x-auto">
                  <code>{`{
  "amount": 500.00,
  "currency": "USD",
  "destination": "WISE_SOVEREIGN_NODE",
  "recipient_id": "user_4242",
  "meta": {
    "node_signature": "rsa_v2_sig_...",
    "failover": "enabled"
  }
}`}</code>
                </pre>
              </div>

              <div className="p-8 bg-accent/5 border border-accent/20 rounded-[2.5rem] space-y-6">
                <h4 className="text-xl font-headline font-bold uppercase tracking-widest text-accent">Integration Blueprint</h4>
                <div className="space-y-4">
                   <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 text-xs font-bold">1</div>
                      <p className="text-sm text-muted-foreground">প্রথমে `Sovereign Gateway` থেকে একটি সেশন টোকেন সংগ্রহ করুন।</p>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 text-xs font-bold">2</div>
                      <p className="text-sm text-muted-foreground">`POST /api/v1/payouts` এন্ডপয়েন্টে আপনার লজিক ডিএনএ এবং ট্রানজেকশন ডাটা পাঠান।</p>
                   </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 text-xs font-bold">3</div>
                      <p className="text-sm text-muted-foreground">সিস্টেম স্বয়ংক্রিয়ভাবে ৪২টি নোড গ্রিডে লেনদেনের বিশুদ্ধতা যাচাই করে সেটলমেন্ট সম্পন্ন করবে।</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'nodejs':
        return (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <section className="space-y-6">
              <Badge variant="outline" className="border-primary/40 text-primary py-1.5 px-4 bg-primary/5 text-[10px] font-bold tracking-widest uppercase">
                Official SDK v1.0.0
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Sovereign <br/><span className="text-primary italic">Node.js SDK</span>
              </h2>
              <p className="max-w-3xl text-muted-foreground text-lg font-light leading-relaxed">
                আপনার Node.js ব্যাকএন্ড অ্যাপ্লিকেশনে সরাসরি সম্রাটের ৪২টি নোড গ্রিড একীভূত করুন। আমাদের এই SDK স্বয়ংক্রিয়ভাবে RSA v2 সিগনেচার এবং Ephemeral Token ম্যানেজমেন্ট হ্যান্ডেল করে।
              </p>
            </section>

            <div className="space-y-8">
              <div className="p-6 bg-muted/20 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3 text-accent">
                  <Terminal size={20} />
                  <h4 className="font-headline font-bold text-sm uppercase tracking-widest">Installation</h4>
                </div>
                <div className="relative group">
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1/2 -translate-y-1/2 right-4 h-8 w-8 text-white/40 hover:text-white"
                    onClick={() => copyToClipboard(`npm install @sheikh/core`)}
                   >
                    <Copy size={14} />
                   </Button>
                   <code className="block p-4 bg-black/40 rounded-xl text-primary font-mono text-xs border border-primary/20">
                    npm install @sheikh/core
                   </code>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-headline font-bold uppercase flex items-center gap-2">
                  <Braces className="text-accent" /> Implementation Logic
                </h4>
                
                <Card className="bg-card/40 border-white/5 rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
                     <p className="text-[10px] font-bold uppercase text-primary tracking-widest">Basic Usage</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="p-6 bg-slate-950 font-mono text-[11px] text-accent/80 overflow-x-auto leading-relaxed">
{`const { SheikhHub } = require('@sheikh/core');

// Initialize with your Master API Key
const hub = new SheikhHub({
  apiKey: 'sk_sov_your_access_token',
  node: 'anycast_primary'
});

async function runImperialSync() {
  try {
    // 1. Establish Sovereign Handshake
    const session = await hub.auth.handshake();
    console.log('Grid Recognized Identity:', session.id);

    // 2. Fetch Vault Capacity
    const vault = await hub.vault.getStats();
    console.log('Vault Health:', vault.purity);

    // 3. Dispatch SOS Alert
    await hub.sos.dispatch({
      type: 'SERVER_OVERLOAD',
      location: 'DC-42-PRIMARY',
      urgency: 'HIGH'
    });

  } catch (error) {
    console.error('Sovereign Bridge Failure:', error.message);
  }
}

runImperialSync();`}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-3">
                    <Box size={24} className="text-accent" />
                    <h4 className="font-bold text-sm uppercase">Auto-Signature</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">প্রতিটি রিকোয়েস্ট স্বয়ংক্রিয়ভাবে RSA v2 প্রোটোকল ব্যবহার করে সাইন করা হয়, আপনাকে ম্যানুয়ালি হাশ করার প্রয়োজন নেই।</p>
                 </div>
                 <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl space-y-3">
                    <RefreshCw size={24} className="text-primary animate-spin-slow" />
                    <h4 className="font-bold text-sm uppercase">Anycast Failover</h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">নিকটতম এবং দ্রুততম নোডটি SDK নিজেই খুঁজে নেয়। একটি নোড অফলাইন হলে তা অটোমেটিক রিলুট হয়।</p>
                 </div>
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

            <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl">
               <p className="text-[9px] font-bold text-accent uppercase tracking-widest mb-2">System Status</p>
               <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-white/60">API Latency</span>
                  <span className="text-accent">0.004ms</span>
               </div>
               <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                  <span className="text-white/60">Purity Score</span>
                  <span className="text-accent">100.0%</span>
               </div>
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
                  <div className="flex gap-4">
                     <Link href="/support">
                       <Button variant="outline" className="rounded-full border-white/10 text-[10px] uppercase font-bold h-10 px-6">
                          Support Hub
                       </Button>
                     </Link>
                     <Link href="/security-policy">
                       <Button variant="outline" className="rounded-full border-white/10 text-[10px] uppercase font-bold h-10 px-6">
                          Security Policy
                       </Button>
                     </Link>
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
