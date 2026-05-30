
"use client"

import React, { useState, useEffect } from 'react'
import { Landmark, Users, Clock, TrendingUp, DollarSign, ShieldCheck, PieChart, Activity, UserCheck, Briefcase, Calculator, ArrowUpRight, Zap, Target, Gavel, Scale, Trophy, Rocket, Sparkles, Star, Terminal, Loader2, Code2, CheckCircle2, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SovereignAudit } from '@/lib/sovereign-audit'
import { GoogleDriveBridge } from '@/lib/google-drive-bridge'
import { useToast } from '@/hooks/use-toast'

export function ImperialManagement() {
  const [budget, setBudget] = useState({
    total: 25000000,
    spent: 4250000,
    reserved: 20750000,
    revenue: 186750
  })

  const [projectProgress, setProjectProgress] = useState(42)
  const targetProjects = 400
  const [isSimulating, setIsSimulating] = useState(false)
  const [syncLogs, setSyncLogs] = useState<string[]>([])
  
  const { toast } = useToast()

  const milestones = [
    { id: 1, title: 'Sheikh Code Exchange (42nd)', status: 'COMPLETED', impact: 'High' },
    { id: 2, title: 'Sovereign ID Protocol', status: 'ACTIVE', impact: 'Critical' },
    { id: 3, title: 'Global Treasury Integration', status: 'ACTIVE', impact: 'Economic' },
    { id: 4, title: 'Mission-Critical SOS Grid', status: 'STABLE', impact: 'Social' },
  ]

  const budgetAllocation = [
    { sector: 'Infrastructure', amount: 12000000, color: 'bg-primary' },
    { sector: 'Rescue Operations', amount: 8000000, color: 'bg-accent' },
    { sector: 'Payroll & Social', amount: 3000000, color: 'bg-green-500' },
    { sector: 'AI & Security', amount: 2000000, color: 'bg-purple-500' },
  ]

  const handleEngageSimulation = async () => {
    setIsSimulating(true);
    setSyncLogs([]);
    try {
      await GoogleDriveBridge.simulateCodeExchange((msg) => {
        setSyncLogs(prev => [msg, ...prev]);
      });
      await SovereignAudit.logEvolution(42, 'Sheikh Code Exchange Sync Success');
      toast({ title: "SIMULATION SUCCESSFUL", description: "Project 42 data offloaded to vault." });
    } catch (e) {
      toast({ title: "SIMULATION FAILED", variant: "destructive" });
    } finally {
      setIsSimulating(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Sovereign Growth Header */}
      <div className="p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/20 rounded-[2.5rem] relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-45 transition-transform duration-1000">
            <Trophy size={200} className="text-primary" />
         </div>
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
               <div className="relative">
                  <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl border-2 border-primary/40 flex items-center justify-center">
                     <Rocket className="text-primary animate-bounce" size={40} />
                  </div>
               </div>
               <div>
                  <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-foreground">Sovereign Growth Engine</h2>
                  <p className="text-xs text-muted-foreground italic max-w-md">"পরিশ্রম ভাগ্যকে বদলে দেয়"—আপনার ৪০০ প্রজেক্টের যাত্রায় আপনি এখন ৪২তম মাইলফলকে আছেন।</p>
               </div>
            </div>
            <div className="w-full md:w-80 space-y-3">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-primary">Project 42 Progress</span>
                  <span className="text-foreground">{Math.round((projectProgress / targetProjects) * 100)}% to Empire</span>
               </div>
               <Progress value={(projectProgress / targetProjects) * 100} className="h-2 bg-white/5 [&>div]:bg-primary" />
               <div className="flex justify-between items-center text-[8px] text-muted-foreground uppercase font-mono">
                  <span>Start: 001</span>
                  <span>Target: 400 Projects</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Milestones & Evolution */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sheikh Code Exchange Simulation Card */}
          <Card className="bg-card/40 border-accent/20 overflow-hidden rounded-[2.5rem] neon-glow-accent">
             <CardHeader className="bg-accent/10 border-b border-white/5 py-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                         <Code2 size={20} className={isSimulating ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                         <CardTitle className="text-sm font-headline uppercase tracking-widest text-accent">Sheikh Code Exchange (Project 42)</CardTitle>
                         <CardDescription className="text-[8px] font-bold uppercase">Live Grid Synchronization HUD</CardDescription>
                      </div>
                   </div>
                   <Button onClick={handleEngageSimulation} disabled={isSimulating} size="sm" className="h-9 bg-accent text-background font-bold text-[9px] gap-2 rounded-xl">
                      {isSimulating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} fill="currentColor" />}
                      ENGAGE SYNC
                   </Button>
                </div>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="aspect-[21/9] bg-black/60 rounded-3xl border border-white/10 overflow-hidden relative font-mono text-[10px] p-4 group">
                   <div className="absolute top-2 right-4 flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500/40" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/40" />
                      <div className="w-2 h-2 rounded-full bg-green-500/40" />
                   </div>
                   <ScrollArea className="h-full">
                      {syncLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 opacity-40">
                           <Terminal size={40} className="mb-2" />
                           <p className="uppercase tracking-[0.3em]">Awaiting Imperial Command...</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                           {syncLogs.map((log, i) => (
                             <p key={i} className={`animate-in slide-in-from-left-2 duration-300 ${log.includes('SUCCESS') ? 'text-accent' : 'text-primary/70'}`}>
                                <span className="text-muted-foreground mr-2">&gt;</span> {log}
                             </p>
                           ))}
                        </div>
                      )}
                   </ScrollArea>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="p-3 bg-muted/20 border border-white/5 rounded-2xl flex flex-col items-center gap-1">
                      <CheckCircle2 className="text-accent" size={14} />
                      <p className="text-[7px] uppercase font-bold text-muted-foreground">Encryption</p>
                      <p className="text-[10px] font-bold">RSA_V2_ACTIVE</p>
                   </div>
                   <div className="p-3 bg-muted/20 border border-white/5 rounded-2xl flex flex-col items-center gap-1">
                      <Database className="text-primary" size={14} />
                      <p className="text-[7px] uppercase font-bold text-muted-foreground">Grid Nodes</p>
                      <p className="text-[10px] font-bold">42_SYNCED</p>
                   </div>
                   <div className="p-3 bg-muted/20 border border-white/5 rounded-2xl flex flex-col items-center gap-1">
                      <Globe className="text-accent" size={14} />
                      <p className="text-[7px] uppercase font-bold text-muted-foreground">Latency</p>
                      <p className="text-[10px] font-bold">0.004ms</p>
                   </div>
                </div>
             </CardContent>
          </Card>

          <Card className="bg-card/40 border-white/10 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-primary/5 border-b border-white/5">
              <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                <Star size={18} className="text-primary animate-pulse" /> Fate Changing Milestones
              </CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-primary/60">মাইলফলকগুলো আপনার পরিশ্রমের রাজকীয় প্রতিফলন</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-white/5">
                  {milestones.map((m, i) => (
                    <div key={i} className="p-5 hover:bg-primary/5 transition-all group">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-white/10 group-hover:border-primary/40">
                                <Zap size={18} className="text-primary" />
                             </div>
                             <div>
                                <h4 className="text-xs font-bold text-foreground">{m.title}</h4>
                                <p className="text-[9px] text-muted-foreground uppercase">Impact Vector: {m.impact}</p>
                             </div>
                          </div>
                          <Badge className={m.status === 'COMPLETED' ? 'bg-accent text-background' : 'bg-primary/20 text-primary'}>
                             {m.status}
                          </Badge>
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-4 bg-muted/10 border-t border-white/5">
                  <Button variant="outline" className="w-full h-10 border-accent/20 text-accent text-[10px] uppercase font-bold gap-2 rounded-xl">
                    <Sparkles size={14} /> ত্বরান্বিত করুন (Accelerate Fate)
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Financial & Payroll */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20 p-5 space-y-2 relative overflow-hidden">
               <Landmark className="absolute -right-4 -bottom-4 opacity-5" size={100} />
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Imperial Budget</p>
               <h3 className="text-2xl font-headline font-bold text-foreground">৳{(budget.total / 10000000).toFixed(2)} Cr</h3>
               <Badge variant="outline" className="text-[7px] border-primary/40 text-primary">FY 2026-27</Badge>
            </Card>
            <Card className="bg-accent/5 border-accent/20 p-5 space-y-2">
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Revenue</p>
               <h3 className="text-2xl font-headline font-bold text-accent">৳{budget.revenue.toLocaleString()}</h3>
               <p className="text-[8px] text-accent animate-pulse">FLOWING FROM GRID</p>
            </Card>
          </div>

          <Card className="bg-card/40 border-primary/20 rounded-[2.5rem] overflow-hidden">
             <CardHeader className="bg-primary/5 border-b border-white/5 py-6">
                <CardTitle className="text-xs font-headline uppercase tracking-[0.2em] flex items-center gap-2">
                   <Calculator size={18} className="text-primary" /> Payroll & Settlement Ledger
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="flex flex-col gap-4">
                   <div className="p-4 bg-muted/20 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Briefcase size={20} />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-foreground">Total Payroll Pool</p>
                            <p className="text-xs text-muted-foreground">Monthly Allocation</p>
                         </div>
                      </div>
                      <p className="text-lg font-headline font-bold text-primary">৳৩,০০,০০০</p>
                   </div>
                   
                   <div className="p-4 bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                            <DollarSign size={20} />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-foreground">Average Salary</p>
                            <p className="text-xs text-muted-foreground">Sovereign Standard</p>
                         </div>
                      </div>
                      <p className="text-lg font-headline font-bold text-accent">৳১৫,০০০</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Settlement Protocol</h4>
                   <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                         <ShieldCheck className="text-green-500" size={16} />
                         <span className="text-[10px] font-bold">Automated Crypto Payout Enabled</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                        "মহামান্য সম্রাট, কর্মচারীদের বেতন সরাসরি আপনার 'Rubelpay' প্রোটোকলের মাধ্যমে USDT বা স্থানীয় ব্যাংকিং নোডে ১ মিলি-সেকেন্ডের মধ্যে সেটল করা সম্ভব।"
                      </p>
                      <Button className="w-full h-11 bg-primary text-background font-bold rounded-xl gap-2 shadow-lg shadow-primary/20">
                         <Zap size={16} fill="currentColor" /> রিলিজ মাসব্যাপী বেতন
                      </Button>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
