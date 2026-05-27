"use client"

import React, { useEffect, useState } from 'react'
import { History, ShieldAlert, Clock, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DisasterStorage } from '@/lib/disaster-storage'
import { Badge } from '@/components/ui/badge'

export function DisasterFeed() {
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    setHistory(DisasterStorage.getAdviceHistory())
    
    // Listen for storage changes (simple sync)
    const interval = setInterval(() => {
      setHistory(DisasterStorage.getAdviceHistory())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  if (history.length === 0) return null

  return (
    <Card className="bg-card border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-headline flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
          <History size={16} />
          ইন্টেলিজেন্স ফিড (অফলাইন)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="p-3 bg-muted/30 rounded-xl border border-white/5 space-y-2 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <Badge variant="outline" className="text-[9px] h-5 bg-background/50">
                {new Date(item.timestamp).toLocaleTimeString('bn-BD')}
              </Badge>
              {item.riskLevel === 'Extreme' && (
                <ShieldAlert size={14} className="text-destructive animate-pulse" />
              )}
            </div>
            <p className="text-xs font-body line-clamp-2 text-foreground/80 italic">
              "{item.advice}"
            </p>
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <Clock size={10} />
              <span>রিস্ক: {item.riskLevel}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
