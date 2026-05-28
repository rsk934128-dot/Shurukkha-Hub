"use client"

import React, { useState, useEffect } from 'react'
import { Cpu, Zap, Wifi, WifiOff, ShieldCheck, ShieldAlert, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SelfHealing } from '@/lib/self-healing'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function SovereignStatusWidget() {
  const [status, setStatus] = useState(SelfHealing.getStatus())

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(SelfHealing.getStatus())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const isLocal = status.aiStatus === 'LOCAL_MODE'

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${isLocal ? 'bg-accent/10 border-accent/40 text-accent shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-primary/10 border-primary/40 text-primary'}`}>
              {isLocal ? (
                <>
                  <Cpu size={14} className="animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden xs:inline">Sovereign Mode</span>
                </>
              ) : (
                <>
                  <Wifi size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden xs:inline">Cloud Active</span>
                </>
              )}
              <div className={`w-1.5 h-1.5 rounded-full ${isLocal ? 'bg-accent animate-ping' : 'bg-primary'}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-card border-white/10 text-xs">
            {isLocal 
              ? "সিস্টেম বর্তমানে নিজস্ব গাণিতিক লজিক ব্যবহার করছে। কোনো ক্লাউড নির্ভরশীলতা নেই।" 
              : "সিস্টেম সরাসরি গুগল জেমিনি এআই ইঞ্জিনের সাথে সংযুক্ত।"}
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-md border border-white/5">
          <Activity size={12} className="text-muted-foreground" />
          <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-tighter">Purity: 100%</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
