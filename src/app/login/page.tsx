
"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Globe, Lock, LogIn, Loader2, Key, Fingerprint } from 'lucide-react'
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

export default function LoginPage() {
  const { auth } = useAuth()
  const { firestore } = useFirestore()
  const { user, loading } = useUser()
  const [isHandshaking, setIsHandshaking] = useState(false)
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
        body: JSON.stringify({ token: code, secret: pendingSecret })
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
      
      {/* Visual Background Logo */}
      <div className="absolute -bottom-24 -left-24 opacity-5 rotate-12">
        <AppLogo size={500} />
      </div>

      <Card className="max-w-md w-full border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl z-10">
        <CardHeader className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 relative group">
            <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
            {isHandshaking ? (
              <AppLogo size={64} className="animate-sos-pulse" />
            ) : (
              <AppLogo size={64} />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-headline font-bold tracking-tight uppercase">SHURUKKHA HUB</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60">
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
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest animate-pulse">Encrypting_Session_Keys...</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center leading-relaxed px-4">
                সিরাজগঞ্জ সুরক্ষা পোর্টালে আপনার রাজকীয় পরিচয় নিশ্চিত করুন। নিরাপদ এক্সেস পেতে নিচের মাধ্যমটি ব্যবহার করুন।
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleLogin}
                  className="w-full h-14 bg-white text-black hover:bg-white/90 font-bold gap-3 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Globe size={18} /> Google দিয়ে রাজকীয় প্রবেশ
                </Button>
                
                <Button 
                  variant="outline"
                  disabled
                  className="w-full h-14 border-white/10 font-bold gap-3 opacity-50 rounded-2xl"
                >
                  <Fingerprint size={18} /> বায়োমেট্রিক লগইন (শীঘ্রই)
                </Button>
              </div>
            </>
          )}

          <div className="pt-6 border-t border-white/5 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
              <Lock size={12} className="text-primary" /> SHA256withRSA SECURED
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
