
"use client"

import React, { useState } from 'react'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, ShieldCheck, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MediaControlsProps {
  onHangUp: () => void;
  className?: string;
}

export function MediaControls({ onHangUp, className = "" }: MediaControlsProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);

  return (
    <div className={`flex items-center justify-center gap-4 bg-black/80 backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-2xl ${className}`}>
      <TooltipProvider>
        <div className="flex items-center gap-2">
          {/* Mic Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsMicOn(!isMicOn)}
                variant={isMicOn ? "outline" : "destructive"} 
                size="icon" 
                className={`w-12 h-12 rounded-2xl transition-all duration-300 ${isMicOn ? 'border-primary/20 hover:bg-primary/10 text-primary' : 'bg-destructive/20 border-destructive/40 text-destructive'}`}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-white/10">
              <p className="text-[10px] uppercase font-bold">{isMicOn ? "Mute Microphone" : "Unmute Microphone"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Camera Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsCamOn(!isCamOn)}
                variant={isCamOn ? "outline" : "destructive"} 
                size="icon" 
                className={`w-12 h-12 rounded-2xl transition-all duration-300 ${isCamOn ? 'border-accent/20 hover:bg-accent/10 text-accent' : 'bg-destructive/20 border-destructive/40 text-destructive'}`}
              >
                {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-white/10">
              <p className="text-[10px] uppercase font-bold">{isCamOn ? "Stop Video" : "Start Video"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Speaker Control */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={() => setIsAudioOn(!isAudioOn)}
                variant="outline"
                size="icon" 
                className={`w-12 h-12 rounded-2xl border-white/10 hover:bg-white/5 transition-all ${!isAudioOn ? 'text-muted-foreground opacity-50' : 'text-white'}`}
              >
                {isAudioOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-card border-white/10">
              <p className="text-[10px] uppercase font-bold">{isAudioOn ? "Mute Audio" : "Unmute Audio"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-px h-8 bg-white/10 mx-2" />

        {/* Hang Up */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onHangUp}
              variant="destructive" 
              size="icon" 
              className="w-14 h-14 rounded-2xl bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/40 transition-transform active:scale-95"
            >
              <PhoneOff size={24} />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-destructive border-none text-white">
            <p className="text-[10px] uppercase font-bold tracking-widest">Terminate Session</p>
          </TooltipContent>
        </Tooltip>

        <div className="hidden lg:flex flex-col items-start gap-1 ml-4 pr-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} className="text-accent" />
            <span className="text-[8px] font-mono text-accent uppercase font-bold">Encrypted</span>
          </div>
          <Badge variant="outline" className="text-[7px] border-white/10 h-4 px-1.5 opacity-50">NODE_RSA_V2</Badge>
        </div>
      </TooltipProvider>
    </div>
  )
}
