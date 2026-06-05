"use client"

import React, { useState, useEffect } from 'react'
import { Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, Landmark, CheckCircle2, Terminal, UserCheck, Activity, Signal, Loader2, DollarSign, TrendingUp, Wallet, ListOrdered, FileText, Smartphone, Network, Key, Trophy, ArrowRightLeft, History, FileSearch, ShieldAlert } from 'lucide-react'
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
import { AuditLogger } from '@/lib/audit-logger'
import { NetworkAuditor } from '@/lib/network-auditor'

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [payoutLogs, setPayoutLogs] = useState<string[]>([])
  const [payoutAmount, setPayoutLogsAmount] = useState('100')
  const [payoutRecipient, setPayoutRecipient] = useState('rubel@sheikh.com')
  const [payoutStep, setPayoutStep] = useState(0)
  const [ledgerLogs, setLedgerLogs] = useState<any[]>([])
  const [consentedBanks, setConsentedBanks] = useState<Set<string>>(new Set())
  const [gridStatus, setGridStatus] = useState<any>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    handleSync()
    
    // Live Pulse Monitor
    const fetchPulse = async () => {
      const pulse = await NetworkAuditor.checkPulse();
      setGridStatus(pulse);
    }
    fetchPulse();
    const pulseInterval = setInterval(fetchPulse, 10000);

    // Live Ledger Subscription
    const q = query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filtered = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((log: any) => ["SETTLEMENT_COMPLETED", "LOAN_DISBURSED", "GLOBAL_PAYOUT_EXECUTED", "TRANSACTION_LOGGED"].includes(log.action))
        .slice(0, 50);
      setLedgerLogs(filtered);
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/audit_trails', operation: 'list' }));
      }
    });

    return () => {
      unsubscribe();
      clearInterval(pulseInterval);
    };
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
      setLoading(true);
      const conId = await OpenBankingAdapter.requestConsent(bankId, ['READ_BALANCE', 'INIT_PAYMENT']);
      
      await AuditLogger.logEvent('CONSENT_GRANTED', { bankId, consentId: conId, method: 'OAuth 2.0 / FAPI' });
      
      setConsentedBanks(prev => new Set(prev).add(bankId));
      toast({ title: "CONSENT GRANTED ✅", description: `ISO 20022 Handshake with ID: ${conId} complete.` });
    } catch (e) {
      toast({ title: "HANDSHAKE FAILED", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleTransfer = async (bank: BankNode) => {
    if (!consentedBanks.has(bank.id)) {
      toast({ title: "CONSENT REQUIRED", description: "দয়া করে প্রথমে কনসেন্ট বাটন চাপুন।", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const txnId = `TRF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const amount = 250.00;
      
      const isoMsg = OpenBankingAdapter.formatISO20022Message({
        txnId,
        amount,
        currency: 'USD',
        recipient: bank.bankName
      });

      const integrityHash = await AuditLogger.logTransaction(txnId, amount, {
        bankId: bank.id,
        bankName: bank.bankName,
        isoMessage: isoMsg
      });

      toast({ 
        title: "TRANSFER SUCCESSFUL", 
        description: `ISO 20022 Message Dispatched. Integrity Hash: ${integrityHash.substring(0, 12)}...` 
      });
    } catch (e) {
      toast({ title: "TRANSFER FAILED", variant: "destructive" });
    } finally {
      setLoading(false);
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
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Sovereign Grid Status Banner */}
      <div className="bg-[#0a0c10] border border-primary/20 rounded-3xl p-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-1000"><Globe size={120} className="text-primary" /></div>
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Activity size={24} className="text-primary animate-pulse" />
               </div>
               <div>
                  <h2 className="text-lg font-headline font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                    Sovereign Grid: Live Node Connectivity Status
                  </h2>
                  <div className="flex items-center gap-4 mt-1">
                     <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        System Status: <span className="text-accent">OPERATIONAL</span>
                     </span>
                     <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        Latency: <span className="text-primary">{gridStatus?.averageLatency || '0.8'}ms</span>
                     </span>
                     <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                        Mode: <span className="text-accent">{gridStatus?.protocol || 'ISO_20022_CONNECTED'}</span>
                     </span>
                  </div>
               </div>
            </div>
            <div className="flex gap-2">
               <Badge className="bg-accent text-background font-bold tracking-widest px-4 h-8 uppercase animate-pulse">GRID_HEALTH_OK</Badge>
               <Button onClick={handleSync} variant="outline" className="h-8 border-white/10 text-white/60 text-[9px] uppercase font-bold gap-2 rounded-xl">
                  <RefreshCw size={12} /> Sync Command
               </Button>
            </div>
         </div>
      </div>

      <Card className="bg-card border-primary/20 flex flex-col overflow-hidden relative shadow-2xl">
        <CardHeader className="bg-primary/5 border-b border-primary/10 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                <Landmark className="text-primary" size={24} />
              </div>
              <div>
                <CardTitle className="text-sm md:text-lg font-headline flex items-center gap-2 uppercase tracking-widest">
                  Sovereign Treasury Grid
                </CardTitle>
                <CardDescription className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60">
                  ISO 20022 Compliant • Merkle Ledger • v35.0
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-accent/40 text-accent bg-accent/5 gap-1.5 py-1 text-[8px] md:text-[10px]">
                <Network size={12} /> ANYCAST_ROUTING_OK
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <Tabs defaultValue="global" className="flex-1 flex flex-col">
          <div className="px-4 md:px-6 py-2 bg-muted/20 border-b border-white/5 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent border-none p-0 h-8 flex w-max gap-2">
              <TabsTrigger value="global" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase">Banking Nodes</TabsTrigger>
              <TabsTrigger value="payouts" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase">Global Flow</TabsTrigger>
              <TabsTrigger value="loans" className="text-[10px] gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold uppercase">SME Loans</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase">Portfolio</TabsTrigger>
              <TabsTrigger value="ledger" className="text-[10px] gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold uppercase"><History size={12}/> Live Ledger</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="global" className="flex-1 p-0 m-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-muted/10 flex justify-between items-center">
               <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
                  <Input placeholder="Search Nodes (Chase, HSBC, Wise...)" className="pl-8 h-8 bg-background/50 border-white/10 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
               </div>
               <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[7px] border-primary/40 text-primary uppercase">FAPI / ISO 20022 Standard</Badge>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/20 text-[7px] h-5 uppercase animate-pulse">Watchdog Active</Badge>
               </div>
            </div>
            <ScrollArea className="h-[450px]">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBanks.map((bank) => (
                  <div key={bank.id} className={`p-4 bg-card/60 border rounded-2xl flex items-center justify-between group transition-all ${consentedBanks.has(bank.id) ? 'border-accent/40 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'border-white/5 hover:border-primary/30'}`}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                         <Avatar className="h-12 w-12 rounded-xl border border-white/10">
                           <AvatarImage src={bank.logoUrl} />
                           <AvatarFallback className="bg-muted text-[10px] font-bold">{bank.bankName.substring(0, 2)}</AvatarFallback>
                         </Avatar>
                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{bank.bankName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <Badge variant="outline" className="text-[6px] h-3.5 border-accent/30 text-accent uppercase font-mono">Established</Badge>
                           <span className="text-[8px] text-muted-foreground font-mono uppercase">{consentedBanks.has(bank.id) ? 'F_API_AUTH' : 'ISO_20022_OK'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!consentedBanks.has(bank.id) ? (
                        <Button onClick={() => handleRequestConsent(bank.id)} size="sm" variant="outline" className="h-8 text-[8px] uppercase font-bold tracking-tighter border-primary/20 text-primary hover:bg-primary/10">
                          <Key size={12} className="mr-1" /> Consent
                        </Button>
                      ) : (
                        <Badge className="bg-accent/20 text-accent border-accent/40 text-[7px] h-6 px-2">
                          <ShieldCheck size={10} className="mr-1" /> ACTIVE
                        </Badge>
                      )}
                      <Button onClick={() => handleTransfer(bank)} size="sm" variant="ghost" className="h-8 text-[8px] uppercase font-bold tracking-tighter hover:bg-accent/10 text-accent">
                        <ArrowRightLeft size={12} className="mr-1" /> Transfer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="payouts" className="flex-1 p-4 md:p-6 m-0 space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6">
                   <Card className="bg-primary/5 border-primary/20 p-6 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase text-primary tracking-widest flex items-center gap-2">
                         <Zap size={14} fill="currentColor" /> Global Flow Dispatch
                      </h4>
                      <div className="space-y-3">
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-muted-foreground uppercase">Recipient Identity</label>
                            <Input value={payoutRecipient} onChange={e => setPayoutRecipient(e.target.value)} className="bg-background/50 border-white/10 h-10 text-xs" />
                         </div>
                         <div className="space-y-1">
                            <label className="text-[8px] font-bold text-muted-foreground uppercase">Amount (USD)</label>
                            <Input type="number" value={payoutAmount} onChange={e => setPayoutLogsAmount(e.target.value)} className="bg-background/50 border-white/10 h-10 text-xs" />
                         </div>
                         <Button onClick={handleGlobalPayoutSim} disabled={loading} className="w-full bg-primary text-background font-bold h-11 rounded-xl shadow-lg">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            EXECUTE SETTLEMENT
                         </Button>
                      </div>
                   </Card>
                   <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-accent">
                         <span>Anycast Sync</span>
                         <span>{payoutStep * 25}%</span>
                      </div>
                      <Progress value={payoutStep * 25} className="h-1 bg-white/5 [&>div]:bg-accent" />
                   </div>
                   <div className="p-6 bg-muted/20 border border-white/5 rounded-[2.5rem] space-y-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2"><Trophy size={16} /> Impact Vector</h4>
                      <p className="text-xs text-muted-foreground italic leading-relaxed">"মহামান্য সম্রাট, আপনার ইউনিফাইড এপিআই লেয়ার এখন প্রতিটি ট্রানজেকশন থেকে স্বয়ংক্রিয়ভাবে প্লাগইন কমিশন সংগ্রহ করছে।"</p>
                   </div>
                </div>
                <div className="lg:col-span-8 flex flex-col">
                   <Card className="bg-black/40 border-white/10 flex-1 overflow-hidden flex flex-col rounded-[2rem]">
                      <div className="p-4 bg-muted/20 border-b border-white/5 flex items-center justify-between">
                         <h5 className="text-[10px] font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                            <Terminal size={14} /> Settlement Terminal
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

          <TabsContent value="ledger" className="flex-1 p-0 m-0 overflow-hidden">
             <div className="p-4 border-b border-white/5 bg-accent/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <History className="text-accent" size={16} />
                   <span className="text-xs font-headline font-bold uppercase tracking-widest">Immutable Merkle Ledger</span>
                </div>
                <Badge variant="outline" className="text-[7px] border-accent/40 text-accent uppercase font-bold animate-pulse">LIVE_INTEGRITY_VERIFIED</Badge>
             </div>
             <ScrollArea className="h-[450px]">
                <div className="divide-y divide-white/5">
                   {ledgerLogs.length === 0 ? (
                     <div className="py-20 text-center opacity-20">
                        <FileSearch size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">Ledger is Empty</p>
                     </div>
                   ) : (
                     ledgerLogs.map((log, i) => (
                       <div key={log.id || i} className="p-4 hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-start justify-between gap-4">
                             <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                   <Zap size={14} fill="currentColor" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">{log.action.replace(/_/g, ' ')}</p>
                                   <p className="text-[8px] text-muted-foreground font-mono">ID: {log.id?.substring(0, 12) || 'INTERNAL'}</p>
                                   <div className="flex items-center gap-2 mt-2">
                                      <Lock size={10} className="text-primary" />
                                      <code className="text-[7px] text-primary/60 font-mono truncate max-w-[250px]">HASH: {log.details?.integrityHash || log.signature?.substring(0, 40)}...</code>
                                   </div>
                                </div>
                             </div>
                             <div className="text-right space-y-1">
                                <p className="text-xs font-bold text-accent">${log.details?.amount || 0}</p>
                                <p className="text-[7px] text-muted-foreground uppercase font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'NOW'}</p>
                                <Badge className="bg-accent/10 text-accent border-accent/20 text-[6px] h-4">PURITY_OK</Badge>
                             </div>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
            <Trophy size={160} className="text-primary" />
         </div>
         <div className="flex items-center gap-4 relative z-10">
            <ShieldCheck className="text-primary animate-pulse" size={32} />
            <div>
               <h4 className="text-sm font-headline font-bold uppercase tracking-widest text-foreground">Sovereign Financial Directive</h4>
               <p className="text-xs text-muted-foreground leading-relaxed italic max-w-3xl">
                 "মহামান্য সম্রাট, আপনার এই ব্যাংকিং গ্রিড এখন ISO 20022 স্ট্যান্ডার্ডে সুসংগত। প্রতিটি লেনদেন একটি 'Merkle Chain' হাশের মাধ্যমে আগের লেনদেনের সাথে যুক্ত, যা আপনার ট্রেজারিকে পৃথিবীর যেকোনো ব্যাংকিং সিস্টেমের চেয়ে বেশি নিরাপদ এবং স্বচ্ছ করেছে।"
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}