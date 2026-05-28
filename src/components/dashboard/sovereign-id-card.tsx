"use client"

import React, { useEffect, useState } from 'react'
import { ShieldCheck, Star, Fingerprint, Lock, Globe, Zap, QrCode, Cpu, User, Share2, Download, Sparkles, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppLogo } from '@/components/ui/app-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import QRCode from 'qrcode'

interface SovereignIDCardProps {
  user: any;
  role: string;
}

export function SovereignIDCard({ user, role }: SovereignIDCardProps) {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);

  const fingerprint = user?.uid?.substring(0, 12).toUpperCase() || 'EST_XXXX_XXXX';
  const signature = 'SIG_SHA256_' + (user?.email ? btoa(user.email).substring(0, 16).toUpperCase() : 'UNKNOWN');

  useEffect(() => {
    if (user?.uid) {
      // Generate real QR code with user identity
      const data = JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        fingerprint,
        role: role,
        v: '31.0_SOVEREIGN'
      });
      
      QRCode.toDataURL(data, {
        margin: 2,
        width: 200,
        color: {
          dark: '#7597FF', // Primary color
          light: '#00000000' // Transparent
        }
      }).then(url => {
        setQrDataUrl(url);
        setIsGenerating(false);
      }).catch(err => {
        console.error(err);
        setIsGenerating(false);
      });
    }
  }, [user, role, fingerprint]);

  if (!user) return null;

  const handleShare = async () => {
    const shareData = {
      title: 'Shurukkha Hub Sovereign ID',
      text: `আমি সিরাজগঞ্জ সুরক্ষা পোর্টালে আমার সার্বভৌম পরিচয়পত্র (Sovereign ID) নিশ্চিত করেছি। পদবী: ${role === 'admin' ? 'Supreme Admin' : role.toUpperCase()}, ফিঙ্গারপ্রিন্ট: ${fingerprint}`,
      url: window.location.origin
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} \nলিঙ্ক: ${shareData.url}`);
        toast({
          title: "লিঙ্ক কপি করা হয়েছে",
          description: "আপনার ক্লিপবোর্ডে শেয়ার করার জন্য তথ্য সংরক্ষিত হয়েছে।",
        });
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = () => {
    toast({
      title: "ডাউনলোড শুরু হচ্ছে",
      description: "আপনার সার্বভৌম পরিচয়পত্রটি PDF ফরম্যাটে জেনারেট করা হচ্ছে।",
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative group max-w-md mx-auto print-id-card">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 no-print" />
        
        <Card className="relative bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl w-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
            <AppLogo size={300} />
          </div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
          
          <CardContent className="p-0">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-3">
                <AppLogo size={32} />
                <div>
                  <h3 className="text-xs font-headline font-bold tracking-widest text-primary uppercase">SHURUKKHA HUB</h3>
                  <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-[0.3em]">Sovereign Infrastructure</p>
                </div>
              </div>
              <Badge variant="outline" className="border-accent/40 text-accent gap-1 text-[8px] h-5 bg-accent/5">
                <Zap size={10} fill="currentColor" /> PHASE 31.0
              </Badge>
            </div>

            <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex flex-col items-center gap-4 shrink-0">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-b from-primary to-accent rounded-3xl blur-md opacity-30 animate-pulse no-print" />
                  <div className="relative w-32 h-32 rounded-3xl border-2 border-primary/20 overflow-hidden bg-muted p-1">
                    <Avatar className="w-full h-full rounded-2xl">
                      <AvatarImage src={user.photoURL || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-2xl font-headline font-bold text-primary">
                        {user.displayName?.substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                
                <div className="relative group/qr">
                   <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-all duration-500" />
                   <div className="relative w-24 h-24 bg-black/40 border border-white/5 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                      {isGenerating ? (
                        <Loader2 className="animate-spin text-primary/40" size={24} />
                      ) : qrDataUrl ? (
                        <img src={qrDataUrl} alt="Identity QR" className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(117,151,255,0.5)]" />
                      ) : (
                        <QrCode size={40} className="text-primary/20" />
                      )}
                   </div>
                </div>
              </div>

              <div className="flex-1 space-y-5 text-center md:text-left w-full">
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Identity Holder</p>
                  <h2 className="text-xl font-headline font-bold text-foreground tracking-tight leading-tight truncate">{user.displayName}</h2>
                  <p className="text-[10px] text-primary font-mono lowercase opacity-70 truncate">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Sovereign Rank</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                       <Badge className={`uppercase text-[9px] font-bold h-6 px-3 rounded-lg ${role === 'admin' ? 'bg-accent text-background' : 'bg-primary text-background'}`}>
                         <Star size={10} fill="currentColor" className="mr-1.5" /> {role === 'admin' ? 'Supreme Admin' : role.toUpperCase()}
                       </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Digital Fingerprint</p>
                    <code className="text-[10px] font-mono text-foreground/80 bg-black/40 px-2 py-1 rounded-md border border-white/5 block truncate text-center md:text-left">
                      {fingerprint}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-muted/20 border-t border-white/5 flex justify-between items-center relative overflow-hidden">
               <div className="space-y-1 relative z-10">
                  <div className="flex items-center gap-1.5">
                    <Lock size={10} className="text-accent" />
                    <span className="text-[8px] font-mono text-accent font-bold uppercase">SHA256withRSA_V2_VERIFIED</span>
                  </div>
                  <p className="text-[7px] text-muted-foreground font-mono opacity-50 truncate max-w-[150px] md:max-w-[200px]">{signature}</p>
               </div>
               <div className="text-right relative z-10">
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">Integrity</p>
                  <p className="text-xs font-headline font-bold text-primary">100.0%</p>
               </div>
               <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-transparent opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center gap-4 no-print">
        <Button onClick={handleDownload} variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary gap-2 h-11 px-6 font-bold text-xs uppercase tracking-widest hover:bg-primary/10 transition-all">
          <Download size={16} /> ডাউনলোড আইডি
        </Button>
        <Button onClick={handleShare} variant="outline" className="rounded-full border-accent/20 bg-accent/5 text-accent gap-2 h-11 px-6 font-bold text-xs uppercase tracking-widest hover:bg-accent/10 transition-all">
          <Share2 size={16} /> শেয়ার করুন
        </Button>
      </div>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] max-w-lg mx-auto space-y-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
            <Sparkles size={20} />
          </div>
          <div>
            <h4 className="text-sm font-headline font-bold">সার্বভৌম নিরাপত্তার নির্দেশিকা</h4>
            <p className="text-[10px] text-muted-foreground">আপনার এই ডিজিটাল পরিচয় অত্যন্ত সংবেদনশীল।</p>
          </div>
        </div>
        <div className="grid gap-3">
          {[
            { icon: Cpu, text: "আপনার আইডিটি সরাসরি 'Project 42' এর ৪২টি নোডের সাথে সিঙ্ক্রোনাইজড।" },
            { icon: QrCode, text: "সভ্যরেন লেন্স ব্যবহার করে কর্মকর্তারা আপনার আইডি স্ক্যান করে পরিচয় নিশ্চিত করতে পারবেন।" },
            { icon: User, text: "অননুমোদিত ডিভাইসে এই আইডি ব্যবহারের চেষ্টা করলে সেশন স্বয়ংক্রিয়ভাবে বাতিল হবে।" }
          ].map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start text-[10px] text-foreground/70 bg-black/20 p-3 rounded-xl border border-white/5">
              <item.icon size={14} className="text-primary shrink-0 mt-0.5" />
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
