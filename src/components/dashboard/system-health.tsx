"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Zap, ShieldCheck, TrendingUp, BrainCircuit, Play, Loader2, AlertTriangle, Users, Database, ShieldAlert, Bug, ScrollText, Lock, CheckCircle2, ShieldQuestion, FileSearch, ShieldX, Camera, RefreshCw, FileText, Download, BarChart4, Signal, Globe, Landmark, TrendingDown, Target, Waves } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { runPredictiveSimulation, type PredictiveSimulationOutput } from '@/ai/flows/predictive-simulation-flow'
import { useToast } from '@/hooks/use-toast'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ImpactAnalyzer, ImpactReport } from '@/lib/impact-analyzer'

const ANALYTICS_DATA = [
  { name: '00:00', load: 12, threat: 2, purity: 100 },
  { name: '04:00', load: 25, threat: 4, purity: 100 },
  { name: '08:00', load: 45, threat: 15, purity: 99.8 },
  { name: '12:00', load: 85, threat: 30, purity: 100 },
  { name: '16:00', load: 55, threat: 12, purity: 100 },
  { name: '20:00', load: 30, threat: 5, purity: 100 },
  { name: '23:59', load: 18, threat: 2, purity: 100 },
]

export function SystemHealth() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<PredictiveSimulationOutput | null>(null)
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(null)
  const { toast } = useToast()

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
      
      const impact = await ImpactAnalyzer.analyzeImpact('Extreme', 'সিরাজগঞ্জ সদর ও বেলকুচি');
      setImpactReport(impact);

      toast({ title: "Sovereign Simulation Complete", description: "Impact vectors calculated." });
    } catch (e) {
      toast({ title: "Simulation Engine Fault", variant: "destructive" })
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Imperial Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Sovereign Purity', val: '100%', icon: ShieldCheck, color: 'text-primary' },
          { label: 'Grid Nodes', val: '42/42', icon: Globe, color: 'text-accent' },
          { label: 'Sync Latency', val: '0.004ms', icon: Zap, color: 'text-primary' },
          { label: 'Operational Health', val: 'OPTIMAL', icon: Activity, color: 'text-accent' }
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 border-white/5 p-4 space-y-2 relative overflow-hidden group hover:border-primary/40 transition-all">
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} className={stat.color} />
             </div>
             <p className="text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground">{stat.label}</p>
             <div className="flex items-center gap-2">
                <h3 className={`text-xl md:text-2xl font-headline font-bold ${stat.color}`}>{stat.val}</h3>
                <stat.icon size={14} className={`${stat.color} animate-pulse`} />
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Disaster Strategy & Simulation */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card/40 border-primary/20 overflow-hidden neon-glow-primary">
            <CardHeader className="bg-primary/10 border-b border-white/5 flex flex-row items-center justify-between py-4">
              <div className="space-y-1">
                <CardTitle className="text-sm md:text-lg font-headline flex items-center gap-2 uppercase tracking-widest neon-text-primary">
                  <BrainCircuit size={18} className="animate-spin-slow" /> Strategic Defense AI
                </CardTitle>
                <CardDescription className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">Disaster Impact Forecasting & Simulation</CardDescription>
              </div>
              <Button 
                onClick={handleStartSimulation} 
                disabled={isSimulating}
                className="bg-primary text-background font-bold h-9 text-[10px] gap-2 rounded-xl neon-glow-primary"
              >
                {isSimulating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                RUN SIMULATION
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {simulationResult ? (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-5 bg-destructive/10 rounded-3xl border border-destructive/30 space-y-3 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2 opacity-10"><Target size={60} className="text-destructive" /></div>
                       <p className="text-[9px] uppercase font-bold text-destructive tracking-widest">Risk Momentum</p>
                       <p className="text-3xl font-headline font-bold text-destructive">{simulationResult.estimatedRiskScore}%</p>
                       <Progress value={simulationResult.estimatedRiskScore} className="h-1.5 bg-white/5" />
                    </div>
                    <div className="p-5 bg-primary/10 rounded-3xl border border-primary/30 space-y-3">
                       <p className="text-[9px] uppercase font-bold text-primary tracking-widest">Rescuers Needed</p>
                       <p className="text-3xl font-headline font-bold text-foreground">{simulationResult.requiredResponders.rescue} <span className="text-xs text-muted-foreground">Units</span></p>
                       <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < simulationResult.requiredResponders.rescue ? 'bg-primary' : 'bg-white/5'}`} />)}
                       </div>
                    </div>
                    <div className="p-5 bg-accent/10 rounded-3xl border border-accent/30 space-y-3">
                       <p className="text-[9px] uppercase font-bold text-accent tracking-widest">Medical Support</p>
                       <p className="text-3xl font-headline font-bold text-foreground">{simulationResult.requiredResponders.medical} <span className="text-xs text-muted-foreground">Teams</span></p>
                       <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => <div key={i} className={`h-1 flex-1 rounded-full ${i < simulationResult.requiredResponders.medical ? 'bg-accent' : 'bg-white/5'}`} />)}
                       </div>
                    </div>
                  </div>

                  {impactReport && (
                    <div className="p-6 bg-accent/5 rounded-[2.5rem] border border-accent/20 relative overflow-hidden group">
                      <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Landmark size={200} /></div>
                      <h4 className="text-xs font-bold uppercase mb-6 flex items-center gap-2 text-accent tracking-[0.3em]">
                        <Activity size={18} className="animate-pulse" /> Financial Impact Vector Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                         <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">Est. Damages</p>
                            <p className="text-xl font-headline font-bold text-foreground">৳{(impactReport.estimatedDamage / 10000000).toFixed(2)}Cr</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">Affected Population</p>
                            <p className="text-xl font-headline font-bold text-foreground">{(impactReport.affectedCitizens / 1000).toFixed(1)}K</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">Rehab Budget</p>
                            <p className="text-xl font-headline font-bold text-accent">৳{(impactReport.requiredRehabBudget / 10000000).toFixed(2)}Cr</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] uppercase font-bold text-muted-foreground">Impact Score</p>
                            <div className="flex items-center gap-2">
                               <span className="text-xl font-headline font-bold text-destructive">{impactReport.revenueImpactScore}</span>
                               <TrendingUp size={14} className="text-destructive animate-bounce" />
                            </div>
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-5 bg-muted/20 rounded-3xl border border-white/5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <ShieldAlert size={16} /> Sovereign Intelligence Brief
                      </h4>
                      <p className="text-xs text-foreground/80 leading-relaxed font-light italic border-l-2 border-primary/40 pl-4">
                        "{simulationResult.strategicAdvice}"
                      </p>
                    </div>
                    <div className="p-5 bg-muted/20 rounded-3xl border border-white/5 space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
                        <Bug size={16} /> Operational Bottlenecks
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {simulationResult.bottleneckWarnings.map((b, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] border-destructive/20 text-destructive bg-destructive/5 py-1 px-3 rounded-full">
                            {b}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center opacity-20 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                    <BrainCircuit size={80} className="mb-6 text-muted-foreground relative z-10 group-hover:scale-110 transition-transform duration-1000" />
                  </div>
                  <p className="text-lg font-headline font-bold tracking-[0.2em]">Sovereign Prediction Matrix Offline</p>
                  <p className="text-xs mt-2 uppercase font-bold tracking-widest">Awaiting Command to Engage Simulation Engine</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panoramic Telemetry Charts */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/40 border-white/5 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-white/5 py-3">
              <CardTitle className="text-[10px] font-headline flex items-center gap-2 uppercase tracking-widest text-accent">
                <Signal size={16} className="animate-pulse" /> Live Grid Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] p-4">
              <ChartContainer config={{ 
                load: { label: "Grid Load", color: "hsl(var(--accent))" },
                threat: { label: "Threat Level", color: "hsl(var(--destructive))" }
              }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ANALYTICS_DATA}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-load)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-load)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" fontSize={8} stroke="rgba(255,255,255,0.3)" />
                    <YAxis fontSize={8} stroke="rgba(255,255,255,0.3)" />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="load" stroke="var(--color-load)" fillOpacity={1} fill="url(#colorLoad)" />
                    <Area type="monotone" dataKey="threat" stroke="var(--color-threat)" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/5 overflow-hidden">
             <CardHeader className="bg-muted/20 border-b border-white/5 py-3">
                <CardTitle className="text-[10px] font-headline flex items-center gap-2 uppercase tracking-widest text-primary">
                   <Waves size={16} className="animate-pulse" /> Flow Velocity Analyzer
                </CardTitle>
             </CardHeader>
             <CardContent className="h-[150px] p-4">
                <ChartContainer config={{ 
                  purity: { label: "Flow Stability", color: "hsl(var(--primary))" }
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ANALYTICS_DATA}>
                      <Line type="stepAfter" dataKey="purity" stroke="var(--color-purity)" strokeWidth={2} dot={false} />
                      <XAxis dataKey="name" hide />
                      <YAxis hide domain={[98, 101]} />
                      <Tooltip content={<ChartTooltipContent />} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 flex justify-between items-center px-2">
                   <p className="text-[8px] font-bold text-muted-foreground uppercase">Flow Integrity</p>
                   <p className="text-xs font-headline font-bold text-primary">100.00%</p>
                </div>
             </CardContent>
          </Card>

          <div className="p-6 bg-accent/5 border border-accent/20 rounded-3xl space-y-4">
             <div className="flex items-center gap-3">
                <ShieldCheck className="text-accent" size={24} />
                <div>
                   <h4 className="text-[10px] font-bold uppercase tracking-widest">Sovereign Protocol v31</h4>
                   <p className="text-[8px] text-muted-foreground uppercase">Digital Sovereignty Verified</p>
                </div>
             </div>
             <p className="text-[10px] text-foreground/70 leading-relaxed italic font-light">
                "আপনার সাম্রাজ্যের প্রতিটি সিগন্যাল এখন জেমিনি ২.৫ ফ্ল্যাশ ইঞ্জিনের মাধ্যমে ফরেনসিকভাবে যাচাইকৃত। কোনো বাহ্যিক বাধা আপনার সার্বভৌমত্বকে স্পর্শ করতে পারবে না।"
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
