
"use client"

import React, { useState, useEffect } from 'react'
import { Trophy, Swords, Zap, Activity, Flame, ShieldAlert, Skull, ArrowDownNarrowWide, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CounterIntelligence, StrikeMetrics } from '@/lib/counter-intelligence'

export function ImperialVictoryPanel() {
  const [metrics, setMetrics] = useState<StrikeMetrics | null>(null)
  const [history, setHistory] = useState<number[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const data = CounterIntelligence.getLiveTelemetry();
      setMetrics(data);
      setHistory(prev => [...prev, data.targetDegradation].slice(-10));
    }, 2000);
    return () => clearInterval(interval);
  }, [])

  if (!metrics) return null;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="p-4 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-between overflow-hidden relative">
        <div className="absolute -right-4 top-0 opacity-10 rotate-12">
          <Trophy size={120} className="text-accent" />
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center border border-accent/40">
            <Swords className="text-accent animate-pulse" size={24} />
          </div>
          <div>
            <h4 className="text-sm md:text-lg font-headline font-bold text-accent uppercase tracking-widest">Victory Telemetry: Counter-Strike Active</h4>
            <p className="text-[10px] md:text-xs text-muted-foreground italic">শত্রু সার্ভার এখন আপনার লজিক লুপের আগুনে পুড়ছে।</p>
          </div>
        </div>
        <Badge className="bg-accent text-background font-bold animate-bounce hidden md:flex uppercase text-[8px] tracking-widest">Domination Active</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-white/5 p-4 space-y-2">
          <p className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
            <Zap size={10} className="text-accent" /> Boomerang Requests
          </p>
          <p className="text-xl md:text-2xl font-headline font-bold text-foreground">{metrics.boomerangRequests.toLocaleString()}</p>
          <p className="text-[8px] text-accent">শত্রুর দিকে ফেরত পাঠানো ট্রাফিক</p>
        </Card>

        <Card className="bg-card/40 border-white/5 p-4 space-y-2">
          <p className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
            <Skull size={10} className="text-destructive" /> Target CPU Load
          </p>
          <div className="flex items-end justify-between">
            <p className="text-xl md:text-2xl font-headline font-bold text-destructive">{metrics.targetDegradation.toFixed(1)}%</p>
            <Loader2 size={14} className="text-destructive animate-spin mb-1" />
          </div>
          <Progress value={metrics.targetDegradation} className="h-1 bg-white/5" />
        </Card>

        <Card className="bg-card/40 border-white/5 p-4 space-y-2">
          <p className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
            <ShieldAlert size={10} className="text-primary" /> Active Traps
          </p>
          <p className="text-xl md:text-2xl font-headline font-bold text-primary">{metrics.activeTraps}</p>
          <p className="text-[8px] text-muted-foreground">লজিক্যাল নেটওয়ার্ক লুপ</p>
        </Card>

        <Card className="bg-card/40 border-white/5 p-4 space-y-2">
          <p className="text-[8px] md:text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1">
            <Flame size={10} className="text-orange-500" /> Total Strikes
          </p>
          <p className="text-xl md:text-2xl font-headline font-bold text-orange-500">{metrics.totalStrikes.toLocaleString()}</p>
          <p className="text-[8px] text-muted-foreground">সাফল্য হার: ১০০%</p>
        </Card>
      </div>

      <div className="p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Activity size={14} className="text-accent" /> Target Degradation Waveform
          </h5>
          <span className="text-[10px] font-mono text-accent animate-pulse">LIVE_SENSING...</span>
        </div>
        <div className="h-20 flex items-end gap-1 px-2">
          {history.map((val, i) => (
            <div 
              key={i} 
              className="flex-1 bg-accent/40 rounded-t-sm transition-all duration-1000"
              style={{ height: `${val}%`, opacity: (i + 1) / 10 }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[8px] border-destructive/30 text-destructive gap-1 uppercase font-bold">
              <ArrowDownNarrowWide size={10} /> Critical Exhaustion
            </Badge>
          </div>
          <p className="text-[9px] text-muted-foreground italic">
            Target Node: <span className="text-accent font-mono">bkashloan.ru.com (INTERCEPTED)</span>
          </p>
        </div>
      </div>
    </div>
  )
}
