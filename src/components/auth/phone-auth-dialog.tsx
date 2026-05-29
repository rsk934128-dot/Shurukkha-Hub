"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Smartphone, ShieldCheck, Loader2, MessageSquare, ArrowRight, X, Phone, Volume2, Mic } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'
import { generateVoiceOtp } from '@/ai/flows/generate-voice-otp'

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
  const [isCalling, setIsCalling] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [voiceOtp, setVoiceOtp] = useState<string | null>(null)
  
  const auth = useAuth()
  const { toast } = useToast()
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setOtp('');
      setConfirmationResult(null);
      setVoiceOtp(null);
      setIsCalling(false);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    }
  }, [isOpen]);

  const initRecaptcha = () => {
    if (!auth || recaptchaVerifierRef.current || !containerRef.current) return;
    
    try {
      const verifier = new RecaptchaVerifier(auth, containerRef.current, {
        'size': 'invisible',
        'callback': () => {
          console.log("[Recaptcha] Verified");
        },
        'expired-callback': () => {
          console.log("[Recaptcha] Expired - Resetting...");
          if (recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current.clear();
            recaptchaVerifierRef.current = null;
          }
        }
      });
      recaptchaVerifierRef.current = verifier;
    } catch (error) {
      console.error("[Recaptcha] Initialization failed:", error);
      toast({ title: "Recaptcha Error", description: "নিরাপত্তা যাচাইকরণ মডিউলটি চালু করা সম্ভব হয়নি।", variant: "destructive" });
    }
  }

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      toast({ title: "ভুল নম্বর", description: "সঠিক মোবাইল নম্বর প্রদান করুন।", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        initRecaptcha();
      }
      
      if (!recaptchaVerifierRef.current) {
        throw new Error("Recaptcha failed to initialize.");
      }

      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep('otp');
      toast({ title: "OTP পাঠানো হয়েছে", description: "আপনার মোবাইলে আসা ৬ ডিজিটের কোডটি দিন।" });
    } catch (error: any) {
      console.error("SMS Error:", error);
      let msg = "SMS পাঠানো ব্যর্থ। দয়া করে আবার চেষ্টা করুন।";
      if (error.code === 'auth/invalid-phone-number') msg = "প্রদত্ত মোবাইল নম্বরটি সঠিক নয়।";
      toast({ title: "প্রবেশাধিকার নাকচ", description: msg, variant: "destructive" });
      
      if (recaptchaVerifierRef.current) {
        try { recaptchaVerifierRef.current.clear(); } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCall = async () => {
    if (!phoneNumber || phoneNumber.length < 11) return;
    
    setIsCalling(true);
    try {
      const { otp: generatedOtp, audioDataUri } = await generateVoiceOtp();
      setVoiceOtp(generatedOtp);
      
      // Play the imperial voice audio
      if (audioRef.current) {
        audioRef.current.src = audioDataUri;
        audioRef.current.play();
      }
      
      setStep('otp');
      toast({ title: "ইম্পেরিয়াল কল সক্রিয়", description: "মনোযোগ দিয়ে কণ্ঠস্বর শুনুন এবং কোডটি লিখুন।" });
    } catch (error) {
      console.error("Voice OTP Error:", error);
      toast({ title: "কল ব্যর্থ", description: "ভয়েস ইঞ্জিন বর্তমানে রক্ষণাবেক্ষণাধীন।", variant: "destructive" });
    } finally {
      setIsCalling(false);
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    try {
      if (voiceOtp && otp === voiceOtp) {
        // Voice OTP simulation - in real app would link to custom token
        toast({ title: "পরিচয় নিশ্চিত", description: "ভয়েস অথেন্টিকেশন সফল হয়েছে।" });
        // Simulating idToken for handshake
        onSuccess('est_voice_verified_' + btoa(phoneNumber));
      } else if (confirmationResult) {
        const userCredential = await confirmationResult.confirm(otp);
        const idToken = await userCredential.user.getIdToken();
        toast({ title: "পরিচয় নিশ্চিত", description: "সাম্রাজ্যে আপনাকে স্বাগতম।" });
        onSuccess(idToken);
      } else {
        throw new Error("Invalid Code");
      }
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast({ title: "ভুল OTP", description: "প্রদত্ত কোডটি সঠিক নয়।", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm bg-card border-primary/20 backdrop-blur-xl rounded-[2.5rem]">
        <div ref={containerRef} id="recaptcha-container"></div>
        <audio ref={audioRef} className="hidden" />
        
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 mb-4">
            {isCalling ? (
              <Phone className="text-accent animate-bounce" size={32} />
            ) : (
              <Smartphone className="text-primary" size={32} />
            )}
          </div>
          <DialogTitle className="font-headline font-bold uppercase tracking-tight">
            {isCalling ? "Imperial Voice Call" : "Sovereign Identity"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'phone' 
              ? "সাম্রাজ্যে প্রবেশের জন্য আপনার মোবাইল নম্বরটি দিন।" 
              : isCalling ? "সেনটিনেল এআই-এর কণ্ঠস্বর থেকে কোডটি সংগ্রহ করুন।" : "আপনার মোবাইলে পাঠানো কোডটি লিখুন।"}
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
                disabled={loading || isCalling}
                className="bg-background/50 border-primary/20 h-12 text-center text-lg font-mono"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">গোপন কোড (OTP)</label>
                {voiceOtp && (
                  <Badge variant="outline" className="text-[7px] border-accent/40 text-accent animate-pulse">VOICE_SESSION_ACTIVE</Badge>
                )}
              </div>
              <Input 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="000000"
                disabled={loading}
                className="bg-background/50 border-primary/20 h-14 text-center text-2xl font-mono tracking-[0.5em]"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2">
          {step === 'phone' ? (
            <>
              <Button 
                disabled={loading || isCalling}
                onClick={handleSendOtp}
                className="w-full bg-primary text-background font-bold h-12 gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <MessageSquare size={18} />}
                {loading ? "প্রসেসিং..." : "এসএমএস পাঠান"}
              </Button>
              <Button 
                disabled={loading || isCalling}
                onClick={handleVoiceCall}
                variant="outline"
                className="w-full border-accent/20 text-accent hover:bg-accent/10 font-bold h-12 gap-2"
              >
                {isCalling ? <Loader2 className="animate-spin" size={18} /> : <Phone size={18} />}
                {isCalling ? "কল করা হচ্ছে..." : "কল দিয়ে কোড বলুন"}
              </Button>
            </>
          ) : (
            <Button 
              disabled={loading}
              onClick={handleVerifyOtp}
              className="w-full bg-primary text-background font-bold h-12 gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              {loading ? "ভেরিফাই করা হচ্ছে..." : "পরিচয় নিশ্চিত করুন"}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={onCancel}
            disabled={loading}
            className="text-[10px] uppercase font-bold text-muted-foreground"
          >
            বাতিল করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
