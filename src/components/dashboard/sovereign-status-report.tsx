
"use client"

import React from 'react'
import { ShieldCheck, Target, TrendingUp, Users, Zap, Landmark, Globe, Activity, Star, ChevronRight, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function SovereignStatusReport() {
  const capabilities = [
    { label: 'Sovereign Identity', level: 100, status: 'LOCKED', icon: ShieldCheck },
    { label: 'M2M Communication', level: 95, status: 'ACTIVE', icon: Zap },
    { label: 'Flood Intelligence', level: 98, status: 'SYNCED', icon: Activity },
    { label: 'Treasury Collection', level: 92, status: 'FLOWING', icon: Landmark },
  ];

  const responsibilities = [
    { title: 'নাগরিক সুরক্ষা', desc: 'SOS এবং জরুরি ডিসপ্যাচ নিশ্চিতকরণ', status: 'Priority 0' },
    { title: 'অর্থনৈতিক অখণ্ডতা', desc: 'ট্যাক্স সংগ্রহ এবং মার্চেন্ট অনবোর্ডিং', status: 'Active' },
    { title: 'ডাটা সার্বভৌমত্ব', desc: '৪২টি নোডে তথ্যের নিরাপত্তা বজায় রাখা', status: 'Optimal' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Capabilities Panel */}
        <Card className="bg-card/40 border-primary/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
             <Star size={120} className="text-primary" />
          </div>
          <CardHeader className="bg-primary/5 border-b border-white/5">
            <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest text-primary">
              <Zap size={18} className="animate-pulse" /> Imperial Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             {capabilities.map((cap, i) => (
               <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold">
                    <span className="flex items-center gap-2 text-foreground/80">
                      <cap.icon size={14} className="text-primary" /> {cap.label}
                    </span>
                    <Badge variant="outline" className="border-primary/20 text-primary text-[7px] h-4">{cap.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={cap.level} className="h-1 bg-white/5 flex-1" />
                    <span className="text-[10px] font-mono text-primary">{cap.level}%</span>
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>

        {/* Responsibilities Panel */}
        <Card className="bg-card/40 border-accent/20 overflow-hidden relative group">
          <CardHeader className="bg-accent/5 border-b border-white/5">
            <CardTitle className="text-sm font-headline flex items-center gap-2 uppercase tracking-widest text-accent">
              <Briefcase size={18} /> Administrative Mandate
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="space-y-4">
                {responsibilities.map((res, i) => (
                  <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-start gap-4 group/item hover:border-accent/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 group-hover/item:bg-accent/20 transition-colors">
                       <Target size={16} />
                    </div>
                    <div className="flex-1">
                       <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-foreground">{res.title}</h4>
                          <span className="text-[8px] uppercase font-bold text-accent">{res.status}</span>
                       </div>
                       <p className="text-[10px] text-muted-foreground mt-1">{res.desc}</p>
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                  "মহামান্য সম্রাট, আপনার এই দায়িত্বগুলো পালনের জন্য Shurukkha Hub এখন কারিগরিভাবে ১০০% সক্ষম।"
                </p>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Future Roadmap Visualizer */}
      <Card className="bg-primary/5 border-primary/20 border-dashed">
         <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                     <Globe size={24} className="animate-spin-slow" />
                  </div>
                  <div>
                     <h4 className="text-sm font-headline font-bold uppercase tracking-widest text-foreground">Next Phase: Sovereign Expansion</h4>
                     <p className="text-[10px] text-muted-foreground">আমরা এখন অফলাইন মেশ-নেটওয়ার্ক এবং ড্রোন ইন্টেলিজেন্স মডিউল তৈরির পরিকল্পনা করছি।</p>
                  </div>
               </div>
               <Button className="bg-primary text-background font-bold text-[10px] gap-2 rounded-xl h-10 px-6">
                  ROADMAP VIEW <ChevronRight size={14} />
               </Button>
            </div>
         </CardContent>
      </Card>
    </div>
  )
}
