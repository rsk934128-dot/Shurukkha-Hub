"use client"

import React, { useState, useEffect } from 'react'
import { Gavel, ShieldX, FileText, Lock, ShieldCheck, Scale, AlertOctagon, History, Trash2, UserCheck, Search, Database, Fingerprint, ExternalLink, ShieldAlert, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function JudiciaryPanel() {
  const [sentences, setSentences] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveStep] = useState('exiles')

  // Imperial Evidence from Sovereign Input
  const imperialEvidence = [
    {
      id: 'case_001',
      title: 'Phishing Vector: bkashloan.ru.com',
      type: 'FRAUDULENT_DOMAIN',
      status: 'BLACKLISTED',
      details: 'বিকাশের লোগো ব্যবহার করে ভুয়া লোন অ্যাপ্লিকেশনের নামে তথ্য হাতিয়ে নেওয়ার চেষ্টা।',
      risk: 'Critical',
      timestamp: '2026-05-26T21:54:00Z'
    },
    {
      id: 'case_002',
      title: 'Payment Forensic: TrxID DEQ2N3ZY3E',
      type: 'MERCHANT_VERIFICATION',
      status: 'LOGGED_IN_VAULT',
      details: 'Grameenphone Ltd-GP WEBSITE (01714170287) পেমেন্ট সফলভাবে সম্পন্ন ও নথিবদ্ধ।',
      risk: 'Logged',
      timestamp: '2026-05-26T21:54:00Z'
    }
  ]

  useEffect(() => {
    const q = query(
      collection(db, "suspect_profiles"), 
      where("status", "==", "blacklisted"),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSentences(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [])

  const filteredSentences = sentences.filter(s => 
    s.ipAddress?.includes(search) || s.fingerprint?.includes(search)
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold text-destructive flex items-center gap-2">
              <ShieldX size={14} /> Permanent Exiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-headline font-bold text-destructive">{sentences.length}</p>
            <p className="text-[8px] text-muted-foreground uppercase mt-1">Identities barred from core.sheikh</p>
          </CardContent>
        </Card>
        
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold text-accent flex items-center gap-2">
              <Database size={14} /> Evidence Vault
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-headline font-bold text-accent">Active</p>
            <p className="text-[8px] text-muted-foreground uppercase mt-1">Encrypted forensic logs secured</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase font-bold text-primary flex items-center gap-2">
              <Scale size={14} /> Justice Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-headline font-bold text-primary">100%</p>
            <p className="text-[8px] text-muted-foreground uppercase mt-1">Autonomous sentencing active</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/5 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-white/5 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-headline font-bold flex items-center gap-2 uppercase tracking-widest text-foreground">
                <Gavel className="text-primary" size={18} /> Sovereign Court: Justice Board
              </CardTitle>
              <CardDescription className="text-[10px]">সাম্রাজ্যের অটোনোমাস বিচার ও ফরেনসিক প্রমাণাদি।</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              <Input 
                placeholder="Search Database..." 
                className="pl-8 h-8 bg-background/50 border-white/10 text-[10px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <Tabs defaultValue="exiles" className="w-full">
          <div className="px-6 py-2 bg-muted/10 border-b border-white/5 overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent border-none p-0 h-8 flex gap-4">
              <TabsTrigger value="exiles" className="text-[10px] uppercase font-bold gap-1.5 data-[state=active]:text-primary"><ShieldX size={12}/> Permanent Exiles</TabsTrigger>
              <TabsTrigger value="imperial" className="text-[10px] uppercase font-bold gap-1.5 data-[state=active]:text-accent"><ShieldAlert size={12}/> Imperial Evidence</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="exiles" className="m-0">
            <ScrollArea className="h-[450px]">
              <div className="p-4 space-y-4">
                {filteredSentences.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-20">
                    <ShieldCheck size={48} className="mb-4" />
                    <p className="font-headline font-bold">No Exiles Recorded</p>
                    <p className="text-xs">The realm is currently pure.</p>
                  </div>
                ) : (
                  filteredSentences.map((sentence) => (
                    <div key={sentence.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex flex-col gap-4 group hover:border-destructive/30 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3">
                        <Badge variant="destructive" className="text-[8px] animate-pulse">PERMANENT EXILE</Badge>
                      </div>

                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
                              <AlertOctagon size={24} />
                            </div>
                            <div>
                              <h3 className="text-sm font-mono font-bold text-foreground">{sentence.ipAddress}</h3>
                              <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">Fingerprint: {sentence.fingerprint}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-[7px] border-white/10 bg-black/40">
                              Captured: {new Date(sentence.lastIncident).toLocaleString()}
                            </Badge>
                            <Badge variant="outline" className="text-[7px] border-white/10 bg-black/40">
                              Violations: {sentence.violationCount}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 justify-end items-end">
                          <Button size="sm" variant="outline" className="h-7 text-[8px] border-primary/20 text-primary gap-1">
                            <FileText size={10} /> VIEW EVIDENCE
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="imperial" className="m-0">
            <ScrollArea className="h-[450px]">
              <div className="p-4 space-y-4">
                {imperialEvidence.map((evidence) => (
                  <div key={evidence.id} className={`p-4 bg-card border rounded-2xl relative overflow-hidden transition-all ${evidence.risk === 'Critical' ? 'border-destructive/30 bg-destructive/5' : 'border-accent/30 bg-accent/5'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${evidence.risk === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent'}`}>
                          {evidence.type === 'FRAUDULENT_DOMAIN' ? <ShieldAlert size={20} /> : <CreditCard size={20} />}
                        </div>
                        <div>
                          <h3 className="text-sm font-headline font-bold text-foreground uppercase tracking-tight">{evidence.title}</h3>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{evidence.type}</p>
                        </div>
                      </div>
                      <Badge variant={evidence.risk === 'Critical' ? 'destructive' : 'default'} className="text-[8px] animate-pulse">
                        {evidence.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-xs text-foreground/80 leading-relaxed italic">"{evidence.details}"</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[7px] border-white/10 text-muted-foreground uppercase">ID: {evidence.id}</Badge>
                        <span className="text-[9px] text-muted-foreground font-mono">{new Date(evidence.timestamp).toLocaleString('bn-BD')}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-[8px] gap-1 text-primary">
                        <ExternalLink size={10} /> VIEW VAULT RECORD
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
