"use client"

import React, { useState } from 'react'
import { Map as MapIcon, Info, Navigation, Search, Layers, Waves, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export function ResourceMap() {
  const [viewMode, setViewMode] = useState<'shelters' | 'flood_overlay'>('shelters')

  return (
    <Card className="bg-card border-white/5 h-full flex flex-col overflow-hidden relative">
      <CardHeader className="pb-2 bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <MapIcon className="text-primary" size={20} />
            {viewMode === 'shelters' ? 'আশ্রয়কেন্দ্র মানচিত্র' : 'বন্যা ঝুঁকি প্রেডিকশন (Heatmap)'}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={viewMode === 'flood_overlay' ? 'default' : 'outline'} 
              onClick={() => setViewMode(viewMode === 'shelters' ? 'flood_overlay' : 'shelters')}
              className="h-8 text-[10px] uppercase font-bold gap-2"
            >
              <Layers size={14} /> {viewMode === 'shelters' ? 'AI হীটম্যাপ' : 'আশ্রয়কেন্দ্র'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[400px]">
        {/* Mock Map View */}
        <div className={`absolute inset-0 transition-all duration-700 ${viewMode === 'flood_overlay' ? 'grayscale-0' : 'grayscale opacity-40 mix-blend-overlay'}`}>
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
               <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-yellow-500/10 blur-[60px] rounded-full" />
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
              
              <div className="p-3 bg-card/90 backdrop-blur-md border border-primary/20 rounded-xl flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs font-headline font-bold">সিরাজগঞ্জ সরকারি কলেজ আশ্রয়কেন্দ্র</p>
                    <p className="text-[10px] text-muted-foreground font-body">৫০০ মি. দূরে • ২০০ জনের জায়গা আছে</p>
                  </div>
                </div>
                <Button size="sm" variant="link" className="text-primary text-xs font-bold">বিস্তারিত</Button>
              </div>
            </>
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
                <Button size="sm" variant="outline" className="border-white/10 text-[9px] h-7 w-full">
                   ডিটেইলস লজিক
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/5 space-y-1">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[8px] uppercase font-bold text-muted-foreground">Extreme</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-[8px] uppercase font-bold text-muted-foreground">High</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-[8px] uppercase font-bold text-muted-foreground">Moderate</span>
           </div>
        </div>
      </CardContent>
    </Card>
  )
}
