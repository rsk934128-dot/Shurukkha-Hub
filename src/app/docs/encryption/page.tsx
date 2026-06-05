"use client"

import React from 'react'
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Zap, 
  ArrowLeft, 
  ShieldAlert, 
  Fingerprint, 
  Database, 
  Network,
  Activity,
  FileSearch,
  Code2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { AppLogo } from '@/components/ui/app-logo'

export default function EncryptionGude() {
  return (
    <div className="min-h-screen bg-[#05070a] text-foreground font-body selection:bg-primary/30 overflow-x-hidden">
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-12 max-w-4xl">
        <Link href="/docs" className="inline-block mb-12">
          <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest p-0">
            <ArrowLeft size={14} /> ফিরে যান
          </Button>
        </Link>

        <div className="space-y-16">
          {/* Hero Section */}
          <div className="space-y-6">
            <Badge variant="outline" className="border-accent/40 text-accent py-1 px-4 uppercase tracking-[0.3em] font-bold text-[10px]">Security Protocol v31.0</Badge>
            <h1 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-[0.9]">
              Imperial <br /><span className="text-primary italic">Encryption Logic</span>
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-2xl">
              সিরাজগঞ্জ সুরক্ষা সাম্রাজ্যের প্রতিটি ডেটা প্যাকেট গবেষণামূলক এনক্রিপশন লেয়ার দ্বারা সুরক্ষিত। আমাদের এই জিরো-ট্রাস্ট মডেল তথ্যের বিশুদ্ধতা এবং গোপনীয়তা নিশ্চিত করে।
            </p>
          </div>

          {/* RSA v2 Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Lock size={24} />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">RSA v2: Identity Signing</h2>
            </div>
            
            <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  আমাদের সিগন্যালগুলো **SHA256withRSA** অ্যালগরিদম ব্যবহার করে। প্রতিটি আউটগোয়িং রেসপন্স ইম্পেরিয়াল মাস্টার কী দ্বারা স্বাক্ষরিত হয়, যা প্রমাণ করে যে ডাটা সরাসরি আপনার সভারেন নোড থেকে আসছে।
                </p>
                <div className="p-6 bg-black/40 rounded-3xl border border-white/5 font-mono text-[11px] text-accent/80 space-y-2">
                   <p className="text-muted-foreground">// Imperial RSA Signature Structure</p>
                   <p className="text-primary">sig = sign(sha256(payload + nonce + timestamp), privateKey)</p>
                   <p className="text-white/40 mt-4">Header: X-Imperial-Signature</p>
                   <p className="text-white/40">Prefix: sig_sha256_rsa_v2_sovereign_...</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* AES-256 Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                <Database size={24} />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">AES-256: Data at Rest</h2>
            </div>
            
            <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  আপনার "Sovereign Vault" এ রাখা প্রতিটি ফাইল **AES-256-GCM** প্রোটোকল দ্বারা এনক্রিপ্ট করা হয়। এটি নিশ্চিত করে যে অফলোড করা ফাইলগুলো ড্রাইভ ব্রিজে থাকা অবস্থায়ও অন্য কেউ পড়তে পারবে না।
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/20 rounded-2xl border border-white/5 space-y-2">
                    <Badge className="bg-primary/20 text-primary text-[8px] h-4">STRENGTH</Badge>
                    <h4 className="font-bold text-xs">Military Grade</h4>
                    <p className="text-[10px] text-muted-foreground">256-bit symmetric key encryption used by global banks.</p>
                  </div>
                  <div className="p-4 bg-muted/20 rounded-2xl border border-white/5 space-y-2">
                    <Badge className="bg-accent/20 text-accent text-[8px] h-4">STATUS</Badge>
                    <h4 className="font-bold text-xs">Always Encrypted</h4>
                    <p className="text-[10px] text-muted-foreground">Zero-knowledge architecture. We don't store your plain-text data.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Fingerprinting Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Fingerprint size={24} />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase tracking-widest">Hardware Fingerprinting</h2>
            </div>
            
            <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 space-y-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  সেশন হাইজ্যাকিং প্রতিরোধ করার জন্য আমরা আপনার ব্রাউজার এবং হার্ডওয়্যার মেটাডাটা থেকে একটি ইউনিক **Digital DNA** তৈরি করি। যদি কোনো অননুমোদিত ডিভাইস থেকে আপনার টোকেন ব্যবহারের চেষ্টা করা হয়, সিস্টেমটি তা তাৎক্ষণিকভাবে ব্লক করে দেবে।
                </p>
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-2xl border border-destructive/20 text-destructive">
                   <ShieldAlert size={18} className="animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Auto-Lockdown Protocol Active</span>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer Notice */}
          <footer className="pt-20 border-t border-white/5 text-center">
            <div className="flex flex-col items-center gap-6">
               <AppLogo size={64} className="opacity-20" />
               <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-primary tracking-[0.3em]">Quantum Ready Shield</p>
                  <p className="text-[8px] font-mono text-muted-foreground/30 uppercase tracking-[0.5em]">
                    SHA256_V2 | AES_256_GCM | RSA_4096_PENDING
                  </p>
               </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
