
"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Globe, Zap, ShieldCheck, RefreshCw, Send, Lock, Search, CreditCard, Landmark, CheckCircle2, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StripeBankSync, BankNode } from '@/lib/stripe-bank-sync'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'

export function BankDirectory() {
  const [banks, setBanks] = useState<BankNode[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    handleSync()
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
                Stripe Financial Connections • Network-to-Network Locked
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
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
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
          
          {filteredBanks.length === 0 && (
            <div className="py-20 text-center opacity-20">
              <Landmark size={48} className="mx-auto mb-4" />
              <p className="font-headline font-bold uppercase tracking-widest">No Banking Nodes Found</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <div className="p-4 bg-primary/5 border-t border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-accent">Sovereign Connection: LOCKED</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Grid Identity: 42nd_Project_Verified</span>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground italic font-body">
            * প্রতিটি ট্রানজেকশন Sovereign অডিট রেজিস্ট্রিতে (42nd Archive) সিগনেচার সহ সংরক্ষিত হয়।
          </p>
        </div>
      </div>
    </Card>
  )
}
