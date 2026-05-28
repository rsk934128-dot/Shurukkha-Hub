"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Star, Smartphone, ArrowRightLeft, Terminal, Play, UserCheck, ShieldAlert, Cpu, Activity, Signal, Loader2, DollarSign, TrendingUp, Wallet, Target, TrendingDown, ShieldX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StripeBankSync, BankNode } from '@/lib/stripe-bank-sync'
import { PaymentHandler } from '@/lib/payment-handler'
import { FraudRecovery } from '@/lib/fraud-recovery-protocol'
import { EconomicForecaster } from '@/lib/economic-forecaster'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { MerchantGrowthChart } from '@/components/dashboard/merchant-growth-chart'
import { AppLogo } from '@/components/ui/app-logo'

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [fraudStats, setFraudStats] = useState(FraudRecovery.getStats())
  const [marketTrends, setMarketTrends] = useState(EconomicForecaster.getMarketTrends())
  
  const [revenueStats, setRevenueStats] = useState({
    totalProcessed: 12450000,
    totalFees: 186750,
    activeMerchants: 42
  })
  
  const { toast } = useToast()

  useEffect(() => {
    handleSync()
  }, [])

  const handleSync = async () => {
    setLoading(true)
    try {
      const data = await StripeBankSync.fetchGlobalBanks()
      setBanks(data)
      setFraudStats(FraudRecovery.getStats())
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
    { id: 1, label: 'Auth', icon: Signal },
    { id: 2, label: 'Tax', icon: DollarSign },
    { id: 3, label: 'Risk', icon: ShieldCheck },
    { id: 4, label: 'Vault', icon: Landmark },
    { id: 5, label: 'Settle', icon: Activity },
  ]

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden relative">
      {/* Background Sovereign Logo Watermark */}
      <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none">
        <AppLogo size={300} />
      </div>

      <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-lg md:rounded-xl flex items-center justify-center border border-primary/20">
              <AppLogo size={24} />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg font-headline flex items-center gap-2">
                GLOBAL TREASURY HUB
              </CardTitle>
              <CardDescription className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60">
                Phase 31.0 • Sovereign Prosperity Protocol Active
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              <Input 
                placeholder="বাজারে ব্যাংক খুঁজুন..." 
                className="pl-8 h-8 md:h-9 bg-background/50 border-white/10 text-[10px] md:text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="h-8 md:h-9 border-primary/20 text-primary gap-1 md:gap-2 px-2 md:px-3">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden xs:inline text-[10px]">SYNC</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="revenue" className="flex-1 flex flex-col relative z-10">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="revenue" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><TrendingUp size={12}/> রেভিনিউ</TabsTrigger>
            <TabsTrigger value="fraud" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold whitespace-nowrap"><ShieldX size={12}/> ফ্রড রিকভারি</TabsTrigger>
            <TabsTrigger value="global" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold whitespace-nowrap"><Globe size={12}/> গ্লোবাল ব্যাংকস</TabsTrigger>
            <TabsTrigger value="local" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold whitespace-nowrap"><Smartphone size={12}/> লোকাল লুপ</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-primary/5 border-primary/20 p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                    <AppLogo size={80} />
                  </div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary truncate">Total Processed (V31.0)</p>
                  <h3 className="text-sm md:text-2xl font-headline font-bold text-foreground">৳{revenueStats.totalProcessed.toLocaleString()}</h3>
                </Card>
                <Card className="bg-accent/5 border-accent/20 p-4 md:p-6 space-y-2 md:space-y-4 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-5 rotate-12">
                    <AppLogo size={80} variant="accent" />
                  </div>
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-accent truncate">Imperial Tax (1.5%)</p>
                  <h3 className="text-sm md:text-2xl font-headline font-bold text-accent">৳{revenueStats.totalFees.toLocaleString()}</h3>
                </Card>
                <Card className="bg-muted/20 border-white/10 p-4 md:p-6 space-y-2 md:space-y-4 col-span-2 md:col-span-1">
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Growth Curve</p>
                  <h3 className="text-sm md:text-2xl font-headline font-bold text-foreground">92/100</h3>
                </Card>
              </div>
              <div className="overflow-hidden">
                <MerchantGrowthChart />
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl space-y-4">
                <h4 className="text-[10px] md:text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                  <Activity size={16} className="text-primary" /> Market Trends
                </h4>
                <div className="space-y-3">
                  {marketTrends.map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-2 md:p-3 bg-black/40 rounded-xl border border-white/5">
                      <span className="text-[10px] md:text-xs font-bold">{t.sector}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs text-accent font-bold">{t.growth}</span>
                        <Badge variant="outline" className="text-[6px] md:text-[8px] h-4 uppercase">{t.trend}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-destructive/5 border-destructive/20 p-4 md:p-6 space-y-2 md:space-y-4">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-destructive truncate">Frozen Funds</p>
              <h3 className="text-sm md:text-2xl font-headline font-bold text-destructive">৳{fraudStats.totalFrozen.toLocaleString()}</h3>
            </Card>
            <Card className="bg-accent/5 border-accent/20 p-4 md:p-6 space-y-2 md:space-y-4">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-accent truncate">Recovery Rate</p>
              <h3 className="text-sm md:text-2xl font-headline font-bold text-accent">{fraudStats.recoveryRate}</h3>
            </Card>
            <Card className="bg-muted/20 border-white/10 p-4 md:p-6 space-y-2 md:space-y-4 col-span-2 md:col-span-1">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Cases</p>
              <h3 className="text-sm md:text-2xl font-headline font-bold text-foreground">{fraudStats.activeCases}</h3>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="flex-1 p-0 m-0 overflow-hidden">
          <ScrollArea className="h-[500px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Country</TableHead>
                    <TableHead className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Bank Name</TableHead>
                    <TableHead className="hidden md:table-cell text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanks.map((bank) => (
                    <TableRow key={bank.id} className="group hover:bg-primary/5 border-white/5">
                      <TableCell><span className="text-[10px] md:text-xs font-bold">{bank.country}</span></TableCell>
                      <TableCell><span className="text-[10px] md:text-sm font-headline font-medium truncate max-w-[80px] md:max-w-none block">{bank.bankName}</span></TableCell>
                      <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-[8px]">{bank.status}</Badge></TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="ghost" className="h-7 text-[8px]" disabled={!bank.pushAvailable}>PUSH</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="local" className="flex-1 p-4 md:p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 overflow-x-auto no-scrollbar">
                <div className="flex items-center justify-between mb-6 min-w-[300px]">
                  <h4 className="text-[10px] md:text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-primary animate-pulse" />
                    Atomic Settlement Visualizer (0.001ms)
                  </h4>
                  <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[8px]">V31_SOVEREIGN</Badge>
                </div>
                
                <div className="relative flex justify-between items-center px-4 min-w-[400px]">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 -z-10" />
                  {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = activeStep >= step.id;
                    const isCurrent = activeStep === step.id;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2 relative">
                        <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-background' : isCurrent ? 'bg-muted border-accent text-accent animate-pulse' : 'bg-card border-white/5 text-muted-foreground'}`}>
                          <Icon size={16} />
                        </div>
                        <span className={`text-[7px] md:text-[9px] font-bold uppercase tracking-tighter text-center max-w-[60px] md:max-w-[80px] ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
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
                <CardHeader className="bg-accent/5 border-b border-accent/10 py-3 p-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-[10px] font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> ENGINE Terminal (Anycast v3)
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleWebhookTest} disabled={loading} className="h-6 md:h-7 text-[8px] bg-primary text-background font-bold px-2">
                      WEBHOOK
                    </Button>
                    <Button size="sm" onClick={handleDummyTest} disabled={loading} className="h-6 md:h-7 text-[8px] bg-accent text-background font-bold px-2">
                      RUN TEST
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[200px] md:h-[250px] bg-black/60 p-3 md:p-4">
                    {terminalLogs.length === 0 ? (
                      <p className="text-[9px] md:text-[10px] font-mono text-muted-foreground italic">Waiting for command from Sovereign Admin...</p>
                    ) : (
                      <div className="space-y-1">
                        {terminalLogs.map((log, i) => (
                          <div key={i} className="text-[9px] md:text-[10px] font-mono text-accent/80 leading-relaxed">
                            <span className="text-accent mr-1 md:mr-2">&gt;</span> {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
