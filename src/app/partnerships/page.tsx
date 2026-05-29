
"use client"

import React, { useState } from 'react'
import { ShieldCheck, Globe, Zap, Key, Share2, Send, CheckCircle2, Building2, Lock, Cpu, ArrowLeft, Activity, Sparkles, Network, Users, Landmark, HeartPulse } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function PartnershipHub() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    orgName: '',
    email: '',
    useCase: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, "partner_requests"), {
        ...form,
        status: 'pending',
        timestamp: serverTimestamp()
      })
      setSubmitted(true)
      toast({ title: "আবেদন জমা হয়েছে", description: "আপনার আবেদনটি এআই এজেন্ট দ্বারা যাচাই করা হচ্ছে।" })
    } catch (e) {
      toast({ title: "ত্রুটি", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/20 bg-card/60 backdrop-blur-xl text-center p-12 space-y-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-pulse" />
          <div className="w-24 h-24 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto border border-accent/20">
            <CheckCircle2 size={48} className="text-accent animate-bounce" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-headline font-bold text-foreground uppercase tracking-tight">আবেদন সফল হয়েছে</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">আমাদের এআই সিস্টেম আপনার প্রতিষ্ঠানের প্রোফাইল এবং ভেক্টোরিয়াল ডাটা ভেরিফাই করছে। শীঘ্রই ইমেইলের মাধ্যমে পরবর্তী নির্দেশনা পাঠানো হবে।</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="w-full h-12 border-primary/20 hover:bg-primary/10 font-bold uppercase text-xs tracking-widest rounded-xl">
              ড্যাশবোর্ডে ফিরুন
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30">
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-6xl">
        <Link href="/" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest">
            <ArrowLeft size={14} /> প্রচ্ছদ পাতায় ফিরে যান
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <AppLogo size={100} className="relative z-10" />
               </div>
               <div className="space-y-2">
                 <Badge variant="outline" className="border-accent/40 text-accent py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Global Ecosystem 2.0</Badge>
                 <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-tight">
                   International <br /><span className="text-primary italic">Partnership Hub</span>
                 </h1>
               </div>
               <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl">
                 আপনার সিস্টেমকে সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের সাথে একীভূত করুন। আমাদের সাপোর্টাররা সরাসরি গেটওয়ে এবং ইন্টেলিজেন্স শেয়ারিংয়ের মাধ্যমে পোর্টালে অবদান রাখতে পারেন।
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SupportRoleCard 
                icon={Network}
                title="প্রযুক্তিগত প্লাগইন"
                desc="আপনার ওয়েবসাইট বা অ্যাপে আমাদের 'Signal Hub' এপিআই প্লাগইন করুন এবং রিয়েল-টাইম অ্যালার্ট রিসিভ করুন।"
              />
              <SupportRoleCard 
                icon={Landmark}
                title="আর্থিক নোড"
                desc="মার্চেন্ট হিসেবে যুক্ত হয়ে কর প্রদান করুন এবং অজেয় রাজকীয় সেটলমেন্ট ও নিরাপত্তা নিশ্চিত করুন।"
              />
              <SupportRoleCard 
                icon={HeartPulse}
                title="অপারেশনাল সাপোর্ট"
                desc="রেসপন্ডার হিসেবে যুক্ত হয়ে ফিল্ডে সাহায্য করুন। আপনার প্রতিটি কাজ ইমিউটেবল অডিট ট্রেইলে নথিবদ্ধ হবে।"
              />
              <SupportRoleCard 
                icon={Users}
                title="সামাজিক অংশগ্রহণ"
                desc="নাগরিক হিসেবে তথ্য দিয়ে এবং ভেরিফাইড আইডি ব্যবহারের মাধ্যমে সাম্রাজ্যের শক্তি বৃদ্ধি করুন।"
              />
            </div>

            <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4">
               <div className="flex items-center gap-3 text-accent">
                  <Activity size={20} className="animate-pulse" />
                  <h4 className="font-headline font-bold text-sm uppercase tracking-widest">Live Grid Integration Status</h4>
               </div>
               <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                  <span>ACTIVE PARTNERS: 155+</span>
                  <span>SYNC LATENCY: 0.004ms</span>
                  <span>SECURITY: RSA_V2_ACTIVE</span>
               </div>
               <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-[92%] animate-pulse" />
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl rounded-[3rem] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline font-bold text-2xl uppercase tracking-widest text-foreground">পার্টনারশিপ আবেদন</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-primary/60 tracking-widest mt-2">Sovereign Identity Verification Required</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">প্রতিষ্ঠানের নাম</label>
                    <Input 
                      required 
                      value={form.orgName}
                      onChange={e => setForm({...form, orgName: e.target.value})}
                      placeholder="e.g. HealthBridge Global" 
                      className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">অফিসিয়াল ইমেইল</label>
                    <Input 
                      required 
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="admin@org.com" 
                      className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">সহযোগিতার ধরণ ও উদ্দেশ্য</label>
                    <Textarea 
                      required
                      value={form.useCase}
                      onChange={e => setForm({...form, useCase: e.target.value})}
                      placeholder="আপনার অ্যাপ বা প্রতিষ্ঠান কীভাবে আমাদের সাম্রাজ্যের সহযোগী হবে..." 
                      className="bg-background/50 border-white/10 h-32 rounded-xl focus:ring-primary resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-background font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Activity className="animate-spin" size={20} /> ভেরিফাই করা হচ্ছে...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        আবেদন পাঠান <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                   <div className="flex justify-center gap-4">
                      <Badge variant="outline" className="text-[7px] border-white/10 text-muted-foreground">AUTH: EPHEMERAL_TOKEN</Badge>
                      <Badge variant="outline" className="text-[7px] border-white/10 text-muted-foreground">NODE: 42_GRID</Badge>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-32 pt-12 border-t border-white/5 text-center opacity-40">
           <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] uppercase font-bold tracking-widest text-primary/40 mb-8">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
              <Link href="/audit" className="hover:text-primary transition-colors">Forensic Audit</Link>
              <Link href="/partnerships" className="hover:text-primary transition-colors text-primary">Partnership Hub</Link>
           </div>
           <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.5em]">Powered by RSA v2 Protocol & Shurukkha Sovereign Hub</p>
              <p className="text-[8px] font-mono uppercase tracking-widest">Project: 42ND_ARCHIVE | v31.0_SOVEREIGN</p>
           </div>
        </footer>
      </main>
    </div>
  )
}

function SupportRoleCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/20 transition-all duration-500 rounded-3xl p-6 group">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon size={24} />
      </div>
      <h3 className="font-headline font-bold text-lg text-foreground uppercase tracking-tight mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed font-light">{desc}</p>
    </Card>
  )
}
