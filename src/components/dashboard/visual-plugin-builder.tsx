"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Code, Plus, Zap, Box, Webhook, ShieldCheck, Globe, Loader2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { IntegrationBridge } from '@/lib/integration-bridge'

export function VisualPluginBuilder() {
  const [isBuilding, setIsBuilding] = useState(false)
  const [config, setConfig] = useState({
    name: '',
    webhookUrl: '',
    enableAutoSettlement: true,
    enableRiskAnalysis: true,
    events: ['PAYMENT_SETTLED', 'SOS_TRIGGERED']
  })
  
  const { toast } = useToast()

  const handleBuild = async () => {
    if (!config.name || !config.webhookUrl) {
      toast({ title: "তথ্য অপর্যাপ্ত", description: "নাম এবং ওয়েবহুক ইউআরএল প্রদান করুন।", variant: "destructive" })
      return
    }

    setIsBuilding(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const app = await IntegrationBridge.registerApp(config.name, config.webhookUrl, config.events)
      toast({ title: "প্লাগইন সক্রিয় হয়েছে", description: `App ID: ${app.appId}` })
      // Reset form or handle next steps
    } catch (e) {
      toast({ title: "বিল্ড ব্যর্থ", variant: "destructive" })
    } finally {
      setIsBuilding(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-700">
      <div className="lg:col-span-7 space-y-6">
        <Card className="bg-card/40 border-primary/20 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-white/5 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Box size={24} />
              </div>
              <div>
                <CardTitle className="text-lg font-headline uppercase tracking-widest">Visual Plugin Builder</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-primary/60">Drag-and-Drop Integration Logic</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Plugin Identity Name</Label>
                <Input 
                  placeholder="e.g. MyStore Global Payout" 
                  value={config.name}
                  onChange={e => setConfig({...config, name: e.target.value})}
                  className="bg-background/50 border-white/10 h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Secure Webhook Destination</Label>
                <Input 
                  placeholder="https://api.yourdomain.com/webhook" 
                  value={config.webhookUrl}
                  onChange={e => setConfig({...config, webhookUrl: e.target.value})}
                  className="bg-background/50 border-white/10 h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <p className="text-xs font-bold">Auto-Settlement</p>
                  <p className="text-[9px] text-muted-foreground">0.5% commission collection</p>
                </div>
                <Switch checked={config.enableAutoSettlement} onCheckedChange={val => setConfig({...config, enableAutoSettlement: val})} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <p className="text-xs font-bold">Risk Analysis</p>
                  <p className="text-[9px] text-muted-foreground">AI behavioral protection</p>
                </div>
                <Switch checked={config.enableRiskAnalysis} onCheckedChange={val => setConfig({...config, enableRiskAnalysis: val})} />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleBuild} 
                disabled={isBuilding}
                className="w-full h-14 bg-primary text-background font-bold text-lg rounded-2xl gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              >
                {isBuilding ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                ENGAGE PLUGIN GRID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-black/40 border-accent/20 rounded-[2.5rem] overflow-hidden flex flex-col h-full">
          <CardHeader className="bg-accent/10 border-b border-white/5 py-4">
            <CardTitle className="text-xs font-headline uppercase tracking-widest text-accent flex items-center gap-2">
              <Code size={16} /> Generated Manifest
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="flex-1 bg-slate-950 rounded-2xl p-4 font-mono text-[10px] text-accent/80 overflow-auto">
              <p className="text-muted-foreground mb-4">// Imperial Sovereign Manifest v34.0</p>
              <pre>
{`{
  "plugin_name": "${config.name || 'UNNAMED'}",
  "version": "1.0.0_SOV",
  "security": "RSA_V2_SHA256",
  "endpoint": "${config.webhookUrl || 'PENDING'}",
  "capabilities": {
    "auto_settle": ${config.enableAutoSettlement},
    "risk_audit": ${config.enableRiskAnalysis}
  },
  "commission": "0.5%",
  "purity": "VERIFIED_IMPERIAL"
}`}
              </pre>
            </div>
            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
               <div className="flex items-center gap-2 text-primary mb-2">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Sovereign Protection</span>
               </div>
               <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                 আপনার প্লাগইনটি ৪২টি নোডে একীভূত হওয়ার সময় স্বয়ংক্রিয়ভাবে একটি রাজকীয় সিকিউরিটি টোকেন প্রাপ্ত হবে।
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
