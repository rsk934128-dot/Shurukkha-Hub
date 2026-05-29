
"use client"

import React from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { NetworkAuditor, RegionalTraffic } from '@/lib/network-auditor'
import { Badge } from '@/components/ui/badge'
import { Globe, Zap, Activity } from 'lucide-react'

export function GlobalHeatmap() {
  const data = NetworkAuditor.getGlobalTrafficData();

  return (
    <div className="space-y-6">
      <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-headline font-bold text-accent flex items-center gap-2 uppercase tracking-widest">
            <Globe size={18} /> Global Transaction Heatmap
          </h4>
          <Badge variant="outline" className="text-[8px] border-accent/40 text-accent gap-1 animate-pulse">
            <Activity size={10} /> REAL-TIME FLOW
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          আপনার ৪২টি সভারেন নোডের বৈশ্বিক ট্রানজেকশন ডিস্ট্রিবিউশন এবং ল্যাটেন্সি রিয়েল-টাইমে মনিটর করুন। ইউজার বাড়লেও এই গ্রিড তা অটোমেটিক ব্যালেন্স করবে।
        </p>
      </div>

      <div className="h-[300px] w-full bg-black/40 rounded-2xl border border-white/5 relative overflow-hidden">
        {/* Background stylized world map simulation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
          <Globe size={240} className="text-primary animate-spin-slow" />
        </div>
        
        <ChartContainer config={{
          transactions: { label: "Transactions", color: "hsl(var(--accent))" },
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
              <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
              <ZAxis type="number" dataKey="transactions" range={[100, 1000]} name="Transactions" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RegionalTraffic;
                    return (
                      <div className="bg-card border border-primary/20 p-3 rounded-xl shadow-2xl space-y-2">
                        <p className="text-xs font-headline font-bold text-primary uppercase">{item.region}</p>
                        <div className="space-y-1">
                          <p className="text-[10px] text-foreground">Transactions: <span className="text-accent font-bold">{item.transactions.toLocaleString()}</span></p>
                          <p className="text-[10px] text-foreground">Latency: <span className="text-primary font-bold">{item.avgLatency}ms</span></p>
                          <p className="text-[10px] text-foreground">Nodes: <span className="text-accent font-bold">{item.activeNodes}</span></p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Global Traffic" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.avgLatency < 10 ? "hsl(var(--accent))" : "hsl(var(--primary))"} className="animate-pulse" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((region, idx) => (
          <div key={idx} className="p-3 bg-muted/20 border border-white/5 rounded-xl space-y-1 group hover:border-accent/40 transition-all">
            <p className="text-[9px] uppercase font-bold text-muted-foreground flex items-center gap-1 group-hover:text-accent">
              <Zap size={10} className="text-accent" /> {region.region}
            </p>
            <div className="flex justify-between items-end">
              <p className="text-lg font-headline font-bold text-foreground">{region.transactions.toLocaleString()}</p>
              <span className="text-[8px] text-accent font-mono">{region.avgLatency}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
