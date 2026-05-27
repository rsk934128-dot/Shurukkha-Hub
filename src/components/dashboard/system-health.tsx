
"use client"

import React, { useState } from 'react'
import { Activity, Zap, ShieldCheck, TrendingUp, BrainCircuit, Play, Loader2, AlertTriangle, Users, Database, ShieldAlert, Bug } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { runPredictiveSimulation, type PredictiveSimulationOutput } from '@/ai/flows/predictive-simulation-flow'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XValue, YValue, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

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
  const [simulationResult, setSimulationResult] = useState<PredictiveSimulationOutput | null>(null)
  const { toast } = useToast()

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
        description: "ভবিষ্যতের ঝুঁকি বিশ্লেষণ সম্পন্ন হয়েছে। রিপোর্ট চেক করুন।",
      })
    } catch (e) {
      toast({ title: "Simulation Failed", variant: "destructive" })
    } finally {
      setIsSimulating(false)
    }
  }

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
        // Small delay to simulate rapid-fire arrival
        await new Promise(r => setTimeout(r, 500));
      }
      
      toast({
        title: "Stress Test Successful",
        description: "১০টি অ্যালার্ট সফলভাবে পুশ করা হয়েছে। অর্কেস্ট্রেটর এগুলো প্রসেস করছে।",
      })
    } catch (e) {
      toast({ title: "Stress Test Failed", variant: "destructive" })
    } finally {
      setIsStressTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap size={14} className="text-accent" /> এআই রেসপন্স ল্যাটেন্সি
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-headline font-bold">{isStressTesting ? '৮৯ms' : '৪২ms'}</span>
              <Badge variant="outline" className={`text-[8px] h-4 ${isStressTesting ? 'text-destructive border-destructive/30' : 'text-accent border-accent/30'}`}>
                {isStressTesting ? '+৪৫% LOAD' : '-১২%'}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">গড় ডিসপ্যাচ প্রসেসিং সময়</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" /> অটোমেশন সাকসেস
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-headline font-bold">৯৮.৪%</span>
              <Badge variant="outline" className="text-[8px] border-primary/30 text-primary h-4">STABLE</Badge>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">স্বয়ংক্রিয় ডিসপ্যাচ নির্ভুলতা</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity size={14} className="text-destructive" /> সিস্টেম লোড
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-headline font-bold">{isStressTesting ? '৮২%' : '২৪%'}</span>
              <Progress value={isStressTesting ? 82 : 24} className="h-1 flex-1 bg-muted [&>div]:bg-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">কারেন্ট ইনফ্রাস্ট্রাকচার ইউসেজ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 bg-card border-white/5 overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
                <BrainCircuit className="text-accent" size={16} /> প্রিডিক্টিভ সিমুলেশন ও স্ট্রেস ইঞ্জিন
              </CardTitle>
              <CardDescription className="text-[10px]">What-if সিনারিও অ্যানালাইসিস এবং লোড টেস্টিং</CardDescription>
            </div>
            <div className="flex gap-2">
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
                রান সিমুলেশন
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
                      <p className="text-[10px] leading-tight text-destructive font-bold uppercase">Extreme Risk Identified</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">প্রয়োজনীয় রিসোর্স</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="flex items-center gap-1"><Users size={10}/> Rescue</span>
                        <span className="font-bold">{simulationResult.requiredResponders.rescue} Units</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="flex items-center gap-1"><Users size={10}/> Medical</span>
                        <span className="font-bold">{simulationResult.requiredResponders.medical} Teams</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">হাই-প্রায়োরিটি জোন</p>
                    <div className="flex flex-wrap gap-1">
                      {simulationResult.priorityZones.map(zone => (
                        <Badge key={zone} variant="outline" className="text-[8px] border-destructive/30 text-destructive">{zone}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <h4 className="text-[10px] font-bold uppercase text-accent mb-2 flex items-center gap-2">
                    <TrendingUp size={12} /> এআই স্ট্র্যাটেজিক কমান্ড ব্রিফিং
                  </h4>
                  <p className="text-xs leading-relaxed font-body italic">"{simulationResult.strategicAdvice}"</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {simulationResult.bottleneckWarnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2 bg-destructive/5 rounded-lg border border-destructive/10">
                      <AlertTriangle size={12} className="text-destructive mt-0.5" />
                      <p className="text-[10px] text-destructive/80 font-medium">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 opacity-20 text-center grayscale">
                <BrainCircuit size={64} className="mb-4" />
                <p className="text-sm font-headline font-bold">সিমুলেশন ও স্ট্রেস ইঞ্জিন স্ট্যান্ডবাই</p>
                <p className="text-xs">সিস্টেমের স্থায়িত্ব এবং ভবিষ্যতের ঝুঁকি যাচাই করতে রান করুন</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 bg-card border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={16} /> পারফরম্যান্স ট্রেন্ড
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ChartContainer config={{ 
              latency: { label: "Latency", color: "hsl(var(--primary))" },
              success: { label: "Success Rate", color: "hsl(var(--accent))" }
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" fontSize={10} stroke="rgba(255,255,255,0.3)" />
                  <YAxis fontSize={10} stroke="rgba(255,255,255,0.3)" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="latency" stroke="var(--color-latency)" strokeWidth={2} dot={{ fill: 'var(--color-latency)' }} />
                  <Line type="monotone" dataKey="success" stroke="var(--color-success)" strokeWidth={2} dot={{ fill: 'var(--color-success)' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" /> ল্যাটেন্সি (ms)
              </div>
              <div className="flex items-center gap-1.5 text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-accent" /> সাকসেস রেট (%)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
