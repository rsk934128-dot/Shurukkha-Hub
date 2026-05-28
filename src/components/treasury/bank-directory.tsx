
"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, CreditCard, Landmark, CheckCircle2, Star, Smartphone, ArrowRightLeft, Terminal, Play } from 'lucide-react'
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

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [localGateways, setLocalGateways] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])
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
      toast({
        title: "GLOBAL SYNC SUCCESS",
        description: "Phase 23.0: Stripe ব্যাংকিং ডিরেক্টরি সফলভাবে আপডেট করা হয়েছে।",
      })
    } catch (e) {
      toast({ title: "SYNC FAILED", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePush = async (bankId: string) => {
    toast({ title: "INITIATING RSA PUSH", description: "সিগনেচার ভেরিফাই করা হচ্ছে..." })
    const sig = await StripeBankSync.initiateBankPush(bankId)
    if (sig) {
      toast({
        title: "PUSH AUTHORIZED",
        description: `Bank Node ${bankId} আমাদের সিগনেচার গ্রহণ করেছে।`,
      })
    }
  }

  const handleLocalSettlement = async (gw: any) => {
    setLoading(true)
    try {
      const result = await PaymentHandler.initiateLocalSettlement({
        amount: 5000,
        currency: 'BDT',
        source: 'CARD',
        target: 'BKASH',
        merchantId: 'SIRAJGANJ_GOV_HUB'
      })
      if (result.success) {
        toast({
          title: "SETTLEMENT SUCCESSFUL",
          description: `Transaction ID: ${result.settlementId} | bKash এ ফান্ড পাঠানো হয়েছে।`,
        })
      }
    } catch (e) {
      toast({ title: "SETTLEMENT FAILED", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDummyTest = async () => {
    setLoading(true)
    setTerminalLogs([])
    try {
      await PaymentHandler.triggerDummyPayment((msg) => {
        setTerminalLogs(prev => [...prev, msg])
      })
      toast({ title: "Dummy Test Complete", description: "লোকাল পেমেন্ট লজিক সফলভাবে যাচাই করা হয়েছে।" })
    } catch (e) {
      toast({ title: "Test Failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredBanks = banks.filter(b => 
    b.bankName.toLowerCase().includes(search.toLowerCase()) || 
    b.country.toLowerCase().includes(search.toLowerCase())
  )

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
                  <Star size={8} fill="currentColor" /> PHASE 23.0
                </Badge>
              </CardTitle>
              <CardDescription className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60">
                Stripe Financial Connections • Local Settlement Hooks (bKash)
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
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSync}
              disabled={loading}
              className="h-9 border-primary/20 text-primary gap-2"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              SYNC REGISTRY
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="global" className="flex-1 flex flex-col">
        <div className="px-6 py-2 bg-muted/20 border-b border-white/5">
          <TabsList className="bg-transparent border-none p-0 h-8">
            <TabsTrigger value="global" className="text-xs gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold"><Globe size={14}/> ইন্টারন্যাশনাল ব্যাংকস</TabsTrigger>
            <TabsTrigger value="local" className="text-xs gap-1.5 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold"><Smartphone size={14}/> লোকাল গেটওয়ে (bKash)</TabsTrigger>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-muted-foreground" />
                        <span className="text-xs font-bold">{bank.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-primary/60 group-hover:text-primary" />
                        <span className="text-sm font-headline font-medium">{bank.bankName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        bank.status === 'CONNECTED' ? 'bg-accent/20 text-accent border-accent/30' : 
                        bank.status === 'READY' ? 'bg-primary/20 text-primary border-primary/30' : 
                        'bg-destructive/20 text-destructive'
                      }>
                        {bank.status === 'CONNECTED' && <CheckCircle2 size={10} className="mr-1" />}
                        {bank.status === 'LOCKED' && <Lock size={10} className="mr-1" />}
                        {bank.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-[10px] font-mono text-muted-foreground bg-black/40 px-2 py-0.5 rounded">
                        {bank.handshakeId}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        disabled={!bank.pushAvailable}
                        onClick={() => handlePush(bank.id)}
                        className="h-8 text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10 gap-2"
                      >
                        <Zap size={12} fill="currentColor" /> PUSH
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="local" className="flex-1 p-6 m-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {localGateways.map(gw => (
              <div key={gw.id} className="p-4 bg-muted/30 border border-white/5 rounded-2xl space-y-4 group hover:border-accent/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/20">
                      <Smartphone className="text-accent" size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-headline font-bold">{gw.name}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{gw.type} GATEWAY</p>
                    </div>
                  </div>
                  <Badge className="bg-accent/20 text-accent border-accent/30">{gw.status}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className="text-muted-foreground">LATENCY: {gw.latency}</span>
                  <span className="text-accent">RSA_V2_READY</span>
                </div>

                <Button 
                  onClick={() => handleLocalSettlement(gw)}
                  disabled={loading}
                  className="w-full h-8 text-[10px] font-bold bg-accent text-background gap-2"
                >
                  <ArrowRightLeft size={12} /> INITIATE SETTLEMENT
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Card className="bg-black/40 border-accent/20 overflow-hidden">
                <CardHeader className="bg-accent/5 border-b border-accent/10 py-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={14} /> Live Transaction Terminal
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={handleDummyTest} 
                    disabled={loading}
                    className="h-7 text-[9px] bg-accent text-background font-bold gap-2"
                  >
                    <Play size={10} fill="currentColor" /> RUN DUMMY TEST
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[200px] bg-black/60 p-4">
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
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl h-full">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2">Settlement Buffer Protocol:</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  কার্ড থেকে প্রাপ্ত ফান্ড সরাসরি বিকাশে সেটেল করার জন্য **Sovereign Settlement Buffer** ব্যবহৃত হচ্ছে। প্রতিটি ট্রানজেকশন **SHA256withRSA v2** সিগনেচার দ্বারা সুরক্ষিত।
                </p>
                <div className="mt-4 pt-4 border-t border-accent/10 space-y-2">
                  <div className="flex justify-between text-[8px] uppercase font-bold text-muted-foreground">
                    <span>Hook Auth</span>
                    <span className="text-accent">VERIFIED</span>
                  </div>
                  <div className="flex justify-between text-[8px] uppercase font-bold text-muted-foreground">
                    <span>Buffer Status</span>
                    <span className="text-accent">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 bg-primary/5 border-t border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Local Hook Status: ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Grid Identity: 42nd_Project_Verified</span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground italic font-body">
            * প্রতিটি লোকাল পেমেন্ট Sovereign অডিট রেজিস্ট্রিতে সিগনেচার সহ সংরক্ষিত হয়।
          </p>
        </div>
      </div>
    </Card>
  )
}
