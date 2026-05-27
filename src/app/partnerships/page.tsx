
"use client"

import React, { useState } from 'react'
import { ShieldCheck, Globe, Zap, Key, Share2, Send, CheckCircle2, Building2, Lock, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-primary/20 bg-card/60 backdrop-blur-xl text-center p-8 space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <CheckCircle2 size={40} className="text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-headline font-bold">আবেদন সফল হয়েছে</h2>
            <p className="text-muted-foreground text-sm">আমাদের এআই সিস্টেম আপনার প্রোফাইল ভেরিফাই করছে। শীঘ্রই ইমেইলের মাধ্যমে জানানো হবে।</p>
          </div>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">ড্যাশবোর্ডে ফিরুন</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body">
      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      <header className="container mx-auto px-4 py-8 relative">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Globe className="text-primary" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold tracking-tight">INTERNATIONAL PARTNERSHIP HUB</h1>
            <p className="text-[10px] text-primary uppercase tracking-[0.3em] font-bold">Sirajganj Sovereign Ecosystem</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-12">
            <section className="space-y-6">
              <h2 className="text-5xl font-headline font-bold leading-tight">
                আপনার সিস্টেমকে যুক্ত করুন <span className="text-primary">সুরক্ষা সাম্রাজ্যের</span> সাথে।
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                আমাদের "Universal Webhook Engine" এবং "RSA v2 Bridge" ব্যবহার করে রিয়েল-টাইম ইমার্জেন্সি ডেটা এবং ডিসপ্যাচ কমান্ড এক্সেস করুন।
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Lock, title: "RSA v2 Security", desc: "SHA256withRSA ডিজিটাল সিগনেচার মেকানিজম।" },
                { icon: Zap, title: "Universal Engine", desc: "০.৫ms ল্যাটেন্সিতে ইভেন্ট ব্রডকাস্টিং।" },
                { icon: Cpu, title: "Sovereign AI", desc: "এআই-ভেরিফাইড পার্টনারশিপ অটোমেশন।" },
                { icon: Share2, title: "Developer SDK", desc: "মাল্টি-ল্যাঙ্গুয়েজ ইন্টিগ্রেশন সাপোর্ট।" }
              ].map((item, idx) => (
                <div key={idx} className="p-6 bg-card/40 border border-white/5 rounded-2xl space-y-3">
                  <item.icon className="text-primary" size={24} />
                  <h3 className="font-headline font-bold">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="font-headline">পার্টনারশিপ আবেদন</CardTitle>
                <CardDescription>আপনার প্রতিষ্ঠানের তথ্য দিয়ে সুরক্ষা ইকোসিস্টেমে যুক্ত হোন।</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">প্রতিষ্ঠানের নাম</label>
                    <Input 
                      required 
                      value={form.orgName}
                      onChange={e => setForm({...form, orgName: e.target.value})}
                      placeholder="e.g. HealthBridge Global" 
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ইমেইল</label>
                    <Input 
                      required 
                      type="email"
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="admin@org.com" 
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ইউজ কেস / উদ্দেশ্য</label>
                    <Textarea 
                      required
                      value={form.useCase}
                      onChange={e => setForm({...form, useCase: e.target.value})}
                      placeholder="আপনার অ্যাপ কীভাবে আমাদের ডেটা ব্যবহার করবে..." 
                      className="bg-background/50 border-white/10 h-32"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-background font-bold text-lg">
                    {loading ? "ভেরিফাই করা হচ্ছে..." : "রিকোয়েস্ট পাঠান"} <Send size={18} className="ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </header>
      
      <footer className="container mx-auto px-4 py-12 border-t border-white/5 mt-20 text-center opacity-40">
        <p className="text-[10px] uppercase tracking-[0.5em]">Powered by RSA v2 Protocol & Shurukkha Sovereign Hub</p>
      </footer>
    </div>
  )
}
