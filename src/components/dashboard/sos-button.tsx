
"use client"

import React, { useState } from 'react'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { DisasterStorage } from '@/lib/disaster-storage'

export function SOSButton() {
  const [isActivating, setIsActivating] = useState(false)
  const { toast } = useToast()

  const handleSOS = async () => {
    setIsActivating(true)
    
    // Attempt to get real location first
    let userLocation = null;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (e) {
      console.warn("Could not get precise location for SOS. Using fallback name.");
    }

    const locations = ["বেলকুচি চরাঞ্চল", "এনায়েতপুর ঘাট", "সিরাজগঞ্জ বাজার", "কাজীপুর চর"];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];

    const sosData = {
      timestamp: serverTimestamp(),
      location: randomLocation,
      coordinates: userLocation,
      status: 'pending',
      type: 'জরুরি উদ্ধার প্রয়োজন (Flood/Emergency)',
      reporterId: 'anonymous_user_' + Math.floor(Math.random() * 1000)
    }

    try {
      await addDoc(collection(db, "sos_alerts"), sosData);
      
      toast({
        title: "জরুরি সংকেত পাঠানো হয়েছে",
        description: "আপনার অবস্থান সিরাজগঞ্জ কন্ট্রোল রুমে পাঠানো হয়েছে। শান্ত থাকুন, সাহায্য আসছে।",
        variant: "destructive",
      })
    } catch (error) {
      console.error("SOS Sync Error:", error);
      DisasterStorage.setSOS(true);
      toast({
        title: "অফলাইন মোডে সংকেত সংরক্ষিত",
        description: "ইন্টারনেট কানেকশন আসার সাথে সাথে এটি কন্ট্রোল রুমে পাঠানো হবে।",
        variant: "destructive",
      })
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-destructive/20 relative overflow-hidden group">
      <div className="absolute inset-0 bg-destructive/5 group-hover:bg-destructive/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col items-center gap-4 w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-destructive rounded-full blur-2xl opacity-20 animate-sos-pulse" />
          <Button 
            onClick={handleSOS}
            disabled={isActivating}
            className={`w-32 h-32 rounded-full border-8 border-background bg-destructive hover:bg-destructive/90 transition-all flex flex-col gap-1 items-center justify-center shadow-2xl ${isActivating ? 'scale-95 opacity-80' : 'animate-sos-pulse'}`}
          >
            {isActivating ? <Loader2 size={48} className="text-white animate-spin" /> : <ShieldAlert size={48} className="text-white" />}
            <span className="font-headline font-bold text-xl tracking-tighter text-white">SOS</span>
          </Button>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-headline font-bold text-destructive">জরুরি সহায়তা</h3>
          <p className="text-sm text-muted-foreground font-body leading-none mt-1">সাহায্যের জন্য এখানে টিপুন</p>
        </div>
      </div>
    </div>
  )
}
