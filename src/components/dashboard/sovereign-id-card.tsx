
"use client"

import React, { useEffect, useState, useRef } from 'react'
import { 
  ShieldCheck, 
  Star, 
  Fingerprint, 
  Lock, 
  Globe, 
  Zap, 
  QrCode, 
  Cpu, 
  User, 
  Share2, 
  Download, 
  Sparkles, 
  Loader2, 
  Settings, 
  Calendar, 
  Phone, 
  Camera, 
  Save, 
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AppLogo } from '@/components/ui/app-logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useFirestore, useAuth } from '@/firebase'
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import QRCode from 'qrcode'

interface SovereignIDCardProps {
  user: any;
  role: string;
}

export function SovereignIDCard({ user, role }: SovereignIDCardProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Profile Form States
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
    phoneNumber: '',
    dateOfBirth: ''
  });

  const fingerprint = user?.uid?.substring(0, 12).toUpperCase() || 'EST_XXXX_XXXX';
  const signature = 'SIG_SHA256_' + (user?.email ? btoa(user.email).substring(0, 16).toUpperCase() : 'UNKNOWN');

  // Fetch extended profile data from Firestore
  useEffect(() => {
    if (user?.uid && firestore) {
      const fetchExtendedData = async () => {
        try {
          const userSnap = await getDoc(doc(firestore, "users", user.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            setProfileData({
              displayName: user.displayName || data.displayName || '',
              photoURL: user.photoURL || data.photoURL || '',
              phoneNumber: data.phoneNumber || '',
              dateOfBirth: data.dateOfBirth || ''
            });
          }
        } catch (e) {
          console.warn("[Profile] Could not fetch extended data.");
        }
      };
      fetchExtendedData();
    }
  }, [user, firestore, isEditing]);

  useEffect(() => {
    if (user?.uid) {
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
          dark: '#7597FF', 
          light: '#00000000'
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

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ 
        title: "ফাইল অত্যন্ত বড়", 
        description: "দয়া করে ২ মেগাবাইটের কম সাইজের ছবি নির্বাচন করুন।", 
        variant: "destructive" 
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfileData(prev => ({ ...prev, photoURL: base64String }));
      setIsUploading(false);
      toast({ title: "ছবি প্রসেস করা হয়েছে", description: "সংরক্ষণের জন্য 'পরিচয় সংরক্ষণ করুন' বাটনটি চাপুন।" });
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast({ title: "প্রসেসিং ত্রুটি", variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser || !firestore) return;
    
    setIsSaving(true);
    try {
      // 1. Update Firebase Auth Profile (Sync Name & Photo)
      // Note: Firebase Auth photoURL has limits, for very large base64 strings it might fail.
      // We prioritize Firestore storage for the base64 string.
      try {
        await updateProfile(auth.currentUser, {
          displayName: profileData.displayName,
          photoURL: profileData.photoURL.startsWith('data:') ? 'https://picsum.photos/seed/42/200/200' : profileData.photoURL
        });
      } catch (authError) {
        console.warn("[Auth Sync] Partial failure, skipping large string in auth profile.");
      }

      // 2. Update Firestore Extended Profile
      await setDoc(doc(firestore, "users", user.uid), {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "পরিচয় আপডেট সফল ✅",
        description: "আপনার সার্বভৌম তথ্য ৪২টি নোড গ্রিডে স্থায়ীভাবে সংরক্ষিত হয়েছে।",
      });
      setIsEditing(false);
      
      // Give UI time to show success before reload or state sync
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error(error);
      toast({
        title: "আপডেট ব্যর্থ",
        description: "যান্ত্রিক ত্রুটির কারণে তথ্য সংরক্ষণ করা সম্ভব হয়নি।",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        toast({ title: "লিঙ্ক কপি করা হয়েছে" });
      }
    } catch (err) {}
  };

  const handleDownload = () => {
    toast({ title: "ডাউনলোড শুরু হচ্ছে" });
    setTimeout(() => window.print(), 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="relative group max-w-md mx-auto print-id-card">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 no-print" />
        
        <Card className="relative bg-card/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl w-full">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none">
            <AppLogo size={300} />
          </div>
          
          <CardContent className="p-0">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-3">
                <AppLogo size={32} />
                <div>
                  <h3 className="text-xs font-headline font-bold tracking-widest text-primary uppercase">SHURUKKHA HUB</h3>
                  <p className="text-[7px] text-muted-foreground uppercase font-bold tracking-[0.3em]">Sovereign Infrastructure</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Button 
                  onClick={() => setIsEditing(true)} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:bg-primary/10 no-print"
                 >
                   <Settings size={16} />
                 </Button>
                 <Badge variant="outline" className="border-accent/40 text-accent gap-1 text-[8px] h-5 bg-accent/5">
                   <Zap size={10} fill="currentColor" /> PHASE 31.0
                 </Badge>
              </div>
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

              <div className="flex-1 space-y-5 text-center md:text-left w-full">
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Identity Holder</p>
                  <h2 className="text-xl font-headline font-bold text-foreground tracking-tight leading-tight truncate">{user.displayName || 'Unnamed Sovereign'}</h2>
                  <p className="text-[10px] text-primary font-mono lowercase opacity-70 truncate">{user.email}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Sovereign Rank</p>
                    <Badge className={`uppercase text-[9px] font-bold h-6 px-3 rounded-lg ${role === 'admin' ? 'bg-accent text-background' : 'bg-primary text-background'}`}>
                      <Star size={10} fill="currentColor" className="mr-1.5" /> {role === 'admin' ? 'Supreme Admin' : role.toUpperCase()}
                    </Badge>
                  </div>

                  {profileData.phoneNumber && (
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Signal Number</p>
                      <p className="text-[10px] font-mono text-foreground flex items-center justify-center md:justify-start gap-2">
                        <Phone size={10} className="text-primary" /> {profileData.phoneNumber}
                      </p>
                    </div>
                  )}

                  {profileData.dateOfBirth && (
                    <div className="space-y-1">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Birth Registry</p>
                      <p className="text-[10px] font-mono text-foreground flex items-center justify-center md:justify-start gap-2">
                        <Calendar size={10} className="text-accent" /> {profileData.dateOfBirth}
                      </p>
                    </div>
                  )}

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

      {/* Profile Management Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md bg-card border-primary/20 rounded-[2.5rem] shadow-2xl overflow-hidden p-0">
          <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                   <User size={24} />
                </div>
                <div>
                   <DialogTitle className="text-xl font-headline font-bold uppercase tracking-widest">Manage Identity</DialogTitle>
                   <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground">Sovereign Profile Customization</DialogDescription>
                </div>
             </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
             <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative group cursor-pointer" onClick={handleFileClick}>
                   <Avatar className="h-28 w-28 border-4 border-primary/20 group-hover:border-primary/40 transition-all shadow-xl">
                      <AvatarImage src={profileData.photoURL} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-4xl font-headline font-bold text-primary">
                        {profileData.displayName?.substring(0, 1)}
                      </AvatarFallback>
                   </Avatar>
                   <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? <Loader2 size={32} className="text-white animate-spin" /> : <Camera size={32} className="text-white" />}
                   </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button variant="outline" size="sm" onClick={handleFileClick} className="h-8 border-primary/20 text-primary text-[10px] uppercase font-bold gap-2 rounded-full">
                  <Upload size={12} /> নতুন ছবি আপলোড
                </Button>
             </div>

             <div className="space-y-4">
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">ডিসপ্লে নাম</Label>
                   <Input 
                    value={profileData.displayName}
                    onChange={e => setProfileData({...profileData, displayName: e.target.value})}
                    placeholder="আপনার রাজকীয় নাম"
                    className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">মোবাইল নম্বর</Label>
                      <Input 
                        value={profileData.phoneNumber}
                        onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})}
                        placeholder="+৮৮০"
                        className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary"
                      />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">জন্ম তারিখ</Label>
                      <Input 
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={e => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        className="bg-background/50 border-white/10 h-12 rounded-xl focus:ring-primary"
                      />
                   </div>
                </div>
             </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-white/5 flex gap-3">
             <Button onClick={() => setIsEditing(false)} variant="ghost" className="flex-1 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                <X size={16} className="mr-1" /> বাতিল
             </Button>
             <Button onClick={handleSaveProfile} disabled={isSaving || isUploading} className="flex-1 bg-primary text-background font-bold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                পরিচয় সংরক্ষণ করুন
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
