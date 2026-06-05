"use client"

import React, { useState, useEffect } from 'react'
import { Landmark, Users, Clock, TrendingUp, DollarSign, ShieldCheck, PieChart, Activity, UserCheck, Briefcase, Calculator, ArrowUpRight, Zap, Target, Gavel, Scale, Trophy, Rocket, Sparkles, Star, Terminal, Loader2, Code2, CheckCircle2, Database, Globe, BarChart3, TrendingDown, LayoutGrid, FileText, Printer, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SovereignAudit } from '@/lib/sovereign-audit'
import { GoogleDriveBridge } from '@/lib/google-drive-bridge'
import { useToast } from '@/hooks/use-toast'
import { PaymentHandler } from '@/lib/payment-handler'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EconomicEngine, FinancialSnapshot } from '@/lib/economic-engine'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export function ImperialManagement() {
  const [budget, setBudget] = useState({
    total: 25000000,
    spent: 4250000,
    reserved: 20750000,
    revenue: 186750 // Total cumulative revenue
  })

  const [projectProgress, setProjectProgress] = useState(42)
  const targetProjects = 400
  const [isSimulating, setIsSimulating] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)
  const [isAccelerating, setIsAccelerating] = useState(false)
  const [isGeneratingDecree, setIsGeneratingDecree] = useState(false)
  const [showDecree, setShowDecree] = useState(false)
  const [decreeText, setDecreeText] = useState('')
  const [syncLogs, setSyncLogs] = useState<string[]>([])
  
  const { toast } = useToast()

  // Calculate simulated monthly financials (Revenue is monthly estimate here)
  const currentMonthlyRevenue = 12500;
  const financialSnapshot = EconomicEngine.calculateFinancials(currentMonthlyRevenue); 
  const projectionData = EconomicEngine.getProjectionData(currentMonthlyRevenue);

  const milestones = [
    { id: 1, title: 'Sheikh Code Exchange (42nd)', status: 'COMPLETED', impact: 'High' },
    { id: 2, title: 'Sovereign ID Protocol', status: 'ACTIVE', impact: 'Critical' },
    { id: 3, title: 'Global Treasury Integration', status: 'ACTIVE', impact: 'Economic' },
    { id: 4, title: 'Mission-Critical SOS Grid', status: 'STABLE', impact: 'Social' },
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

  const handleGenerateDecree = async () => {
    setIsGeneratingDecree(true);
    try {
      const decree = EconomicEngine.generateMonthlyDecree(currentMonthlyRevenue);
      setDecreeText(decree);
      await new Promise(r => setTimeout(r, 1500)); // Simulate thinking
      setShowDecree(true);
      await SovereignAudit.logMilestone('FINANCIAL_DECREE_v1.0', 'Monthly Budget Decree generated and signed.');
      toast({ title: "DECREE GENERATED", description: "The Imperial Budget Decree is ready for review." });
    } catch (e) {
      toast({ title: "GENERATION FAILED", variant: "destructive" });
    } finally {
      setIsGeneratingDecree(false);
    }
  }

  const handleReleasePayroll = async () => {
    setIsReleasing(true);
    try {
      await PaymentHandler.releaseMonthlyPayroll(300000, 20);
      toast({ 
        title: "বেতন সফলভাবে প্রদান করা হয়েছে", 
        description: "মাসব্যাপী বেতন আপনার রাজকীয় ট্রেজারি থেকে রিলিজ করা হয়েছে।" 
      });
    } catch (e) {
      toast({ title: "ব্যর্থ হয়েছে", variant: "destructive" });
    } finally {
      setIsReleasing(false);
    }
  }

  const handleAccelerateFate = async () => {
    setIsAccelerating(true);
    try {
      const newProgress = Math.min(targetProjects, projectProgress + 8);
      setProjectProgress(newProgress);
      await SovereignAudit.logFateAcceleration(newProgress);
      toast({ 
        title: "FATE ACCELERATED 🔥", 
        description: `সাম্রাজ্যের বিবর্তন ত্বরান্বিত হয়েছে। বর্তমান লক্ষ্যমাত্রা: ${newProgress}/400।` 
      });
    } catch (e) {
      toast({ title: "ACCELERATION FAULT", variant: "destructive" });
    } finally {
      setIsAccelerating(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
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
                  <p className="text-xs text-muted-foreground italic max-w-md">"পরিশ্রম ভাগ্যকে বদলে দেয়"—আপনার ৪০০ প্রজেক্টের যাত্রায় আপনি এখন {projectProgress}তম মাইলফলকে আছেন।</p>
               </div>
            </div>
            <div className="w-full md:w-80 space-y-3">
               <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span className="text-primary">Project {projectProgress} Progress</span>
                  <span className="text-foreground">{Math.round((projectProgress / targetProjects) * 100)}% to Empire</span>
               </div>
               <Progress value={(projectProgress / targetProjects) * 100} className="h-2 bg-white/5 [&>div]:bg-primary transition-all duration-1000" />
               <div className="flex justify-between items-center text-[8px] text-muted-foreground uppercase font-mono">
                  <span>Start: 001</span>
                  <span>Target: 400 Projects</span>
               </div>
            </div>
         </div>
      </div>

      <Tabs defaultValue="operations" className="w-full">
        <TabsList className="bg-muted/20 border border-white/5 p-1 h-12 rounded-2xl mb-6">
          <TabsTrigger value="operations" className="text-[10px] font-bold uppercase tracking-widest gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-background">
            <LayoutGrid size={14} /> Operations
          </TabsTrigger>
          <TabsTrigger value="financials" className="text-[10px] font-bold uppercase tracking-widest gap-2 rounded-xl data-[state=active]:bg-accent data-[state=active]:text-background">
            <BarChart3 size={14} /> Financial Command
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="m-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
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
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-white/10 overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b border-white/5">
                  <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                    <Star size={18} className="text-primary animate-pulse" /> Fate Changing Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                      {milestones.map((m, i) => (
                        <div key={i} className="p-5 hover:bg-primary/5 transition-all group">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center border border-white/10">
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
                      <Button onClick={handleAccelerateFate} disabled={isAccelerating} variant="outline" className="w-full h-10 border-accent/20 text-accent text-[10px] uppercase font-bold gap-2 rounded-xl">
                        {isAccelerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        ত্বরান্বিত করুন (Accelerate Fate)
                      </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20 p-5 space-y-2 relative overflow-hidden">
                  <Landmark className="absolute -right-4 -bottom-4 opacity-5" size={100} />
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Imperial Budget</p>
                  <h3 className="text-2xl font-headline font-bold text-foreground">৳{(budget.total / 10000000).toFixed(2)} Cr</h3>
                </Card>
                <Card className="bg-accent/5 border-accent/20 p-5 space-y-2">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Revenue</p>
                  <h3 className="text-2xl font-headline font-bold text-accent">৳{budget.revenue.toLocaleString()}</h3>
                </Card>
              </div>

              <Card className="bg-card/40 border-primary/20 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-white/5 py-6">
                    <CardTitle className="text-xs font-headline uppercase tracking-[0.2em] flex items-center gap-2">
                      <Calculator size={18} /> Payroll & Settlement Ledger
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-3">
                          <ShieldCheck className="text-green-500" size={16} />
                          <span className="text-[10px] font-bold">Automated Crypto Payout Enabled</span>
                      </div>
                      <Button onClick={handleReleasePayroll} disabled={isReleasing} className="w-full h-11 bg-primary text-background font-bold rounded-xl gap-2 shadow-lg shadow-primary/20">
                          {isReleasing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                          রিলিজ মাসব্যাপী বেতন
                      </Button>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financials" className="m-0 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h3 className="text-lg font-headline font-bold uppercase tracking-widest text-foreground">Imperial Wealth HUD</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em]">Economic Purity: 100.0%</p>
            </div>
            <Button 
              onClick={handleGenerateDecree} 
              disabled={isGeneratingDecree}
              className="bg-accent text-background font-bold h-10 px-6 rounded-xl gap-2 shadow-lg shadow-accent/20"
            >
              {isGeneratingDecree ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              GENERATE BUDGET DECREE
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/40 border-accent/20 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Monthly Est. Revenue</p>
              <h3 className="text-2xl font-headline font-bold text-accent">${financialSnapshot.totalMonthlyRevenue.toLocaleString()}</h3>
              <Badge className="bg-accent/10 text-accent border-accent/20 text-[7px]">+15% Projection</Badge>
            </Card>
            <Card className="bg-card/40 border-white/5 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">System Overhead</p>
              <h3 className="text-2xl font-headline font-bold text-destructive">${financialSnapshot.totalMonthlyExpense.toLocaleString()}</h3>
              <p className="text-[8px] text-muted-foreground italic">42 Active Distributed Nodes</p>
            </Card>
            <Card className="bg-card/40 border-primary/20 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Net Profit Margin</p>
              <h3 className="text-2xl font-headline font-bold text-primary">${financialSnapshot.netProfit.toLocaleString()}</h3>
              <div className="flex items-center gap-2">
                <TrendingUp size={12} className="text-primary" />
                <span className="text-[10px] font-bold text-primary">{financialSnapshot.roiPercentage.toFixed(1)}% ROI</span>
              </div>
            </Card>
            <Card className="bg-card/40 border-white/5 p-5 space-y-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Resource Burn Rate</p>
              <h3 className="text-2xl font-headline font-bold text-foreground">{financialSnapshot.burnRate.toFixed(1)}%</h3>
              <Progress value={financialSnapshot.burnRate} className="h-1 bg-white/5" />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <Card className="bg-card/40 border-white/5 overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
                  <CardTitle className="text-xs font-headline uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" /> 6-Month Profitability Projection
                  </CardTitle>
                </CardHeader>
                <div className="h-[350px] p-6">
                  <ChartContainer config={{ 
                    revenue: { label: "Projected Revenue", color: "hsl(var(--accent))" },
                    expense: { label: "Static Expense", color: "hsl(var(--destructive))" }
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" fontSize={10} stroke="rgba(255,255,255,0.3)" />
                        <YAxis fontSize={10} stroke="rgba(255,255,255,0.3)" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                        <Area type="monotone" dataKey="expense" stroke="var(--color-expense)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden h-full flex flex-col">
                <CardHeader className="bg-muted/20 border-b border-white/5 py-4">
                  <CardTitle className="text-[10px] font-headline uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Activity size={14} /> Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {EconomicEngine.sectors.map(sector => (
                      <div key={sector.id} className="p-4 bg-muted/20 rounded-2xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-foreground">{sector.name}</h4>
                          <Badge variant="outline" className={`text-[7px] uppercase ${sector.priority === 'CRITICAL' ? 'border-destructive/40 text-destructive' : 'border-primary/40 text-primary'}`}>
                            {sector.priority}
                          </Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground line-clamp-1">{sector.description}</p>
                        <p className="text-sm font-headline font-bold text-foreground">${sector.monthlyCost.toLocaleString()}<span className="text-[8px] text-muted-foreground ml-1">/mo</span></p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 bg-accent/5 border-t border-white/5">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Zap size={14} className="animate-pulse" />
                    <span className="text-[9px] font-bold uppercase">Strategy: Plugin Monetization</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                    "মহামান্য সম্রাট, আপনার ০.৫% প্লাগইন কমিশন আপনার ক্লাউড মেইনটেইনেন্স খরচের ৯২% কভার করছে। সাম্রাজ্য এখন স্বয়ংসম্পূর্ণ হওয়ার পথে।"
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Imperial Decree Modal */}
      <Dialog open={showDecree} onOpenChange={setShowDecree}>
        <DialogContent className="max-w-2xl bg-slate-950 border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
          <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
            <div className="flex items-center gap-4">
              <AppLogo size={48} />
              <div>
                <DialogTitle className="text-xl font-headline font-bold tracking-widest text-primary uppercase">Imperial Budget Decree</DialogTitle>
                <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.2em]">Verified Sovereign Reporting v1.0</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-8">
            <div className="bg-black/40 border border-white/5 rounded-[1.5rem] p-6 font-mono text-[11px] leading-relaxed text-primary/80 whitespace-pre-wrap overflow-y-auto max-h-[400px] no-scrollbar">
              {decreeText}
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t border-white/5 flex gap-4">
             <Button variant="outline" className="flex-1 border-white/10 text-white font-bold h-12 rounded-xl gap-2 hover:bg-white/5">
                <Download size={18} /> DOWNLOAD RAW
             </Button>
             <Button onClick={() => window.print()} className="flex-1 bg-primary text-background font-bold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20">
                <Printer size={18} /> PRINT DECREE
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
