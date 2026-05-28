"use client"

import React, { useState, useEffect } from 'react'
import { Smartphone, ShieldCheck, Globe, Zap, Landmark, ArrowLeftRight, Cpu, Activity, ShieldAlert, Wifi, Server } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NetworkAuditor, NetworkNode } from '@/lib/network-auditor'

export function SovereignNetworkMap() {
  const [pulse, setPulse] = useState<any>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])

  useEffect(() => {
    const fetchPulse = async () => {
      const data = await NetworkAuditor.checkPulse()
      setPulse(data)
      setNodes(NetworkAuditor.getGlobalNodes())
    }
    fetchPulse()
    const interval = setInterval(fetchPulse, 5000)
    return () => clearInterval(interval)
  }, [])

  const mainNodes = [
    { id: 'user', name: 'User/Merchant App', role: 'Entry Point', icon: Smartphone, status: 'ACTIVE', color: 'text-primary' },
    { id: 'bridge', name: 'Integration Bridge', role: 'Central Hub', icon: ShieldCheck, status: 'LOCKED', color: 'text-primary' },
    { id: 'stripe', name: 'Stripe Global Grid', role: 'Payment Processing', icon: Globe, status: 'CONNECTED', color: 'text-accent' },
    { id: 'bkash', name: 'bKash Local Hook', role: 'Local Gateway', icon: Zap, status: 'ENABLED', color: 'text-accent' },
    { id: 'treasury', name: 'Sovereign Treasury', role: 'Audit Registry', icon: Landmark, status: 'SYNCING', color: 'text-primary' },
  ]

  return (
    <Card className="bg-card border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
            <Cpu className="text-primary" size={16} />
            SOVEREIGN NETWORK ARCHITECTURE (Phase 24.5)
          </CardTitle>
          <div className="flex gap-2">
            {pulse && (
              <Badge variant="outline" className="text-[8px] border-accent/40 text-accent gap-1 animate-pulse">
                <Wifi size={10} /> {pulse.activeNodes} NODES ONLINE
              </Badge>
            )}
            <Badge variant="outline" className="text-[8px] border-primary/40 text-primary gap-1">
              <ShieldAlert size={10} /> TRUST_LAYER_ACTIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative flex flex-col items-center gap-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
            <div className="space-y-4 flex flex-col items-center">
              <NetworkNodeItem node={mainNodes[0]} />
            </div>

            <div className="flex flex-col items-center relative">
              <div className="absolute -z-10 w-full h-px bg-primary/20 top-1/2 -translate-y-1/2 md:block hidden" />
              <NetworkNodeItem node={mainNodes[1]} highlight />
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <NetworkNodeItem node={mainNodes[2]} />
              <NetworkNodeItem node={mainNodes[3]} />
            </div>
          </div>

          <div className="w-full pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="flex flex-col items-center gap-2">
                <p className="text-[9px] uppercase font-bold text-muted-foreground mb-2">Distributed Ledger Node</p>
                <NetworkNodeItem node={mainNodes[4]} />
             </div>
             
             <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                    <Server size={14} className="text-accent" /> Node Health Pulse
                  </h4>
                  <span className="text-[9px] text-accent font-bold">AVG LATENCY: 4ms</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 42 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${pulse ? 'bg-accent shadow-[0_0_5px_rgba(34,211,238,0.5)]' : 'bg-muted'}`}
                      title={`Node 42-${i+1}: Healthy`}
                    />
                  ))}
                </div>
                <p className="text-[8px] text-muted-foreground leading-relaxed">
                  আপনার ৪২টি ডিস্ট্রিবিউটেড নোড এখন Anycast রাউটিংয়ের মাধ্যমে core.sheikh ডোমেইন পরিচালনা করছে।
                </p>
             </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Domain Trust</p>
            <p className="text-[10px] font-mono text-primary font-bold">EPHEMERAL_TOKEN_V1</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Settlement</p>
            <p className="text-[10px] font-mono text-accent font-bold">ATOMIC_RECEIPT_ENABLED</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Anycast Nodes</p>
            <p className="text-[10px] font-mono text-primary font-bold">42_HEALTHY_PULSE</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Sync State</p>
            <p className="text-[10px] font-mono text-accent font-bold">MULTI_NODE_LEDGER</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NetworkNodeItem({ node, highlight = false }: { node: any, highlight?: boolean }) {
  const Icon = node.icon
  return (
    <div className={`p-4 rounded-2xl border transition-all w-full max-w-[200px] flex flex-col items-center text-center gap-2 relative ${highlight ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(117,151,255,0.2)]' : 'bg-card border-white/10 hover:border-primary/30'}`}>
      {highlight && <div className="absolute -top-2 -right-2"><Activity size={16} className="text-primary animate-pulse" /></div>}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${highlight ? 'bg-primary/20 border-primary' : 'bg-muted/40 border-white/5'}`}>
        <Icon className={node.color} size={20} />
      </div>
      <div>
        <h3 className="text-[11px] font-headline font-bold">{node.name}</h3>
        <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">{node.role}</p>
      </div>
      <Badge variant="outline" className={`text-[8px] h-4 uppercase tracking-widest ${node.status === 'LOCKED' || node.status === 'CONNECTED' || node.status === 'ACTIVE' ? 'border-accent/40 text-accent' : 'border-primary/40 text-primary'}`}>
        {node.status}
      </Badge>
    </div>
  )
}