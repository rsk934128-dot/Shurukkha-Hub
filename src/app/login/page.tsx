
"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Globe, Lock, LogIn, Loader2, Key, Fingerprint, Star, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth, useUser, useFirestore } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/lib/auth-guard'
import { DeviceValidator } from '@/lib/device-fingerprint-validator'
import { useToast } from '@/hooks/use-toast'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { TOTPVerificationDialog } from '@/components/auth/totp-verification-dialog'
import { AppLogo } from '@/components/ui/app-logo'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
  const auth = useAuth()
  const firestore = useFirestore()
  const { user, loading } = useUser()
  const [isHandshaking, setIsHandshaking] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [pendingSecret, setPendingSecret] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !loading && !isHandshaking && !show2FA) {
      if (AuthGuard.isValidSession()) {
        router.push('/')
      } else {
        performHandshake()
      }
    }
  }, [user, loading, router])

  const performHandshake = async () => {
    if (!user || !firestore) return
    setIsHandshaking(true)
    
    try {
      // Check if user has 2FA enabled
      const userRef = doc(firestore, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();

      if (userData?.twoFactorEnabled && userData?.twoFactorSecret) {
        setPendingSecret(userData.twoFactorSecret);
        setShow2FA(true);
        setIsHandshaking(false);
        return;
      }

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
          description: "আপনার সেশন এনক্রিপ্ট করা হয়েছে।",
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

  const handleVerify2FA = async (code: string): Promise<boolean> => {
    if (!pendingSecret) return false;
    
    try {
      const response = await fetch('/api/v1/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: code, secret: pendingSecret, userEmail: user?.email })
      });
      
      const data = await response.json();
      
      if (data.status === 'VERIFIED') {
        AuthGuard.establishSession(data.upgradeToken);
        toast({ title: "2FA ভেরিফিকেশন সফল", description: "সাম্রাজ্যে স্বাগতম।" });
        router.push('/');
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  const handleGoogleLogin = async () => {
    if (!auth) {
      toast({ title: "সিস্টেম ত্রুটি", description: "অথেনটিকেশন সার্ভিস লোড হয়নি।", variant: "destructive" })
      return
    }
    
    setIsSigningIn(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error("Login failed", error)
      toast({
        title: "লগইন ব্যর্থ",
        description: error.message || "গুগল লগইন সম্পন্ন করা সম্ভব হয়নি।",
        variant: "destructive"
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      {/* Visual Background Logo */}
      <div className="absolute -bottom-24 -left-24 opacity-5 rotate-12">
        <AppLogo size={500} />
      </div>

      <Card className="max-w-md w-full border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 relative group">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
            {isHandshaking || isSigningIn ? (
              <AppLogo size={64} className="animate-sos-pulse" />
            ) : (
              <AppLogo size={64} />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold tracking-tight uppercase">SHURUKKHA HUB</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              {isHandshaking ? "Establishing Sovereign Handshake..." : isSigningIn ? "Authorizing Google Identity..." : "Sovereign Identity Access"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-10">
          {isHandshaking ? (
            <div className="py-8 text-center space-y-6">
              <div className="flex justify-center items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                <div className="w-2 h-2 bg-accent rounded-full animate-ping [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-ping [animation-delay:0.4s]" />
              </div>
              <div className="space-y-2">
                <p className="text-[11px] text-primary font-mono uppercase tracking-[0.4em] animate-pulse">Encrypting_Sovereign_Keys...</p>
                <p className="text-[9px] text-muted-foreground font-mono">NODE_IDENTITY: core.sheikh.primary</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center leading-relaxed px-4">
                  সিরাজগঞ্জ সুরক্ষা পোর্টালে আপনার রাজকীয় পরিচয় নিশ্চিত করুন। নিরাপদ এক্সেস পেতে নিচের মাধ্যমটি ব্যবহার করুন।
                </p>
                
                <div className="flex justify-center">
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 py-1 px-4 gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Star size={12} fill="currentColor" /> PHASE 31.0 SECURED
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full h-16 bg-white text-black hover:bg-white/90 font-bold gap-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  {isSigningIn ? (
                    <Loader2 size={22} className="animate-spin relative z-10" />
                  ) : (
                    <Globe size={22} className="relative z-10 group-hover:rotate-12 transition-transform" /> 
                  )}
                  <span className="text-lg relative z-10 tracking-tight">
                    {isSigningIn ? "প্রবেশ করা হচ্ছে..." : "Google দিয়ে রাজকীয় প্রবেশ"}
                  </span>
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                   <Button 
                    variant="outline"
                    disabled
                    className="h-12 border-white/5 font-bold gap-2 opacity-50 rounded-xl text-[10px] uppercase tracking-wider"
                  >
                    <Fingerprint size={16} /> বায়োমেট্রিক
                  </Button>
                  <Button 
                    variant="outline"
                    disabled
                    className="h-12 border-white/5 font-bold gap-2 opacity-50 rounded-xl text-[10px] uppercase tracking-wider"
                  >
                    <Key size={16} /> সিকিউরিটি কী
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="pt-6 border-t border-white/5 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                <Lock size={12} className="text-primary" /> SHA256withRSA V2
              </div>
              <p className="text-[8px] font-mono text-muted-foreground/40">PROJECT_ID: 42ND_ARCHIVE | v31.0_SOVEREIGN</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TOTPVerificationDialog 
        isOpen={show2FA} 
        onVerify={handleVerify2FA} 
        onCancel={() => setShow2FA(false)} 
      />
    </div>
  )
}
