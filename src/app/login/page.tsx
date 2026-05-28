"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Globe, Lock, LogIn, Loader2, Key } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth, useUser } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/lib/auth-guard'
import { DeviceValidator } from '@/lib/device-fingerprint-validator'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const { auth } = useAuth()
  const { user, loading } = useUser()
  const [isHandshaking, setIsHandshaking] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !loading && !isHandshaking) {
      if (AuthGuard.isValidSession()) {
        router.push('/')
      } else {
        performHandshake()
      }
    }
  }, [user, loading, router])

  const performHandshake = async () => {
    if (!user) return
    setIsHandshaking(true)
    
    try {
      const idToken = await user.getIdToken()
      const fingerprint = DeviceValidator.generateFingerprint()
      
      const response = await fetch('/api/v1/auth/handshake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, fingerprint })
      })
      
      const data = await response.json()
      
      if (data.status === 'AUTHORIZED') {
        AuthGuard.establishSession(data.token)
        localStorage.setItem('sovereign_device_id', fingerprint)
        
        toast({
          title: "Sovereign Handshake ACTIVE",
          description: "আপনার সেশন ১০ মিনিটের জন্য এনক্রিপ্ট করা হয়েছে।",
        })
        router.push('/')
      } else {
        throw new Error("Handshake Denied")
      }
    } catch (error) {
      console.error("Handshake failed", error)
      toast({
        title: "AUTH_FAILURE",
        description: "সুরক্ষিত হ্যান্ডশেক সম্পন্ন করা সম্ভব হয়নি।",
        variant: "destructive"
      })
    } finally {
      setIsHandshaking(false)
    }
  }

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
            {isHandshaking ? (
              <Loader2 className="animate-spin text-primary" size={32} />
            ) : (
              <Shield className="text-primary" size={32} />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold tracking-tight uppercase">SHURUKKHA HUB</CardTitle>
            <CardDescription className="text-xs uppercase tracking-[0.2em] font-bold text-primary/60">
              {isHandshaking ? "Establishing Sovereign Handshake..." : "Sovereign Identity Access"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isHandshaking ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
              <p className="text-xs text-muted-foreground font-mono">ENCRYPTING_SESSION_KEYS...</p>
            </div>
          ) : (
            <>
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
            </>
          )}

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
