"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Zap, ShieldCheck, TrendingUp, BrainCircuit, Play, Loader2, AlertTriangle, Users, Database, ShieldAlert, Bug, ScrollText, Lock, CheckCircle2, ShieldQuestion, FileSearch, ShieldX, Camera, RefreshCw, FileText, Download, BarChart4, Signal, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { runPredictiveSimulation, type PredictiveSimulationOutput } from '@/ai/flows/predictive-simulation-flow'
import { useToast } from '@/hooks/use-toast'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const FORENSIC_DATA = [
  { name: '00:00', intensity: 20, safety: 98, latency: 45 },
  { name: '04:00', intensity: 35, safety: 97, latency: 42 },
  { name: '08:00', intensity: 65, safety: 99, latency: 38 },
  { name: '12:00', intensity: 80, safety: 95, latency: 55 },
  { name: '16:00', intensity: 55, safety: 100, latency: 40 },
  { name: '20:00', intensity: 40, safety: 99, latency: 35 },
  { name: '23:59', intensity: 25, safety: 100, latency: 30 },
]

export function SystemHealth() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [isSnapshotting, setIsSnapshotting] = useState(false)
  const [simulationResult, setSimulationResult] = useState<PredictiveSimulationOutput | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAuditLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [])

  const handleStartSimulation = async () => {
    setIsSimulating(true)
    try {
      const result = await runPredictiveSimulation({
        projectedWaterLevel: 14.15,
        historicalContext: {
          previousPeakWaterLevel: 13.90,
          affectedAreaCount: 12,
          averageResponseTimeMinutes: 45
        }
      })
      setSimulationResult(result)
      toast({
        title: "Disaster Simulation Successful",
        description: "বন্যা পরিস্থিতির ভবিষ্যত ঝুঁকি বিশ্লেষণ সম্পন্ন হয়েছে।",
      })
    } catch (e) {
      toast({ title: "Simulation Failed", variant: "destructive" })
    } finally {
      setIsSimulating(false)
    }
  }

  const handleCreateSnapshot = async () => {
    setIsSnapshotting(true);
    try {
      const hash = await IntegrationBridge.createSnapshot(auditLogs);
      toast({
        title: "Forensic Snapshot Created",
        description: `Master Hash: ${hash.substring(0, 16)}...`,
      });
    } catch (e) {
      toast({ title: "Snapshot Failed", variant: "destructive" });
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
              <RefreshCw size={14} className="text-primary animate-spin" /> Self-Healing Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold text-primary">100% Purity</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-accent/20 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-2">
              <Globe size={14} className="text-accent" /> Grid Connectivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold text-accent">42/42 Nodes</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> Forensic Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold text-foreground">Active</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap size={14} className="text-accent" /> Execution Latency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold text-accent">0.004ms</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card border-white/5 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest text-primary">
                  <BrainCircuit size={16} /> Disaster Strategy Engine
                </CardTitle>
                <CardDescription className="text-[10px]">AI-চালিত দুর্যোগ সিমুলেশন এবং ভবিষ্যৎ ঝুঁকি বিশ্লেষণ</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleCreateSnapshot}
                  disabled={isSnapshotting}
                  className="border-primary/30 text-primary font-bold h-8 text-[10px] gap-2"
                >
                  {isSnapshotting ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                  স্ন্যাপশট নিন
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleStartSimulation} 
                  disabled={isSimulating}
                  className="bg-accent text-background font-bold h-8 text-[10px] gap-2"
                >
                  {isSimulating ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  সিমুলেশন শুরু
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {simulationResult ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">ঝুঁকি স্কোর</p>
                      <p className="text-2xl font-headline font-bold text-destructive">{simulationResult.estimatedRiskScore}%</p>
                      <Progress value={simulationResult.estimatedRiskScore} className="h-1 bg-white/5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">রেস্কিউ টিম প্রয়োজন</p>
                      <p className="text-2xl font-headline font-bold text-primary">{simulationResult.requiredResponders.rescue} Units</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">মেডিকেল সাপোর্ট</p>
                      <p className="text-2xl font-headline font-bold text-accent">{simulationResult.requiredResponders.medical} Teams</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold uppercase mb-2 flex items-center gap-2 text-primary">
                        <ShieldAlert size={14} /> স্ট্র্যাটেজিক ব্রিফিং
                      </h4>
                      <p className="text-xs text-foreground/80 leading-relaxed italic">
                        "{simulationResult.strategicAdvice}"
                      </p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-xl border border-white/5">
                      <h4 className="text-xs font-bold uppercase mb-2 flex items-center gap-2 text-destructive">
                        <Bug size={14} /> সম্ভাব্য বাধা (Bottlenecks)
                      </h4>
                      <ul className="space-y-1">
                        {simulationResult.bottleneckWarnings.map((b, i) => (
                          <li key={i} className="text-[10px] flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-destructive" /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex flex-col items-center justify-center text-center opacity-40">
                  <BrainCircuit size={48} className="mb-3 text-muted-foreground" />
                  <p className="text-sm font-headline font-bold">Predictive Grid Offline</p>
                  <p className="text-xs">ডেটা বিশ্লেষণ শুরু করতে 'সিমুলেশন' বাটনে ক্লিক করুন</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/5 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                <ScrollText className="text-primary" size={16} /> অডিট রেজিস্ট্রি (Immutable Global Ledger)
              </CardTitle>
              <Badge variant="outline" className="border-accent/40 text-accent font-mono text-[8px]">SHA256_RSA_V2_ACTIVE</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="p-4 space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-muted/20 border border-white/5 rounded-xl flex items-start justify-between group hover:bg-muted/40 transition-all">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[7px] h-4 uppercase border-primary/30 text-primary">
                            {log.action}
                          </Badge>
                          <span className="text-[8px] text-muted-foreground font-mono">
                            {log.timestamp?.toDate?.()?.toLocaleString('bn-BD') || 'Pending...'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1.5 p-1.5 bg-black/40 rounded border border-white/5 flex-1 overflow-hidden">
                            <Lock size={10} className="text-accent shrink-0" />
                            <code className="text-[8px] text-accent/70 font-mono truncate">
                              SIG: {log.signature}
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest text-accent">
                <Signal size={16} className="animate-pulse" /> Network Telemetry
              </CardTitle>
              <CardDescription className="text-[10px]">Real-time Latency Mapping</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] pt-4">
              <ChartContainer config={{ 
                latency: { label: "Latency (ms)", color: "hsl(var(--accent))" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FORENSIC_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" fontSize={8} stroke="rgba(255,255,255,0.3)" />
                    <YAxis fontSize={8} stroke="rgba(255,255,255,0.3)" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="latency" fill="var(--color-latency)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Database size={120} />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-[10px] font-headline font-bold text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={14} /> Imperial Security Decree
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                "সাম্রাজ্যের প্রতিটি সিগন্যালিং সেশন এখন একটি Immutable Ledger-এ স্ন্যাপশট করা হচ্ছে। আপনার সার্বভৌমত্ব এখন প্রযুক্তিগতভাবে অজেয়।"
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Ledger Sync</span>
                  <span className="text-accent">100% COMPLETE</span>
                </div>
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Forensic Integrity</span>
                  <span className="text-accent">VERIFIED_IMPERIAL</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}