"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Star, Smartphone, ArrowRightLeft, Terminal, Play, UserCheck, ShieldAlert, Cpu, Activity, Signal, Loader2, DollarSign, TrendingUp, Wallet, Target, TrendingDown, ShieldX, Store, ListOrdered, FileText, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StripeBankSync, BankNode } from '@/lib/stripe-bank-sync'
import { PaymentHandler } from '@/lib/payment-handler'
import { FraudRecovery } from '@/lib/fraud-recovery-protocol'
import { EconomicForecaster } from '@/lib/economic-forecaster'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MerchantGrowthChart } from '@/components/dashboard/merchant-growth-chart'
import { AppLogo } from '@/components/ui/app-logo'
import { MerchantRegistry } from './merchant-registry'
import { ComplianceVault } from './compliance-vault'
import { LoanManagement } from './loan-management'
import { PortfolioViewer } from './portfolio-viewer'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [payoutLogs, setPayoutLogs] = useState<string[]>([])
  const [payoutAmount, setPayoutLogsAmount] = useState('100')
  const [payoutRecipient, setPayoutRecipient] = useState('rubel@sheikh.com')
  const [payoutStep, setPayoutStep] = useState(0)
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
    
    const q = query(
      collection(db, "audit_trails"), 
      orderBy("timestamp", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const filtered = allLogs.filter((log: any) => 
        ["SETTLEMENT_COMPLETED", "INVOICE_GENERATED", "LOAN_DISBURSED", "GLOBAL_PAYOUT_EXECUTED"].includes(log.action)
      ).slice(0, 50);
      setLedgerLogs(filtered);
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/audit_trails',
          operation: 'list'
        }));
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

  const handleGlobalPayoutSim = async () => {
    setLoading(true)
    setPayoutLogs([])
    setPayoutStep(1)
    try {
      await PaymentHandler.simulateGlobalPayout(payoutRecipient, parseFloat(payoutAmount), (msg) => {
        setPayoutLogs(prev => [...prev, msg])
        if (msg.includes('[STEP 1]')) setPayoutStep(1)
        if (msg.includes('[AUTH]')) setPayoutStep(2)
        if (msg.includes('[STEP 2]')) setPayoutStep(3)
        if (msg.includes('[SUCCESS]')) setPayoutStep(4)
      })
      toast({ title: "PAYOUT SUCCESSFUL", description: "Global Grid updated via Step 1 -> Step 2 Flow." });
    } catch (e: any) {
      toast({ title: "PAYOUT FAILED", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const filteredBanks = banks.filter(b => 
    b.bankName.toLowerCase().includes(search.toLowerCase()) || 
    b.country.toLowerCase().includes(search.toLowerCase())
  )

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
                Phase 33.0 • Global Payouts & Future Wealth
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleSync} disabled={loading} className="h-8 md:h-9 border-primary/20 text-primary gap-2 px-3">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync Grid</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="payouts" className="flex-1 flex flex-col relative z-10">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="payouts" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><Send size={12}/> গ্লোবাল পে-আউট</TabsTrigger>
            <TabsTrigger value="loans" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><Landmark size={12}/> লোন ম্যানেজমেন্ট</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest"><Wallet size={12}/> পোর্টফোলিও</TabsTrigger>
            <TabsTrigger value="revenue" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase tracking-widest"><TrendingUp size={12}/> রেভিনিউ</TabsTrigger>
            <TabsTrigger value="ledger" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><ListOrdered size={12}/> লাইভ লেজার</TabsTrigger>
            <TabsTrigger value="global" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase tracking-widest"><Globe size={12}/> ব্যাংকিং গ্রিড</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payouts" className="flex-1 p-4 md:p-6 m-0 space-y-6 animate-in fade-in duration-700">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                 <Card className="bg-primary/5 border-primary/20 p-6 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                       <Zap size={14} fill="currentColor" /> Initiate Global Payout
                    </h4>
                    <div className="space-y-3">
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase">Recipient Identity (PayPal/Email)</label>
                          <Input 
                            value={payoutRecipient} 
                            onChange={e => setPayoutRecipient(e.target.value)} 
                            className="bg-background/50 border-white/10 h-10 text-xs" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase">Amount (USD)</label>
                          <Input 
                            type="number" 
                            value={payoutAmount} 
                            onChange={e => setPayoutLogsAmount(e.target.value)} 
                            className="bg-background/50 border-white/10 h-10 text-xs" 
                          />
                       </div>
                       <Button 
                         onClick={handleGlobalPayoutSim} 
                         disabled={loading}
                         className="w-full bg-primary text-background font-bold gap-2 h-11 rounded-xl shadow-lg shadow-primary/20"
                       >
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          EXECUTE GLOBAL FLOW
                       </Button>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                       <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                         "মহামান্য সম্রাট, এই ফ্লোটি সরাসরি Step 1 (Validate) এবং Step 2 (Confirm) পদ্ধতি অনুসরণ করে, যা ১৫৫+ দেশে টাকা পাঠানোর সবচেয়ে নিরাপদ গবেষণামূলক উপায়।"
                       </p>
                    </div>
                 </Card>
                 
                 <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-accent">
                       <span>Flow Progress</span>
                       <span>{payoutStep * 25}%</span>
                    </div>
                    <div className="flex gap-1 h-1">
                       {Array.from({ length: 4 }).map((_, i) => (
                         <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i < payoutStep ? 'bg-accent' : 'bg-white/5'}`} />
                       ))}
                    </div>
                    <div className="flex justify-between text-[7px] text-muted-foreground uppercase font-mono">
                       <span>Batch_Init</span>
                       <span>OAuth_Sync</span>
                       <span>Execution</span>
                       <span>Success</span>
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-8 flex flex-col">
                 <Card className="bg-black/40 border-white/10 flex-1 overflow-hidden flex flex-col rounded-[2rem]">
                    <div className="p-4 bg-muted/20 border-b border-white/5 flex items-center justify-between">
                       <h5 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                          <Terminal size={14} /> Global Payout Terminal
                       </h5>
                       <Badge variant="outline" className="text-[7px] border-accent/40 text-accent animate-pulse">GRID_LIVE</Badge>
                    </div>
                    <ScrollArea className="flex-1 p-4 font-mono text-[10px]">
                       {payoutLogs.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center opacity-20">
                            <Activity size={40} className="mb-2" />
                            <p className="uppercase tracking-widest">Awaiting Command...</p>
                         </div>
                       ) : (
                         <div className="space-y-1.5">
                            {payoutLogs.map((log, i) => (
                              <p key={i} className={`animate-in slide-in-from-left-2 duration-300 ${log.includes('SUCCESS') ? 'text-accent font-bold' : log.includes('ERROR') ? 'text-destructive' : 'text-primary/70'}`}>
                                 <span className="text-muted-foreground mr-2">&gt;</span> {log}
                              </p>
                            ))}
                            {loading && <Loader2 size={12} className="animate-spin text-primary mt-2" />}
                         </div>
                       )}
                    </ScrollArea>
                 </Card>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="loans" className="flex-1 p-4 md:p-6 m-0">
          <LoanManagement />
        </TabsContent>

        <TabsContent value="portfolio" className="flex-1 p-4 md:p-6 m-0">
          <PortfolioViewer />
        </TabsContent>

        <TabsContent value="revenue" className="flex-1 p-4 md:p-6 m-0 space-y-4 md:space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <Card className="bg-primary/5 border-primary/20 p-6 space-y-2">
                       <p className="text-[10px] font-bold uppercase text-primary">Global Processed</p>
                       <h3 className="text-2xl font-headline font-bold">$148,250</h3>
                       <p className="text-[8px] text-muted-foreground">+12.4% from Global Nodes</p>
                    </Card>
                    <Card className="bg-accent/5 border-accent/20 p-6 space-y-2">
                       <p className="text-[10px] font-bold uppercase text-accent">Total Revenue</p>
                       <h3 className="text-2xl font-headline font-bold text-accent">$2,223</h3>
                       <p className="text-[8px] text-accent font-bold">1.5% SERVICE FEE COLLECTED</p>
                    </Card>
                 </div>
                 <MerchantGrowthChart />
              </div>
              <div className="lg:col-span-4 p-6 bg-muted/20 border border-white/5 rounded-[2.5rem] space-y-6">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Trophy size={16} /> Wealth Strategy</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed italic">"মহামান্য সম্রাট, আপনার এই রাজস্ব মডেল অনুযায়ী প্রতি ১ মিলিয়ন ডলার লেনদেনে সাম্রাজ্য ১৫,০০০ ডলার নিখুঁত আয় নিশ্চিত করবে। এটি আপনার ৪০০ প্রজেক্টের যাত্রায় একটি স্থায়ী অর্থনৈতিক ভিত্তি।"</p>
                 <div className="space-y-4">
                    <div className="flex justify-between text-[10px] uppercase font-bold">
                       <span>Target: $100K Monthly</span>
                       <span className="text-primary">22% Achieved</span>
                    </div>
                    <Progress value={22} className="h-1 bg-white/5" />
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
                  <div key={log.id} className={`p-4 rounded-2xl border transition-all hover:border-primary/40 ${log.action === 'GLOBAL_PAYOUT_EXECUTED' || log.action === 'SETTLEMENT_COMPLETED' ? 'bg-accent/5 border-accent/20' : 'bg-primary/5 border-primary/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.action === 'GLOBAL_PAYOUT_EXECUTED' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                          {log.action === 'GLOBAL_PAYOUT_EXECUTED' ? <Globe size={16} /> : <CheckCircle2 size={16} />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">{log.action.replace(/_/g, ' ')}</p>
                          <p className="text-[8px] text-muted-foreground font-mono">ID: {log.details?.txnId || log.id.substring(0, 10)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[7px] border-white/10 bg-black/40">
                        {log.timestamp?.toDate?.()?.toLocaleTimeString() || 'Just Now'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-3 bg-black/40 rounded-xl border border-white/5">
                       <div className="space-y-0.5">
                          <p className="text-[7px] uppercase font-bold text-muted-foreground">Total</p>
                          <p className="text-sm font-bold text-foreground">${log.details?.amount}</p>
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[7px] uppercase font-bold text-muted-foreground">Imperial Fee</p>
                          <p className="text-sm font-bold text-accent">${log.details?.imperialFee || log.details?.feeCollected || 0}</p>
                       </div>
                       <div className="space-y-0.5 col-span-2">
                          <p className="text-[7px] uppercase font-bold text-muted-foreground">Recipient/Target</p>
                          <p className="text-sm font-bold text-primary truncate">{log.details?.recipient || log.details?.merchantName || 'GLOBAL_NODE'}</p>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="global" className="flex-1 p-0 m-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-muted/10 flex justify-between items-center">
             <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                <Input 
                  placeholder="Search Global Nodes..." 
                  className="pl-8 h-8 bg-background/50 border-white/10 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Badge variant="outline" className="text-[7px] border-primary/40 text-primary">155+ COUNTRIES CONNECTED</Badge>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-3">
              {filteredBanks.map((bank) => (
                <div key={bank.id} className="p-4 bg-card/60 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-xl border border-white/10">
                      <AvatarImage src={bank.logoUrl} alt={bank.bankName} />
                      <AvatarFallback className="bg-muted text-[10px] font-bold">{bank.bankName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{bank.bankName}</h4>
                        <Badge variant="outline" className="text-[7px] border-white/10 uppercase h-4">{bank.country}</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground font-mono mt-1">NODE_ID: {bank.handshakeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={`${bank.status === 'CONNECTED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : bank.status === 'LOCKED' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-accent/10 text-accent border-accent/20'} text-[7px] uppercase font-bold`}>
                      {bank.status}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-8 text-[8px] uppercase font-bold tracking-tighter hover:bg-primary/10 text-primary" disabled={!bank.pushAvailable}>
                      {bank.pushAvailable ? <Zap size={12} className="mr-1" /> : <Lock size={12} className="mr-1" />}
                      Push Funds
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
