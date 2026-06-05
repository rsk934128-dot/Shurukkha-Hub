"use client"

import React, { useState } from 'react'
import { 
  LifeBuoy, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  FileText, 
  Send,
  Loader2,
  HelpCircle,
  Clock,
  Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'

export default function SupportHub() {
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    subject: '',
    message: '',
    category: 'Technical'
  })

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const ticketId = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const payload = {
        ...form,
        ticketId,
        status: 'open',
        timestamp: new Date().toISOString()
      }

      await addDoc(collection(db, "audit_trails"), {
        action: 'SUPPORT_TICKET_LOGGED',
        details: payload,
        signature: IntegrationBridge.generateSignature(payload),
        timestamp: serverTimestamp(),
        performedBy: 'Imperial_Citizen_Support'
      });

      toast({ 
        title: "টিকিট জমা হয়েছে", 
        description: `আপনার রেফারেন্স আইডি: ${ticketId}। শীঘ্রই সেনটিনেল এআই আপনার সাথে যোগাযোগ করবে।` 
      })
      setForm({ subject: '', message: '', category: 'Technical' })
    } catch (e) {
      toast({ title: "ব্যর্থ হয়েছে", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    { 
      q: "আমি কীভাবে আমার সভারেন আইডি (Sovereign ID) ভেরিফাই করব?", 
      a: "ড্যাশবোর্ডের 'প্রোফাইল আইডি' প্যানেলে গিয়ে 'Verify' বাটনে ক্লিক করুন। আপনার ডিভাইসের বায়োমেট্রিক বা পিন কোড দিয়ে পরিচয় নিশ্চিত করলে আইডি কার্ডে 'Verified' ব্যাজ প্রদর্শিত হবে।" 
    },
    { 
      q: "পেমেন্ট গেটওয়েতে ০.৫% কমিশন কেন নেওয়া হয়?", 
      a: "এই কমিশন সরাসরি সাম্রাজ্যের ৪২টি নোড এবং ক্লাউড পরিকাঠামো রক্ষণাবেক্ষণের কাজে ব্যয় করা হয়, যা আপনার লেনদেনের ১০০% নিরাপত্তা নিশ্চিত করে।" 
    },
    { 
      q: "জরুরি অবস্থায় ড্রোন সাপোর্ট কীভাবে পাওয়া যাবে?", 
      a: "SOS বাটন প্রেস করার পর যদি সিস্টেম বিপদের মাত্রা 'Extreme' শনাক্ত করে, তবে নিকটস্থ নোড থেকে স্বয়ংক্রিয়ভাবে ড্রোন রিকন মিশন শুরু হবে।" 
    },
    { 
      q: "আমার এপিআই কী (API Key) হারিয়ে গেলে কী করব?", 
      a: "নিরাপত্তার স্বার্থে অবিলম্বে ইন্টিগ্রেশন প্যানেলে গিয়ে 'Rotate Keys' কমান্ড দিন। এটি পুরনো কী নিষ্ক্রিয় করে একটি নতুন RSA v2 কী জেনারেট করবে।" 
    }
  ]

  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30 overflow-x-hidden">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <header className="sticky top-0 z-50 border-b bg-background/80 border-white/5 backdrop-blur-xl px-6 h-20 flex items-center justify-between group">
        <Link href="/" className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:blur-2xl transition-all rounded-full" />
            <AppLogo size={40} className="relative z-10" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold uppercase tracking-tight leading-none">Support Command</h1>
            <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.3em] mt-1">Sovereign Helpdesk v1.0</p>
          </div>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary gap-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </Button>
        </Link>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        <div className="text-center space-y-6 mb-16 animate-in fade-in duration-1000">
          <Badge variant="outline" className="border-accent/40 text-accent py-1.5 px-4 bg-accent/5 text-[10px] font-bold tracking-widest uppercase">
            24/7 Imperial Assistance
          </Badge>
          <h2 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
            How can we <br/><span className="text-primary italic">Help you?</span>
          </h2>
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input 
              placeholder="Search for solutions, error codes, or tutorials..." 
              className="h-16 pl-14 bg-card/50 border-white/10 rounded-2xl text-lg shadow-2xl focus:ring-primary focus:border-primary/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQ Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-primary" size={24} />
              <h3 className="text-2xl font-headline font-bold uppercase">Frequently Asked</h3>
            </div>
            
            <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
              <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                      <AccordionTrigger className="text-sm font-bold uppercase text-left hover:text-primary hover:no-underline py-6">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed text-sm pb-6 italic">
                        "{faq.a}"
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <SupportCard icon={Phone} title="Emergency" val="013-XXXX-XXXX" color="text-destructive" />
               <SupportCard icon={MessageSquare} title="Live Chat" val="Active" color="text-accent" />
               <SupportCard icon={Mail} title="Email" val="support@sheikh.com" color="text-primary" />
            </div>
          </div>

          {/* Ticket Submission */}
          <div className="lg:col-span-5">
            <Card className="bg-card/60 backdrop-blur-xl border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl sticky top-28">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
              <CardHeader className="p-8 pb-4">
                <CardTitle className="font-headline font-bold text-2xl uppercase tracking-widest flex items-center gap-3">
                  <LifeBuoy className="text-primary" /> Submit Ticket
                </CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-2">
                  Encrypted Support Channel v1.0
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <form onSubmit={handleSubmitTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                    <Input 
                      required 
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                      placeholder="e.g. API Sync Latency Issue" 
                      className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Category</label>
                    <select 
                      className="w-full bg-background/50 border border-white/10 h-12 rounded-xl px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="Technical">Technical Support</option>
                      <option value="Financial">Financial / Treasury</option>
                      <option value="Security">Identity / Security</option>
                      <option value="SOS">Emergency / SOS</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Detail</label>
                    <Textarea 
                      required
                      value={form.message}
                      onChange={e => setForm({...form, message: e.target.value})}
                      placeholder="Describe the issue in detail..." 
                      className="bg-background/50 border-white/10 h-32 rounded-xl focus:ring-primary resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-background font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Open Support Channel <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                   <div className="flex justify-center gap-4">
                      <Badge variant="outline" className="text-[7px] border-white/10 text-muted-foreground uppercase">Sync: 42 Nodes</Badge>
                      <Badge variant="outline" className="text-[7px] border-white/10 text-muted-foreground uppercase">Auth: RSA_V2</Badge>
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
              <Link href="/support" className="text-primary">Support Hub</Link>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em]">Developed with Sovereignty for the 400-Project Mission</p>
        </footer>
      </main>
    </div>
  )
}

function SupportCard({ icon: Icon, title, val, color }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/20 transition-all rounded-[2rem] p-6 text-center group">
       <div className={`w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${color}`}>
          <Icon size={24} />
       </div>
       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
       <p className="text-xs font-headline font-bold text-foreground truncate">{val}</p>
    </Card>
  )
}
