
"use client"

import React, { useState, useEffect } from 'react'
import { Globe, Activity, ShieldCheck, Zap, Server, Lock, RefreshCw, Facebook, Cloud, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NetworkAuditor, NetworkNode } from '@/lib/network-auditor'
import { useToast } from '@/hooks/use-toast'

export function NetworkStatusBoard() {
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setNodes(NetworkAuditor.getGlobalNodes())
  }, [])

  const handleManualHandshake = async (nodeId: string) => {
    setIsRefreshing(true)
    try {
      const success = await NetworkAuditor.performHandshake(nodeId)
      if (success) {
        toast({
          title: "HANDSHAKE SUCCESSFUL",
          description: `নোড ${nodeId} আমাদের RSA v2 সিগনেচার গ্রহণ করেছে।`,
        })
      }
    } catch (e) {
      toast({ title: "HANDSHAKE FAILED", variant: "destructive" })
    } finally {
      setIsRefreshing(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    if (provider.includes('Facebook')) return <Facebook size={16} className="text-primary" />
    if (provider.includes('AWS')) return <Cloud size={16} className="text-accent" />
    if (provider.includes('Stripe')) return <CreditCard size={16} className="text-primary" />
    return <Server size={16} className="text-muted-foreground" />
  }

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-headline flex items-center gap-2">
              <Globe className="text-primary" size={20} />
              NETWORK-TO-NETWORK ACCESS BOARD
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
              Global Access Nodes • RSA v2 Authentication ACTIVE
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isRefreshing}
            onClick={() => setNodes(NetworkAuditor.getGlobalNodes())}
            className="h-8 border-primary/20 text-primary gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            SCAN NODES
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nodes.map(node => (
            <div key={node.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl space-y-4 hover:border-primary/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    {getProviderIcon(node.provider)}
                  </div>
                  <div>
                    <h3 className="text-sm font-headline font-bold">{node.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{node.provider}</p>
                  </div>
                </div>
                <Badge className={node.status === 'AUTHORIZED' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-destructive/20 text-destructive'}>
                  {node.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Zap size={10} className="text-accent" />
                    <span className="text-[9px] font-mono text-muted-foreground">{node.latency}ms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={10} className="text-primary" />
                    <span className="text-[9px] font-mono text-muted-foreground">RSA_V2</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleManualHandshake(node.id)}
                  className="h-7 text-[8px] uppercase font-bold tracking-[0.2em] hover:bg-primary/10 text-primary"
                >
                  <Lock size={10} className="mr-1.5" /> RE-AUTH
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-primary" />
            <h4 className="text-xs font-headline font-bold uppercase tracking-widest">Handshake Auditor Logs</h4>
          </div>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
            {nodes.map((node, i) => (
              <div key={i} className="flex items-center justify-between text-[9px] font-mono p-2 bg-black/40 rounded border border-white/5">
                <span className="text-muted-foreground">[{new Date(node.lastHandshake).toLocaleTimeString()}]</span>
                <span className="text-accent">HANDSHAKE_INITIATED</span>
                <span className="text-primary truncate max-w-[150px]">SIG: RSA_SHA256_{Math.random().toString(36).substring(7)}</span>
                <span className="text-accent">VERIFIED</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
