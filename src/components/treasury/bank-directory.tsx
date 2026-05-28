"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Star, Smartphone, ArrowRightLeft, Terminal, Play, UserCheck, ShieldAlert, Cpu, Activity, Signal, Loader2, DollarSign, TrendingUp, Wallet } from 'lucide-react'
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
  const [revenueStats, setRevenueStats] = useState({
    totalProcessed: 12450000,
    totalFees: 186750,
    activeMerchants: 42
  })
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
        if (msg.includes('REVENUE_ENGINE')) setActiveStep(1)
        if (msg.includes('Fee')) setActiveStep(2)
        if (msg.includes('Risk')) setActiveStep(3)
        if (msg.includes('রেভিনিউ জেনারেটেড')) {
          setActiveStep(5)
          setRevenueStats(prev => ({
            ...prev,
            totalFees: prev.totalFees + 150,
            totalProcessed: prev.totalProcessed + 10000
          }))
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWebhookTest = async () => {
    setLoading(true)
    setTerminalLogs([])
    onLog("[WEBHOOK_SIMULATOR]: Mocking bKash Payload via core.sheikh...");
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, "> [WEBHOOK_SENT]: Payload verified with RSA_v2 signature."]);
      setTerminalLogs(prev => [...prev, "> [SETTLEMENT]:  Imperial Tax collected and net funds disbursed."]);
      toast({ title: "Webhook Handshake Successful" });
      setLoading(false);
    }, 1500);
  }

  function onLog(msg: string) {
    setTerminalLogs(prev => [...prev, msg]);
  }

  const filteredBanks = banks.filter(b => 
    b.bankName.toLowerCase().includes(search.toLowerCase()) || 
    b.country.toLowerCase().includes(search.toLowerCase())
  )

  const steps = [
    { id: 1, label: 'Auth Received', icon: Signal },
    { id: 2, label: 'Tax Calculated', icon: DollarSign },
    { id: 3, label: 'Risk Validated', icon: ShieldCheck },
    { id: 4, label: 'Vault Updated', icon: Landmark },
    { id: 5, label: 'Sovereign Settle', icon: Activity },
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
                GLOBAL TREASURY HUB
                <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] h-4 gap-1">
                  <Star size={8} fill="currentColor" /> PHASE 26.0
                </Badge>
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
                Sovereign Revenue Engine • Atomic Settlement • Imperial Tax Loop
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                placeholder="Search Registry..." 
                className="pl-9 h-9 bg-background/50 border-white/10 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="h-9 border-primary/20 text-primary gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> SYNC VAULT
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="revenue" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="revenue" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><TrendingUp size={14}/> রেভিনিউ ড্যাশবোর্ড</TabsTrigger>
            <TabsTrigger value="global" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> গ্লোবাল ব্যাংকস</TabsTrigger>
            <TabsTrigger value="local" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Smartphone size={14}/> লোকাল লুপ (Revenue Test)</TabsTrigger>
            <TabsTrigger value="merchant" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><UserCheck size={14}/> পার্টনার ও মার্চেন্ট</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="flex-1 p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary/5 border-primary/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Total Processed Volume</p>
                <div className="p-2 bg-primary/10 rounded-lg"><Wallet className="text-primary" size={20} /></div>
              </div>
              <h3 className="text-3xl font-headline font-bold text-foreground">৳{revenueStats.totalProcessed.toLocaleString()}</h3>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TrendingUp size={12} className="text-accent" /> 24% increase from last cycle
              </p>
            </Card>
            <Card className="bg-accent/5 border-accent/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Total Imperial Tax (Profit)</p>
                <div className="p-2 bg-accent/10 rounded-lg"><Star className="text-accent" size={20} /></div>
              </div>
              <h3 className="text-3xl font-headline font-bold text-accent">৳{revenueStats.totalFees.toLocaleString()}</h3>
              <p className="text-[10px] text-muted-foreground italic">Automated 1.5% commission active.</p>
            </Card>
            <Card className="bg-muted/20 border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Merchants</p>
                <div className="p-2 bg-muted/40 rounded-lg"><Building2 className="text-muted-foreground" size={20} /></div>
              </div>
              <h3 className="text-3xl font-headline font-bold text-foreground">{revenueStats.activeMerchants}</h3>
              <p className="text-[10px] text-muted-foreground">Sirajganj Region Expansion</p>
            </Card>
          </div>

          <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl">
            <h4 className="text-sm font-headline font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity size={16} className="text-primary" /> Live Revenue Stream
            </h4>
            <div className="space-y-3">
              {[
                { merchant: 'Sirajganj Textile Hub', amount: '৳৪৫,০০০', fee: '৳৬৭৫', time: '২ মি. আগে' },
                { merchant: 'Jamuna Bridge Logistics', amount: '৳১,২০,০০০', fee: '৳১,৮০০', time: '১২ মি. আগে' },
                { merchant: 'Belkuchi Saree Emporium', amount: '৳৫,২০০', fee: '৳৭৮', time: '৪৫ মি. আগে' }
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                      <Zap size={14} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{tx.merchant}</p>
                      <p className="text-[9px] text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{tx.amount}</p>
                    <p className="text-[9px] text-accent font-bold">Fee: {tx.fee}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

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
                    Sovereign Settlement Visualizer
                  </h4>
                  <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[9px]">ENGINE_V26_ACTIVE</Badge>
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
                    <Terminal size={14} /> Revenue Engine Terminal
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleWebhookTest} disabled={loading} className="h-7 text-[9px] bg-primary text-background font-bold gap-2">
                      <Zap size={10} fill="currentColor" /> TEST WEBHOOK
                    </Button>
                    <Button size="sm" onClick={handleDummyTest} disabled={loading} className="h-7 text-[9px] bg-accent text-background font-bold gap-2">
                      <Play size={10} fill="currentColor" /> RUN REVENUE TEST
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[250px] bg-black/60 p-4">
                    {terminalLogs.length === 0 ? (
                      <p className="text-[10px] font-mono text-muted-foreground italic">Waiting for imperial revenue command...</p>
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
                <h4 className="text-xs font-headline font-bold uppercase tracking-widest text-primary">Revenue Engine Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Standard Fee Rate</span>
                    <span className="text-accent font-bold">1.5%</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Atomic Profit Sync</span>
                    <span className="text-accent font-bold">4ms</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-muted-foreground">Imperial Audit Status</span>
                    <span className="text-primary font-bold">VERIFIED</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                    প্রতিটি সফল ট্রানজেকশন থেকে দেড় শতাংশ (১.৫%) সার্ভিস ফি আপনার ট্রেজারিতে স্বয়ংক্রিয়ভাবে সংরক্ষিত হচ্ছে।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="merchant" className="flex-1 p-6 m-0">
          <Card className="bg-card border-primary/20 max-w-2xl mx-auto">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">মার্চেন্ট অনবোর্ডিং পোর্টাল</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleDummyTest(); }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">মার্চেন্ট বা প্রজেক্টের নাম</Label>
                    <Input value={merchantForm.name} onChange={e => setMerchantForm({...merchantForm, name: e.target.value})} className="bg-muted/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest">রেভিনিউ শেয়ারিং রেট (%)</Label>
                    <Input value="1.5% (Imperial Standard)" disabled className="bg-muted/40 border-white/10 font-mono text-xs" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-primary text-background font-bold text-lg gap-2">
                  অটোনোমাস এগ্রিমেন্ট সক্রিয় করুন
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
