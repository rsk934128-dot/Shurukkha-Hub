
"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, Menu, User, Video, LayoutDashboard, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SOSButton } from '@/components/dashboard/sos-button'
import { RiverTelemetry } from '@/components/dashboard/river-telemetry'
import { AIAdviceTool } from '@/components/intelligence/ai-advice-tool'
import { EmergencyDirectory } from '@/components/dashboard/emergency-directory'
import { IncidentReport } from '@/components/dashboard/incident-report'
import { ResourceMap } from '@/components/dashboard/resource-map'
import { DisasterFeed } from '@/components/dashboard/disaster-feed'
import { DispatcherConsole } from '@/components/dashboard/dispatcher-console'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ShurukkhaDashboard() {
  const [isOffline, setIsOffline] = useState(false)
  const [userRole, setUserRole] = useState<'citizen' | 'authority'>('citizen')

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className={`min-h-screen text-foreground flex flex-col transition-colors duration-500 ${isOffline ? 'bg-[#0a0c10]' : 'bg-background'}`}>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold tracking-tighter leading-none">SHURUKKHA HUB</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-body font-medium uppercase tracking-[0.2em]">Sirajganj Operations</span>
                <Badge variant="outline" className="h-4 text-[8px] uppercase px-1 border-primary/30 text-primary cursor-pointer hover:bg-primary/10" onClick={() => setUserRole(prev => prev === 'citizen' ? 'authority' : 'citizen')}>
                  {userRole === 'citizen' ? 'Citizen Mode' : 'Authority Mode'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary relative">
                    <Video size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-ping" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 text-foreground">
                  <DialogHeader>
                    <DialogTitle className="font-headline font-bold">লাইভ ভেরিফিকেশন টার্মিনাল</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-white/5">
                    <Video size={48} className="text-muted-foreground/20" />
                    <p className="text-xs text-muted-foreground mt-4 font-body">কোন কল সক্রিয় নেই।</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button className="bg-primary text-background font-bold">নতুন সেশন শুরু করুন</Button>
                    <Button variant="outline" className="border-white/10">আইডি দিয়ে যোগ দিন</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                <Bell size={20} />
              </Button>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                <User size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {isOffline && (
        <div className="bg-destructive/20 border-b border-destructive/30 py-2">
          <div className="container mx-auto px-4 flex items-center justify-center gap-3">
            <Badge variant="destructive" className="h-4 text-[8px]">OFFLINE</Badge>
            <p className="text-xs font-headline font-bold text-destructive uppercase tracking-widest leading-none">
              সারভাইভাল মোড অ্যাক্টিভ। লোকাল ডেটা ব্যবহৃত হচ্ছে।
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="citizen" value={userRole} onValueChange={(val: any) => setUserRole(val)} className="w-full">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h2 className="text-3xl font-headline font-bold tracking-tight">
                {userRole === 'citizen' ? 'সুরক্ষা ড্যাশবোর্ড' : 'অপারেশনাল কমান্ড সেন্টার'}
              </h2>
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

          <TabsContent value="authority" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
            <div className="lg:col-span-4 space-y-6 h-[calc(100vh-200px)]">
              <DispatcherConsole />
            </div>
            <div className="lg:col-span-8 space-y-6 h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 gap-6 h-1/2">
                <RiverTelemetry />
                <DisasterFeed />
              </div>
              <div className="h-1/2">
                <ResourceMap />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-white/5 py-8 bg-muted/20 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground font-body">Shurukkha Hub © ২০২৪ | সিরাজগঞ্জ জেলা প্রশাসন কর্তৃক পরিচালিত</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  )
}
