
"use client"

import React from 'react'
import { Shield, Globe, Lock, LogIn } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth, useUser } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { auth } = useAuth()
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleGoogleLogin = async () => {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      <Card className="max-w-md w-full border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20">
            <Shield className="text-primary" size={32} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold tracking-tight uppercase">SHURUKKHA HUB</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold text-primary/60">
              Sovereign Identity Access
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            সিরাজগঞ্জ সুরক্ষা পোর্টালে আপনার রাজকীয় পরিচয় নিশ্চিত করুন। নিরাপদ এক্সেস পেতে নিচের যেকোনো একটি মাধ্যম বেছে নিন।
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold gap-3"
            >
              <Globe size={18} /> Google দিয়ে লগইন করুন
            </Button>
            
            <Button 
              variant="outline"
              disabled
              className="w-full h-12 border-white/10 font-bold gap-3 opacity-50"
            >
              <LogIn size={18} /> ফোন নম্বর (শীঘ্রই আসছে)
            </Button>
          </div>

          <div className="pt-6 border-t border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <Lock size={12} /> SHA256withRSA SECURED
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
