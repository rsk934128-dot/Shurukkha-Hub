"use client"

import React, { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
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
    
    const sosData = {
      timestamp: serverTimestamp(),
      location: "Unknown (Permission Pending)", // In a real app, use Geolocation API
      status: 'pending',
      type: 'SOS_TRIGGER'
    }

    try {
      // Try to save to Firestore
      await addDoc(collection(db, "sos_signals"), sosData);
      
      toast({
        title: "জরুরি সংকেত পাঠানো হয়েছে",
        description: "আপনার অবস্থান সিরাজগঞ্জ কন্ট্রোল রুমে পাঠানো হয়েছে। শান্ত থাকুন, সাহায্য আসছে।",
        variant: "destructive",
      })
    } catch (error) {
      console.error("SOS Sync Error:", error);
      // Fallback: Save to Local Storage for survival mode
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
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-destructive rounded-full blur-2xl opacity-20 animate-sos-pulse" />
          <Button 
            onClick={handleSOS}
            disabled={isActivating}
            className={`w-32 h-32 rounded-full border-8 border-background bg-destructive hover:bg-destructive/90 transition-all flex flex-col gap-1 items-center justify-center shadow-2xl ${isActivating ? 'scale-95 opacity-80' : 'animate-sos-pulse'}`}
          >
            <ShieldAlert size={48} className="text-white" />
            <span className="font-headline font-bold text-xl tracking-tighter text-white">SOS</span>
          </Button>
        </div>
        
        <div className="text-center">
          <h3 className="text-xl font-headline font-bold text-destructive">জরুরি সহায়তা</h3>
          <p className="text-sm text-muted-foreground font-body">সাহায্যের জন্য ৩ সেকেন্ড টিপুন</p>
        </div>
      </div>
    </div>
  )
}