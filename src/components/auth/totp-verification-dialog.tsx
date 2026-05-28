"use client"

import React, { useState } from 'react'
import { ShieldCheck, Lock, Loader2, KeyRound } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TOTPVerificationProps {
  isOpen: boolean;
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

export function TOTPVerificationDialog({ isOpen, onVerify, onCancel }: TOTPVerificationProps) {
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState(false)

  const handleVerify = async () => {
    if (code.length !== 6) return
    setIsVerifying(true)
    setError(false)
    
    const success = await onVerify(code)
    if (!success) {
      setError(true)
      setCode('')
    }
    setIsVerifying(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm bg-card border-primary/20 backdrop-blur-xl">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border border-primary/20 mb-4">
            <Lock className="text-primary" size={32} />
          </div>
          <DialogTitle className="font-headline font-bold uppercase tracking-tight">Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-xs">
            আপনার Google Authenticator অ্যাপ থেকে ৬ ডিজিটের কোডটি দিন।
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center gap-4">
          <Input 
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
            placeholder="000000"
            className={`text-center text-2xl font-mono tracking-[0.5em] h-14 bg-background/50 ${error ? 'border-destructive text-destructive' : 'border-primary/20'}`}
            disabled={isVerifying}
          />
          {error && <p className="text-[10px] text-destructive font-bold uppercase animate-pulse">Invalid Code. Access Denied.</p>}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            disabled={isVerifying || code.length !== 6}
            onClick={handleVerify}
            className="w-full bg-primary text-background font-bold h-12 gap-2"
          >
            {isVerifying ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
            {isVerifying ? "VERIFYING..." : "GRANT ACCESS"}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-[10px] uppercase font-bold text-muted-foreground"
          >
            CANCEL LOGIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
