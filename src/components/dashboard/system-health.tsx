"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Zap, ShieldCheck, TrendingUp, BrainCircuit, Play, Loader2, AlertTriangle, Users, Database, ShieldAlert, Bug, ScrollText, Lock, CheckCircle2, ShieldQuestion, FileSearch, ShieldX, Camera, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { runPredictiveSimulation, type PredictiveSimulationOutput } from '@/ai/flows/predictive-simulation-flow'
import { useToast } from '@/hooks/use-toast'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const PERFORMANCE_DATA = [
  { name: '08:00', latency: 45, success: 98 },
  { name: '10:00', latency: 52, success: 96 },
  { name: '12:00', latency: 38, success: 100 },
  { name: '14:00', latency: 65, success: 92 },
  { name: '16:00', latency: 42, success: 99 },
]

export function SystemHealth() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [isStressTesting, setIsStressTesting] = useState(false)
  const [isLocking, setIsLocking] = useState(false)
  const [isSnapshotting, setIsSnapshotting] = useState(false)
  const [simulationResult, setSimulationResult] = useState<PredictiveSimulationOutput | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [tamperingDetected, setTamperingDetected] = useState(false)
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
      
      // Automatic Integrity Check Simulation
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

  const handleMassStressTest = async () => {
    setIsStressTesting(true)
    toast({
      title: "Stress Test Initiated",
      description: "সিস্টেমে ১০টি ফেক SOS অ্যালার্ট পুশ করা হচ্ছে...",
    })

    const testLocations = ["কাজীপুর চর", "সদরের দক্ষিণ অংশ", "বেলকুচি ঘাট", "এনায়েতপুর বাজার"];
    const testTypes = ["বন্যা উদ্ধার", "মেডিকেল ইমার্জেন্সি", "অগ্নিকাণ্ড"];

    try {
      for (let i = 0; i < 10; i++) {
        await addDoc(collection(db, "sos_alerts"), {
          location: testLocations[i % testLocations.length] + ` (Test-${i+1})`,
          type: testTypes[i % testTypes.length],
          status: 'pending',
          timestamp: serverTimestamp(),
          isStressTest: true,
          reporterId: 'system_stress_bot'
        });
        await new Promise(r => setTimeout(r, 500));
      }
      toast({ title: "Stress Test Successful" })
    } catch (e) {
      toast({ title: "Stress Test Failed", variant: "destructive" })
    } finally {
      setIsStressTesting(false)
    }
  }

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
            অডিট রেজিস্ট্রিতে অননুমোদিত পরিবর্তন লক্ষ্য করা গেছে। ফরেনসিক অডিট প্রয়োজন।
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap size={14} className="text-accent" /> এআই ল্যাটেন্সি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-headline font-bold">{isStressTesting ? '৮৯ms' : '৪২ms'}</span>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> অখণ্ডতা স্কোর
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-2xl font-headline font-bold ${tamperingDetected ? 'text-destructive' : 'text-primary'}`}>
              {tamperingDetected ? 'CRITICAL' : '১০০%'}
            </span>
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
              <Activity size={14} className="text-destructive" /> লোড
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={isStressTesting ? 82 : 24} className="h-1 bg-muted [&>div]:bg-destructive" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card border-white/5 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                  <BrainCircuit className="text-accent" size={16} /> প্রিডিক্টিভ ইঞ্জিন ও ফরেনসিক টুলস
                </CardTitle>
                <CardDescription className="text-[10px]">সার্বভৌম নিরাপত্তা ও ভবিষ্যত ঝুঁকি বিশ্লেষণ</CardDescription>
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
                  variant="outline"
                  onClick={handleMassStressTest} 
                  disabled={isStressTesting}
                  className="border-destructive/30 text-destructive font-bold h-8 text-[10px] gap-2 hover:bg-destructive/10"
                >
                  {isStressTesting ? <Loader2 size={12} className="animate-spin" /> : <Bug size={12} />}
                  স্ট্রেস টেস্ট
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
            <CardContent className="p-0">
              {simulationResult ? (
                <div className="p-6 space-y-6 animate-in fade-in zoom-in-95">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">রিস্ক প্রজেকশন</p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                            <circle cx="32" cy="32" r="28" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray={176} strokeDashoffset={176 - (176 * simulationResult.estimatedRiskScore) / 100} className="text-destructive" />
                          </svg>
                          <span className="absolute text-xs font-bold">{simulationResult.estimatedRiskScore}%</span>
                        </div>
                        <p className="text-[10px] leading-tight text-destructive font-bold uppercase">Extreme Risk</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">প্রয়োজনীয় রিসোর্স</p>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold">Rescue: {simulationResult.requiredResponders.rescue} Units</p>
                        <p className="text-[10px] font-bold">Medical: {simulationResult.requiredResponders.medical} Teams</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">জোন অ্যালার্ট</p>
                      <div className="flex flex-wrap gap-1">
                        {simulationResult.priorityZones.map(zone => (
                          <Badge key={zone} variant="outline" className="text-[8px] border-destructive/30 text-destructive">{zone}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 opacity-20 text-center">
                  <BrainCircuit size={64} className="mb-4" />
                  <p className="text-sm font-headline font-bold uppercase tracking-widest">Sovereign Intelligence Ready</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-white/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/5 py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                <ScrollText className="text-primary" size={16} /> অডিট রেজিস্ট্রি (Immutable Log)
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
                <TrendingUp size={16} /> অপারেশনাল ট্রেন্ড
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] pt-4">
              <ChartContainer config={{ 
                latency: { label: "Latency", color: "hsl(var(--primary))" },
                success: { label: "Success", color: "hsl(var(--accent))" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" fontSize={8} stroke="rgba(255,255,255,0.3)" />
                    <YAxis fontSize={8} stroke="rgba(255,255,255,0.3)" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="latency" stroke="var(--color-latency)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-headline font-bold text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldAlert size={14} /> Mission Integrity Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                প্রতিটি লেনদেন **SHA256withRSA** সিগনেচার দ্বারা সুরক্ষিত। **Emergency Lock** সক্রিয় থাকলে সব থার্ড-পার্টি ট্রাফিক স্বয়ংক্রিয়ভাবে রিভোক করা হবে।
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Audit Registry Status</span>
                  <span className="text-accent">ENCRYPTED</span>
                </div>
                <div className="flex justify-between text-[9px] uppercase font-bold">
                  <span className="text-muted-foreground">Lockdown Protocol</span>
                  <span className={isLocked ? "text-destructive" : "text-primary"}>
                    {isLocked ? "ENABLED" : "STANDBY"}
                  </span>
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
              Sovereign Verification
            </DialogTitle>
            <DialogDescription className="text-xs">RSA v2 সিগনেচার ইনটিগ্রিটি চেক</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            {verificationData.verifying ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-[10px] font-mono animate-pulse uppercase">Calculating SHA256 Hash...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={`p-6 rounded-2xl border flex flex-col items-center gap-3 ${verificationData.result ? 'bg-accent/10 border-accent/30' : 'bg-destructive/10 border-destructive/30'}`}>
                  {verificationData.result ? (
                    <>
                      <CheckCircle2 size={48} className="text-accent" />
                      <div className="text-center">
                        <h4 className="font-headline font-bold text-accent">INTEGRITY CONFIRMED</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">ডেটা অপরিবর্তিত আছে।</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={48} className="text-destructive animate-bounce" />
                      <div className="text-center">
                        <h4 className="font-headline font-bold text-destructive">TAMPERING DETECTED</h4>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">সিগনেচার ম্যাচ করেনি!</p>
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