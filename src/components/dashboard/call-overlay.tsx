"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ShieldCheck, Loader2, User, Volume2, VolumeX, Activity, Zap, X, Maximize2, Smartphone, Speaker, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { db } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot, deleteDoc, getDoc, collection, getDocs } from 'firebase/firestore'
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

export function CallOverlay({ callData, onClose }: CallOverlayProps) {
  const [status, setStatus] = useState<'ringing' | 'connected' | 'ended' | 'idle'>('idle')
  const [isMicMuted, setIsMicMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [timer, setTimer] = useState(0)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<any>(null)
  const ringtoneIntervalRef = useRef<any>(null)
  const isTerminatingRef = useRef(false)
  
  const { playAlertSound } = useAudioEngine()
  const { toast } = useToast()

  const stopRingtone = useCallback(() => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current)
      ringtoneIntervalRef.current = null
    }
  }, [])

  const startRingtone = useCallback(() => {
    stopRingtone()
    playAlertSound()
    ringtoneIntervalRef.current = setInterval(playAlertSound, 2500)
  }, [playAlertSound, stopRingtone])

  const cleanupStreams = useCallback(() => {
    console.log("[Imperial Cleanup] Initiating global hardware resource purge...");
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.enabled = false;
        track.stop();
        console.log(`[Hardware] Local Track Force-Stopped: ${track.kind}`);
      });
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    
    if (webrtcRef.current) {
      webrtcRef.current.dispose();
      webrtcRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopRingtone();
  }, [stopRingtone])

  const handleEndCall = useCallback(async (shouldUpdateServer = true) => {
    if (isTerminatingRef.current) return;
    isTerminatingRef.current = true;
    
    console.log(`[Signal Hub] TERMINATING_SESSION: ${callData?.sessionId}`);
    stopRingtone();
    setStatus('ended');

    cleanupStreams();

    if (callData && shouldUpdateServer) {
      const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
      try {
        await updateDoc(sessionRef, { status: 'ended' });
        
        setTimeout(async () => {
          try {
            const candidatesRef = collection(sessionRef, 'ice_candidates');
            const candidatesSnap = await getDocs(candidatesRef);
            for (const cDoc of candidatesSnap.docs) {
              await deleteDoc(doc(candidatesRef, cDoc.id));
            }
            await deleteDoc(sessionRef);
            console.log(`[Signal Hub] GRID_CLEANUP_SUCCESS: ${callData.sessionId}`);
          } catch (e) {}
        }, 1000);
      } catch (err: any) {
        console.error("[Signal Hub] Sync fault during termination", err);
      }
    }

    setTimeout(() => {
      onClose();
      isTerminatingRef.current = false;
      setStatus('idle');
    }, 800);
  }, [callData, cleanupStreams, onClose, stopRingtone])

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
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remote;
        }
      });
      
      const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
      await updateDoc(sessionRef, { status: 'connected' });
      
      setStatus('connected');
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } catch (e) {
      console.error("Session acceptance failure", e);
      handleEndCall(true);
    }
  }

  useEffect(() => {
    return () => {
      cleanupStreams();
    }
  }, [cleanupStreams]);

  useEffect(() => {
    if (callData) {
      setStatus('ringing');
      setTimer(0);
      isTerminatingRef.current = false;
      
      const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
      const unsubscribe = onSnapshot(sessionRef, (snap) => {
        if (!snap.exists()) {
          if (status !== 'idle' && status !== 'ended') {
            handleEndCall(false);
          }
          return;
        }
        const data = snap.data();
        if (data.status === 'connected' && status === 'ringing') {
          setStatus('connected');
          stopRingtone();
          if (!timerRef.current) timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
        }
        if (data.status === 'ended' && status !== 'ended') {
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
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remote;
              }
            });
          } catch (e) { 
            handleEndCall(true); 
          }
        };
        startOutgoing();
      }

      return () => {
        unsubscribe();
      };
    }
  }, [callData?.sessionId, status, callData?.isIncoming, startRingtone, handleEndCall, stopRingtone]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (status === 'idle') return null;

  return (
    <Dialog open={status !== 'idle'} onOpenChange={(open) => !open && handleEndCall(true)}>
      <DialogContent className="max-w-[100vw] h-[100dvh] md:max-w-4xl md:h-auto md:aspect-video bg-[#05070a] border-none md:border md:border-primary/20 p-0 overflow-hidden md:rounded-[2.5rem] shadow-2xl z-[100]">
        <DialogHeader className="sr-only">
          <DialogTitle>Sovereign Communication Hub</DialogTitle>
          <DialogDescription>Secure encrypted session active.</DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center group overflow-hidden">
          {status === 'ringing' && callData?.isIncoming && (
            <div className="flex flex-col items-center gap-8 z-50 animate-in fade-in zoom-in-95 duration-500 w-full px-6 text-center">
               <div className="relative">
                  <div className="absolute -inset-12 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-primary/40 relative z-10 shadow-2xl">
                    <AvatarImage src={callData.callerAvatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-5xl font-headline font-bold text-primary">
                      {callData.callerName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -inset-4 border-2 border-primary/40 rounded-full animate-ping" />
               </div>
               <div className="text-center space-y-4 z-10">
                 <h2 className="text-3xl font-headline font-bold text-white">{callData.callerName}</h2>
                 <Badge className="bg-primary/20 text-primary border-primary/40 px-4 py-1 uppercase tracking-widest font-bold animate-bounce">
                    INCOMING {callData.type.toUpperCase()}
                 </Badge>
               </div>
               
               <div className="flex items-center gap-8 md:gap-12 mt-4">
                  <Button onClick={handleAccept} className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-sos-pulse border-4 border-background">
                    <Phone size={32} />
                  </Button>
                  <Button onClick={() => handleEndCall(true)} className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] border-4 border-background">
                    <PhoneOff size={32} />
                  </Button>
               </div>
            </div>
          )}

          <div className={`w-full h-full relative ${status === 'connected' ? 'block' : 'hidden'}`}>
             <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${callData?.type === 'audio' ? 'hidden' : ''}`} 
             />
             {callData?.type === 'audio' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-slate-900">
                   <Avatar className="h-40 w-40 md:h-56 md:w-56 border-8 border-accent/20">
                      <AvatarImage src={callData.callerAvatar || undefined} />
                      <AvatarFallback className="text-5xl font-bold">{callData.callerName?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold text-white">{callData.callerName}</h2>
                      <p className="text-xl font-mono text-white/60">{formatTime(timer)}</p>
                   </div>
                </div>
             )}
          </div>

          {(status === 'ringing' && !callData?.isIncoming) && (
             <div className="flex flex-col items-center gap-6 z-10 text-center">
                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/40">
                  <AvatarImage src={callData?.callerAvatar || undefined} />
                  <AvatarFallback className="text-4xl font-bold">S</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">{callData?.callerName}</h2>
                  <p className="text-xs font-mono text-primary uppercase tracking-[0.4em] animate-pulse">Establishing Signal...</p>
                </div>
                <Button onClick={() => handleEndCall(true)} variant="destructive" className="h-16 w-16 rounded-full border-4 border-background">
                  <PhoneOff size={24} />
                </Button>
             </div>
          )}

          {status === 'ended' && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center gap-4">
               <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                  <PhoneOff size={32} />
               </div>
               <p className="text-xl font-headline font-bold text-white uppercase tracking-widest">Call Terminated</p>
               <p className="text-xs text-muted-foreground">Encryption session closed.</p>
            </div>
          )}

          <div className={`absolute bottom-32 right-4 md:top-6 md:right-6 w-32 md:w-48 aspect-video bg-black rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-20 ${status === 'connected' && callData?.type === 'video' ? 'block' : 'hidden'}`}>
             <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
             <Badge className="absolute top-2 left-2 bg-black/40 text-[7px] uppercase">You</Badge>
          </div>

          {status === 'connected' && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-3xl p-4 md:px-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  if (localStreamRef.current) {
                    const track = localStreamRef.current.getAudioTracks()[0];
                    if (track) {
                      track.enabled = !track.enabled;
                      setIsMicMuted(!track.enabled);
                    }
                  }
                }}
                className={`h-12 w-12 rounded-full border border-white/5 ${isMicMuted ? 'bg-destructive/20 text-destructive' : 'text-white'}`}
              >
                {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
              
              <Button onClick={() => handleEndCall(true)} className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-lg border-4 border-background">
                <PhoneOff size={32} />
              </Button>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`h-12 w-12 rounded-full border border-white/5 ${isSpeakerOn ? 'text-accent' : 'text-white/40'}`}
              >
                {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}