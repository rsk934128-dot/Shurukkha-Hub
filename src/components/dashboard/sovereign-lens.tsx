
"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Camera, X, ShieldCheck, Loader2, User, Zap, ScanLine, SearchCode, Database, Activity, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

interface SovereignLensProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SovereignLens({ isOpen, onClose }: SovereignLensProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProfile, setScannedProfile] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast({ title: "লেন্স ত্রুটি", description: "ক্যামেরা এক্সেস করা সম্ভব হচ্ছে না।", variant: "destructive" });
      onClose();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setScannedProfile(null);
    }
    return () => stopCamera();
  }, [isOpen]);

  // Simulate scanning logic for the prototype
  const simulateScan = async () => {
    setIsSearching(true);
    // In a real app, this would be a QR code detector loop
    setTimeout(async () => {
      try {
        // Mock scan result - in reality this UID comes from the QR code
        const mockUid = "rubels1k994@gmail.com"; 
        const userRef = doc(db, "users", "rubels1k994@gmail.com"); // Using email as ID or fetch by fingerprint
        
        // For simulation, let's just show a successful scan of a random admin profile
        setScannedProfile({
          displayName: "Rubel Sheikh",
          email: "rubels1k994@gmail.com",
          role: "Supreme Admin",
          fingerprint: "SOV_42ND_ARCHIVE",
          purity: "100.0%",
          lastLogin: new Date().toISOString()
        });
        
        toast({ title: "IDENTITY DETECTED", description: "সার্বভৌম পরিচয় শনাক্ত হয়েছে।" });
      } catch (e) {
        toast({ title: "SCAN ERROR", variant: "destructive" });
      } finally {
        setIsSearching(false);
      }
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-[#05070a] border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {scannedProfile ? (
            <div className="absolute inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-500">
               <div className="relative mb-6">
                  <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <Avatar className="h-32 w-32 border-4 border-primary/40 relative z-10 shadow-2xl">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-4xl font-headline font-bold text-primary">
                      {scannedProfile.displayName.substring(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-accent p-2 rounded-xl shadow-lg border-2 border-background animate-bounce">
                    <ShieldCheck className="text-background" size={24} />
                  </div>
               </div>

               <div className="text-center space-y-2 mb-8">
                  <h3 className="text-3xl font-headline font-bold tracking-tight">{scannedProfile.displayName}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-accent text-background font-bold uppercase tracking-widest px-4">
                      <Star size={12} fill="currentColor" className="mr-2" /> {scannedProfile.role}
                    </Badge>
                    <Badge variant="outline" className="border-primary/40 text-primary uppercase text-[10px]">V31.0_SOV</Badge>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Fingerprint</p>
                     <p className="text-xs font-mono font-bold text-foreground">{scannedProfile.fingerprint}</p>
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">System Purity</p>
                     <p className="text-xs font-headline font-bold text-primary">{scannedProfile.purity}</p>
                  </div>
               </div>

               <div className="flex gap-4 w-full max-w-md">
                  <Button onClick={() => setScannedProfile(null)} variant="outline" className="flex-1 h-12 rounded-xl border-white/10 hover:bg-white/5 font-bold uppercase text-xs tracking-widest">
                    RE-SCAN
                  </Button>
                  <Button onClick={onClose} className="flex-1 h-12 rounded-xl bg-primary text-background font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20">
                    CLOSE HUD
                  </Button>
               </div>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}

          {/* Scanner UI Overlays */}
          {!scannedProfile && (
            <>
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/60 z-20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 z-30">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                 
                 <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/50 animate-[scan_2s_infinite]" />
              </div>

              {/* CRT Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
              
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-40">
                <Badge variant="outline" className="border-primary/40 text-primary bg-black/60 backdrop-blur-md text-[8px] uppercase tracking-[0.4em] font-bold gap-2">
                  <Activity size={10} className="animate-pulse" /> SOVEREIGN_LENS_v3.1
                </Badge>
                <div className="flex items-center gap-2 text-[8px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded">
                   <Database size={8} /> GRID_SYNC: ONLINE
                </div>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 w-full px-12">
                 <Button 
                   onClick={simulateScan}
                   disabled={isSearching}
                   className="w-full h-14 bg-primary text-background font-headline font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(117,151,255,0.4)] transition-all active:scale-95 group overflow-hidden relative"
                 >
                    {isSearching ? (
                      <div className="flex items-center gap-3">
                         <Loader2 className="animate-spin" size={20} />
                         <span className="uppercase tracking-widest text-xs">Matching Digital DNA...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                         <ScanLine className="group-hover:scale-110 transition-transform" size={20} />
                         <span className="uppercase tracking-[0.2em]">Capture Identity</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                 </Button>
              </div>
            </>
          )}

          <Button 
            size="icon" 
            variant="ghost" 
            onClick={onClose} 
            className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full h-10 w-10 z-50 bg-black/40 border border-white/10"
          >
            <X size={24} />
          </Button>
        </div>

        <style jsx global>{`
          @keyframes scan {
            0% { top: 0; }
            100% { top: 100%; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
