"use client"

import React from 'react'
import { Droplets, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function RiverTelemetry() {
  const currentLevel = 13.45
  const dangerLevel = 13.80
  const percentage = (currentLevel / dangerLevel) * 100

  return (
    <Card className="bg-card border-white/5 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Droplets className="text-primary" size={20} />
          যমুনা নদীর পানির স্তর
        </CardTitle>
        <Badge variant={currentLevel > dangerLevel ? "destructive" : "outline"} className="animate-pulse">
          {currentLevel > dangerLevel ? "বিপদসীমার উপরে" : "সতর্কতা"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-4xl font-headline font-bold text-primary">{currentLevel}</span>
            <span className="ml-1 text-muted-foreground">মি.</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-destructive font-bold">
            <TrendingUp size={14} />
            +০.০৫ মি. (গত ২৪ ঘণ্টা)
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground font-body">
              <span>বিপদসীমা: {dangerLevel} মি.</span>
              <span>{Math.round(percentage)}% পূর্ণ</span>
            </div>
            <Progress value={percentage} className="h-2 bg-muted [&>div]:bg-primary" />
          </div>
          
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex gap-3 items-start">
            <AlertTriangle className="text-primary shrink-0 mt-0.5" size={16} />
            <p className="text-xs font-body leading-relaxed text-primary/90">
              এনায়েতপুর ও বেলকুচি চরাঞ্চলে পানি প্রবেশ করছে। নিরাপদ স্থানে সরে যাওয়ার প্রস্তুতি নিন।
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}