"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Zap, ShieldCheck, TrendingUp, BrainCircuit, Play, Loader2, AlertTriangle, Users, Database, ShieldAlert, Bug, ScrollText, Lock, CheckCircle2, ShieldQuestion, FileSearch, ShieldX, Camera, RefreshCw, FileText, Download, BarChart4, Signal, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { runPredictiveSimulation, type PredictiveSimulationOutput } from '@/ai/flows/predictive-simulation-flow'
import { useToast } from '@/hooks/use-toast'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
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
  const [isStressTesting, setIsStressTesting] = useState(false)
  const [isSnapshotting, setIsSnapshotting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [simulationResult, setSimulationResult] = useState<PredictiveSimulationOutput | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [tamperingDetected, setTamperingDetected] = useState(false)
  const [reportData, setReportData] = useState<any | null>(null)
  const [verificationData, setVerificationData] = useState<{ open: boolean, log: any, result: boolean | null, verifying: boolean }>({
    open: false,
    log: null,
    result: null,
    verifying: false
  })
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "audit_trails"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuditLogs(logs);
      
      if (logs.length > 0) {
        const latestLog = logs[0];
        if (latestLog.signature && !IntegrationBridge.verifySignature(latestLog.details, latestLog.signature)) {
          setTamperingDetected(true);
        } else {
          setTamperingDetected(false);
        }
      }
    });
    return () => unsubscribe();
  }, [])

  const handleStartSimulation = async () => {
    setIsSimulating(true)
    try {
      const result = await runPredictiveSimulation({
        projectedWaterLevel: 14.20,
        historicalContext: {
          previousPeakWaterLevel: 13.90,
          affectedAreaCount: 12,
          averageResponseTimeMinutes: 45
        }
      })
      setSimulationResult(result)
      toast({
        title: "Simulation Complete",
        description: "ভবিষ্যতের ঝুঁকি বিশ্লেষণ সম্পন্ন হয়েছে।",
      })
    } catch (e) {
      toast({ title: "Simulation Failed", variant: "destructive" })
    } finally {
      setIsSimulating(false)
    }
  }

  const handleLockdownToggle = (enabled: boolean) => {
    setIsLocked(enabled);
    IntegrationBridge.setLockdown(enabled);
    toast({
      title: enabled ? "SOVEREIGN LOCKDOWN ACTIVE" : "SYSTEM UNLOCKED",
      description: enabled ? "বাইরের সব কানেকশন বিচ্ছিন্ন করা হয়েছে।" : "পার্টনার ব্রিজ এখন সক্রিয়।",
      variant: enabled ? "destructive" : "default"
    });
  };

  const handleCreateSnapshot = async () => {
    setIsSnapshotting(true);
    try {
      const masterHash = await IntegrationBridge.createSnapshot(auditLogs);
      toast({
        title: "Forensic Snapshot Created",
        description: `Master Hash: ${masterHash.substring(0, 16)}...`,
      });
    } catch (e) {
      toast({ title: "Snapshot Failed", variant: "destructive" });
    } finally {
      setIsSnapshotting(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setTimeout(async () => {
      const report = {
        title: "Mission Sovereignty Report v2.0",
        archiveId: "42nd_Project_Sheikh_Code_Exchange",
        status: "SELF_HEALING_ACTIVE",
        security: "SHA256withRSA & AI Fraud Active",
        grid: "Global Cross-Currency Grid Ready",
        forensicIntegrity: tamperingDetected ? "CRITICAL_TAMPER_ALERT" : "VERIFIED_SOVEREIGN",
        timestamp: new Date().toISOString()
      };
      setReportData(report);
      setIsGeneratingReport(false);
      
      await addDoc(collection(db, "audit_trails"), {
        action: 'MISSION_REPORT_GENERATED',
        details: report,
        signature: IntegrationBridge.generateSignature(report),
        timestamp: serverTimestamp(),
        performedBy: 'imperial_archivist_v2'
      });
      
      toast({ title: "Imperial Report v2.0 Generated", description: "সাম্রাজ্যের বৈশ্বিক সক্ষমতা নথিবদ্ধ হয়েছে।" });
    }, 2000);
  };

  const verifyAuditLog = (log: any) => {
    setVerificationData({ open: true, log, result: null, verifying: true })
    setTimeout(() => {
      const isValid = IntegrationBridge.verifySignature(log.details, log.signature);
      setVerificationData(prev => ({ ...prev, result: isValid, verifying: false }))
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {tamperingDetected && (
        <Alert variant="destructive" className="bg-destructive/20 border-destructive animate-pulse">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle className="font-bold">SOVEREIGN ALERT: TAMPERING DETECTED</AlertTitle>
          <AlertDescription className="text-xs">
            অডিট রেজিস্ট্রিতে অননুমোদিত পরিবর্তন লক্ষ্য করা গেছে। সেলফ-হিলিং প্রোটোকল ভেরিফিকেশন শুরু করছে।
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
              <RefreshCw size={14} className="text-primary animate-spin" /> Self-Healing Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold text-primary">100% Secure</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-accent/20 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-accent flex items-center gap-2">
              <Globe size={14} className="text-accent" /> Global Scaling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold text-accent">Active Matrix</span>
          </CardContent>
        </Card>

        <Card className={`bg-card border-white/5 transition-colors ${isLocked ? 'bg-destructive/10' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldX size={14} className={isLocked ? 'text-destructive' : 'text-muted-foreground'} /> লকডাউন মোড
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Switch checked={isLocked} onCheckedChange={handleLockdownToggle} className="data-[state=checked]:bg-destructive" />
            <span className="text-xs font-bold uppercase tracking-widest">{isLocked ? 'ACTIVE' : 'OFF'}</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileText size={14} className="text-accent" /> আর্কাইভ রিপোর্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="h-7 text-[9px] bg-accent/10 border-accent/20 text-accent font-bold"
            >
              {isGeneratingReport ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
              জেনারেট করুন
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card border-white/5 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                  <BarChart4 className="text-accent" size={16} /> Global Forensic Audit
                </CardTitle>
                <CardDescription className="text-[10px]">সার্বভৌম অডিট, সেলফ-হিলিং ও গ্লোবাল ট্রাফিক এনালাইসিস</CardDescription>
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
                  স্ন্যাপশট
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleStartSimulation} 
                  disabled={isSimulating}
                  className="bg-accent text-background font-bold h-8 text-[10px] gap-2"
                >
                  {isSimulating ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  সিমুলেশন
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[250px] w-full">
                <ChartContainer config={{ 
                  intensity: { label: "Network Intensity", color: "hsl(var(--primary))" },
                  safety: { label: "Integrity Score", color: "hsl(var(--accent))" }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FORENSIC_DATA}>
                      <defs>
                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-intensity)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--color-intensity)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" fontSize={8} stroke="rgba(255,255,255,0.3)" />
                      <YAxis fontSize={8} stroke="rgba(255,255,255,0.3)" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="intensity" stroke="var(--color-intensity)" fillOpacity={1} fill="url(#colorIntensity)" />
                      <Area type="monotone" dataKey="safety" stroke="var(--color-safety)" fill="transparent" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              
              {simulationResult && (
                <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in-95">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">রিস্ক স্কোর</p>
                    <p className="text-xl font-headline font-bold text-destructive">{simulationResult.estimatedRiskScore}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">রেস্কিউ টিম</p>
                    <p className="text-xl font-headline font-bold text-primary">{simulationResult.requiredResponders.rescue} Units</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">মেডিকেল সাপোর্ট</p>
                    <p className="text-xl font-headline font-bold text-accent">{simulationResult.requiredResponders.medical} Teams</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/5 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                <ScrollText className="text-primary" size={16} /> অডিট রেজিস্ট্রি (Immutable Global Ledger)
              </CardTitle>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground">
                <RefreshCw size={12} />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-muted/20 border border-white/5 rounded-xl flex items-start justify-between group hover:bg-muted/40 transition-all">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[7px] h-4 uppercase border-primary/30 text-primary">
                            {log.action}
                          </Badge>
                          <span className="text-[8px] text-muted-foreground">
                            {log.timestamp?.toDate?.()?.toLocaleString('bn-BD') || 'Pending Sync'}
                          </span>
                        </div>
                        {log.signature && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1.5 p-1.5 bg-black/40 rounded border border-white/5 flex-1">
                              <Lock size={10} className="text-accent" />
                              <code className="text-[8px] text-accent/70 font-mono truncate">
                                SIG: {log.signature}
                              </code>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => verifyAuditLog(log)}
                              className="h-7 text-[8px] uppercase font-bold tracking-widest text-primary hover:bg-primary/10"
                            >
                              <ShieldQuestion size={10} className="mr-1" /> ভেরিফাই
                            </Button>
                          </div>
                        )}
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
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                <Signal size={16} className="text-accent animate-pulse" /> Network Telemetry
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

          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-headline font-bold text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={14} /> Global Sovereignty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                আপনার সিস্টেম এখন **Self-Healing** ও **Cross-Currency** সক্ষমতা সম্পন্ন। **AI Fraud Prediction** এখন প্রতিটি লেনদেন মনিটর করছে।
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Self-Healing Loop</span>
                  <span className="text-accent">ACTIVE</span>
                </div>
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">AI Risk Engine</span>
                  <span className="text-accent">READY</span>
                </div>
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Global Swap Rate</span>
                  <span className="text-accent">SYNCED</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={verificationData.open} onOpenChange={(open) => setVerificationData(prev => ({ ...prev, open }))}>
        <DialogContent className="bg-card border-primary/20 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-headline flex items-center gap-2">
              <FileSearch className="text-primary" />
              Global Sovereignty Check
            </DialogTitle>
            <DialogDescription className="text-xs">RSA v2 & Global Ledger Integrity</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            {verificationData.verifying ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-[10px] font-mono animate-pulse uppercase">Auditing Global Ledger...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl border flex flex-col items-center gap-3 ${verificationData.result ? 'bg-accent/10 border-accent/30' : 'bg-destructive/10 border-destructive/30'}`}>
                  {verificationData.result ? (
                    <>
                      <CheckCircle2 size={48} className="text-accent" />
                      <div className="text-center">
                        <h4 className="font-headline font-bold text-accent">GLOBAL INTEGRITY CONFIRMED</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">সকল নোড ও লেজার সিঙ্ক্রোনাইজড।</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={48} className="text-destructive animate-bounce" />
                      <div className="text-center">
                        <h4 className="font-headline font-bold text-destructive">ANOMALY DETECTED</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">লেজার অসামঞ্জস্যতা পাওয়া গেছে!</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button className="w-full bg-primary text-background font-bold" onClick={() => setVerificationData(prev => ({ ...prev, open: false }))}>
            বন্ধ করুন
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
