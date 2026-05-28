
"use client"

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Zap, Activity, Globe, TrendingUp, Skull, Cpu, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SelfMaintenanceDaemon } from '@/lib/self-maintenance-daemon'
import { SovereignGuard } from '@/lib/sovereign-guard'

export function ImperialOverview() {
  const [stats, setStats] = useState(SelfMaintenanceDaemon.getStats());
  const guardStats = SovereignGuard.getStats();

  useEffect(() => {
    // Start the daemon if not running
    SelfMaintenanceDaemon.start();
    
    const interval = setInterval(() => {
      setStats(SelfMaintenanceDaemon.getStats());
    }, 5000);
    return () => clearInterval(interval);
  }, [])

  const metrics = [
    { 
      label: 'Sovereign Score', 
      val: `${stats.sovereignScore}%`, 
      icon: Star, 
      color: 'text-primary', 
      desc: 'সিস্টেমের সামগ্রিক বিশুদ্ধতা' 
    },
    { 
      label: 'Active Nodes', 
      val: '42/42', 
      icon: Globe, 
      color: 'text-accent', 
      desc: 'ডিস্ট্রিবিউটেড নেটওয়ার্ক অনলাইন' 
    },
    { 
      label: 'Threat Level', 
      val: guardStats.intercepted > 100 ? 'HIGH' : 'LOW', 
      icon: Skull, 
      color: guardStats.intercepted > 100 ? 'text-destructive' : 'text-green-500', 
      desc: 'রিয়েল-টাইম সিকিউরিটি রিস্ক' 
    },
    { 
      label: 'Imperial Revenue', 
      val: 'OPTIMAL', 
      icon: TrendingUp, 
      color: 'text-primary', 
      desc: 'রাজস্ব প্রবাহের স্থিতিশীলতা' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((item, idx) => (
        <Card key={idx} className="bg-card/40 border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <item.icon size={60} className={item.color} />
          </div>
          <CardContent className="p-5 space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{item.label}</p>
              <Badge variant="outline" className={`text-[7px] border-white/10 ${item.color} bg-black/20`}>
                LIVE
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-headline font-bold ${item.color}`}>{item.val}</h3>
              <Activity size={12} className={`${item.color} animate-pulse`} />
            </div>
            <p className="text-[9px] text-muted-foreground italic font-body">{item.desc}</p>
          </CardContent>
          <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-${item.color.split('-')[1]} to-transparent w-full opacity-30`} />
        </Card>
      ))}
    </div>
  )
}
