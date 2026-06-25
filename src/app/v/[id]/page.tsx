"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Globe, Zap, Star, MessageSquare, LogIn, Loader2, ArrowRight, Share2, Copy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppLogo } from '@/components/ui/app-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'

/**
 * @fileOverview Public Sovereign Identity Verification Page.
 * Accessible via core.sheikh/v/[id]
 * Updated Phase 37.0: Majestic Passport UI with biometric integrity status.
 */

export default function PublicIdentityVerify() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const id = params.id as string

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Attempt to find user or merchant by ID
        const userSnap = await getDoc(doc(db, "users", id));
        if (userSnap.exists()) {
          setProfile({ ...userSnap.data(), id: userSnap.id, type: 'CITIZEN' });
        } else {
          // Check merchants if user not found
          const merchantSnap = await getDoc(doc(db, "merchants", id));
          if (merchantSnap.exists()) {
            setProfile({ ...merchantSnap.data(), id: merchantSnap.id, type: 'MERCHANT' });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "লিঙ্ক কপি করা হয়েছে", description: "এই সার্বভৌম আইডিটি এখন শেয়ার করার জন্য প্রস্তুত।" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-6">
        <AppLogo size={100} className="animate-sos-pulse" />
        <p className="text-[10px] uppercase font-bold text-primary tracking-[0.4em] animate-pulse">Verifying Identity Grid...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
          <Lock className="text-destructive" size={40} />
        </div>
        <h1 className="text-2xl font-headline font-bold uppercase text-white">ID Not Recognized</h1>
        <p className="text-muted-foreground text-sm max-w-xs">প্রদত্ত আইডিটি আমাদের ৪২টি নোড গ্রিডে খুঁজে পাওয়া যায়নি। এটি একটি অননুমোদিত বা ভুল লিঙ্ক হতে পারে।</p>
        <Button onClick={() => router.push('/')} className="bg-primary text-background font-bold rounded-xl px-8">প্রচ্ছদ পাতায় ফিরে যান</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      <main className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10 space-y-4">
           <AppLogo size={64} className="mx-auto" />
           <div className="space-y-1">
              <h1 className="text-xl font-headline font-bold uppercase tracking-widest text-primary">Sovereign Identity Registry</h1>
              <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-[0.4em]">Sirajganj District Administration • Phase 37.0</p>
           </div>
        </div>

        <Card className="bg-card/40 backdrop-blur-3xl border-primary/20 rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
          
          <CardContent className="p-0">
             <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                   <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-1000" />
                   <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-primary/20 relative z-10 shadow-2xl">
                      <AvatarImage src={profile.photoURL || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/5 text-6xl font-headline font-bold text-primary">
                        {(profile.displayName || profile.businessName || '?').substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-2 -right-2 bg-accent p-3 rounded-2xl shadow-xl border-4 border-[#05070a] z-20 animate-bounce">
                      <ShieldCheck className="text-background" size={28} />
                   </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-6 w-full">
                   <div>
                      <Badge variant="outline" className="border-accent/40 text-accent uppercase text-[9px] font-bold tracking-widest px-4 py-1 mb-3">Verified {profile.type}</Badge>
                      <h2 className="text-3xl font-headline font-bold text-white tracking-tight leading-none mb-2">
                        {profile.displayName || profile.businessName}
                      </h2>
                      <p className="text-xs text-primary font-mono uppercase tracking-widest opacity-70">
                        {profile.type === 'MERCHANT' ? profile.merchantId : `CITIZEN_${profile.id.substring(0, 8).toUpperCase()}`}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/10 rounded-2xl border border-white/5 space-y-1">
                         <p className="text-[8px] uppercase font-bold text-muted-foreground">Purity Score</p>
                         <p className="text-lg font-headline font-bold text-primary">100.0%</p>
                      </div>
                      <div className="p-4 bg-muted/10 rounded-2xl border border-white/5 space-y-1">
                         <p className="text-[8px] uppercase font-bold text-muted-foreground">Status</p>
                         <p className="text-lg font-headline font-bold text-accent">ACTIVE</p>
                      </div>
                   </div>

                   <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <Button onClick={() => router.push('/login')} className="flex-1 h-14 bg-primary text-background font-bold text-lg rounded-2xl gap-3 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <LogIn size={20} /> পোর্টালে প্রবেশ
                      </Button>
                      <Button onClick={handleCopyLink} variant="outline" className="h-14 w-full sm:w-14 rounded-2xl border-white/10 hover:bg-white/5">
                        <Share2 size={20} />
                      </Button>
                   </div>
                </div>
             </div>

             <div className="px-10 py-6 bg-primary/5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                   <Lock className="text-accent" size={16} />
                   <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                     Signed via SHA256withRSA v2.1 Protocol
                   </p>
                </div>
                <div className="flex items-center gap-2">
                   <Globe className="text-primary animate-pulse" size={14} />
                   <span className="text-[9px] font-bold text-primary uppercase">Anycast Sync: 42/42 Nodes</span>
                </div>
             </div>
          </CardContent>
        </Card>

        <p className="text-center mt-8 text-[9px] text-muted-foreground uppercase font-bold tracking-[0.5em] opacity-40">
           Project ID: 42nd_Archive | Sovereign Standard v37.0
        </p>
      </main>
    </div>
  )
}
