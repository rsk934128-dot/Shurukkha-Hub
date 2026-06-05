"use client"

import React, { useState, useEffect } from 'react'
import { Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Terminal, UserCheck, Activity, Signal, Loader2, DollarSign, TrendingUp, Wallet, ListOrdered, FileText, Smartphone, Network, Key, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { StripeBankSync, BankNode } from '@/lib/stripe-bank-sync'
import { PaymentHandler } from '@/lib/payment-handler'
import { OpenBankingAdapter, BankingConsent } from '@/lib/open-banking-adapter'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MerchantGrowthChart } from '@/components/dashboard/merchant-growth-chart'
import { AppLogo } from '@/components/ui/app-logo'
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
  const [ledgerLogs, setLedgerLogs] = useState<any[]>([])
  const [consents, setConsents] = useState<BankingConsent[]>([])
  
  const { toast } = useToast()

  useEffect(() => {
    handleSync()
    
    const q = query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((log: any) => ["SETTLEMENT_COMPLETED", "LOAN_DISBURSED", "GLOBAL_PAYOUT_EXECUTED"].includes(log.action))
        .slice(0, 50);
      setLedgerLogs(filtered);
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/audit_trails', operation: 'list' }));
      }
    });

    return () => unsubscribe();
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

  const handleRequestConsent = async (bankId: string) => {
    try {
      const conId = await OpenBankingAdapter.requestConsent(bankId, ['READ_BALANCE', 'INIT_PAYMENT']);
      toast({ title: "CONSENT REQUESTED", description: `FAPI Handshake ID: ${conId}` });
    } catch (e) {
      toast({ title: "HANDSHAKE FAILED", variant: "destructive" });
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
      toast({ title: "PAYOUT SUCCESSFUL" });
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
      <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6">
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
                Phase 33.5 • Unified Aggregator & Open Banking
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5 gap-1.5 py-1 text-[8px] md:text-[10px]">
              <Network size={12} /> AGGREGATOR_ACTIVE
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="payouts" className="flex-1 flex flex-col">
        <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
          <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
            <TabsTrigger value="payouts" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase">পে-আউট</TabsTrigger>
            <TabsTrigger value="loans" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase">লোন</TabsTrigger>
            <TabsTrigger value="portfolio" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase">পোর্টফোলিও</TabsTrigger>
            <TabsTrigger value="revenue" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase">রেভিনিউ</TabsTrigger>
            <TabsTrigger value="global" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase">ব্যাংকিং গ্রিড</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payouts" className="flex-1 p-4 md:p-6 m-0 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-6">
                 <Card className="bg-primary/5 border-primary/20 p-6 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                       <Zap size={14} fill="currentColor" /> Global Payout
                    </h4>
                    <div className="space-y-3">
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase">Recipient</label>
                          <Input value={payoutRecipient} onChange={e => setPayoutRecipient(e.target.value)} className="bg-background/50 border-white/10 h-10 text-xs" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-bold text-muted-foreground uppercase">Amount (USD)</label>
                          <Input type="number" value={payoutAmount} onChange={e => setPayoutLogsAmount(e.target.value)} className="bg-background/50 border-white/10 h-10 text-xs" />
                       </div>
                       <Button onClick={handleGlobalPayoutSim} disabled={loading} className="w-full bg-primary text-background font-bold h-11 rounded-xl shadow-lg">
                          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          EXECUTE GLOBAL FLOW
                       </Button>
                    </div>
                 </Card>
                 <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-accent">
                       <span>Aggregator Sync</span>
                       <span>{payoutStep * 25}%</span>
                    </div>
                    <Progress value={payoutStep * 25} className="h-1 bg-white/5 [&>div]:bg-accent" />
                 </div>
              </div>
              <div className="lg:col-span-8 flex flex-col">
                 <Card className="bg-black/40 border-white/10 flex-1 overflow-hidden flex flex-col rounded-[2rem]">
                    <div className="p-4 bg-muted/20 border-b border-white/5 flex items-center justify-between">
                       <h5 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                          <Terminal size={14} /> Payout Terminal
                       </h5>
                    </div>
                    <ScrollArea className="flex-1 p-4 font-mono text-[10px]">
                       {payoutLogs.map((log, i) => (
                         <p key={i} className="animate-in slide-in-from-left-2 duration-300 text-primary/70">
                           <span className="text-muted-foreground mr-2">&gt;</span> {log}
                         </p>
                       ))}
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

        <TabsContent value="revenue" className="flex-1 p-4 md:p-6 m-0 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                 <MerchantGrowthChart />
              </div>
              <div className="lg:col-span-4 p-6 bg-muted/20 border border-white/5 rounded-[2.5rem] space-y-6">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Trophy size={16} /> Impact Vector</h4>
                 <p className="text-xs text-muted-foreground italic leading-relaxed">"মহামান্য সম্রাট, আপনার ইউনিফাইড এপিআই লেয়ার এখন প্রতিটি ট্রানজেকশন থেকে স্বয়ংক্রিয়ভাবে প্লাগইন কমিশন সংগ্রহ করছে।"</p>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="global" className="flex-1 p-0 m-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-muted/10 flex justify-between items-center">
             <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                <Input placeholder="Search Banking Nodes..." className="pl-8 h-8 bg-background/50 border-white/10 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
             </div>
             <Badge variant="outline" className="text-[7px] border-primary/40 text-primary uppercase">FAPI Standard v3.0</Badge>
          </div>
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-3">
              {filteredBanks.map((bank) => (
                <div key={bank.id} className="p-4 bg-card/60 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 rounded-xl border border-white/10">
                      <AvatarImage src={bank.logoUrl} />
                      <AvatarFallback className="bg-muted text-[10px] font-bold">{bank.bankName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{bank.bankName}</h4>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase">ISO_20022_CONNECTED</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button onClick={() => handleRequestConsent(bank.id)} size="sm" variant="outline" className="h-8 text-[8px] uppercase font-bold tracking-tighter border-accent/20 text-accent hover:bg-accent/10">
                      <Key size={12} className="mr-1" /> Consent
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-[8px] uppercase font-bold tracking-tighter hover:bg-primary/10 text-primary">
                      <ArrowRightLeft size={12} className="mr-1" /> Transfer
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
