"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ShieldCheck, Loader2, User, Volume2, Activity, Zap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WebRTCManager } from '@/lib/webrtc-signaling'
import { db } from '@/lib/firebase'
import { doc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  const [status, setStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMicMuted] = useState(false)
  const [isCamOff, setIsCamOff] = useState(false)
  const [timer, setTimer] = useState(0)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  const timerRef = useRef<any>(null)
  const { playAlertSound } = useAudioEngine()

  // Reset status when a new call starts
  useEffect(() => {
    if (callData) {
      setStatus('ringing');
      setTimer(0);
    }
  }, [callData?.sessionId]);

  useEffect(() => {
    if (!callData) return;

    const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
    
    // Listen for call state changes
    const unsubscribe = onSnapshot(sessionRef, (snap) => {
      if (!snap.exists()) {
        handleEndCall();
        return;
      }
      const data = snap.data();
      if (data.status === 'connected' && status === 'ringing') {
        setStatus('connected');
        startTimer();
      }
      if (data.status === 'ended') {
        handleEndCall();
      }
    });

    if (callData.isIncoming) {
      playAlertSound();
    } else {
      initiateOutgoingCall();
    }

    return () => {
      unsubscribe();
      stopTimer();
      cleanupStreams();
    };
  }, [callData?.sessionId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [localStream, remoteStream]);

  const initiateOutgoingCall = async () => {
    if (!callData) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callData.type === 'video', 
        audio: true 
      });
      setLocalStream(stream);
      webrtcRef.current = new WebRTCManager(callData.sessionId);
      await webrtcRef.current.createCall(stream, (remote) => {
        setRemoteStream(remote);
      });
    } catch (e) {
      console.error("Call initiation failed", e);
      handleEndCall();
    }
  }

  const handleAccept = async () => {
    if (!callData) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callData.type === 'video', 
        audio: true 
      });
      setLocalStream(stream);
      webrtcRef.current = new WebRTCManager(callData.sessionId);
      await webrtcRef.current.answerCall(stream, (remote) => {
        setRemoteStream(remote);
      });
      
      await updateDoc(doc(db, 'webrtc_sessions', callData.sessionId), {
        status: 'connected'
      });
    } catch (e) {
      console.error("Call acceptance failed", e);
      handleEndCall();
    }
  }

  const handleEndCall = async () => {
    if (callData) {
      try {
        await updateDoc(doc(db, 'webrtc_sessions', callData.sessionId), { status: 'ended' });
        // Delay deletion slightly to let the other side see the status
        setTimeout(() => deleteDoc(doc(db, 'webrtc_sessions', callData.sessionId)), 1000);
      } catch (e) {}
    }
    cleanupStreams();
    setStatus('ended');
    onClose();
  }

  const cleanupStreams = () => {
    localStream?.getTracks().forEach(t => t.stop());
    remoteStream?.getTracks().forEach(t => t.stop());
    webrtcRef.current?.dispose();
    setLocalStream(null);
    setRemoteStream(null);
  }

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
  }

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (!callData) return null;

  return (
    <Dialog open={!!callData} onOpenChange={(open) => !open && handleEndCall()}>
      <DialogContent className="max-w-4xl bg-[#05070a] border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Sovereign Call Link</DialogTitle>
          <DialogDescription>Secure encrypted communication session.</DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center group">
          {/* Main Video View (Remote) */}
          {callData.type === 'video' && status === 'connected' && remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-6">
               <div className="relative">
                  <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <Avatar className="h-40 w-40 border-4 border-primary/40 relative z-10 shadow-2xl">
                    <AvatarImage src={callData.callerAvatar} />
                    <AvatarFallback className="bg-primary/10 text-5xl font-headline font-bold text-primary">
                      {callData.callerName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  {status === 'ringing' && (
                    <div className="absolute -inset-4 border-2 border-primary/40 rounded-full animate-ping" />
                  )}
               </div>
               <div className="text-center space-y-2 z-10">
                 <h2 className="text-3xl font-headline font-bold tracking-tight">{callData.callerName}</h2>
                 <p className="text-xs font-mono text-primary uppercase tracking-[0.4em] animate-pulse">
                   {status === 'ringing' ? (callData.isIncoming ? 'Incoming Signal...' : 'Calling Node...') : `Session: ${formatTime(timer)}`}
                 </p>
               </div>
            </div>
          )}

          {/* Local Video Preview */}
          {callData.type === 'video' && status === 'connected' && (
            <div className="absolute top-6 right-6 w-48 aspect-video bg-black rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-20">
               <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
               <Badge className="absolute top-2 left-2 bg-black/40 text-[7px] uppercase">My_Feed</Badge>
            </div>
          )}

          {/* HUD Overlays */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-30">
            <Badge variant="outline" className="border-accent/40 text-accent bg-black/60 backdrop-blur-md text-[8px] uppercase tracking-widest gap-2">
              <Activity size={10} className="animate-pulse" /> SOVEREIGN_LINK_v3.1
            </Badge>
            <div className="flex items-center gap-2 text-[8px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded">
               <ShieldCheck size={8} className="text-primary" /> ENCRYPTION: RSA_V2
            </div>
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40 bg-black/40 backdrop-blur-xl p-4 px-8 rounded-full border border-white/10 shadow-2xl">
            {status === 'ringing' && callData.isIncoming ? (
              <>
                <Button 
                  onClick={handleAccept} 
                  className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 animate-bounce"
                >
                  <Phone size={28} />
                </Button>
                <Button 
                  onClick={handleEndCall} 
                  className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
                >
                  <PhoneOff size={28} />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMicMuted(!isMuted)}
                  className={`h-12 w-12 rounded-full border border-white/10 ${isMuted ? 'bg-destructive/20 text-destructive' : 'text-white hover:bg-white/10'}`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </Button>
                
                {callData.type === 'video' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsCamOff(!isCamOff)}
                    className={`h-12 w-12 rounded-full border border-white/10 ${isCamOff ? 'bg-destructive/20 text-destructive' : 'text-white hover:bg-white/10'}`}
                  >
                    {isCamOff ? <VideoOff size={20} /> : <Video size={20} />}
                  </Button>
                )}

                <Button 
                  onClick={handleEndCall} 
                  className="h-14 w-14 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/40 transition-transform active:scale-90"
                >
                  <PhoneOff size={24} />
                </Button>

                <div className="w-px h-8 bg-white/10 mx-2" />
                <div className="flex flex-col items-center">
                   <Zap size={14} className="text-accent animate-pulse" />
                   <span className="text-[7px] font-mono text-accent uppercase">Pure</span>
                </div>
              </>
            )}
          </div>

          {/* CRT Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
        </div>
      </DialogContent>
    </Dialog>
  )
}