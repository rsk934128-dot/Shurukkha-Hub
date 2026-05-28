"use client"

import React from 'react'
import { Smartphone, ShieldCheck, Globe, Zap, Landmark, ArrowRight, ArrowLeftRight, Cpu, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const nodes = [
  { id: 'user', name: 'User/Merchant App', role: 'Entry Point', icon: Smartphone, status: 'ACTIVE', color: 'text-primary' },
  { id: 'bridge', name: 'Integration Bridge', role: 'Central Hub', icon: ShieldCheck, status: 'LOCKED', color: 'text-primary' },
  { id: 'stripe', name: 'Stripe Global Grid', role: 'Payment Processing', icon: Globe, status: 'CONNECTED', color: 'text-accent' },
  { id: 'bkash', name: 'bKash Local Hook', role: 'Local Gateway', icon: Zap, status: 'ENABLED', color: 'text-accent' },
  { id: 'treasury', name: 'Sovereign Treasury', role: 'Audit Registry', icon: Landmark, status: 'SYNCING', color: 'text-primary' },
]

export function SovereignNetworkMap() {
  return (
    <Card className="bg-card border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-3">
        <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
          <Cpu className="text-primary" size={16} />
          SOVEREIGN NETWORK ARCHITECTURE
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative flex flex-col items-center gap-12">
          {/* Central Hub and Global/Local Connections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-center">
            {/* Left Wing: Entry Points */}
            <div className="space-y-4 flex flex-col items-center">
              <NetworkNodeItem node={nodes[0]} />
            </div>

            {/* Center: The Bridge */}
            <div className="flex flex-col items-center relative">
              <div className="absolute -z-10 w-full h-px bg-primary/20 top-1/2 -translate-y-1/2 md:block hidden" />
              <NetworkNodeItem node={nodes[1]} highlight />
            </div>

            {/* Right Wing: External Grids */}
            <div className="space-y-4 flex flex-col items-center">
              <NetworkNodeItem node={nodes[2]} />
              <NetworkNodeItem node={nodes[3]} />
            </div>
          </div>

          {/* Bottom: The Ledger */}
          <div className="w-full pt-8 border-t border-white/5 flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <ArrowLeftRight className="text-primary/40 mb-2 animate-bounce" size={20} />
              <NetworkNodeItem node={nodes[4]} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Encryption</p>
            <p className="text-[10px] font-mono text-primary font-bold">SHA256withRSA v2</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Handshake</p>
            <p className="text-[10px] font-mono text-accent font-bold">MULTI_NODE_SYNC</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Traffic Control</p>
            <p className="text-[10px] font-mono text-primary font-bold">AUTONOMOUS</p>
          </div>
          <div className="p-3 bg-muted/20 rounded-xl border border-white/5 space-y-1">
            <p className="text-[8px] uppercase font-bold text-muted-foreground">Registry</p>
            <p className="text-[10px] font-mono text-accent font-bold">IMMUTABLE_LOG</p>
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
