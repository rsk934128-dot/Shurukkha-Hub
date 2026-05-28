
"use client"

import React from 'react'
import { Shield, Lock, Gavel, Scale, Ban, Landmark, ArrowLeft, Zap, FileText, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function ImperialTerms() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
        <Link href="/" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest">
            <ArrowLeft size={14} /> প্রচ্ছদ পাতায় ফিরে যান
          </Button>
        </Link>

        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
               <Gavel size={120} className="relative z-10 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary/40 text-primary py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Imperial Decree 31.0</Badge>
              <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-tight">Imperial Terms: <br /><span className="text-primary italic">The Sovereign Decree</span></h1>
            </div>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
              সিরাজগঞ্জ সুরক্ষা একটি সার্বভৌম পরিকাঠামো। এর ব্যবহারকারী হিসেবে আপনাকে নিম্নলিখিত রাজকীয় নিয়মাবলী মেনে চলতে হবে।
            </p>
          </div>

          {/* Terms Grid */}
          <div className="grid gap-8">
            <TermCard 
              icon={UserCheck}
              title="১. সার্বভৌম প্রবেশাধিকার (Sovereign Access)"
              desc="কেবল অনুমোদিত ডিভাইস এবং ২-স্তরীয় (2FA) ভেরিফাইড পরিচয়ই এই সাম্রাজ্যের 'কমান্ড সেন্টার' অ্যাক্সেস করতে পারবে। অননুমোদিত প্রবেশের যেকোনো চেষ্টা স্বয়ংক্রিয়ভাবে শনাক্ত এবং প্রতিহত করা হবে।"
            />

            <TermCard 
              icon={Landmark}
              title="২. রাজকীয় রাজস্ব ইঞ্জিন (Revenue Engine)"
              desc="সিস্টেমের মাধ্যমে সম্পন্ন প্রতিটি বাণিজ্যিক ট্রানজেকশন থেকে ১.৫% ইম্পেরিয়াল সার্ভিস ফি কর্তন করা হবে। এই রাজস্ব সরাসরি জেলা প্রশাসনের ট্রেজারিতে জমা হবে এবং জনকল্যাণে ব্যয় হবে।"
            />

            <TermCard 
              icon={Ban}
              title="৩. তথ্যের বিশুদ্ধতা ও নির্বাসন (Permanent Exile)"
              desc="সিস্টেমের কোনো ডেটা পরিবর্তন বা তথ্যের বিশুদ্ধতা নষ্ট করার চেষ্টা করলে সংশ্লিষ্ট ইউজার আইডি এবং ডিভাইসকে 'Permanent Exile' বা চিরস্থায়ী ব্ল্যাকলিস্টে অন্তর্ভুক্ত করা হবে।"
            />

            <TermCard 
              icon={Zap}
              title="৪. জরুরি সংকেত প্রোটোকল (SOS Protocol)"
              desc="SOS বা জরুরি সংকেত কেবল প্রকৃত বিপদের সময় ব্যবহারের জন্য। এর অপব্যবহার দণ্ডনীয় অপরাধ এবং এর ফলে আইনি ব্যবস্থা গ্রহণ করা হবে।"
            />
          </div>

          {/* Disclaimer */}
          <div className="p-8 bg-destructive/5 border border-destructive/20 rounded-[2.5rem] text-center space-y-4">
             <div className="flex justify-center items-center gap-3 text-destructive">
                <Scale size={24} />
                <h4 className="font-headline font-bold text-xl uppercase">Legal Jurisdiction Verified</h4>
             </div>
             <p className="text-sm text-muted-foreground italic leading-relaxed">
               "এই নিয়মাবলী লঙ্ঘনকারীকে সাম্রাজ্যের ফরেনসিক অডিট লগের ভিত্তিতে যেকোনো সময় অভিযুক্ত করার অধিকার জেলা প্রশাসন সংরক্ষণ করে।"
             </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <footer className="mt-20 pt-12 border-t border-white/5 text-center opacity-40">
           <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-[9px] uppercase font-bold tracking-widest text-primary/40 mb-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
              <Link href="/terms" className="hover:text-primary transition-colors text-primary">Imperial Terms</Link>
              <Link href="/audit" className="hover:text-primary transition-colors">Forensic Audit</Link>
              <Link href="/partnerships" className="hover:text-primary transition-colors">Partnership Hub</Link>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em]">Authored with Authority for Sirajganj District Administration</p>
           <p className="text-[8px] font-mono mt-2 uppercase tracking-widest">Project: 42ND_ARCHIVE | v31.0_SOVEREIGN</p>
        </footer>
      </main>
    </div>
  )
}

function TermCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2rem] overflow-hidden group">
      <CardContent className="p-8 flex gap-6 items-start">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:bg-primary/20 transition-all duration-500">
          <Icon size={32} />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-headline font-bold text-foreground uppercase tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            {desc}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
