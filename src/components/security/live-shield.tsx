"use client"

import React, { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, Activity, Wifi, Zap, Globe, Target, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SovereignGuard } from '@/lib/sovereign-guard'
import { ScrollArea } from '@/components/ui/scroll-area'

export function LiveShield() {
  const [traffic, setTraffic] = useState(SovereignGuard.getLiveTraffic())
  const stats = SovereignGuard.getStats()

  useEffect(() => {
    const interval = setInterval(() => {
      setTraffic(SovereignGuard.getLiveTraffic())
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20 p-4 space-y-2">
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Requests Scan</p>
           <h3 className="text-2xl font-headline font-bold text-primary">{stats.totalRequests.toLocaleString()}</h3>
           <Progress value={100} className="h-1 bg-white/5 [&>div]:bg-primary" />
        </Card>
        <Card className="bg-destructive/5 border-destructive/20 p-4 space-y-2">
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Intercepted Attacks</p>
           <h3 className="text-2xl font-headline font-bold text-destructive">{stats.intercepted.toLocaleString()}</h3>
           <Progress value={stats.intercepted / 10} className="h-1 bg-white/5 [&>div]:bg-destructive" />
        </Card>
        <Card className="bg-accent/5 border-accent/20 p-4 space-y-2">
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Avg Response Time</p>
           <h3 className="text-2xl font-headline font-bold text-accent">{stats.avgResponseTime}ms</h3>
           <Progress value={85} className="h-1 bg-white/5 [&>div]:bg-accent" />
        </Card>
      </div>

      <Card className="bg-card/40 border-primary/20 overflow-hidden shadow-2xl rounded-[2rem]">
        <CardHeader className="bg-primary/10 border-b border-white/5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="text-primary animate-pulse" /> Imperial Defense: Real-Time HUD
              </CardTitle>
              <CardDescription className="text-[8px] font-bold uppercase text-primary/60">Packet Inspection & Threat Mitigation</CardDescription>
            </div>
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[8px] animate-pulse h-6">DEFENSE_ACTIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="divide-y divide-white/5">
              {traffic.map((req, i) => (
                <div key={i} className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${req.status === 'STRIKE' ? 'bg-destructive animate-ping' : req.status === 'INTERCEPTED' ? 'bg-yellow-500' : 'bg-accent shadow-[0_0_8px_rgba(34,211,238,0.5)]'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-bold text-foreground">{req.origin}</p>
                        <Badge variant="outline" className="text-[7px] h-3.5 border-white/10 opacity-60">ID: {req.id}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Globe size={10} className="text-muted-foreground" />
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">{req.endpoint}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <Badge variant="outline" className={`text-[7px] uppercase font-bold px-2 py-0.5 ${req.status === 'STRIKE' ? 'border-destructive/40 text-destructive bg-destructive/5' : req.status === 'PASSED' ? 'border-accent/40 text-accent bg-accent/5' : 'border-white/10'}`}>
                      {req.status}
                    </Badge>
                    <span className="text-[8px] font-mono text-muted-foreground opacity-40">{req.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function Progress({ value, className }: any) {
  return (
    <div className={`h-1.5 w-full bg-white/5 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-current transition-all duration-1000" style={{ width: `${value}%` }} />
    </div>
  )
}
