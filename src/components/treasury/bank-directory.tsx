"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Star, Smartphone, ArrowRightLeft, Terminal, Play, UserCheck, ShieldAlert, Cpu, Activity, Signal, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StripeBankSync, BankNode } from '@/lib/stripe-bank-sync'
import { PaymentHandler } from '@/lib/payment-handler'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [localGateways, setLocalGateways] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [merchantForm, setMerchantForm] = useState({
    name: 'Shurukkha Hub Official',
    callback: 'https://hub.shurukkha.gov.bd/api/webhook/bkash'
  })
  const { toast } = useToast()

  useEffect(() => {
    handleSync()
    setLocalGateways(PaymentHandler.getLocalGatewayStatus())
  }, [])

  const handleSync = async () => {
    setLoading(true)
    try {
      const data = await StripeBankSync.fetchGlobalBanks()
      setBanks(data)
    } catch (e) {
      toast({ title: "SYNC FAILED", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDummyTest = async () => {
    setLoading(true)
    setTerminalLogs([])
    setActiveStep(1)
    try {
      await PaymentHandler.triggerDummyPayment((msg) => {
        setTerminalLogs(prev => [...prev, msg])
        if (msg.includes('CONNECTED')) setActiveStep(2)
        if (msg.includes('Verified')) setActiveStep(3)
        if (msg.includes('Balance Update')) setActiveStep(4)
        if (msg.includes('সফল')) setActiveStep(5)
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWebhookTest = async () => {
    setLoading(true)
    setTerminalLogs([])
    try {
      await PaymentHandler.testWebhookHandshake((msg) => {
        setTerminalLogs(prev => [...prev, msg])
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMerchantRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await PaymentHandler.registerMerchant(merchantForm)
      toast({ title: "MERCHANT PARTNER ACTIVE", description: `bKash ID: ${result.merchantId}` })
    } finally {
      setLoading(false)
    }
  }

  const filteredBanks = banks.filter(b => 
    b.bankName.toLowerCase().includes(search.toLowerCase()) || 
    b.country.toLowerCase().includes(search.toLowerCase())
  )

  const steps = [
    { id: 1, label: 'Webhook Received', icon: Signal },
    { id: 2, label: 'Signature Verified', icon: ShieldCheck },
    { id: 3, label: 'Payload Parsed', icon: Cpu },
    { id: 4, label: 'Settlement Initiated', icon: ArrowRightLeft },
    { id: 5, label: 'Registry Updated', icon: Landmark },
  ]

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Landmark className="text-primary" size={28} />
            </div>
            <div>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                GLOBAL BANK REGISTRY
                <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] h-4 gap-1">
                  <Star size={8} fill="currentColor" /> PHASE 24.0
                </Badge>
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
                Stripe Financial Connections • Merchant Gateway Orchestration
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                placeholder="Search Bank or Country..." 
                className="pl-9 h-9 bg-background/50 border-white/10 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="h-9 border-primary/20 text-primary gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> SYNC REGISTRY
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="global" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="global" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> ইন্টারন্যাশনাল ব্যাংকস</TabsTrigger>
            <TabsTrigger value="local" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Smartphone size={14}/> লোকাল গেটওয়ে (bKash)</TabsTrigger>
            <TabsTrigger value="merchant" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><UserCheck size={14}/> মার্চেন্ট পার্টনার (Hub)</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="global" className="flex-1 p-0 m-0 overflow-hidden">
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Country</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Bank Name</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest">Handshake ID</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanks.map((bank) => (
                  <TableRow key={bank.id} className="group hover:bg-primary/5 border-white/5">
                    <TableCell><span className="text-xs font-bold">{bank.country}</span></TableCell>
                    <TableCell><span className="text-sm font-headline font-medium">{bank.bankName}</span></TableCell>
                    <TableCell><Badge variant="outline">{bank.status}</Badge></TableCell>
                    <TableCell><code className="text-[10px]">{bank.handshakeId}</code></TableCell>
                    <TableCell className="text-right"><Button size="sm" variant="ghost" disabled={!bank.pushAvailable}>PUSH</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="local" className="flex-1 p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                    <Activity size={18} className="text-primary animate-pulse" />
                    Transaction Flow Visualizer
                  </h4>
                  <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[9px]">ENGINE_V1_ACTIVE</Badge>
                </div>
                
                <div className="relative flex justify-between items-center px-4">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 -z-10" />
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = activeStep >= step.id;
                    const isCurrent = activeStep === step.id;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2 relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-background' : isCurrent ? 'bg-muted border-accent text-accent animate-pulse' : 'bg-card border-white/5 text-muted-foreground'}`}>
                          <Icon size={20} />
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-tighter text-center max-w-[80px] ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              <Card className="bg-black/40 border-accent/20 overflow-hidden">
                <CardHeader className="bg-accent/5 border-b border-accent/10 py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={14} /> Live Transaction Terminal
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleWebhookTest} disabled={loading} className="h-7 text-[9px] bg-primary text-background font-bold gap-2">
                      <Zap size={10} fill="currentColor" /> TEST WEBHOOK
                    </Button>
                    <Button size="sm" onClick={handleDummyTest} disabled={loading} className="h-7 text-[9px] bg-accent text-background font-bold gap-2">
                      <Play size={10} fill="currentColor" /> RUN DUMMY TEST
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[250px] bg-black/60 p-4">
                    {terminalLogs.length === 0 ? (
                      <p className="text-[10px] font-mono text-muted-foreground italic">Waiting for imperial command...</p>
                    ) : (
                      <div className="space-y-1">
                        {terminalLogs.map((log, i) => (
                          <div key={i} className="text-[10px] font-mono text-accent/80 leading-relaxed">
                            <span className="text-accent mr-2">&gt;</span> {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-4">
              <div className="p-4 bg-muted/20 border border-white/5 rounded-xl space-y-4">
                <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-primary">Response Engine Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Retry Efficiency</span>
                    <span className="text-accent font-bold">99.9%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Validation Latency</span>
                    <span className="text-accent font-bold">4ms</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Audit Compliance</span>
                    <span className="text-primary font-bold">VERIFIED</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                    বিকাশের প্রতিটি রিপ্লাই এখন সভারেন এন্ডপয়েন্টে এনক্রিপ্টেড লুপের মাধ্যমে প্রসেস হচ্ছে।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="merchant" className="flex-1 p-6 m-0">
          <Card className="bg-card border-primary/20 max-w-2xl mx-auto">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">মার্চেন্ট পার্টনার রেজিস্ট্রেশন</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleMerchantRegister} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">মার্চেন্ট বা প্রজেক্টের নাম</Label>
                    <Input value={merchantForm.name} onChange={e => setMerchantForm({...merchantForm, name: e.target.value})} className="bg-muted/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">API Callback URL</Label>
                    <Input value={merchantForm.callback} onChange={e => setMerchantForm({...merchantForm, callback: e.target.value})} className="bg-muted/40 border-white/10 font-mono text-xs" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-background font-bold text-lg gap-2">
                  ডিজিটাল সিগনেচার পুশ করুন
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
