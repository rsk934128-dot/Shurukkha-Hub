
"use client"

import React, { useState, useEffect } from 'react'
import { BrainCircuit, Zap, ShieldAlert, TrendingUp, RefreshCw, Activity, Target, ShieldCheck, Sparkles, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PredictiveAnalytics, SecurityForecast } from '@/lib/predictive-analytics'
import { SelfEvolutionEngine, EvolvedRule } from '@/lib/self-evolution-engine'
import { ScrollArea } from '@/components/ui/scroll-area'

export function PredictiveForecasting() {
  const [forecast, setForecast] = useState<SecurityForecast | null>(null)
  const [evolvedRules, setEvolvedRules] = useState<EvolvedRule[]>([])
  const [isEvolving, setIsEvolving] = useState(false)

  useEffect(() => {
    setForecast(PredictiveAnalytics.getForecast())
    setEvolvedRules(SelfEvolutionEngine.evolvedRules)
  }, [])

  const triggerManualEvolution = () => {
    setIsEvolving(true)
    setTimeout(() => {
      SelfEvolutionEngine.evolveFromThreat('MANUAL_STRESS_TEST')
      setEvolvedRules([...SelfEvolutionEngine.evolvedRules])
      setIsEvolving(false)
    }, 2000)
  }

  if (!forecast) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-headline font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                <BrainCircuit size={18} className="animate-pulse" /> 24H SECURITY FORECAST
              </h4>
              <Badge variant={forecast.estimatedThreatLevel === 'high' ? 'destructive' : 'outline'} className="animate-bounce">
                {forecast.estimatedThreatLevel.toUpperCase()} RISK
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Predicted Attack Type</p>
                <p className="text-xs font-bold text-foreground">{forecast.expectedAttackType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Probability</p>
                <div className="flex items-center gap-2">
                  <Progress value={forecast.probability} className="h-1.5 flex-1 bg-white/5" />
                  <span className="text-[10px] font-mono text-accent">{forecast.probability}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-white/5 space-y-2">
              <p className="text-[9px] text-accent font-bold uppercase flex items-center gap-1">
                <Target size={12} /> Strategic Recommendation
              </p>
              <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                "{forecast.recommendation}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {PredictiveAnalytics.getBottleneckPrediction().map((node, i) => (
              <div key={i} className="p-3 bg-muted/20 border border-white/5 rounded-xl space-y-2">
                <p className="text-[9px] uppercase font-bold text-muted-foreground">{node.zone}</p>
                <div className="flex justify-between items-end">
                  <span className={`text-[10px] font-bold ${node.risk === 'High' ? 'text-destructive' : 'text-accent'}`}>{node.risk} RISK</span>
                  <span className="text-[8px] text-muted-foreground font-mono">LOAD: {(node.loadFactor * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-headline font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={18} className="text-primary" /> SELF-EVOLUTION LOOP
              </h4>
              <button 
                onClick={triggerManualEvolution}
                disabled={isEvolving}
                className="p-1.5 hover:bg-primary/10 rounded-full transition-colors text-primary"
              >
                <RefreshCw size={16} className={isEvolving ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1">
              <ScrollArea className="h-[180px] pr-4">
                <div className="space-y-3">
                  {evolvedRules.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground text-center py-8 italic">No evolutions recorded in this cycle.</p>
                  ) : (
                    evolvedRules.map((rule) => (
                      <div key={rule.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                          <ShieldCheck size={14} className="text-primary" />
                          <div>
                            <p className="text-[11px] font-bold text-foreground">{rule.name}</p>
                            <p className="text-[8px] text-muted-foreground uppercase">ID: {rule.id}</p>
                          </div>
                        </div>
                        <Badge className="bg-accent/20 text-accent border-accent/30 text-[7px] h-4">ACTIVE</Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-[8px] uppercase text-muted-foreground font-bold">Evolution Rate</p>
                <p className="text-lg font-headline font-bold text-primary">{SelfEvolutionEngine.getEvolutionStats().evolutionEfficiency}</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] uppercase text-muted-foreground font-bold">Adaptability</p>
                <p className="text-lg font-headline font-bold text-accent">{SelfEvolutionEngine.getEvolutionStats().systemAdaptability}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
