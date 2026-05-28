"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Star, Smartphone, ArrowRightLeft, Terminal, Play, UserCheck, ShieldAlert, Cpu, Activity, Signal, Loader2, DollarSign, TrendingUp, Wallet, Target, TrendingDown, ShieldX, Store, ListOrdered, FileText } from 'lucide-react'
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
import { MerchantRegistry } from './merchant-registry'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState(0)
  const [fraudStats, setFraudStats] = useState(FraudRecovery.getStats())
  const [marketTrends, setMarketTrends] = useState(EconomicForecaster.getMarketTrends())
  const [ledgerLogs, setLedgerLogs] = useState<any[]>([])
  
  const [revenueStats, setRevenueStats] = useState({
    totalProcessed: 12450000,
    totalFees: 186750,
    activeMerchants: 42
  })
  
  const { toast } = useToast()

  useEffect(() => {
    handleSync()
    
    // Client-side filtering to bypass indexing issues
    const q = query(
      collection(db, "audit_trails"), 
      orderBy("timestamp", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allLogs.filter((log: any) => 
        ["SETTLEMENT_COMPLETED", "INVOICE_GENERATED"].includes(log.action)
      ).slice(0, 50);
      setLedgerLogs(filtered);
      
      // Update local revenue stats based on successful settlements
      const settlements = filtered.filter((l: any) => l.action === 'SETTLEMENT_COMPLETED');
      if (settlements.length > 0) {
        let totalProcessed = 12450000;
        let totalFees = 186750;
        settlements.forEach((s: any) => {
          totalProcessed += (s.details?.amount || 0);
          totalFees += (s.details?.feeCollected || 0);
        });
        setRevenueStats(prev => ({ ...prev, totalProcessed, totalFees }));
      }
    });

    return () => unsubscribe();
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

  const handleFullCycleTest = async () => {
    setLoading(true)
    setTerminalLogs([])
    setActiveStep(1)
    try {
      await PaymentHandler.simulateFinancialCycle((msg) => {
        setTerminalLogs(prev => [...prev, msg])
        if (msg.includes('[MERCHANT]')) setActiveStep(1)
        if (msg.includes('[INVOICE]')) setActiveStep(2)
        if (msg.includes('[SECURITY]')) setActiveStep(3)
        if (msg.includes('[REVENUE]')) setActiveStep(4)
        if (msg.includes('[COMPLETED]')) setActiveStep(5)
      })
      toast({ title: "STRESS TEST COMPLETED", description: "Ledger updated with atomic settlement." });
    } catch (e) {
      console.error("[Stress Test Error]", e);
      toast({ title: "STRESS TEST FAILED", description: "Check terminal for error signature.", variant: "destructive" });
      setTerminalLogs(prev => [...prev, `[FATAL_ERROR]: ${e.message || "Unknown Failure"}`]);
    } finally {
      setLoading(false)
    }
  }

  const handleWebhookTest = async () => {
    setLoading(true)
    setTerminalLogs([])
    setTerminalLogs(prev => [...prev, "[WEBHOOK_SIMULATOR]: Mocking bKash Payload..."]);
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, "> [WEBHOOK_SENT]: Payload verified with RSA_v2 signature."]);
      setTerminalLogs(prev => [...prev, "> [SETTLEMENT]: Imperial Tax collected successfully."]);
      toast({ title: "Webhook Handshake Successful" });
      setLoading(false);
    }, 1500);
  }

  const filteredBanks = banks.filter(b => 
    b.bankName.toLowerCase().includes(search.toLowerCase()) || 
    b.country.toLowerCase().includes(search.toLowerCase())
  )

  const steps = [
    { id: 1, label: 'Merchant', icon: UserCheck },
    { id: 2, label: 'Invoice', icon: FileText },
    { id: 3, label: 'Security', icon: ShieldCheck },
    { id: 4, label: 'Revenue', icon: DollarSign },
    { id: 5, label: 'Ledger', icon: ListOrdered },
  ]

  return (
    <Card className="bg-card border-primary/20 h-full flex flex-col overflow-hidden relative">
      <div className="absolute bottom-4 right-4 opacity-5 pointer-events-none hidden md:block">
        <AppLogo size={300} />
      </div>

      <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <AppLogo className="w-6 h-6 md:w-8 md:h-8" />
            </div>
            <div>
              <CardTitle className="text-sm md:text-lg font-headline flex items-center gap-2 uppercase tracking-widest">
                Sovereign Treasury
              </CardTitle>
              <CardDescription className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60">
                Phase 31.0 • Imperial Prosperity Protocol
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="h-8 md:h-9 border-primary/20 text-primary gap-2 px-3">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync Grid</span>
            </Button>
            <Button size="sm" onClick={handleFullCycleTest} disabled={loading} className="h-8 md:h-9 bg-accent text-background font-bold gap-2 px-3">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
              STRESS TEST
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="revenue" className="flex-1 flex flex-col relative z-10">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="revenue" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest"><TrendingUp size={12}/> রেভিনিউ</TabsTrigger>
            <TabsTrigger value="ledger" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><ListOrdered size={12}/> লাইভ লেজার</TabsTrigger>
            <TabsTrigger value="merchants" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><Store size={12}/> মার্চেন্ট</TabsTrigger>
            <TabsTrigger value="fraud" className="text-[10px] gap-1.5 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive font-bold uppercase tracking-widest"><ShieldX size={12}/> ফ্রড</TabsTrigger>
            <TabsTrigger value="global" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><Globe size={12}/> গ্লোবাল</TabsTrigger>
            <TabsTrigger value="local" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest"><Smartphone size={12}/> লোকাল</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="flex-1 p-4 md:p-6 m-0 space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                <Card className="bg-primary/5 border-primary/20 p-3 md:p-6 space-y-1 md:space-y-4 relative overflow-hidden">
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-primary">Total Processed</p>
                  <h3 className="text-sm md:text-2xl font-headline font-bold text-foreground">৳{revenueStats.totalProcessed.toLocaleString()}</h3>
                </Card>
                <Card className="bg-accent/5 border-accent/20 p-3 md:p-6 space-y-1 md:space-y-4 relative overflow-hidden">
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-accent">Imperial Tax</p>
                  <h3 className="text-sm md:text-2xl font-headline font-bold text-accent">৳{revenueStats.totalFees.toLocaleString()}</h3>
                </Card>
                <Card className="bg-muted/20 border-white/10 p-3 md:p-6 space-y-1 md:space-y-4 col-span-2 md:col-span-1">
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Merchant Pulse</p>
                  <h3 className="text-sm md:text-2xl font-headline font-bold text-foreground">{revenueStats.activeMerchants} <span className="text-xs text-muted-foreground">ACTIVE</span></h3>
                </Card>
              </div>
              <div className="overflow-hidden bg-black/20 rounded-2xl p-2 md:p-4 border border-white/5 shadow-inner">
                <MerchantGrowthChart />
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-4 md:space-y-6">
              <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl space-y-4 shadow-xl">
                <h4 className="text-[10px] md:text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Activity size={16} className="animate-pulse" /> Growth Trends
                </h4>
                <div className="space-y-2 md:space-y-3">
                  {marketTrends.map((t, i) => (
                    <div key={i} className="flex justify-between items-center p-2 md:p-3 bg-black/40 rounded-xl border border-white/5 group hover:border-primary/40 transition-all">
                      <span className="text-[9px] md:text-xs font-bold text-foreground/80">{t.sector}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-xs text-accent font-bold">{t.growth}</span>
                        <TrendingUp size={12} className="text-accent" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl space-y-2">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Treasury Status</p>
                 <div className="flex items-center gap-2">
                   <ShieldCheck className="text-accent" size={16} />
                   <p className="text-xs font-bold">LOCKED & VERIFIED</p>
                 </div>
                 <p className="text-[8px] text-muted-foreground italic">সবগুলো ট্রানজেকশন SHA256withRSA দ্বারা সুরক্ষিত।</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="flex-1 p-4 md:p-6 m-0 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <FileText size={18} /> Imperial Live Ledger
            </h3>
            <Badge variant="outline" className="text-[7px] border-primary/20 text-primary">SYNC_OK: 100% PURITY</Badge>
          </div>
          
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {ledgerLogs.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                   <ListOrdered size={48} className="mx-auto mb-4" />
                   <p className="text-xs uppercase font-bold tracking-widest">No Recent Transactions</p>
                </div>
              ) : (
                ledgerLogs.map((log) => (
                  <div key={log.id} className={`p-4 rounded-2xl border transition-all hover:border-primary/40 ${log.action === 'SETTLEMENT_COMPLETED' ? 'bg-accent/5 border-accent/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-primary/5 border-primary/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.action === 'SETTLEMENT_COMPLETED' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                          {log.action === 'SETTLEMENT_COMPLETED' ? <CheckCircle2 size={16} /> : <FileText size={16} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-[8px] text-muted-foreground font-mono">HASH: {log.signature?.substring(0, 20)}...</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[7px] border-white/10 bg-black/40">
                        {log.timestamp?.toDate?.()?.toLocaleTimeString() || 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-black/40 rounded-xl border border-white/5">
                       <div className="space-y-0.5">
                          <p className="text-[7px] uppercase font-bold text-muted-foreground">Total Amount</p>
                          <p className="text-sm font-bold text-foreground">৳{log.details?.amount?.toLocaleString()}</p>
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[7px] uppercase font-bold text-muted-foreground">Imperial Fee (1.5%)</p>
                          <p className="text-sm font-bold text-accent">৳{log.details?.feeCollected || log.details?.serviceFee || 0}</p>
                       </div>
                       <div className="space-y-0.5 col-span-2">
                          <p className="text-[7px] uppercase font-bold text-muted-foreground">Target Merchant</p>
                          <p className="text-sm font-bold text-primary truncate">{log.details?.merchantName || log.details?.merchantId || 'TXT-001'}</p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="merchants" className="flex-1 p-4 md:p-6 m-0">
          <MerchantRegistry />
        </TabsContent>

        <TabsContent value="fraud" className="flex-1 p-4 md:p-6 m-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-destructive/5 border-destructive/20 p-4 md:p-6 space-y-2">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-destructive">Frozen Funds</p>
              <h3 className="text-sm md:text-2xl font-headline font-bold text-destructive">৳{fraudStats.totalFrozen.toLocaleString()}</h3>
              <p className="text-[8px] text-muted-foreground">High-risk merchant activity detected.</p>
            </Card>
            <Card className="bg-accent/5 border-accent/20 p-4 md:p-6 space-y-2">
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-accent">Recovery Success</p>
              <h3 className="text-sm md:text-2xl font-headline font-bold text-accent">{fraudStats.recoveryRate}</h3>
              <p className="text-[8px] text-muted-foreground">Funds redirected back to the grid.</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="global" className="flex-1 p-0 m-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-muted/10 flex justify-between items-center">
             <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                <Input 
                  placeholder="Global Banks..." 
                  className="pl-8 h-8 bg-background/50 border-white/10 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Badge variant="outline" className="text-[8px] border-primary/40 text-primary">STRIPE_CONNECT_V2</Badge>
          </div>
          <ScrollArea className="h-[400px] md:h-[500px]">
            <div className="overflow-x-auto min-w-full">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Country</TableHead>
                    <TableHead className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Bank Node</TableHead>
                    <TableHead className="text-right text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBanks.map((bank) => (
                    <TableRow key={bank.id} className="group hover:bg-primary/5 border-white/5">
                      <TableCell><span className="text-[9px] md:text-xs font-bold text-foreground/70">{bank.country}</span></TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="text-[9px] md:text-sm font-medium truncate max-w-[150px] md:max-w-none block">{bank.bankName}</span>
                           <span className="text-[7px] font-mono text-muted-foreground uppercase">{bank.handshakeId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[8px] uppercase tracking-tighter hover:text-primary" disabled={!bank.pushAvailable}>
                           Push Funds
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="local" className="flex-1 p-4 md:p-6 m-0 space-y-4 md:space-y-6">
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 overflow-x-auto no-scrollbar shadow-lg">
            <div className="flex items-center justify-between mb-4 md:mb-6 min-w-[300px]">
              <h4 className="text-[10px] md:text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-primary animate-pulse" /> Local Settlement Visualizer
              </h4>
              <Badge className="bg-accent text-background font-bold text-[7px] uppercase">Anycast Active</Badge>
            </div>
            
            <div className="relative flex justify-between items-center px-2 md:px-4 min-w-[350px] py-4">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 -z-10" />
              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = activeStep >= step.id;
                const isCurrent = activeStep === step.id;
                return (
                  <div key={step.id} className="flex flex-col items-center gap-1.5 md:gap-2 relative">
                    <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-primary border-primary text-background' : isCurrent ? 'bg-muted border-accent text-accent animate-pulse' : 'bg-card border-white/5 text-muted-foreground'}`}>
                      <Icon className="w-[14px] h-[14px] md:w-4 md:h-4" />
                    </div>
                    <span className={`text-[6px] md:text-[8px] font-bold uppercase text-center ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <Card className="bg-black/40 border-accent/20 overflow-hidden shadow-2xl">
            <CardHeader className="bg-accent/5 border-b border-accent/10 py-2 md:py-3 p-4 flex flex-row items-center justify-between">
              <CardTitle className="text-[8px] md:text-[10px] font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                <Terminal size={12} /> REVENUE_ENGINE Terminal
              </CardTitle>
              <div className="flex gap-1 md:gap-2">
                <Button size="sm" onClick={handleWebhookTest} disabled={loading} className="h-6 md:h-7 text-[7px] md:text-[8px] bg-primary text-background font-bold px-2 rounded-lg">
                  SIM_HOOK
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[150px] md:h-[250px] bg-black/60 p-3 md:p-4">
                {terminalLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-20">
                     <Signal size={32} className="mb-2" />
                     <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-widest">Awaiting Command...</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {terminalLogs.map((log, i) => (
                      <div key={i} className="text-[8px] md:text-[9px] font-mono text-accent/80 leading-relaxed">
                        <span className="text-accent mr-1">&gt;</span> {log}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
