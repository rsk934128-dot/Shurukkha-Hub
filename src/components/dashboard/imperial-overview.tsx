"use client"

import React, { useState, useEffect } from 'react'
import { ShieldCheck, Zap, Activity, Globe, TrendingUp, Star, Package, CreditCard, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SelfMaintenanceDaemon } from '@/lib/self-maintenance-daemon'
import { SovereignGuard } from '@/lib/sovereign-guard'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export function ImperialOverview() {
  const [stats, setStats] = useState(SelfMaintenanceDaemon.getStats());
  const [treasuryBalance, setTreasuryBalance] = useState(12450000);
  const [projectCount, setProjectCount] = useState(42);

  useEffect(() => {
    // Start the daemon if not running
    SelfMaintenanceDaemon.start();
    
    const interval = setInterval(() => {
      setStats(SelfMaintenanceDaemon.getStats());
    }, 5000);

    // Listen for ledger updates to increment balance
    const q = query(collection(db, "audit_trails"), where("action", "==", "SETTLEMENT_COMPLETED"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalFees = 186750; // Base historical fees
      snapshot.docs.forEach(doc => {
        const fee = doc.data().details?.feeCollected || 0;
        totalFees += fee;
      });
      // Mocked total balance logic
      setTreasuryBalance(12450000 + (totalFees - 186750) * 66); 
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [])

  const metrics = [
    { 
      label: 'Sovereign Score', 
      val: `100%`, 
      icon: Star, 
      color: 'text-primary', 
      desc: 'সিস্টেমের সামগ্রিক বিশুদ্ধতা (Immutable)' 
    },
    { 
      label: 'Active Projects', 
      val: `${projectCount}/400`, 
      icon: Package, 
      color: 'text-accent', 
      desc: 'Phase 35.0 বিবর্তন সক্রিয়' 
    },
    { 
      label: 'Network Health', 
      val: 'OPTIMAL', 
      icon: Activity, 
      color: 'text-green-500', 
      desc: '৪২টি নোড Anycast সিঙ্কড' 
    },
    { 
      label: 'Global Treasury', 
      val: `$${(treasuryBalance / 120).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
      icon: CreditCard, 
      color: 'text-primary', 
      desc: 'বৈশ্বিক রাজস্ব প্রবাহ (USD)' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in fade-in duration-1000">
      {metrics.map((item, idx) => (
        <Card key={idx} className="bg-card/40 border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all rounded-[2rem] shadow-xl">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <item.icon size={60} className={item.color} />
          </div>
          <CardContent className="p-5 space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{item.label}</p>
              <Badge variant="outline" className={`text-[7px] border-white/10 ${item.color} bg-black/20 animate-pulse`}>
                SOVEREIGN
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-xl md:text-2xl font-headline font-bold ${item.color}`}>{item.val}</h3>
              <Activity size={12} className={`${item.color} animate-pulse`} />
            </div>
            <p className="text-[9px] text-muted-foreground italic font-body">{item.desc}</p>
          </CardContent>
          <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent w-full opacity-30`} />
        </Card>
      ))}
    </div>
  )
}
