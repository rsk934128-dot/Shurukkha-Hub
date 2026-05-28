"use client"

import React, { useState, useEffect } from 'react'
import { Map as MapIcon, Info, Navigation, Search, Layers, Waves, ShieldCheck, Plane, Signal, Radio, ArrowUpRight, Crosshair, Zap, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { DroneService, DroneNode } from '@/lib/drone-service'

export function ResourceMap() {
  const [viewMode, setViewMode] = useState<'shelters' | 'flood_overlay' | 'drone_intel'>('flood_overlay')
  const [drones, setDrones] = useState<DroneNode[]>([])
  const [mapRotation, setMapRotation] = useState(0)
  
  useEffect(() => {
    setDrones(DroneService.getDroneStats());
    const interval = setInterval(() => {
      setDrones([...DroneService.getDroneStats()]);
      setMapRotation(prev => (prev + 0.5) % 360);
    }, 1000);
    return () => clearInterval(interval);
  }, [])

  return (
    <Card className="bg-card/40 border-primary/20 h-full flex flex-col overflow-hidden relative group">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid.png')] z-10" />
      
      <CardHeader className="pb-2 bg-primary/5 border-b border-white/5 relative z-20">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm md:text-lg font-headline flex items-center gap-2 uppercase tracking-widest neon-text-primary">
              <MapIcon className="text-primary animate-pulse" size={20} />
              SOVEREIGN GIS ENGINE v1.2
            </CardTitle>
            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-[0.3em]">Interactive Visual Monitoring Active</p>
          </div>
          <div className="flex gap-2">
             <Button 
              size="sm" 
              variant={viewMode === 'drone_intel' ? 'default' : 'outline'} 
              onClick={() => setViewMode('drone_intel')}
              className="h-8 text-[9px] uppercase font-bold gap-2 rounded-full border-primary/20"
            >
              <Plane size={14} className={viewMode === 'drone_intel' ? 'animate-bounce' : ''} /> <span className="hidden sm:inline">Drones</span>
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'flood_overlay' ? 'default' : 'outline'} 
              onClick={() => setViewMode('flood_overlay')}
              className="h-8 text-[9px] uppercase font-bold gap-2 rounded-full border-primary/20"
            >
              <Layers size={14} className={viewMode === 'flood_overlay' ? 'animate-spin-slow' : ''} /> <span className="hidden sm:inline">Heatmap</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative min-h-[500px] overflow-hidden">
        {/* Animated Map Viewport */}
        <div className="absolute inset-0 transition-transform duration-[2000ms] ease-in-out" style={{ transform: viewMode === 'flood_overlay' ? 'scale(1.1)' : 'scale(1)' }}>
          <Image 
            src="https://picsum.photos/seed/sirajganj_gis/1200/800" 
            alt="Sirajganj HD Map" 
            fill 
            className={`object-cover transition-all duration-1000 ${viewMode === 'flood_overlay' ? 'contrast-125 saturate-150' : 'grayscale brightness-50'}`}
            data-ai-hint="satellite topography"
          />
          
          {/* GIS Overlay Layers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
            {/* Momentum Flow Arrows - Simulated for Jamuna */}
            {viewMode === 'flood_overlay' && (
              <g className="text-accent/60">
                <path d="M400,200 L450,250 M450,300 L500,350 M500,400 L550,450" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="animate-flood-flow" />
                <circle cx="450" cy="250" r="4" fill="currentColor" className="animate-ping" />
                <circle cx="500" cy="350" r="4" fill="currentColor" className="animate-ping" />
              </g>
            )}
            
            {/* District Scan Lines */}
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(117, 151, 255, 0.1)" strokeWidth="1" className="animate-pulse" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(117, 151, 255, 0.1)" strokeWidth="1" className="animate-pulse" />
          </svg>

          {/* Simulated Flood Risk Pulsing Zones */}
          {viewMode === 'flood_overlay' && (
            <div className="absolute inset-0 pointer-events-none z-20">
               <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-red-500/20 blur-[80px] animate-pulse rounded-full border-2 border-red-500/40" />
               <div className="absolute top-1/4 left-1/3 flex flex-col items-center justify-center">
                  <div className="w-4 h-4 bg-red-600 rounded-full animate-ping" />
                  <Badge variant="destructive" className="text-[7px] mt-2 animate-bounce">CRITICAL IMPACT</Badge>
               </div>
            </div>
          )}

          {/* Drone Node Animations */}
          {viewMode === 'drone_intel' && (
            <div className="absolute inset-0 z-30">
               {drones.map((drone, i) => (
                 <div 
                   key={drone.id} 
                   className="absolute transition-all duration-[3000ms] ease-in-out"
                   style={{ 
                     top: drone.status === 'DEPLOYED' ? '30%' : '15%', 
                     left: drone.status === 'DEPLOYED' ? '60%' : '10%',
                     transform: `rotate(${mapRotation}deg)`
                   }}
                 >
                    <div className="relative group/drone">
                       {/* Scanner Effect */}
                       <div className="absolute -inset-8 bg-accent/5 rounded-full border border-accent/20 scale-150 animate-pulse-ring" />
                       
                       <div className="relative flex flex-col items-center">
                          <Plane className="text-accent drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" size={32} />
                          <div className="mt-2 flex flex-col items-center opacity-0 group-hover/drone:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded border border-accent/40 backdrop-blur-md">
                             <span className="text-[8px] font-mono text-accent font-bold">{drone.id}</span>
                             <span className="text-[7px] text-white/60">BAT: {drone.battery}%</span>
                          </div>
                       </div>
                       
                       {drone.isFeedActive && (
                         <div className="absolute -top-1 -right-1 flex gap-1">
                           <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                         </div>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
        
        {/* Dynamic Scan Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent z-40 pointer-events-none" />
        
        {/* Floating Data Panels */}
        <div className="absolute inset-x-6 bottom-6 space-y-4 z-50">
          {viewMode === 'drone_intel' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-10 duration-700">
               {drones.filter(d => d.isFeedActive).map(drone => (
                 <Card key={drone.id} className="bg-black/90 backdrop-blur-2xl border-accent/50 overflow-hidden neon-glow-accent">
                    <div className="aspect-video relative bg-slate-950 flex items-center justify-center group/feed">
                       {/* CRT Scanline Effect */}
                       <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                       
                       <div className="text-center space-y-3 relative z-10">
                          <Activity className="mx-auto text-accent animate-pulse" size={24} />
                          <p className="text-[9px] font-mono text-accent uppercase tracking-[0.4em] neon-text-accent">LIVE_RECON_FEED: {drone.id}</p>
                       </div>

                       <Badge className="absolute top-2 left-2 bg-red-600/80 text-[7px] animate-pulse rounded-sm">REC 00:04:12</Badge>
                       
                       <div className="absolute bottom-2 right-2 flex flex-col gap-1 items-end">
                          <div className="flex gap-1">
                             <Badge variant="outline" className="text-[7px] border-white/20 text-white bg-black/60">24.3636° N</Badge>
                             <Badge variant="outline" className="text-[7px] border-white/20 text-white bg-black/60">89.6732° E</Badge>
                          </div>
                          <p className="text-[6px] font-mono text-accent/60">SIG_STRENGTH: 98%</p>
                       </div>

                       <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover/feed:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="ghost" size="sm" className="text-accent text-[9px] uppercase font-bold tracking-widest gap-2">
                             <Search size={14} /> Full Deep Scan
                          </Button>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          ) : viewMode === 'flood_overlay' ? (
            <div className="max-w-xl p-5 bg-destructive/10 backdrop-blur-2xl border border-destructive/40 rounded-3xl space-y-4 animate-in zoom-in-95 duration-500 neon-glow-destructive">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-destructive/20 rounded-2xl flex items-center justify-center border border-destructive/30">
                      <Waves className="text-destructive animate-pulse" size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-headline font-bold text-foreground flex items-center gap-2">
                        উচ্চ ঝুঁকি সনাক্তকরণ: চরাঞ্চল <Crosshair size={14} className="text-destructive" />
                      </h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Prediction Momentum: North-West</p>
                   </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-headline font-bold text-destructive">৯৪%</p>
                  <p className="text-[7px] text-muted-foreground uppercase font-bold">Confidence</p>
                </div>
              </div>
              
              <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                <p className="text-[11px] text-foreground/80 leading-relaxed italic">
                  "যমুনা নদীর পানি বৃদ্ধির বেগ প্রতি ঘণ্টায় ০.০২ মিটার বৃদ্ধি পাচ্ছে। এনায়েতপুর ও বেলকুচি চরাঞ্চলে পরবর্তী ৪ ঘণ্টায় ৩ ফুট পানি প্রবেশের সম্ভাবনা নিশ্চিত।"
                </p>
              </div>

              <div className="flex gap-3">
                <Button size="sm" className="bg-destructive hover:bg-destructive/90 text-white font-bold text-[10px] h-10 w-full gap-2 rounded-xl shadow-lg shadow-destructive/20">
                   <Radio size={16} /> অটোনোমাস সতর্কবার্তা পাঠান
                </Button>
                <Button onClick={() => setViewMode('drone_intel')} size="sm" variant="outline" className="border-white/10 hover:bg-white/5 text-[10px] h-10 w-full gap-2 rounded-xl">
                   <Plane size={16} /> ড্রোন ভেরিফিকেশন শুরু করুন
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={16} />
                 <Input 
                  placeholder="নিকটস্থ আশ্রয়কেন্দ্র বা ত্রাণ শিবিরের স্থানাঙ্ক খুঁজুন..." 
                  className="bg-card/90 backdrop-blur-2xl border-primary/20 h-12 text-xs pl-10 rounded-2xl neon-glow-primary"
                />
              </div>
              <Button size="icon" className="h-12 w-12 shrink-0 bg-primary text-background rounded-2xl shadow-lg shadow-primary/20">
                <Navigation size={20} />
              </Button>
            </div>
          )}
        </div>

        {/* Dynamic Legend / Telemetry Sidebar Overlay */}
        <div className="absolute top-6 right-6 p-4 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 space-y-4 z-50 animate-in fade-in slide-in-from-right-10 duration-1000">
           <div className="space-y-3">
              <p className="text-[9px] font-headline font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 pb-2">Active Signals</p>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-[9px] uppercase font-bold text-white/80">Drone Recon Alpha</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                <span className="text-[9px] uppercase font-bold text-white/80">Critical Surge Zone</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(117,151,255,0.8)]" />
                <span className="text-[9px] uppercase font-bold text-white/80">Sovereign Node v42</span>
              </div>
           </div>

           <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center text-[9px] font-mono">
                 <span className="text-muted-foreground">LATENCY</span>
                 <span className="text-primary font-bold">0.004ms</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono">
                 <span className="text-muted-foreground">THREAT</span>
                 <span className="text-accent font-bold">OPTIMAL</span>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
