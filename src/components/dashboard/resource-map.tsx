"use client"

import React, { useState, useEffect } from 'react'
import { Map as MapIcon, Info, Navigation, Search, Layers, Waves, ShieldCheck, Plane, Signal, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { DroneService, DroneNode } from '@/lib/drone-service'

export function ResourceMap() {
  const [viewMode, setViewMode] = useState<'shelters' | 'flood_overlay' | 'drone_intel'>('shelters')
  const [drones, setDrones] = useState<DroneNode[]>([])

  useEffect(() => {
    setDrones(DroneService.getDroneStats());
    const interval = setInterval(() => {
      setDrones([...DroneService.getDroneStats()]);
    }, 2000);
    return () => clearInterval(interval);
  }, [])

  return (
    <Card className="bg-card border-white/5 h-full flex flex-col overflow-hidden relative">
      <CardHeader className="pb-2 bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <MapIcon className="text-primary" size={20} />
            {viewMode === 'shelters' ? 'আশ্রয়কেন্দ্র মানচিত্র' : viewMode === 'flood_overlay' ? 'বন্যা ঝুঁকি প্রেডিকশন' : 'এরিয়াল ড্রোন ইন্টেল'}
          </CardTitle>
          <div className="flex gap-2">
             <Button 
              size="sm" 
              variant={viewMode === 'drone_intel' ? 'default' : 'outline'} 
              onClick={() => setViewMode('drone_intel')}
              className="h-8 text-[10px] uppercase font-bold gap-2"
            >
              <Plane size={14} /> ড্রোন মোড
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'flood_overlay' ? 'default' : 'outline'} 
              onClick={() => setViewMode('flood_overlay')}
              className="h-8 text-[10px] uppercase font-bold gap-2"
            >
              <Layers size={14} /> হীটম্যাপ
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[400px]">
        {/* Mock Map View */}
        <div className={`absolute inset-0 transition-all duration-700 ${viewMode !== 'shelters' ? 'grayscale-0' : 'grayscale opacity-40 mix-blend-overlay'}`}>
          <Image 
            src={viewMode === 'shelters' ? "https://picsum.photos/seed/map/800/600" : "https://picsum.photos/seed/floodmap/800/600"} 
            alt="Sirajganj Map" 
            fill 
            className="object-cover"
            data-ai-hint="satellite map"
          />
          
          {/* Simulated Flood Heatmap Overlays */}
          {viewMode === 'flood_overlay' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
               <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-red-500/30 blur-[100px] animate-pulse rounded-full" />
               <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/20 blur-[80px] rounded-full" />
            </div>
          )}

          {/* Drone Markers */}
          {viewMode === 'drone_intel' && (
            <div className="absolute inset-0">
               {drones.map((drone, i) => (
                 <div 
                   key={drone.id} 
                   className={`absolute transition-all duration-1000 ${drone.status === 'DEPLOYED' ? 'top-1/3 left-1/2 animate-pulse' : 'top-20 left-20'}`}
                 >
                    <div className="relative group">
                       <Plane className={`text-accent rotate-45 ${drone.status !== 'IDLE' ? 'scale-150' : 'opacity-40'}`} size={24} />
                       <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/80 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {drone.id} ({drone.battery}%)
                       </Badge>
                       {drone.isFeedActive && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Overlay Markers and Search */}
        <div className="absolute inset-x-4 bottom-4 space-y-3">
          {viewMode === 'shelters' ? (
            <>
              <div className="flex gap-2">
                <Input 
                  placeholder="নিকটস্থ আশ্রয়কেন্দ্র খুঁজুন..." 
                  className="bg-card/80 backdrop-blur-md border-white/10 h-10 text-xs"
                />
                <Button size="icon" className="h-10 w-10 shrink-0 bg-primary">
                  <Navigation size={18} className="text-background" />
                </Button>
              </div>
            </>
          ) : viewMode === 'drone_intel' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {drones.filter(d => d.isFeedActive).map(drone => (
                 <Card key={drone.id} className="bg-black/80 backdrop-blur-xl border-accent/40 overflow-hidden animate-in slide-in-from-bottom-5">
                    <div className="aspect-video relative bg-slate-900 flex items-center justify-center overflow-hidden">
                       <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid.png')]" />
                       <div className="text-center space-y-2 relative z-10">
                          <Signal className="mx-auto text-accent animate-pulse" size={24} />
                          <p className="text-[10px] font-mono text-accent uppercase tracking-widest">LIVE_DRONE_FEED: {drone.id}</p>
                       </div>
                       <Badge className="absolute top-2 left-2 bg-red-600 text-[8px] animate-pulse">REC 00:04:12</Badge>
                       <div className="absolute bottom-2 right-2 flex gap-1">
                          <Badge variant="outline" className="text-[8px] border-white/20 text-white bg-black/40">LAT: 24.3636</Badge>
                          <Badge variant="outline" className="text-[8px] border-white/20 text-white bg-black/40">LNG: 89.6732</Badge>
                       </div>
                    </div>
                 </Card>
               ))}
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 backdrop-blur-xl border border-destructive/30 rounded-2xl space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <Badge variant="destructive" className="animate-pulse gap-1 text-[8px] uppercase tracking-widest font-bold">
                  <Waves size={10} /> High Risk Detected
                </Badge>
                <span className="text-[8px] font-mono text-muted-foreground">PREDICTION_CONFIDENCE: 94%</span>
              </div>
              <div>
                <h4 className="text-xs font-headline font-bold text-foreground">বেলকুচি ও এনায়েতপুর চরাঞ্চল</h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">আগামী ৪-৬ ঘণ্টার মধ্যে এই এলাকাগুলোতে ৩-৪ ফুট পানি বৃদ্ধি পাওয়ার সম্ভাবনা ১০০%।</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-destructive text-white font-bold text-[9px] h-7 w-full gap-2">
                   অ্যালার্ট পাঠান
                </Button>
                <Button onClick={() => setViewMode('drone_intel')} size="sm" variant="outline" className="border-white/10 text-[9px] h-7 w-full gap-2">
                   <Plane size={12} /> ড্রোন পাঠান
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 space-y-1">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-[8px] uppercase font-bold text-muted-foreground">Drone Node</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[8px] uppercase font-bold text-muted-foreground">Critical Risk</span>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
