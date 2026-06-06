"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ShieldCheck, Loader2, User, Volume2, VolumeX, Activity, Zap, X, Star, Clock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { db } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

interface CallOverlayProps {
  callData: {
    sessionId: string;
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    type: 'audio' | 'video';
    isIncoming: boolean;
  } | null;
  onClose: () => void;
}

/**
 * @fileOverview Call Interface for Shurukkha Hub.
 * Optimized Phase 36.2: Fixed Stale Closures and Enhanced Hardware Purge.
 */

export function CallOverlay({ callData, onClose }: CallOverlayProps) {
  const [status, setStatus] = useState<'ringing' | 'connected' | 'ended' | 'idle'>('idle')
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [timer, setTimer] = useState(0)
  const [finalDuration, setFinalDuration] = useState<string | null>(null)
  
  // Refs to avoid stale closures in listeners
  const statusRef = useRef<'ringing' | 'connected' | 'ended' | 'idle'>('idle')
  const timerRef = useRef(0)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerIntervalRef = useRef<any>(null)
  const ringtoneIntervalRef = useRef<any>(null)
  const isTerminatingRef = useRef(false)
  
  const { playAlertSound } = useAudioEngine()
  const { toast } = useToast()

  // Sync refs with state
  useEffect(() => { statusRef.current = status; }, [status])
  useEffect(() => { timerRef.current = timer; }, [timer])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current)
      ringtoneIntervalRef.current = null
    }
  }, [])

  const startRingtone = useCallback(() => {
    stopRingtone()
    playAlertSound()
    ringtoneIntervalRef.current = setInterval(playAlertSound, 3500)
  }, [playAlertSound, stopRingtone])

  /**
   * Aggressively stops all tracks and ensures device release.
   */
  const cleanupHardware = useCallback(() => {
    console.warn("[Imperial Purge] Nuking Hardware Resources...");
    
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (localStreamRef.current) {
      WebRTCManager.stopMediaStream(localStreamRef.current);
      localStreamRef.current = null;
    }

    if (webrtcRef.current) {
      webrtcRef.current.dispose();
      webrtcRef.current = null;
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopRingtone();
  }, [stopRingtone])

  const handleEndCall = useCallback(async (shouldUpdateServer = true) => {
    if (isTerminatingRef.current) return;
    isTerminatingRef.current = true;
    
    const duration = formatTime(timerRef.current);
    setFinalDuration(duration);

    console.log(`[Signal Hub] Terminating Session: ${callData?.sessionId} | Duration: ${duration}`);
    
    // 1. Immediately Stop Local Hardware
    cleanupHardware();
    setStatus('ended');

    // 2. Notify Grid if needed
    if (callData && shouldUpdateServer) {
      try {
        await updateDoc(doc(db, 'webrtc_sessions', callData.sessionId), { 
          status: 'ended',
          duration: duration,
          endTime: serverTimestamp()
        });
      } catch (err) {}
    }

    // 3. UI Grace Period before closing HUD
    // If ended by other party, close faster for better UX
    const closeDelay = shouldUpdateServer ? 3000 : 1000;
    setTimeout(() => {
      onClose();
      isTerminatingRef.current = false;
      setStatus('idle');
      setFinalDuration(null);
    }, closeDelay);
  }, [callData, cleanupHardware, onClose])

  const handleAccept = async () => {
    if (!callData) return;
    stopRingtone(); 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callData.type === 'video', 
        audio: WebRTCManager.getAudioConstraints()
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      webrtcRef.current = new WebRTCManager(callData.sessionId);
      await webrtcRef.current.answerCall(stream, (remote) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
      });
      
      await updateDoc(doc(db, 'webrtc_sessions', callData.sessionId), { status: 'connected' });
      setStatus('connected');
      timerIntervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } catch (e) {
      handleEndCall(true);
      toast({ title: "হার্ডওয়্যার এক্সেস ব্যর্থ", variant: "destructive" });
    }
  }

  useEffect(() => {
    if (callData) {
      setStatus('ringing');
      setTimer(0);
      setFinalDuration(null);
      isTerminatingRef.current = false;
      
      const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
      const unsubscribe = onSnapshot(sessionRef, (snap) => {
        if (!snap.exists()) {
          if (statusRef.current !== 'idle' && statusRef.current !== 'ended') handleEndCall(false);
          return;
        }
        const data = snap.data();
        if (data.status === 'connected' && statusRef.current === 'ringing') {
          setStatus('connected');
          stopRingtone();
          if (!timerIntervalRef.current) timerIntervalRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        if (data.status === 'ended' && statusRef.current !== 'ended') {
          handleEndCall(false);
        }
      });

      if (callData.isIncoming) {
        startRingtone();
      } else {
        const startOutgoing = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: callData.type === 'video', 
              audio: WebRTCManager.getAudioConstraints() 
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            webrtcRef.current = new WebRTCManager(callData.sessionId);
            await webrtcRef.current.createCall(stream, (remote) => {
              if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
            });
          } catch (e) { 
            handleEndCall(true); 
          }
        };
        startOutgoing();
      }

      return () => {
        unsubscribe();
        cleanupHardware();
      };
    }
  }, [callData?.sessionId, callData?.isIncoming]);

  if (!callData) return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleEndCall(true)}>
      <DialogContent 
        className="max-w-[100vw] h-[100dvh] md:max-w-4xl md:h-auto md:aspect-video bg-[#05070a] border-none md:border md:border-primary/20 p-0 overflow-hidden md:rounded-[2.5rem] shadow-[0_0_80px_rgba(117,151,255,0.3)] z-[99999]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Sovereign Call Interface</DialogTitle>
          <DialogDescription>Locked-Identity encrypted communication via 42 nodes.</DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-full bg-[#05070a] flex items-center justify-center overflow-hidden">
          
          {status === 'connected' && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[10020] animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-6 py-2 rounded-full border border-primary/20 shadow-2xl">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                 <p className="text-xl font-mono font-bold text-white tracking-widest leading-none">{formatTime(timer)}</p>
              </div>
            </div>
          )}

          {status === 'ringing' && (
            <div className="flex flex-col items-center gap-10 z-50 animate-in fade-in zoom-in-95 duration-500 w-full px-8 text-center">
               <div className="relative">
                  <div className="absolute -inset-16 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
                  <Avatar className="h-44 w-44 md:h-56 md:w-56 border-8 border-primary/40 relative z-10 shadow-2xl">
                    <AvatarImage src={callData.callerAvatar || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-6xl font-headline font-bold text-primary">
                      {callData.callerName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -inset-6 border-4 border-primary/40 rounded-full animate-ping" />
               </div>
               
               <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tighter uppercase">{callData.callerName}</h2>
                 <Badge className="bg-primary/20 text-primary border-primary/40 px-8 py-2 uppercase tracking-[0.4em] font-bold animate-bounce text-xs">
                    {callData.isIncoming ? `INCOMING ${callData.type.toUpperCase()}` : `OUTGOING ${callData.type.toUpperCase()}`}
                 </Badge>
               </div>
               
               {callData.isIncoming ? (
                 <div className="flex items-center gap-16 mt-6 relative z-[310]">
                    <Button onClick={(e) => { e.stopPropagation(); handleAccept(); }} className="h-24 w-24 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl border-4 border-background flex items-center justify-center transition-transform active:scale-90 cursor-pointer"><Phone size={36} /></Button>
                    <Button onClick={(e) => { e.stopPropagation(); handleEndCall(true); }} className="h-24 w-24 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-2xl border-4 border-background flex items-center justify-center transition-transform active:scale-90 cursor-pointer"><PhoneOff size={36} /></Button>
                 </div>
               ) : (
                 <div className="space-y-8">
                   <div className="flex justify-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                   <Button onClick={(e) => { e.stopPropagation(); handleEndCall(true); }} className="h-20 w-20 rounded-full bg-destructive border-4 border-background flex items-center justify-center transition-transform active:scale-90 cursor-pointer"><PhoneOff size={28} /></Button>
                 </div>
               )}
            </div>
          )}

          <div className={`w-full h-full relative ${status === 'connected' ? 'block' : 'hidden'}`}>
             <video ref={remoteVideoRef} autoPlay playsInline className={`w-full h-full object-cover ${callData.type === 'audio' ? 'hidden' : ''}`} />
             {callData.type === 'audio' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-10 bg-slate-950">
                   <div className="relative">
                      <div className="absolute -inset-10 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                      <Avatar className="h-56 w-56 border-8 border-primary/20 relative z-10 shadow-2xl">
                        <AvatarImage src={callData.callerAvatar || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-7xl font-headline font-bold text-primary">{callData.callerName?.[0]}</AvatarFallback>
                      </Avatar>
                   </div>
                   <h2 className="text-4xl font-headline font-bold text-white tracking-tighter uppercase">{callData.callerName}</h2>
                </div>
             )}
             
             <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-10 bg-black/60 backdrop-blur-3xl p-6 px-12 rounded-[4rem] border border-white/10 shadow-2xl z-[10015]">
                <Button onClick={() => { if (localStreamRef.current) { const t = localStreamRef.current.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; setIsMicMuted(!t.enabled); } } }} className={`h-16 w-16 rounded-full border border-white/10 transition-all ${isMicMuted ? 'bg-destructive/20 text-destructive border-destructive/40' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  {isMicMuted ? <MicOff size={28} /> : <Mic size={28} />}
                </Button>
                <Button onClick={() => handleEndCall(true)} className="h-28 w-28 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-2xl border-4 border-background flex items-center justify-center transition-transform active:scale-90"><PhoneOff size={40} /></Button>
                <Button onClick={() => setIsSpeakerOn(!isSpeakerOn)} className={`h-16 w-16 rounded-full border border-white/10 transition-all ${isSpeakerOn ? 'bg-accent/20 text-accent border-accent/40' : 'bg-white/5 text-white/40'}`}>
                  {isSpeakerOn ? <Volume2 size={28} /> : <VolumeX size={28} />}
                </Button>
             </div>

             <div className={`absolute top-10 right-10 w-40 md:w-64 aspect-video bg-black rounded-3xl border-2 border-primary/40 shadow-2xl overflow-hidden z-20 transition-all ${callData.type === 'video' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
             </div>
          </div>

          {status === 'ended' && (
            <div className="absolute inset-0 bg-black/95 z-[10010] flex flex-col items-center justify-center gap-8 animate-in fade-in duration-300">
               <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/20 relative z-10"><PhoneOff size={40} className="text-destructive" /></div>
               <div className="text-center space-y-2">
                  <p className="text-3xl font-headline font-bold text-white uppercase tracking-[0.4em]">Signal Terminated</p>
                  <p className="text-xl font-mono text-primary font-bold">Duration: {finalDuration || formatTime(timer)}</p>
               </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}