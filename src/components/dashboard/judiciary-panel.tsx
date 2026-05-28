"use client"

import React, { useState, useEffect } from 'react'
import { Gavel, ShieldX, FileText, Lock, ShieldCheck, Scale, AlertOctagon, History, Trash2, UserCheck, Search, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore'
import { Input } from '@/components/ui/input'

export function JudiciaryPanel() {
  const [sentences, setSentences] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

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
                <Gavel className="text-primary" size={18} /> Sovereign Court: Exiled Identities
              </CardTitle>
              <CardDescription className="text-[10px]">সার্বভৌম বিচারে নির্বাসিত অপরাধীদের তালিকা ও ফরেনসিক প্রমাণ।</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              <Input 
                placeholder="Search Fingerprint/IP..." 
                className="pl-8 h-8 bg-background/50 border-white/10 text-[10px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                          <Badge variant="outline" className="text-[7px] border-white/10 bg-black/40">
                            Source: {sentence.capturedAt}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 justify-end items-end">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-[8px] border-primary/20 text-primary gap-1">
                            <FileText size={10} /> VIEW EVIDENCE
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-[8px] border-accent/20 text-accent gap-1">
                            <UserCheck size={10} /> EXONERATE
                          </Button>
                        </div>
                        <p className="text-[8px] text-muted-foreground italic">RSA_v2_Forensic_Checksum_Verified</p>
                      </div>
                    </div>

                    {sentence.linkedIdentities?.length > 0 && (
                      <div className="pt-3 border-t border-white/5 space-y-2">
                        <p className="text-[8px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                          <History size={10} /> Linked Network Collateral
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {sentence.linkedIdentities.map((ip: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-[7px] border-destructive/20 text-destructive/70 bg-destructive/5">{ip}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
