
"use client"

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { TrendingUp, ArrowUpRight, Zap, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const DATA = [
  { day: 'Sat', revenue: 45000, tax: 675 },
  { day: 'Sun', revenue: 52000, tax: 780 },
  { day: 'Mon', revenue: 48000, tax: 720 },
  { day: 'Tue', revenue: 61000, tax: 915 },
  { day: 'Wed', revenue: 55000, tax: 825 },
  { day: 'Thu', revenue: 67000, tax: 1005 },
  { day: 'Fri', revenue: 72000, tax: 1080 },
]

export function MerchantGrowthChart() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-sm font-headline font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp size={18} /> Merchant Growth Curve
          </h4>
          <p className="text-[10px] text-muted-foreground italic">রিয়েল-টাইম রেভিনিউ এবং ট্যাক্স ইমপ্যাক্ট অ্যানালাইসিস</p>
        </div>
        <Badge className="bg-accent/20 text-accent border-accent/30 text-[8px] animate-pulse">GROWTH: +24%</Badge>
      </div>

      <div className="h-[200px] w-full bg-black/20 rounded-xl p-2">
        <ChartContainer config={{
          revenue: { label: "Revenue", color: "hsl(var(--primary))" },
          tax: { label: "Imperial Tax", color: "hsl(var(--accent))" }
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DATA}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" fontSize={9} stroke="rgba(255,255,255,0.3)" />
              <YAxis fontSize={9} stroke="rgba(255,255,255,0.3)" />
              <Tooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="tax" stroke="var(--color-tax)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted/20 border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-muted-foreground">
            <Zap size={12} className="text-accent" /> Prediction
          </div>
          <p className="text-sm font-headline font-bold text-foreground">৳৮৫,০০০/দিন</p>
          <p className="text-[8px] text-accent flex items-center gap-1"><ArrowUpRight size={10} /> আগামী সপ্তাহে সম্ভাব্য আয়</p>
        </div>
        <div className="p-3 bg-muted/20 border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-muted-foreground">
            <Target size={12} className="text-primary" /> Target
          </div>
          <p className="text-sm font-headline font-bold text-foreground">৳১০,০০,০০০</p>
          <p className="text-[8px] text-muted-foreground">মাসিক লক্ষ্যমাত্রা: ৬৭% অর্জিত</p>
        </div>
      </div>
    </div>
  )
}
