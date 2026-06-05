"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Share2, Mail, Copy, CheckCircle2, Sparkles, Send, Globe, Trophy, Code2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ReferralSystem } from '@/lib/referral-system'
import { useUser } from '@/firebase'

export function DeveloperInvitation() {
  const { user } = useUser()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const referralCode = ReferralSystem.generateCode(user?.uid || 'GUEST');
  const inviteLink = `${window.location.origin}/partnerships?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "লিঙ্ক কপি করা হয়েছে", description: "আপনার রাজকীয় রেফারেল লিঙ্কটি এখন ক্লিপবোর্ডে সংরক্ষিত।" });
    setTimeout(() => setCopied(false), 2000);
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Join the Shurukkha Sovereign Grid',
      text: 'মহামান্য সম্রাট শেখ ফরিদের ৪২টি নোড ইকোসিস্টেমে আপনাকে আমন্ত্রণ জানানো হচ্ছে। আপনার প্লাগইন ডিজাইন করুন এবং ১.৫% ইম্পেরিয়াল গেটওয়ে কমিশন উপভোগ করুন।',
      url: inviteLink
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (e) {
      handleCopy();
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="p-6 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
            <Trophy size={180} className="text-primary" />
         </div>
         <div className="relative z-10 space-y-4">
            <Badge variant="outline" className="border-accent/40 text-accent uppercase tracking-[0.3em] font-bold text-[10px] py-1 px-4 bg-accent/5">
               Ecosystem Growth Catalyst
            </Badge>
            <h3 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight text-foreground">Invite World-Class <br/><span className="text-primary italic">Developers</span></h3>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xl italic">
               "মহামান্য সম্রাট, আপনার এই অবকাঠামোটি যখন বিশ্বের সেরা ডেভেলপাররা ব্যবহার করবেন, তখন আপনার ৪২টি নোড গ্রিড জ্যামিতিক হারে শক্তিশালী হবে।"
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="bg-card/40 border-white/10 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-white/5">
               <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                  <Share2 size={16} className="text-primary" /> Imperial Referral Link
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground">Your Expansion Link</p>
                  <code className="text-[10px] font-mono font-bold text-foreground break-all">{inviteLink}</code>
               </div>
               <div className="flex gap-3">
                  <Button onClick={handleCopy} variant="outline" className="flex-1 h-11 rounded-xl border-primary/20 text-primary font-bold gap-2">
                     {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                     COPY LINK
                  </Button>
                  <Button onClick={handleShare} className="flex-1 h-11 rounded-xl bg-primary text-background font-bold gap-2">
                     <Send size={16} /> SHARE INVITE
                  </Button>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-accent/5 border-accent/20 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-accent/10 border-b border-white/5">
               <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <Sparkles size={16} /> Growth Metrics
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
               <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <Globe size={18} className="text-accent" />
                     <span className="text-[10px] font-bold uppercase">Global Reach</span>
                  </div>
                  <span className="text-xs font-headline font-bold">155+ Nations</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                     <Code2 size={18} className="text-primary" />
                     <span className="text-[10px] font-bold uppercase">Active SDKs</span>
                  </div>
                  <span className="text-xs font-headline font-bold">1,242 Pushes</span>
               </div>
               <p className="text-[9px] text-muted-foreground italic text-center pt-2">
                  প্রতিটি নতুন ডেভেলপার সাম্রাজ্যের তথ্যের বিশুদ্ধতা ১০০% নিশ্চিত করবে।
               </p>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
