"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ShieldCheck, Loader2, User, Volume2, VolumeX, Activity, Zap, X, Maximize2, Smartphone, Speaker } from 'lucide-react'
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
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isCamOff, setIsCamOff] = useState(false)
  const [timer, setTimer] = useState(0)
  const [proximityActive, setProximityActive] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcRef = useRef<WebRTCManager | null>(null)
  const timerRef = useRef<any>(null)
  const ringtoneIntervalRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { playAlertSound } = useAudioEngine()

  /**
   * Virtual Proximity Sensor Simulation
   * Screen turns off (black) if the phone is tilted towards the ear (Vertical)
   */
  useEffect(() => {
    if (status !== 'connected' || callData?.type === 'video') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta; // In front-back tilt
      if (beta !== null && beta > 70 && beta < 110) {
        setProximityActive(true); // Tilt detected (near ear)
      } else {
        setProximityActive(false);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [status, callData?.type]);

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

  const cleanupStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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
      setRemoteStream(null);
      
      const sessionRef = doc(db, 'webrtc_sessions', callData.sessionId);
      
      const unsubscribe = onSnapshot(sessionRef, (snap) => {
        if (!snap.exists()) {
          handleEndCall();
          return;
        }
        const data = snap.data();
        if (data.status === 'connected' && status === 'ringing') {
          setStatus('connected');
          stopRingtone();
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
  }, [localStream, status]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(e => console.warn("[WebRTC] Autoplay prevented", e));
    }
  }, [remoteStream, status]);

  const initiateOutgoingCall = async () => {
    if (!callData) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: callData.type === 'video', 
        audio: WebRTCManager.getAudioConstraints() 
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
        audio: WebRTCManager.getAudioConstraints()
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
      <DialogContent className="max-w-[100vw] h-[100dvh] md:max-w-4xl md:h-auto md:aspect-video bg-[#05070a] border-none md:border md:border-primary/20 p-0 overflow-hidden md:rounded-[2.5rem] shadow-2xl z-[100]">
        <DialogHeader className="sr-only">
          <DialogTitle>Sovereign Communication Hub</DialogTitle>
          <DialogDescription>Secure encrypted session Link active.</DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center group overflow-hidden">
          {/* Proximity Shield Overlay (Sensor Simulation) */}
          {proximityActive && (
            <div className="absolute inset-0 bg-black z-[100] flex items-center justify-center">
               <div className="text-center opacity-10 flex flex-col items-center gap-4">
                  <Smartphone size={100} className="text-white" />
                  <p className="text-[10px] font-mono text-white uppercase tracking-[0.4em]">Screen_Inactive_Mode</p>
               </div>
            </div>
          )}

          {/* Incoming Call UI */}
          {status === 'ringing' && callData.isIncoming && (
            <div className="flex flex-col items-center gap-8 z-50 animate-in fade-in zoom-in-95 duration-500 w-full px-6">
               <div className="relative">
                  <div className="absolute -inset-8 md:-inset-12 bg-primary/20 rounded-full blur-2xl md:blur-3xl animate-pulse" />
                  <Avatar className="h-40 w-40 md:h-48 md:w-48 border-4 border-primary/40 relative z-10 shadow-2xl">
                    <AvatarImage src={callData.callerAvatar} />
                    <AvatarFallback className="bg-primary/10 text-5xl md:text-6xl font-headline font-bold text-primary">
                      {callData.callerName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -inset-4 border-2 border-primary/40 rounded-full animate-ping" />
               </div>
               <div className="text-center space-y-4 z-10">
                 <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight neon-text-primary">{callData.callerName}</h2>
                 <Badge className="bg-primary/20 text-primary border-primary/40 px-4 py-1 uppercase tracking-[0.3em] font-bold animate-bounce">
                    INCOMING {callData.type.toUpperCase()}
                 </Badge>
               </div>
               
               <div className="flex items-center gap-8 md:gap-12 mt-4">
                  <div className="flex flex-col items-center gap-3">
                    <Button onClick={handleAccept} className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] animate-sos-pulse border-4 border-background">
                      <Phone size={32} />
                    </Button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Accept</span>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <Button onClick={handleEndCall} className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_40px_rgba(239,68,68,0.4)] border-4 border-background">
                      <PhoneOff size={32} />
                    </Button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">Decline</span>
                  </div>
               </div>
            </div>
          )}

          {/* Connected Display Area */}
          <div className={`w-full h-full relative ${status === 'connected' ? 'block' : 'hidden'}`}>
             <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className={`w-full h-full object-cover ${callData.type === 'audio' ? 'hidden' : ''}`} 
             />
             {callData.type === 'audio' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-slate-900 to-black px-6">
                   <div className="relative">
                      <div className="absolute -inset-12 bg-accent/10 rounded-full blur-[60px] animate-pulse" />
                      <Avatar className="h-40 w-40 md:h-56 md:w-56 border-8 border-accent/20 relative z-10 shadow-2xl">
                         <AvatarImage src={callData.callerAvatar} />
                         <AvatarFallback className="bg-primary/10 text-5xl md:text-6xl font-headline font-bold text-primary">
                            {callData.callerName?.[0] || 'S'}
                         </AvatarFallback>
                      </Avatar>
                      {/* Audio Pulse Ring */}
                      <div className="absolute -inset-4 border-2 border-accent/20 rounded-full animate-ping opacity-40" />
                   </div>
                   <div className="text-center space-y-3">
                      <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-white">{callData.callerName}</h2>
                      <div className="flex flex-col items-center gap-2">
                        <Badge variant="outline" className="border-accent/40 text-accent uppercase tracking-widest text-[10px] bg-accent/5">Imperial Secure Audio</Badge>
                        <p className="text-xl font-mono text-white/60">{formatTime(timer)}</p>
                      </div>
                   </div>
                </div>
             )}
          </div>

          {/* Outgoing State */}
          {status === 'ringing' && !callData.isIncoming && (
             <div className="flex flex-col items-center gap-6 z-10 w-full px-6">
                <div className="relative">
                   <div className="absolute -inset-8 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                   <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-primary/40 relative z-10 shadow-2xl">
                     <AvatarImage src={callData.callerAvatar} />
                     <AvatarFallback className="bg-primary/10 text-4xl md:text-5xl font-headline font-bold text-primary">
                       {callData.callerName?.[0] || 'S'}
                     </AvatarFallback>
                   </Avatar>
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold tracking-tight">{callData.callerName}</h2>
                  <p className="text-xs font-mono text-primary uppercase tracking-[0.4em] animate-pulse">Calling Node...</p>
                </div>
             </div>
          )}

          {/* Local PIP */}
          <div className={`absolute bottom-32 right-4 md:top-6 md:right-6 w-32 md:w-48 aspect-[3/4] md:aspect-video bg-black rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-20 ${status === 'connected' && callData.type === 'video' ? 'block' : 'hidden'}`}>
             <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
             <Badge className="absolute top-2 left-2 bg-black/40 text-[7px] uppercase">You</Badge>
          </div>

          {/* HUD Indicators */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-30">
            <Badge variant="outline" className="border-accent/40 text-accent bg-black/60 backdrop-blur-md text-[8px] uppercase tracking-widest gap-2">
              <Activity size={10} className="animate-pulse" /> M2M_SOVEREIGN_V2.0
            </Badge>
            {status === 'connected' && (
              <div className="flex items-center gap-2 text-[8px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded">
                 <ShieldCheck size={8} className="text-primary" /> ENCRYPTED_LINK
              </div>
            )}
          </div>

          {/* Enhanced Controls */}
          {(status === 'connected' || (status === 'ringing' && !callData.isIncoming)) && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8 z-40 bg-black/40 backdrop-blur-3xl p-4 px-6 md:px-12 rounded-[2.5rem] border border-white/10 shadow-2xl transition-all w-[95%] md:w-auto justify-center">
              <div className="flex flex-col items-center gap-2">
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
                  className={`h-14 w-14 rounded-full border border-white/5 transition-all ${isMuted ? 'bg-destructive/20 text-destructive border-destructive/30' : 'text-white hover:bg-white/10'}`}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </Button>
                <span className="text-[8px] font-bold uppercase text-white/40 tracking-widest">Mute</span>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`h-14 w-14 rounded-full border border-white/5 transition-all ${isSpeakerOn ? 'bg-accent/20 text-accent border-accent/30' : 'text-white/40'}`}
                >
                  {isSpeakerOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </Button>
                <span className="text-[8px] font-bold uppercase text-white/40 tracking-widest">Speaker</span>
              </div>

              {callData.type === 'video' && (
                <div className="flex flex-col items-center gap-2">
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
                    className={`h-14 w-14 rounded-full border border-white/5 ${isCamOff ? 'bg-destructive/20 text-destructive' : 'text-white hover:bg-white/10'}`}
                  >
                    {isCamOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </Button>
                  <span className="text-[8px] font-bold uppercase text-white/40 tracking-widest">Cam</span>
                </div>
              )}

              <Button onClick={handleEndCall} className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-transform active:scale-90 border-4 border-background">
                <PhoneOff size={32} className="md:w-8 md:h-8" />
              </Button>
            </div>
          )}

          {/* CRT Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
