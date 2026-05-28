"use client"

import React, { useState } from 'react'
import { Fingerprint, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface BiometricPromptProps {
  isOpen: boolean;
  onVerify: () => void;
  onCancel: () => void;
  actionName?: string;
}

export function BiometricPrompt({ isOpen, onVerify, onCancel, actionName = "Critical Action" }: BiometricPromptProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleVerify = () => {
    setIsVerifying(true)
    // Simulate biometric processing
    setTimeout(() => {
      setIsVerifying(false)
      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onVerify()
      }, 1000)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm bg-card border-primary/20 backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 mb-4">
            {isSuccess ? (
              <ShieldCheck className="text-accent animate-bounce" size={32} />
            ) : (
              <Fingerprint className={`text-primary ${isVerifying ? 'animate-pulse' : ''}`} size={32} />
            )}
          </div>
          <DialogTitle className="font-headline font-bold uppercase tracking-tight">Identity Confirmation</DialogTitle>
          <DialogDescription className="text-xs">
            আপনি বর্তমানে একটি গুরুত্বপূর্ণ কার্যক্রম পরিচালনা করছেন: <br/>
            <Badge variant="outline" className="mt-2 border-primary/40 text-primary uppercase text-[8px]">{actionName}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-4">
          {isVerifying ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary" size={24} />
              <p className="text-[10px] font-mono uppercase text-muted-foreground animate-pulse">Scanning Bio-Sovereign Identity...</p>
            </div>
          ) : isSuccess ? (
            <p className="text-sm font-bold text-accent">IDENTITY VERIFIED ✅</p>
          ) : (
            <p className="text-xs text-center text-muted-foreground italic">আপনার ডিভাইসের বায়োমেট্রিক বা পিন কোড দিয়ে পরিচয় নিশ্চিত করুন।</p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            disabled={isVerifying || isSuccess}
            onClick={handleVerify}
            className="w-full bg-primary text-background font-bold h-12"
          >
            {isVerifying ? "PROCESING..." : "CONFIRM IDENTITY"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive"
          >
            CANCEL REQUEST
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
