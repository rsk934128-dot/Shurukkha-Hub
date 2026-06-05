"use client"

import React, { useState, useEffect, useRef } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PortfolioEngine, Asset } from '@/lib/portfolio-engine'
import { TrendingUp, TrendingDown, Wallet, Zap, BrainCircuit, ShieldCheck, ArrowUpRight, Activity, Globe, DollarSign, Loader2, Terminal } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

const COLORS = ['#7597FF', '#34D399', '#FBBF24', '#A855F7'];

const TREND_DATA = [
  { day: 'Mon', val: 42000 },
  { day: 'Tue', val: 45000 },
  { day: 'Wed', val: 43500 },
  { day: 'Thu', val: 48000 },
  { day: 'Fri', val: 52000 },
  { day: 'Sat', val: 55000 },
  { day: 'Sun', val: 54240 },
];

export function PortfolioViewer() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simLogs, setSimLogs] = useState<string[]>([])
  const [aiInsight, setAIInsight] = useState<string>('')
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const data = PortfolioEngine.getLiveAssets();
    setAssets(data);
    const m = PortfolioEngine.calculateMetrics(data);
    setMetrics(m);
    setAIInsight(PortfolioEngine.getAIInsight(m));
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimLogs([]);
    try {
      const result = await PortfolioEngine.runMarketSimulation((msg) => {
        setSimLogs(prev => [...prev, msg]);
      });
      setAIInsight(result);
      toast({ title: "SIMULATION SUCCESSFUL", description: "Imperial Insights have been updated." });
    } catch (e) {
      toast({ title: "SIMULATION FAILED", variant: "destructive" });
    } finally {
      setIsSimulating(false);
    }
  }

  if (!metrics) return null;

  const chartData = assets.map(a => ({ name: a.symbol, value: a.quantity * a.currentPrice }));

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20 p-6 space-y-3 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                  <Wallet size={100} className="text-primary" />
               </div>
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Asset Value</p>
               <h3 className="text-3xl font-headline font-bold text-foreground">${metrics.totalValue.toLocaleString()}</h3>
               <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    <TrendingUp size={12} className="mr-1" /> +{metrics.profitPercentage.toFixed(2)}%
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-mono">Profit: +${metrics.profit.toLocaleString()}</span>
               </div>
            </Card>

            <Card className="bg-accent/5 border-accent/20 p-6 space-y-3 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                  <Zap size={100} className="text-accent" />
               </div>
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Smart Escrow Locked</p>
               <h3 className="text-3xl font-headline font-bold text-accent">$12,400</h3>
               <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-accent" />
                  <span className="text-[10px] text-accent font-bold uppercase tracking-tighter">Verified & Protected</span>
               </div>
            </Card>
          </div>

          <Card className="bg-card/40 border-white/5 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
              <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} /> Asset Growth Waveform
              </CardTitle>
            </CardHeader>
            <div className="h-[250px] p-6">
              <ChartContainer config={{ val: { label: "Value", color: "hsl(var(--primary))" } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-val)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-val)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" fontSize={9} stroke="rgba(255,255,255,0.3)" />
                    <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="val" stroke="var(--color-val)" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </Card>
        </div>

        {/* Breakdown & AI */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/40 border-white/5 p-6 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Asset Allocation</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {assets.map((a, i) => (
                <div key={a.id} className="flex justify-between items-center text-[10px]">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-bold text-foreground/80">{a.symbol}</span>
                   </div>
                   <span className="font-mono text-muted-foreground">${(a.quantity * a.currentPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-accent/5 border-accent/20 p-5 space-y-4">
            <div className="flex items-center gap-2 text-accent">
               <BrainCircuit size={18} className="animate-pulse" />
               <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest">Imperial Investment AI</h4>
            </div>
            <p className="text-[11px] text-foreground/80 leading-relaxed italic border-l-2 border-accent/40 pl-4">
              "{aiInsight}"
            </p>
            
            {isSimulating ? (
              <div className="bg-black/60 rounded-xl p-3 border border-accent/20 font-mono text-[9px] text-accent/80 h-32">
                <ScrollArea className="h-full">
                   {simLogs.map((log, i) => (
                     <p key={i} className="animate-in slide-in-from-left-1 mb-1">
                       <span className="text-muted-foreground mr-1">&gt;</span> {log}
                     </p>
                   ))}
                </ScrollArea>
              </div>
            ) : (
              <Button 
                onClick={handleRunSimulation}
                variant="outline" 
                className="w-full h-9 border-accent/20 text-accent text-[9px] font-bold uppercase rounded-xl hover:bg-accent/10"
              >
                 <Terminal size={14} className="mr-2" /> Market Simulation Scan
              </Button>
            )}
          </Card>
        </div>
      </div>

      {/* Asset Table */}
      <Card className="bg-card/40 border-white/5 overflow-hidden">
         <div className="p-4 bg-muted/20 border-b border-white/5 flex justify-between items-center">
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Live Portfolio Assets</h4>
            <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">SYNC_OK: 100% PURE</Badge>
         </div>
         <ScrollArea className="h-[300px]">
            <div className="divide-y divide-white/5">
               {assets.map((asset, i) => (
                 <div key={asset.id} className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                          {asset.symbol === 'GOLD' ? <Globe size={18} /> : <DollarSign size={18} />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-foreground">{asset.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-mono">{asset.quantity} {asset.symbol}</p>
                       </div>
                    </div>
                    <div className="text-right flex items-center gap-8">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">${asset.currentPrice.toLocaleString()}</p>
                          <p className={`text-[9px] font-bold ${asset.change24h > 0 ? 'text-accent' : 'text-destructive'}`}>
                            {asset.change24h > 0 ? '+' : ''}{asset.change24h}%
                          </p>
                       </div>
                       <div className="w-32 hidden md:block">
                          <p className="text-xs font-bold text-foreground">${(asset.quantity * asset.currentPrice).toLocaleString()}</p>
                          <Progress value={Math.floor(Math.random() * 40) + 60} className="h-1 bg-white/5 mt-1" />
                       </div>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowUpRight size={16} />
                       </Button>
                    </div>
                 </div>
               ))}
            </div>
         </ScrollArea>
      </Card>
    </div>
  )
}
