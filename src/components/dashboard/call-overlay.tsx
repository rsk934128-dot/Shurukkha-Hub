"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ShieldCheck, Loader2, User, Volume2, Activity, Zap, X } from 'lucide-react'
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
  const ringtoneIntervalRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { playAlertSound } = useAudioEngine()

  // Control Ringtone with strict logic
  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current)
      ringtoneIntervalRef.current = null
    }
  }

  const startRingtone = () => {
    stopRingtone()
    playAlertSound()
    ringtoneIntervalRef.current = setInterval(playAlertSound, 3000)
  }

  // Hardware Kill-Switch Logic
  const cleanupStreams = () => {
    // Explicitly stop all local tracks (Mic & Cam)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log(`[Hardware Kill-Switch] Stopped track: ${track.kind}`);
      });
      streamRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(t => t.stop());
      setRemoteStream(null);
    }
    
    webrtcRef.current?.dispose();
    stopTimer();
    stopRingtone();
  }

  useEffect(() => {
    if (callData) {
      setStatus('ringing');
      setTimer(0);
      
      const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
      
      // Listen for call state changes from Firestore
      const unsubscribe = onSnapshot(sessionRef, (snap) => {
        if (!snap.exists()) {
          handleEndCall();
          return;
        }
        const data = snap.data();
        if (data.status === 'connected' && status === 'ringing') {
          setStatus('connected');
          stopRingtone(); // Stop immediately when connected
          startTimer();
        }
        if (data.status === 'ended') {
          handleEndCall();
        }
      });

      if (callData.isIncoming) {
        startRingtone();
      } else {
        initiateOutgoingCall();
      }

      return () => {
        unsubscribe();
        cleanupStreams();
      };
    }
  }, [callData?.sessionId]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(e => console.warn("[WebRTC] Autoplay prevented", e));
    }
  }, [localStream, remoteStream]);

  const initiateOutgoingCall = async () => {
    if (!callData) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callData.type === 'video', 
        audio: true 
      });
      streamRef.current = stream;
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
    stopRingtone(); 
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callData.type === 'video', 
        audio: true 
      });
      streamRef.current = stream;
      setLocalStream(stream);
      webrtcRef.current = new WebRTCManager(callData.sessionId);
      await webrtcRef.current.answerCall(stream, (remote) => {
        setRemoteStream(remote);
      });
      
      await updateDoc(doc(db, 'webrtc_sessions', callData.sessionId), {
        status: 'connected'
      });
      
      setStatus('connected');
      startTimer();
    } catch (e) {
      console.error("Call acceptance failed", e);
      handleEndCall();
    }
  }

  const handleEndCall = async () => {
    stopRingtone();
    if (callData) {
      try {
        await updateDoc(doc(db, 'webrtc_sessions', callData.sessionId), { status: 'ended' });
        setTimeout(() => {
          try { deleteDoc(doc(db, 'webrtc_sessions', callData.sessionId)); } catch (e) {}
        }, 1000);
      } catch (e) {}
    }
    cleanupStreams();
    setStatus('ended');
    onClose();
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
          <DialogTitle>Sovereign Communication Hub</DialogTitle>
          <DialogDescription>Secure encrypted session Link active.</DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-video bg-slate-950 flex items-center justify-center group">
          {/* Incoming Call UI - Prominent Accept/Reject */}
          {status === 'ringing' && callData.isIncoming ? (
            <div className="flex flex-col items-center gap-8 z-50 animate-in fade-in zoom-in-95 duration-500">
               <div className="relative">
                  <div className="absolute -inset-12 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <Avatar className="h-48 w-48 border-4 border-primary/40 relative z-10 shadow-2xl">
                    <AvatarImage src={callData.callerAvatar} />
                    <AvatarFallback className="bg-primary/10 text-6xl font-headline font-bold text-primary">
                      {callData.callerName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -inset-4 border-2 border-primary/40 rounded-full animate-ping" />
               </div>
               <div className="text-center space-y-4 z-10">
                 <h2 className="text-4xl font-headline font-bold tracking-tight neon-text-primary">{callData.callerName}</h2>
                 <Badge className="bg-primary/20 text-primary border-primary/40 px-4 py-1 uppercase tracking-[0.3em] font-bold animate-bounce">
                    INCOMING {callData.type.toUpperCase()} SIGNAL
                 </Badge>
               </div>
               
               <div className="flex items-center gap-12 mt-4">
                  <div className="flex flex-col items-center gap-3">
                    <Button 
                      onClick={handleAccept} 
                      className="h-24 w-24 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-sos-pulse border-4 border-background"
                    >
                      <Phone size={40} />
                    </Button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Accept</span>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <Button 
                      onClick={handleEndCall} 
                      className="h-24 w-24 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] border-4 border-background"
                    >
                      <PhoneOff size={40} />
                    </Button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">Decline</span>
                  </div>
               </div>
            </div>
          ) : (
            <>
              {/* Connected Video or Profile View */}
              {status === 'connected' && remoteStream ? (
                <div className="w-full h-full relative">
                  <video 
                    ref={remoteVideoRef} 
                    autoPlay 
                    playsInline 
                    className={`w-full h-full object-cover ${callData.type === 'audio' ? 'hidden' : ''}`} 
                  />
                  {callData.type === 'audio' && (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-slate-900">
                      <div className="relative">
                        <div className="absolute -inset-8 bg-accent/20 rounded-full blur-3xl animate-pulse" />
                        <Avatar className="h-40 w-40 border-4 border-accent/40 relative z-10 shadow-2xl">
                          <AvatarImage src={callData.callerAvatar} />
                          <AvatarFallback className="bg-primary/10 text-5xl font-headline font-bold text-primary">
                            {callData.callerName?.[0] || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 bg-accent p-2 rounded-full border-2 border-background">
                          <Volume2 className="text-background" size={24} />
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <h2 className="text-3xl font-headline font-bold tracking-tight text-white">{callData.callerName}</h2>
                        <Badge variant="outline" className="border-accent/40 text-accent uppercase tracking-widest text-[10px]">Audio Only Session</Badge>
                      </div>
                    </div>
                  )}
                </div>
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
                   </div>
                   <div className="text-center space-y-2 z-10">
                     <h2 className="text-3xl font-headline font-bold tracking-tight">{callData.callerName}</h2>
                     <p className="text-xs font-mono text-primary uppercase tracking-[0.4em] animate-pulse">
                       {status === 'ringing' ? 'Calling Sovereign Node...' : `Secured Session: ${formatTime(timer)}`}
                     </p>
                   </div>
                </div>
              )}
            </>
          )}

          {/* Local Video Preview (Picture in Picture) */}
          {callData.type === 'video' && status === 'connected' && (
            <div className="absolute top-6 right-6 w-48 aspect-video bg-black rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-20">
               <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
               <Badge className="absolute top-2 left-2 bg-black/40 text-[7px] uppercase">My_Feed</Badge>
            </div>
          )}

          {/* HUD Status Overlays */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-30">
            <Badge variant="outline" className="border-accent/40 text-accent bg-black/60 backdrop-blur-md text-[8px] uppercase tracking-widest gap-2">
              <Activity size={10} className="animate-pulse" /> SOVEREIGN_LINK_v3.3
            </Badge>
            <div className="flex items-center gap-2 text-[8px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded">
               <ShieldCheck size={8} className="text-primary" /> ENCRYPTION: RSA_V2
            </div>
          </div>

          {/* In-Call Controls */}
          {(status === 'connected' || (status === 'ringing' && !callData.isIncoming)) && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40 bg-black/60 backdrop-blur-xl p-4 px-8 rounded-full border border-white/10 shadow-2xl transition-all hover:scale-105">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  const audioTrack = streamRef.current?.getAudioTracks()[0];
                  if (audioTrack) {
                    audioTrack.enabled = !audioTrack.enabled;
                    setIsMicMuted(!audioTrack.enabled);
                  }
                }}
                className={`h-12 w-12 rounded-full border border-white/10 ${isMuted ? 'bg-destructive/20 text-destructive' : 'text-white hover:bg-white/10'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
              
              {callData.type === 'video' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => {
                    const videoTrack = streamRef.current?.getVideoTracks()[0];
                    if (videoTrack) {
                      videoTrack.enabled = !videoTrack.enabled;
                      setIsCamOff(!videoTrack.enabled);
                    }
                  }}
                  className={`h-12 w-12 rounded-full border border-white/10 ${isCamOff ? 'bg-destructive/20 text-destructive' : 'text-white hover:bg-white/10'}`}
                >
                  {isCamOff ? <VideoOff size={20} /> : <Video size={20} />}
                </Button>
              )}

              <Button 
                onClick={handleEndCall} 
                className="h-16 w-16 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/40 transition-transform active:scale-90 border-4 border-background"
              >
                <PhoneOff size={28} />
              </Button>

              <div className="w-px h-8 bg-white/10 mx-2" />
              <div className="flex flex-col items-center">
                 <Zap size={14} className="text-accent animate-pulse" />
                 <span className="text-[7px] font-mono text-accent uppercase">Pure</span>
              </div>
            </div>
          )}

          {/* CRT Visual Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
        </div>
      </DialogContent>
    </Dialog>
  )
}