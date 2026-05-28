
"use client"

import React from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Target, ShieldAlert, Crosshair, Swords, Map } from 'lucide-react'

const MOCK_ATTACKS = [
  { region: 'East Asia', type: 'DDoS', intensity: 85, x: 80, y: 50, color: 'hsl(var(--destructive))' },
  { region: 'Eastern Europe', type: 'SQL Injection', intensity: 60, x: 55, y: 40, color: 'hsl(var(--destructive))' },
  { region: 'North America', type: 'Brute Force', intensity: 45, x: 20, y: 45, color: 'hsl(var(--primary))' },
  { region: 'Local Proxy', type: 'Endpoint Scan', intensity: 30, x: 70, y: 30, color: 'hsl(var(--accent))' },
];

export function ThreatMap() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <Swords className="text-destructive animate-pulse" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-headline font-bold text-destructive uppercase tracking-widest">Live Threat Vector Map</h4>
            <p className="text-[10px] text-muted-foreground">রিয়েল-টাইমে আক্রমণের ভৌগোলিক উৎস এবং তীব্রতা পর্যবেক্ষণ করুন।</p>
          </div>
        </div>
        <Badge variant="destructive" className="animate-bounce">ACTIVE WARFARE</Badge>
      </div>

      <div className="h-[300px] w-full bg-black/60 rounded-2xl border border-destructive/20 relative overflow-hidden">
        {/* Abstract World Grid Background */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full border-t border-b border-destructive/20 scale-150 rotate-12" />
          <div className="absolute w-full h-full border-l border-r border-destructive/20 scale-150 -rotate-12" />
        </div>
        
        <ChartContainer config={{
          intensity: { label: "Intensity", color: "hsl(var(--destructive))" },
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
              <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
              <ZAxis type="number" dataKey="intensity" range={[100, 1000]} name="Intensity" />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-card border border-destructive/40 p-3 rounded-xl shadow-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-destructive" />
                          <p className="text-xs font-headline font-bold text-destructive uppercase">{item.region}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-foreground">Type: <span className="text-destructive font-bold">{item.type}</span></p>
                          <p className="text-[10px] text-foreground">Intensity: <span className="text-primary font-bold">{item.intensity}%</span></p>
                          <Badge variant="outline" className="text-[7px] border-destructive/30 text-destructive uppercase">Intercepted</Badge>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Live Threats" data={MOCK_ATTACKS}>
                {MOCK_ATTACKS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="animate-pulse" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-[8px] uppercase font-bold text-muted-foreground">High Criticality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[8px] uppercase font-bold text-muted-foreground">Standard Scan</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_ATTACKS.map((attack, idx) => (
          <div key={idx} className="p-3 bg-muted/20 border border-white/5 rounded-xl flex items-center justify-between group hover:border-destructive/30 transition-all">
            <div className="flex items-center gap-3">
              <Crosshair size={16} className="text-destructive" />
              <div>
                <p className="text-xs font-bold text-foreground">{attack.region}</p>
                <p className="text-[9px] text-muted-foreground">{attack.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono font-bold text-destructive">{attack.intensity}%</p>
              <Badge variant="outline" className="text-[7px] h-4 border-destructive/20 text-destructive">COUNTERED</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
