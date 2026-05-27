
"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, User, Video, LayoutDashboard, Radio, Play, Loader2, Wifi, WifiOff, RefreshCw, Share2, BrainCircuit, Zap, BarChart3, Activity, PowerOff, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SOSButton } from '@/components/dashboard/sos-button'
import { RiverTelemetry } from '@/components/dashboard/river-telemetry'
import { AIAdviceTool } from '@/components/intelligence/ai-advice-tool'
import { EmergencyDirectory } from '@/components/dashboard/emergency-directory'
import { IncidentReport } from '@/components/dashboard/incident-report'
import { ResourceMap } from '@/components/dashboard/resource-map'
import { DisasterFeed } from '@/components/dashboard/disaster-feed'
import { DispatcherConsole } from '@/components/dashboard/dispatcher-console'
import { IntegrationPanel } from '@/components/dashboard/integration-panel'
import { SystemHealth } from '@/components/dashboard/system-health'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DisasterStorage } from '@/lib/disaster-storage'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { AutonomousOrchestrator } from '@/lib/orchestrator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

export default function ShurukkhaDashboard() {
  const [isOffline, setIsOffline] = useState(false)
  const [userRole, setUserRole] = useState<'citizen' | 'authority'>('citizen')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      syncOfflineData()
    }
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)
    
    if (navigator.onLine) {
      syncOfflineData()
    }

    // Start Orchestrator Monitoring
    const unsubscribeOrchestrator = AutonomousOrchestrator.startMonitoring()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribeOrchestrator()
    }
  }, [])

  const handleAutoModeToggle = (enabled: boolean) => {
    setIsAutoMode(enabled)
    AutonomousOrchestrator.setAutoMode(enabled)
    toast({
      title: enabled ? "Autonomous Mode Enabled" : "Manual Mode Enabled",
      description: enabled 
        ? "সিস্টেম এখন স্বয়ংক্রিয়ভাবে ডিসপ্যাচ ম্যানেজ করবে।" 
        : "কর্তৃপক্ষকে এখন ম্যানুয়ালি ডিসপ্যাচ হ্যান্ডেল করতে হবে।",
      variant: enabled ? "default" : "outline"
    })
  }

  const handleEmergencyKillSwitch = () => {
    setIsAutoMode(false)
    AutonomousOrchestrator.setAutoMode(false)
    toast({
      title: "EMERGENCY STOP ACTIVATED",
      description: "সব স্বয়ংক্রিয় কার্যক্রম বন্ধ করা হয়েছে। সিস্টেম এখন সম্পূর্ণ ম্যানুয়াল মোডে।",
      variant: "destructive"
    })
  }

  const syncOfflineData = async () => {
    const reports = DisasterStorage.getReports()
    if (reports.length === 0) return

    setIsSyncing(true)
    let syncedCount = 0

    try {
      for (const report of reports) {
        await addDoc(collection(db, "incidents"), {
          ...report,
          timestamp: serverTimestamp(),
          syncedFromOffline: true
        })
        syncedCount++
      }
      DisasterStorage.clearReports()
      toast({
        title: "অফলাইন ডেটা সিঙ্ক সফল",
        description: `${syncedCount}টি রিপোর্ট সার্ভারে আপলোড করা হয়েছে।`,
      })
    } catch (e) {
      console.error("Sync Failed", e)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className={`min-h-screen text-foreground flex flex-col transition-colors duration-500 ${isOffline ? 'bg-[#0a0c10]' : 'bg-background'}`}>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold tracking-tighter leading-none uppercase">SHURUKKHA HUB</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-body font-medium uppercase tracking-[0.2em]">Sovereign Grid</span>
                <Badge variant="outline" className="h-4 text-[8px] uppercase px-1 border-primary/30 text-primary cursor-pointer hover:bg-primary/10" onClick={() => setUserRole(prev => prev === 'citizen' ? 'authority' : 'citizen')}>
                  {userRole === 'citizen' ? 'Citizen Mode' : 'Authority Mode'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/partnerships">
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold gap-2 text-primary/60 hover:text-primary">
                <Globe size={14} /> PARTNERSHIP HUB
              </Button>
            </Link>

            {userRole === 'authority' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-white/5">
                  <BrainCircuit size={14} className={isAutoMode ? "text-accent animate-pulse" : "text-muted-foreground"} />
                  <Label htmlFor="auto-mode" className="text-[10px] uppercase font-bold tracking-widest cursor-pointer">Autonomous Mode</Label>
                  <Switch 
                    id="auto-mode" 
                    checked={isAutoMode} 
                    onCheckedChange={handleAutoModeToggle}
                    className="scale-75 data-[state=checked]:bg-accent" 
                  />
                </div>
                {isAutoMode && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8 px-3 text-[10px] font-bold gap-1 animate-pulse"
                    onClick={handleEmergencyKillSwitch}
                  >
                    <PowerOff size={12} /> EMERGENCY STOP
                  </Button>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {isSyncing && (
                <Badge variant="outline" className="h-6 gap-1 border-primary/20 text-primary animate-pulse">
                  <RefreshCw size={10} className="animate-spin" /> সিঙ্কিং...
                </Badge>
              )}
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary relative">
                  <Video size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping" />
                </Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                  {isOffline ? <WifiOff size={20} className="text-destructive" /> : <Wifi size={20} className="text-accent" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {isOffline && (
        <div className="bg-destructive/20 border-b border-destructive/30 py-2">
          <div className="container mx-auto px-4 flex items-center justify-center gap-3">
            <Badge variant="destructive" className="h-4 text-[8px]">SURVIVAL MODE ACTIVE</Badge>
            <p className="text-xs font-headline font-bold text-destructive uppercase tracking-widest leading-none">
              নেটওয়ার্ক বিচ্ছিন্ন। লোকাল ডেটা ব্যবহৃত হচ্ছে।
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="citizen" value={userRole} onValueChange={(val: any) => setUserRole(val)} className="w-full">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-headline font-bold tracking-tight">
                  {userRole === 'citizen' ? 'সুরক্ষা ড্যাশবোর্ড' : 'অপারেশনাল কমান্ড সেন্টার'}
                </h2>
                {userRole === 'authority' && isAutoMode && (
                  <Badge variant="outline" className="border-accent/30 text-accent gap-1 animate-pulse">
                    <Zap size={10} fill="currentColor" /> AUTONOMOUS ACTIVE
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm font-body">
                {userRole === 'citizen' ? 'সিরাজগঞ্জ জেলা প্রশাসনের পাবলিক সেফটি পোর্টাল' : 'জরুরি পরিস্থিতি মনিটরিং ও ডিসপ্যাচ ম্যানেজমেন্ট'}
              </p>
            </div>
            <TabsList className="bg-muted/40 border border-white/5">
              <TabsTrigger value="citizen" className="gap-2"><LayoutDashboard size={14}/> পাবলিক</TabsTrigger>
              <TabsTrigger value="authority" className="gap-2"><Radio size={14}/> অথরিটি</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="citizen" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
            <div className="lg:col-span-3 space-y-6">
              <SOSButton />
              <AIAdviceTool />
              <DisasterFeed />
            </div>
            <div className="lg:col-span-6 space-y-6">
              <RiverTelemetry />
              <ResourceMap />
            </div>
            <div className="lg:col-span-3 space-y-6">
              <IncidentReport />
              <EmergencyDirectory />
            </div>
          </TabsContent>

          <TabsContent value="authority" className="w-full">
            <Tabs defaultValue="ops" className="w-full">
              <TabsList className="mb-6 bg-muted/20 border border-white/5 p-1 h-12">
                <TabsTrigger value="ops" className="gap-2 h-10 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold tracking-widest">১. ডিসপ্যাচ কমান্ড</TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 h-10 px-6 data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold tracking-widest">২. হেলথ ও সিমুলেশন</TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2 h-10 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold tracking-widest">৩. পার্টনার ব্রিজ</TabsTrigger>
              </TabsList>

              <TabsContent value="ops" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
                <div className="lg:col-span-8 space-y-6">
                  {isAutoMode && (
                    <Alert className="bg-accent/10 border-accent/20">
                      <Zap className="h-4 w-4 text-accent" />
                      <AlertTitle className="text-xs font-bold uppercase text-accent">Autonomous Monitoring Enabled</AlertTitle>
                      <AlertDescription className="text-[10px]">
                        সিস্টেম এখন স্বয়ংক্রিয়ভাবে অ্যালার্ট প্রসেস করছে। প্রতিটি অ্যাকশন Sovereign Audit Registry-তে রেকর্ড হচ্ছে।
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="h-[calc(100vh-450px)]">
                    <DispatcherConsole />
                  </div>
                  <div className="h-[350px]">
                    <RiverTelemetry />
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-6 h-full">
                  <ResourceMap />
                  <EmergencyDirectory />
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6 mt-0">
                <SystemHealth />
              </TabsContent>

              <TabsContent value="integrations" className="h-[800px] mt-0">
                <IntegrationPanel />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-white/5 py-8 bg-muted/20 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-body uppercase tracking-[0.4em]">Shurukkha Sovereign Hub © ২০২৪ | সিরাজগঞ্জ সুরক্ষা মিশন-ক্রিটিক্যাল ইনফ্রাস্ট্রাকচার</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  )
}
