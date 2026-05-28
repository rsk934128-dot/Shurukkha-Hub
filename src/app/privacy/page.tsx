"use client"

import React from 'react'
import { Shield, Lock, EyeOff, Fingerprint, Database, ArrowLeft, Activity, ShieldCheck, Zap, Globe, FileSearch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function PrivacyProtocols() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-4xl">
        <Link href="/" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest">
            <ArrowLeft size={14} /> প্রচ্ছদ পাতায় ফিরে যান
          </Button>
        </Link>

        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
               <AppLogo size={120} className="relative z-10 animate-sos-pulse" />
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="border-primary/40 text-primary py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Security Directive 42.0</Badge>
              <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-tight">Privacy Protocols: <br /><span className="text-primary italic">The Sovereign Shield</span></h1>
            </div>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl mx-auto">
              সিরাজগঞ্জ সুরক্ষা কেবল একটি অ্যাপ্লিকেশন নয়; এটি একটি সার্বভৌম ডিজিটাল বর্ম। আমাদের প্রোটোকলগুলো নাগরিকের তথ্যকে বাহ্যিক হস্তক্ষেপ এবং নজরদারি থেকে মুক্ত রাখে।
            </p>
          </div>

          {/* Protocols Grid */}
          <div className="grid gap-8">
            {/* Protocol 1 */}
            <ProtocolCard 
              icon={Globe}
              title="Data Sovereignty (তথ্য সার্বভৌমত্ব)"
              desc="আপনার ব্যক্তিগত তথ্য কোনো সাধারণ বাণিজ্যিক সার্ভারে সংরক্ষিত থাকে না। এটি আমাদের ৪২টি ডিস্ট্রিবিউটেড নোডে এনক্রিপ্ট করা অবস্থায় ছড়িয়ে থাকে। এর ফলে কোনো একক সার্ভার আক্রমণ করে আপনার তথ্য চুরি করা অসম্ভব।"
              tech="Anycast Distributed Ledger"
            />

            {/* Protocol 2 */}
            <ProtocolCard 
              icon={Lock}
              title="RSA v2 Bridge Encryption"
              desc="প্রতিটি ডেটা প্যাকেট পাঠানোর আগে আমাদের 'Imperial Bridge' দ্বারা স্বাক্ষরিত হয়। আমরা SHA256withRSA অ্যালগরিদম ব্যবহার করি, যা নিশ্চিত করে যে প্রেরিত তথ্য পথে কেউ পরিবর্তন করতে পারবে না।"
              tech="SHA256withRSA v2.1"
            />

            {/* Protocol 3 */}
            <ProtocolCard 
              icon={Fingerprint}
              title="Identity Fingerprinting"
              desc="আমরা ডিভাইস আইডি এবং মেটাডাটা অ্যানালাইসিস করে প্রতিটি সেশনের বৈধতা নিশ্চিত করি। যদি কোনো অননুমোদিত ডিভাইস থেকে আপনার আইডি ব্যবহারের চেষ্টা করা হয়, সিস্টেমটি তাৎক্ষণিকভাবে সেই সেশনটিকে 'Isolate' করে দেবে।"
              tech="Hardware-Bound Bio-Auth"
            />

            {/* Protocol 4 */}
            <ProtocolCard 
              icon={FileSearch}
              title="Forensic Immutability"
              desc="সাম্রাজ্যের প্রতিটি অপারেশন 'Audit Trail'-এ রেকর্ড করা হয়। এই অডিট লগগুলো ইমিউটেবল বা অপরিবর্তনীয়। এমনকি কোনো অ্যাডমিনও এই রেকর্ডগুলো মুছে ফেলতে পারে না, যা স্বচ্ছতা নিশ্চিত করে।"
              tech="Sovereign Audit Engine"
            />
          </div>

          {/* Footer Statement */}
          <div className="p-8 bg-primary/5 border border-primary/20 rounded-[2.5rem] text-center space-y-4">
             <div className="flex justify-center items-center gap-3 text-primary">
                <ShieldCheck size={24} />
                <h4 className="font-headline font-bold text-xl uppercase">Sovereign Compliance Verified</h4>
             </div>
             <p className="text-sm text-muted-foreground italic leading-relaxed">
               "আমাদের প্রোটোকলগুলো নাগরিকের গোপনীয়তাকে রাজকীয় অধিকার হিসেবে সম্মান করে। আপনার কোনো তথ্য বাণিজ্যিক উদ্দেশ্যে কারো কাছে বিক্রি বা শেয়ার করা হয় না।"
             </p>
             <div className="pt-4 flex justify-center gap-4">
                <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[8px]">ENCRYPTION: QUANTUM_READY</Badge>
                <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[8px]">LOGS: ZERO_DELETE</Badge>
             </div>
          </div>
        </div>

        <footer className="mt-20 pt-12 border-t border-white/5 text-center opacity-40">
           <div className="flex justify-center gap-8 text-[9px] uppercase font-bold tracking-widest text-primary/40 mb-6">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Protocols</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Imperial Terms</Link>
              <Link href="/audit" className="hover:text-primary transition-colors">Forensic Audit</Link>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em]">Developed with Pride for Sirajganj District Administration</p>
           <p className="text-[8px] font-mono mt-2 uppercase tracking-widest">Project: 42ND_ARCHIVE | v31.0_SOVEREIGN</p>
        </footer>
      </main>
    </div>
  )
}

function ProtocolCard({ icon: Icon, title, desc, tech }: any) {
  return (
    <Card className="bg-card/40 border-white/5 hover:border-primary/30 transition-all duration-500 rounded-[2rem] overflow-hidden group">
      <CardContent className="p-8 flex gap-6 items-start">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:bg-primary/20 transition-all duration-500">
          <Icon size={32} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-headline font-bold text-foreground uppercase tracking-tight">{title}</h3>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-[7px] h-4">ACTIVE</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed font-light">
            {desc}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <Zap size={12} className="text-accent" />
            <span className="text-[9px] font-mono text-accent uppercase font-bold tracking-widest">Tech Stack: {tech}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
