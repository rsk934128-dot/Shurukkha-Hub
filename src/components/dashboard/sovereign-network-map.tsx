
"use client"

import React, { useState, useEffect } from 'react'
import { Smartphone, ShieldCheck, Globe, Zap, Landmark, ArrowLeftRight, Cpu, Activity, ShieldAlert, Wifi, Server, TrendingUp, BarChart3, Star, Map } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NetworkAuditor, NetworkNode } from '@/lib/network-auditor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlobalHeatmap } from './global-heatmap'

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
    <Card className="bg-card border-primary/20 overflow-hidden shadow-2xl">
      <CardHeader className="bg-primary/5 border-b border-primary/10 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
            <Cpu className="text-primary" size={16} />
            SOVEREIGN NETWORK ARCHITECTURE (Phase 31.0)
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
      
      <Tabs defaultValue="map" className="w-full">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8 flex gap-4">
            <TabsTrigger value="map" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0"><Globe size={12}/> Architecture Map</TabsTrigger>
            <TabsTrigger value="heatmap" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-accent rounded-none px-0"><Map size={12}/> Global Traffic</TabsTrigger>
            <TabsTrigger value="metrics" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-accent rounded-none px-0"><BarChart3 size={12}/> Growth Metrics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="p-6 m-0 animate-in fade-in duration-500">
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
               
               <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl space-y-3 shadow-inner">
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
                  <p className="text-[8px] text-muted-foreground leading-relaxed italic">
                    আপনার ৪২টি ডিস্ট্রিবিউটেড নোড এখন Anycast রাউটিংয়ের মাধ্যমে core.sheikh ডোমেইন পরিচালনা করছে।
                  </p>
               </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="p-6 m-0 animate-in slide-in-from-bottom-2 duration-500">
          <GlobalHeatmap />
        </TabsContent>

        <TabsContent value="metrics" className="p-6 m-0 space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <TrendingUp size={16} className="text-primary" />
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px]">+24%</Badge>
              </div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-headline font-bold text-primary">99.98%</p>
              <p className="text-[8px] text-muted-foreground">Atomic Settlement efficiency improved.</p>
            </Card>

            <Card className="bg-accent/5 border-accent/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Activity size={16} className="text-accent" />
                <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px]">-15ms</Badge>
              </div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Network Latency</p>
              <p className="text-2xl font-headline font-bold text-accent">4.2ms</p>
              <p className="text-[8px] text-muted-foreground">Anycast Routing optimization active.</p>
            </Card>

            <Card className="bg-primary/5 border-primary/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Star size={16} className="text-primary fill-primary" />
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px]">100%</Badge>
              </div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">System Uptime</p>
              <p className="text-2xl font-headline font-bold text-primary">Sovereign</p>
              <p className="text-[8px] text-muted-foreground">Zero-downtime redundancy protocol.</p>
            </Card>
          </div>

          <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl">
            <h4 className="text-xs font-headline font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Landmark size={14} className="text-primary" /> SovereignPay Impact Analytics
            </h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Automated Auditing Efficiency</span>
                  <span className="text-primary">95%</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[95%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Gateway Pre-Flight Success</span>
                  <span className="text-accent">100%</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-full" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Atomic Settlement Speed</span>
                  <span className="text-primary">0.001ms</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%]" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-6 pt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
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
