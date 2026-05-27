"use client"

import React, { useState, useEffect } from 'react'
import { BrainCircuit, Loader2, MessageSquare, ShieldCheck, MapPin, AlertCircle, Luggage, Clock, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { generateFloodSurvivalAdvice, type GenerateFloodSurvivalAdviceOutput } from '@/ai/flows/generate-flood-survival-advice'
import { Badge } from '@/components/ui/badge'
import { DisasterStorage } from '@/lib/disaster-storage'
import { useToast } from '@/hooks/use-toast'

export function AIAdviceTool() {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<GenerateFloodSurvivalAdviceOutput | null>(null)
  const { toast } = useToast()

  const getAdvice = async () => {
    setLoading(true)
    try {
      const result = await generateFloodSurvivalAdvice({
        jamunaWaterLevel: 13.95, // Test with danger level
        dangerLevelThreshold: 13.80,
        weatherForecast: "ভারী বৃষ্টিপাত ও উজানের ঢলের কারণে আকস্মিক প্লাবন",
        currentLocation: "বেলকুচি চরাঞ্চল, সিরাজগঞ্জ",
        nearbyShelters: [
          { name: "বেলকুচি বহুমুখী উচ্চ বিদ্যালয়", distance: "৮০০ মিটার", capacity: "৮০% পূর্ণ" },
          { name: "খাস পুখুরিয়া আশ্রয়কেন্দ্র", distance: "১.২ কি.মি.", capacity: "৪০% খালি" }
        ]
      })
      
      setAdvice(result)
      DisasterStorage.saveAdvice(result)

      if (result.automaticAlertTriggered) {
        toast({
          title: "স্বয়ংক্রিয় এলার্ট সক্রিয়",
          description: "ঝুঁকির মাত্রা অত্যধিক হওয়ায় কন্ট্রোল রুমে সতর্কবার্তা পাঠানো হয়েছে।",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "নেটওয়ার্ক ত্রুটি",
        description: "অফলাইন ফিড থেকে আগের পরামর্শগুলো দেখুন।",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Extreme': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-black';
      default: return 'bg-green-500 text-white';
    }
  }

  return (
    <Card className="bg-card border-white/5 overflow-hidden">
      <CardHeader className="pb-2 bg-accent/5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <BrainCircuit className="text-accent" size={20} />
          বন্যা ইন্টেলিজেন্স
        </CardTitle>
        {advice && (
          <Badge className={getRiskColor(advice.riskLevel)}>
            রিস্ক: {advice.riskLevel}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {!advice ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <MessageSquare className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-body font-bold text-foreground">Mission Risk Assessment</p>
              <p className="text-xs font-body text-muted-foreground mt-1">রিয়েল-টাইম ডেটা থেকে এআই গাইডেন্স জেনারেট করুন</p>
            </div>
            <Button 
              onClick={getAdvice} 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-background font-headline font-bold w-full"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "অ্যানালাইসিস শুরু করুন"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-muted/40 rounded-xl border border-white/5">
              <p className="text-sm font-body leading-relaxed text-foreground">
                {advice.advice}
              </p>
            </div>

            {advice.evacuationPlan && (
              <div className="space-y-3 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle size={18} />
                  <h4 className="text-sm font-headline font-bold uppercase">ইভাকুয়েশন প্ল্যান</h4>
                </div>
                
                <div className="grid gap-3">
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-destructive shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-foreground">গন্তব্য: {advice.evacuationPlan.recommendedShelter}</p>
                      <p className="text-[10px] text-muted-foreground">{advice.evacuationPlan.safeRoute}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Luggage size={16} className="text-destructive shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-foreground">জরুরি সামগ্রী</p>
                      <p className="text-[10px] text-muted-foreground">{advice.evacuationPlan.priorityItems.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock size={16} className="text-destructive shrink-0 mt-1" />
                    <p className="text-[10px] font-bold text-destructive">সময়সীমা: {advice.evacuationPlan.urgencyTimeframe}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h4 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground">নিরাপত্তা গাইডেন্স:</h4>
              <ul className="grid gap-2">
                {advice.safetyMeasures.map((measure, idx) => (
                  <li key={idx} className="flex gap-2 text-xs font-body items-start">
                    <ShieldCheck size={14} className="text-accent shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setAdvice(null)}
              className="w-full text-[10px] uppercase tracking-widest font-headline border-accent/30 text-accent hover:bg-accent/10 h-8"
            >
              আপডেট রিফ্রেশ করুন
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
