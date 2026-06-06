"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Smartphone, ShieldCheck, Loader2, MessageSquare, ArrowRight, X, Phone, Volume2, Mic, Send } from 'lucide-react'
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
  const [isSocialDispatching, setIsSocialDispatching] = useState<'whatsapp' | 'telegram' | null>(null)
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
      setIsSocialDispatching(null);
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
      
      if (error.code === 'auth/invalid-phone-number') {
        msg = "প্রদত্ত মোবাইল নম্বরটি সঠিক নয়।";
      } else if (error.code === 'auth/operation-not-allowed') {
        msg = "ফায়ারবেস কনসোলে SMS বা এই রিজিয়নটি সক্রিয় নেই। দয়া করে Voice Call অপশনটি ব্যবহার করুন।";
      } else if (error.code === 'auth/too-many-requests') {
        msg = "অত্যধিক রিকোয়েস্ট পাঠানো হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।";
      }

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
      
      // Log for imperial debugging - help user test quickly
      console.warn(`[IMPERIAL_DEBUG] VOICE_OTP_CODE: ${generatedOtp}`);
      
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

  const handleSocialOtp = async (platform: 'whatsapp' | 'telegram') => {
    if (!phoneNumber || phoneNumber.length < 11) return;
    
    setIsSocialDispatching(platform);
    try {
      const response = await fetch('/api/v1/auth/dispatch-social-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, platform })
      });
      const data = await response.json();
      
      if (data.status === 'SUCCESS') {
        setVoiceOtp(data.otp); 
        console.warn(`[IMPERIAL_DEBUG] ${platform.toUpperCase()}_OTP_CODE: ${data.otp}`);
        setStep('otp');
        toast({ 
          title: platform === 'whatsapp' ? "WhatsApp OTP" : "Telegram OTP", 
          description: `আপনার ${platform === 'whatsapp' ? 'হোয়াটসঅ্যাপ' : 'টেলিগ্রাম'} নম্বরে কোড পাঠানো হয়েছে।` 
        });
      }
    } catch (error) {
      toast({ title: "Dispatch Failed", variant: "destructive" });
    } finally {
      setIsSocialDispatching(null);
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    try {
      // 1. Check for Simulated OTP (Voice/Social)
      if (voiceOtp) {
        if (otp === voiceOtp) {
          toast({ title: "পরিচয় নিশ্চিত", description: "অথেন্টিকেশন সফল হয়েছে।" });
          onSuccess('est_social_verified_' + btoa(phoneNumber));
          return;
        } else {
          toast({ title: "ভুল OTP", description: "সিমুলেটেড কোডটি সঠিক নয়। পুনরায় চেষ্টা করুন।", variant: "destructive" });
          setLoading(false);
          return;
        }
      }

      // 2. Check for Firebase Auth Result (SMS)
      if (confirmationResult) {
        const userCredential = await confirmationResult.confirm(otp);
        const idToken = await userCredential.user.getIdToken();
        toast({ title: "পরিচয় নিশ্চিত", description: "সাম্রাজ্যে আপনাকে স্বাগতম।" });
        onSuccess(idToken);
        return;
      }

      // 3. Fallback for unexpected state
      toast({ title: "সেশন ত্রুটি", description: "কোনো সক্রিয় অথেন্টিকেশন সেশন খুঁজে পাওয়া যায়নি।", variant: "destructive" });
      setStep('phone');
      
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast({ title: "ভুল OTP", description: "প্রদত্ত কোডটি সঠিক নয় বা সেশনটির মেয়াদ শেষ হয়েছে।", variant: "destructive" });
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
            ) : isSocialDispatching ? (
              <Send className="text-accent animate-pulse" size={32} />
            ) : (
              <Smartphone className="text-primary" size={32} />
            )}
          </div>
          <DialogTitle className="font-headline font-bold uppercase tracking-tight">
            {isCalling ? "Imperial Voice Call" : isSocialDispatching ? "Social Dispatch" : "Sovereign Identity"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'phone' 
              ? "সাম্রাজ্যে প্রবেশের জন্য আপনার মোবাইল নম্বরটি দিন।" 
              : isCalling ? "সেনটিনেল এআই-এর কণ্ঠস্বর থেকে কোডটি সংগ্রহ করুন।" : "আপনার ডিভাইসে পাঠানো কোডটি লিখুন।"}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">মোবাইল নম্বর</label>
                <Input 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+88017XXXXXXXX"
                  disabled={loading || isCalling || !!isSocialDispatching}
                  className="bg-background/50 border-primary/20 h-12 text-center text-lg font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  disabled={loading || isCalling || !!isSocialDispatching}
                  onClick={handleSendOtp}
                  className="bg-primary text-background font-bold h-11 gap-2 text-[10px] uppercase"
                >
                  {loading ? <Loader2 className="animate-spin" size={14} /> : <MessageSquare size={14} />}
                  SMS
                </Button>
                <Button 
                  disabled={loading || isCalling || !!isSocialDispatching}
                  onClick={handleVoiceCall}
                  variant="outline"
                  className="border-accent/20 text-accent hover:bg-accent/10 font-bold h-11 gap-2 text-[10px] uppercase"
                >
                  {isCalling ? <Loader2 className="animate-spin" size={14} /> : <Phone size={14} />}
                  Voice Call
                </Button>
                <Button 
                  disabled={loading || isCalling || !!isSocialDispatching}
                  onClick={() => handleSocialOtp('whatsapp')}
                  variant="outline"
                  className="border-green-500/20 text-green-500 hover:bg-green-500/10 font-bold h-11 gap-2 text-[10px] uppercase"
                >
                   {isSocialDispatching === 'whatsapp' ? <Loader2 className="animate-spin" size={14} /> : <MessageSquare size={14} />}
                   WhatsApp
                </Button>
                <Button 
                  disabled={loading || isCalling || !!isSocialDispatching}
                  onClick={() => handleSocialOtp('telegram')}
                  variant="outline"
                  className="border-sky-500/20 text-sky-500 hover:bg-sky-500/10 font-bold h-11 gap-2 text-[10px] uppercase"
                >
                   {isSocialDispatching === 'telegram' ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                   Telegram
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest ml-1">গোপন কোড (OTP)</label>
                {voiceOtp && (
                  <Badge variant="outline" className="text-[7px] border-accent/40 text-accent animate-pulse">SESSION_ACTIVE</Badge>
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
          {step === 'otp' && (
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
