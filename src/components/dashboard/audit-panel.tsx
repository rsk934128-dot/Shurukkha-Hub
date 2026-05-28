"use client"

import React, { useState, useEffect } from 'react'
import { ScrollText, ShieldCheck, ShieldAlert, Clock, Search, Filter, Lock, Eye, RefreshCw, FileSearch, ShieldX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

export function AuditPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const getEventIcon = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('VERIFIED')) return <ShieldCheck className="text-accent" size={16} />
    if (action.includes('FAILURE') || action.includes('FAILED')) return <ShieldAlert className="text-destructive" size={16} />
    if (action.includes('LOCKDOWN')) return <ShieldX className="text-destructive animate-pulse" size={16} />
    return <Clock className="text-primary" size={16} />
  }

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.performedBy?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <Input 
            placeholder="অডিট রেজিস্ট্রি খুঁজুন..." 
            className="pl-9 h-10 bg-background/50 border-white/10 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 text-[10px] uppercase font-bold border-white/10 gap-2">
            <Filter size={14} /> ফিল্টার
          </Button>
          <Button variant="outline" size="sm" className="h-10 text-[10px] uppercase font-bold border-white/10 gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> রিফ্রেশ
          </Button>
        </div>
      </div>

      <Card className="bg-card border-white/5 overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                <FileSearch className="text-primary" size={18} /> IMPERIAL ACCESS REGISTRY
              </CardTitle>
              <CardDescription className="text-[10px]">সাম্রাজ্যের প্রতিটি সেশন ও সিকিউরিটি ইভেন্টের ইমিউটেবল লগ।</CardDescription>
            </div>
            <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[8px]">SHA256_V30_ACTIVE</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${log.action.includes('FAILED') || log.action.includes('LOCKDOWN') ? 'bg-destructive/10 border-destructive/20' : 'bg-accent/10 border-accent/20'}`}>
                        {getEventIcon(log.action)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${log.action.includes('FAILED') || log.action.includes('LOCKDOWN') ? 'text-destructive' : 'text-foreground'}`}>
                            {log.action.replace(/_/g, ' ')}
                          </h4>
                          <Badge variant="outline" className="text-[7px] h-4 border-white/10 opacity-60">ID: {log.id.substring(0, 8)}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Performed by: <span className="text-primary/80">{log.performedBy}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Lock size={10} className="text-accent" />
                          <code className="text-[8px] text-accent/60 font-mono truncate max-w-[200px] md:max-w-md">
                            SIG: {log.signature}
                          </code>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono bg-black/40 px-2 py-1 rounded">
                        <Clock size={10} />
                        {log.timestamp?.toDate?.()?.toLocaleString('bn-BD') || 'Pending...'}
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-[8px] uppercase font-bold text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye size={10} className="mr-1" /> VIEW DETAILS
                      </Button>
                    </div>
                  </div>
                  {log.details && (
                    <div className="mt-3 ml-14 p-3 bg-muted/20 rounded-lg border border-white/5 overflow-hidden">
                       <pre className="text-[9px] font-mono text-muted-foreground whitespace-pre-wrap">
                         {JSON.stringify(log.details, null, 2)}
                       </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
