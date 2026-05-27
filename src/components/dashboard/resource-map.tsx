"use client"

import React from 'react'
import { Map as MapIcon, Info, Navigation, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

export function ResourceMap() {
  return (
    <Card className="bg-card border-white/5 h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <MapIcon className="text-primary" size={20} />
            আশ্রয়কেন্দ্র মানচিত্র
          </CardTitle>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
              <Search size={16} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
              <Info size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[300px]">
        {/* Mock Map View */}
        <div className="absolute inset-0 grayscale opacity-40 mix-blend-overlay">
          <Image 
            src="https://picsum.photos/seed/map/800/600" 
            alt="Sirajganj Map" 
            fill 
            className="object-cover"
            data-ai-hint="satellite map"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* Overlay Markers and Search */}
        <div className="absolute inset-x-4 bottom-4 space-y-3">
          <div className="flex gap-2">
            <Input 
              placeholder="নিকটস্থ আশ্রয়কেন্দ্র খুঁজুন..." 
              className="bg-card/80 backdrop-blur-md border-white/10 h-10 text-xs"
            />
            <Button size="icon" className="h-10 w-10 shrink-0 bg-primary">
              <Navigation size={18} className="text-background" />
            </Button>
          </div>
          
          <div className="p-3 bg-card/90 backdrop-blur-md border border-primary/20 rounded-xl flex items-center justify-between shadow-2xl">
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
        </div>
      </CardContent>
    </Card>
  )
}