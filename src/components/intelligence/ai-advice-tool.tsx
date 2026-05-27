"use client"

import React, { useState } from 'react'
import { BrainCircuit, Loader2, MessageSquare, ShieldCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { generateFloodSurvivalAdvice, type GenerateFloodSurvivalAdviceOutput } from '@/ai/flows/generate-flood-survival-advice'

export function AIAdviceTool() {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<GenerateFloodSurvivalAdviceOutput | null>(null)

  const getAdvice = async () => {
    setLoading(true)
    try {
      const result = await generateFloodSurvivalAdvice({
        jamunaWaterLevel: 13.45,
        dangerLevelThreshold: 13.80,
        weatherForecast: "ভারী বৃষ্টিপাত ও দমকা হাওয়া",
        currentLocation: "বেলকুচি উপজেলা, সিরাজগঞ্জ",
      })
      setAdvice(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <BrainCircuit className="text-accent" size={20} />
          এআই সুরক্ষা পরামর্শক
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!advice ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <MessageSquare className="text-accent" />
            </div>
            <div className="max-w-[200px]">
              <p className="text-sm font-body text-muted-foreground">আপনার এলাকার জন্য নির্দিষ্ট বন্যা পরামর্শ পেতে ক্লিক করুন</p>
            </div>
            <Button 
              onClick={getAdvice} 
              disabled={loading}
              className="bg-accent hover:bg-accent/90 text-background font-headline font-bold"
            >
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "পরামর্শ নিন"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
              <p className="text-sm font-body leading-relaxed text-accent-foreground/90 italic">
                "{advice.advice}"
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-headline font-bold uppercase tracking-wider text-muted-foreground">নিরাপত্তা পদক্ষেপ:</h4>
              <ul className="grid gap-2">
                {advice.safetyMeasures.map((measure, idx) => (
                  <li key={idx} className="flex gap-2 text-sm font-body items-start">
                    <ShieldCheck size={16} className="text-accent shrink-0 mt-0.5" />
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>

            {advice.isEvacuationRecommended && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20 flex gap-3 items-start">
                <MapPin size={18} className="text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-destructive font-headline">আশ্রয়কেন্দ্রে যাওয়ার সুপারিশ</p>
                  <p className="text-xs font-body text-destructive/80">{advice.shelterDirections}</p>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setAdvice(null)}
              className="w-full text-xs font-headline border-accent/30 text-accent hover:bg-accent/10"
            >
              নতুন আপডেট দেখুন
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}