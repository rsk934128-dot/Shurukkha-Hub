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
  Network
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'
import { useToast } from '@/hooks/use-toast'

export default function DocumentationHub() {
  const [search, setSearch] = useState('')
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
        { title: 'Financial Payouts', id: 'payouts' },
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
                <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em] mt-1">Project 43 | Global Standard</p>
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
                        <button className="w-full text-left px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all flex items-center justify-between group">
                          {item.title}
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="lg:col-span-9 space-y-12">
            
            {/* Introduction Hero */}
            <section className="space-y-6 animate-in fade-in duration-1000">
              <Badge variant="outline" className="border-primary/40 text-primary py-1.5 px-4 bg-primary/5 text-[10px] font-bold tracking-widest uppercase">
                Documentation v35.0 Sovereign
              </Badge>
              <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
                Build on the <br/><span className="text-primary italic">Imperial Grid</span>
              </h2>
              <p className="max-w-2xl text-muted-foreground text-lg font-light leading-relaxed">
                সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের ৪২টি ডিস্ট্রিবিউটেড নোড এবং জিরো-ল্যাটেন্সি এপিআই ব্যবহার করে আপনার অ্যাপ্লিকেশনে বৈপ্লবিক শক্তি সঞ্চার করুন। আমাদের প্রোটোকলগুলো নিরাপত্তা এবং গতির গবেষণামূলক সমন্বয়।
              </p>
            </section>

            {/* Quick Integration Example */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                    <Terminal size={20} />
                  </div>
                  <h3 className="text-2xl font-headline font-bold uppercase tracking-tight">Quick Start SDK</h3>
               </div>
               
               <Card className="bg-black/60 border-white/10 rounded-[2rem] overflow-hidden">
                  <div className="p-4 bg-muted/20 border-b border-white/5 flex items-center justify-between">
                     <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                        <div className="w-3 h-3 rounded-full bg-green-500/20" />
                     </div>
                     <Badge variant="outline" className="text-[8px] font-mono border-white/10 uppercase">terminal — nodejs</Badge>
                  </div>
                  <CardContent className="p-8 space-y-6 font-mono text-sm leading-relaxed">
                    <div className="space-y-2">
                       <p className="text-muted-foreground">// 1. Install the Sovereign SDK</p>
                       <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group">
                          <code className="text-primary">npm install @sheikh/core-sdk</code>
                          <Button variant="ghost" size="icon" onClick={() => copyToClipboard('npm install @sheikh/core-sdk')} className="h-8 w-8 text-white/20 hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                             <Copy size={14} />
                          </Button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-muted-foreground">// 2. Initialize Imperial Handshake</p>
                       <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/5 group">
                          <code className="text-accent">
                             const hub = new SheikhHub({`{`}<br />
                             &nbsp;&nbsp;apiKey: 'sk_sov_your_key_here',<br />
                             &nbsp;&nbsp;node: 'anycast_primary'<br />
                             {`}`});
                          </code>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-accent opacity-0 group-hover:opacity-100 transition-all">
                             <Copy size={14} />
                          </Button>
                       </div>
                    </div>
                  </CardContent>
               </Card>
            </section>

            {/* Authentication Deep Dive */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-card/40 border-white/5 rounded-[2.5rem] p-8 space-y-4 group hover:border-primary/40 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                    <Lock size={24} />
                  </div>
                  <h4 className="text-xl font-headline font-bold uppercase tracking-tight">RSA v2 Security</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">আমাদের প্রতিটি রিকোয়েস্ট SHA256withRSA অ্যালগরিদম দ্বারা স্বাক্ষরিত। এটি নিশ্চিত করে যে আপনার ডাটা পথে কেউ পরিবর্তন করতে পারবে না।</p>
                  <Link href="/docs/encryption">
                    <Button variant="link" className="p-0 text-primary text-[10px] uppercase font-bold tracking-widest gap-2">
                      Learn about Encryption <ChevronRight size={14} />
                    </Button>
                  </Link>
               </Card>

               <Card className="bg-card/40 border-white/5 rounded-[2.5rem] p-8 space-y-4 group hover:border-accent/40 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 text-accent group-hover:scale-110 transition-transform">
                    <Globe size={24} />
                  </div>
                  <h4 className="text-xl font-headline font-bold uppercase tracking-tight">Anycast Routing</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">আপনার রিকোয়েস্ট স্বয়ংক্রিয়ভাবে নিকটতম ৪২টি নোডের একটিতে পৌঁছে যায়, যা ১ মিলি-সেকেন্ডের কম ল্যাটেন্সি নিশ্চিত করে।</p>
                  <Link href="/docs/network-map">
                    <Button variant="link" className="p-0 text-accent text-[10px] uppercase font-bold tracking-widest gap-2">
                      Node Network Map <ChevronRight size={14} />
                    </Button>
                  </Link>
               </Card>
            </section>

            {/* API Endpoints Table */}
            <section className="space-y-6">
               <h3 className="text-2xl font-headline font-bold uppercase tracking-tight flex items-center gap-3">
                 <Network size={24} className="text-primary" /> Core Endpoints
               </h3>
               <div className="bg-black/40 border border-white/5 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-muted/20 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 uppercase font-bold text-muted-foreground">Method</th>
                        <th className="px-6 py-4 uppercase font-bold text-muted-foreground">Endpoint</th>
                        <th className="px-6 py-4 uppercase font-bold text-muted-foreground">Action</th>
                        <th className="px-6 py-4 uppercase font-bold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { m: 'POST', path: '/api/v1/auth/handshake', action: 'Initialize Session', s: 'STABLE' },
                        { m: 'GET', path: '/api/v1/treasury/status', action: 'Get Vault Stats', s: 'ACTIVE' },
                        { m: 'POST', path: '/api/v1/emergency/sos', action: 'Trigger SOS Signal', s: 'CRITICAL' },
                        { m: 'POST', path: '/api/v1/notifications/ingest', action: 'Signal Capture', s: 'ACTIVE' },
                      ].map((api, i) => (
                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4 font-bold text-primary">{api.m}</td>
                           <td className="px-6 py-4 text-white/80">{api.path}</td>
                           <td className="px-6 py-4 text-muted-foreground">{api.action}</td>
                           <td className="px-6 py-4">
                             <Badge variant="outline" className="text-[7px] border-accent/40 text-accent uppercase font-bold">{api.s}</Badge>
                           </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </section>

            {/* Footer Notice */}
            <footer className="pt-12 border-t border-white/5 space-y-6 text-center lg:text-left">
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
