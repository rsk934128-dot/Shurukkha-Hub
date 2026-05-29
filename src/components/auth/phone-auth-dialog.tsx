"use client"

import React, { useState, useEffect } from 'react'
import { Smartphone, ShieldCheck, Loader2, MessageSquare, ArrowRight, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'

interface PhoneAuthProps {
  isOpen: boolean;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

export function PhoneAuthDialog({ isOpen, onSuccess, onCancel }: PhoneAuthProps) {
  const [phoneNumber, setPhoneNumber] = useState('+880')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  
  const auth = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier && auth) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          console.log("[Recaptcha] Verified");
        }
      });
    }
  }, [isOpen, auth]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      toast({ title: "ভুল নম্বর", description: "সঠিক মোবাইল নম্বর প্রদান করুন।", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: "OTP পাঠানো হয়েছে", description: "আপনার মোবাইলে আসা ৬ ডিজিটের কোডটি দিন।" });
    } catch (error: any) {
      console.error("SMS Error:", error);
      toast({ title: "SMS পাঠানো ব্যর্থ", description: "দয়া করে আবার চেষ্টা করুন বা নম্বর যাচাই করুন।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6 || !confirmationResult) return;

    setLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();
      toast({ title: "পরিচয় নিশ্চিত", description: "সাম্রাজ্যে আপনাকে স্বাগতম।" });
      onSuccess(idToken);
    } catch (error: any) {
      toast({ title: "ভুল OTP", description: "প্রদত্ত কোডটি সঠিক নয়।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm bg-card border-primary/20 backdrop-blur-xl rounded-[2rem]">
        <div id="recaptcha-container"></div>
        
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 mb-4">
            <Smartphone className="text-primary" size={32} />
          </div>
          <DialogTitle className="font-headline font-bold uppercase tracking-tight">Sovereign SMS OTP</DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'phone' 
              ? "সাম্রাজ্যে প্রবেশের জন্য আপনার মোবাইল নম্বরটি দিন।" 
              : "আপনার মোবাইলে পাঠানো ৬ ডিজিটের কোডটি লিখুন।"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {step === 'phone' ? (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">মোবাইল নম্বর</label>
              <Input 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+88017XXXXXXXX"
                className="bg-background/50 border-primary/20 h-12 text-center text-lg font-mono"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">গোপন কোড (OTP)</label>
              <Input 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="000000"
                className="bg-background/50 border-primary/20 h-14 text-center text-2xl font-mono tracking-[0.5em]"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            disabled={loading}
            onClick={step === 'phone' ? handleSendOtp : handleVerifyOtp}
            className="w-full bg-primary text-background font-bold h-12 gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (step === 'phone' ? "কোড পাঠান" : "ভেরিফাই করুন")}
            {!loading && <ArrowRight size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-[10px] uppercase font-bold text-muted-foreground"
          >
            বাতিল করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
