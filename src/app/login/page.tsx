
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Shield, Globe, Lock, LogIn, Loader2, Key, Fingerprint, Star, Zap, ArrowRight, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth, useUser, useFirestore } from '@/firebase'
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/lib/auth-guard'
import { DeviceValidator } from '@/lib/device-fingerprint-validator'
import { useToast } from '@/hooks/use-toast'
import { doc, getDoc } from 'firebase/firestore'
import { TOTPVerificationDialog } from '@/components/auth/totp-verification-dialog'
import { BiometricPrompt } from '@/components/auth/biometric-prompt'
import { AppLogo } from '@/components/ui/app-logo'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function LoginPage() {
  const auth = useAuth()
  const firestore = useFirestore()
  const { user, loading } = useUser()
  const [isHandshaking, setIsHandshaking] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [showBiometric, setShowBiometric] = useState(false)
  const [showSecurityKey, setShowSecurityKey] = useState(false)
  const [pendingSecret, setPendingSecret] = useState<string | null>(null)
  const [handshakeComplete, setHandshakeComplete] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const performHandshake = useCallback(async () => {
    if (!user || !firestore || isHandshaking || handshakeComplete) return
    setIsHandshaking(true)
    
    try {
      const userRef = doc(firestore, "users", user.uid);
      let userData = null;
      
      try {
        const userSnap = await getDoc(userRef);
        userData = userSnap.data();
      } catch (e: any) {
        console.warn("[Handshake] Firestore read skipped (offline/init).");
      }

      if (userData?.twoFactorEnabled && userData?.twoFactorSecret && !show2FA) {
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
        
        setHandshakeComplete(true)
        toast({
          title: "Sovereign Handshake ACTIVE",
          description: "আপনার সেশন সফলভাবে এনক্রিপ্ট করা হয়েছে।",
        })
        
        // Immediate redirect using location for maximum reliability
        window.location.assign('/dashboard')
      } else {
        throw new Error("Handshake Denied")
      }
    } catch (error: any) {
      console.error("Handshake failed", error)
      if (!navigator.onLine) {
        const localToken = 'est_local_' + Math.random().toString(36).substring(7);
        AuthGuard.establishSession(localToken);
        setHandshakeComplete(true)
        window.location.assign('/dashboard')
      } else {
        toast({
          title: "AUTH_FAILURE",
          description: "সুরক্ষিত হ্যান্ডশেক সম্পন্ন করা সম্ভব হয়নি।",
          variant: "destructive"
        })
      }
    } finally {
      setIsHandshaking(false)
    }
  }, [user, firestore, isHandshaking, handshakeComplete, show2FA, toast])

  // Handle Auth Redirect Result
  useEffect(() => {
    if (auth) {
      getRedirectResult(auth).catch((error) => console.error("[Auth] Redirect Error:", error.code));
    }
  }, [auth]);

  // Main Auth Flow Trigger
  useEffect(() => {
    if (user && !loading && !isHandshaking && !show2FA && !showBiometric && !showSecurityKey && !handshakeComplete) {
      if (AuthGuard.isValidSession()) {
        router.replace('/dashboard')
      } else {
        performHandshake()
      }
    }
  }, [user, loading, isHandshaking, show2FA, showBiometric, showSecurityKey, handshakeComplete, performHandshake, router])

  const handleGoogleLogin = async () => {
    if (!auth) return
    setIsSigningIn(true)
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setIsSigningIn(false)
        return
      }
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        setIsSigningIn(false);
        toast({ title: "লগইন ব্যর্থ", variant: "destructive" });
      }
    } finally {
      setTimeout(() => setIsSigningIn(false), 2000);
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
        setHandshakeComplete(true);
        window.location.assign('/dashboard');
        return true;
      }
      return false;
    } catch (e) { return false; }
  }

  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
      
      {/* Return to Landing Page Button */}
      <Link href="/" className="mb-6 z-20">
        <Button variant="ghost" className="text-muted-foreground hover:text-primary gap-2 text-xs uppercase font-bold tracking-widest">
          <ArrowLeft size={14} /> প্রচ্ছদ পাতায় ফিরে যান
        </Button>
      </Link>

      <Card className="max-w-md w-full border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-pulse" />
        
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 relative group">
            <AppLogo size={64} className={isHandshaking || isSigningIn ? "animate-sos-pulse" : ""} />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold tracking-tight uppercase">SHURUKKHA HUB</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              {isHandshaking ? "Establishing Sovereign Handshake..." : handshakeComplete ? "Handshake Complete" : "Sovereign Identity Access"}
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
              <p className="text-[11px] text-primary font-mono uppercase tracking-[0.4em] animate-pulse">Encrypting_Sovereign_Keys...</p>
            </div>
          ) : handshakeComplete ? (
             <div className="py-8 text-center space-y-6">
               <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto border border-accent/40">
                  <Zap className="text-accent animate-bounce" size={32} />
               </div>
               <div className="space-y-4">
                 <p className="text-sm font-bold text-accent uppercase tracking-widest">পরিচয় নিশ্চিত হয়েছে!</p>
                 <Button onClick={() => window.location.assign('/dashboard')} className="w-full bg-primary text-background font-bold gap-2">
                   ড্যাশবোর্ডে প্রবেশ করুন <ArrowRight size={18} />
                 </Button>
               </div>
             </div>
          ) : (
            <>
              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground leading-relaxed px-4">
                  সিরাজগঞ্জ সুরক্ষা পোর্টালে আপনার রাজকীয় পরিচয় নিশ্চিত করুন।
                </p>
                <div className="flex justify-center">
                  <Badge variant="outline" className="border-primary/30 text-primary py-1 px-4 gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <Star size={12} fill="currentColor" /> PHASE 31.0 SECURED
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full h-16 bg-white text-black hover:bg-white/90 font-bold gap-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
                >
                  {isSigningIn ? <Loader2 size={22} className="animate-spin" /> : <Globe size={22} />}
                  <span className="text-lg tracking-tight">
                    {isSigningIn ? "প্রবেশ করা হচ্ছে..." : "Google দিয়ে রাজকীয় প্রবেশ"}
                  </span>
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                   <Button variant="outline" onClick={() => setShowBiometric(true)} className="h-12 border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-wider">
                    <Fingerprint size={16} className="mr-2" /> বায়োমেট্রিক
                  </Button>
                  <Button variant="outline" onClick={() => setShowSecurityKey(true)} className="h-12 border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-wider">
                    <Key size={16} className="mr-2" /> সিকিউরিটি কী
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="pt-6 border-t border-white/5 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
                <Lock size={12} className="text-primary" /> SHA256withRSA V2
              </div>
              <p className="text-[8px] font-mono text-muted-foreground/40">PROJECT_ID: 42ND_ARCHIVE | v31.0_SOVEREIGN</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TOTPVerificationDialog isOpen={show2FA} onVerify={handleVerify2FA} onCancel={() => setShow2FA(false)} />
      <BiometricPrompt isOpen={showBiometric} onVerify={() => { setShowBiometric(false); performHandshake(); }} onCancel={() => setShowBiometric(false)} actionName="Imperial Access" />
      <BiometricPrompt isOpen={showSecurityKey} onVerify={() => { setShowSecurityKey(false); performHandshake(); }} onCancel={() => setShowSecurityKey(false)} actionName="Hardware Key Access" />
    </div>
  )
}
