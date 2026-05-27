"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, Menu, User, Search, Map as MapIcon, Wind, Compass, WifiOff, Zap, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SOSButton } from '@/components/dashboard/sos-button'
import { RiverTelemetry } from '@/components/dashboard/river-telemetry'
import { AIAdviceTool } from '@/components/intelligence/ai-advice-tool'
import { EmergencyDirectory } from '@/components/dashboard/emergency-directory'
import { IncidentReport } from '@/components/dashboard/incident-report'
import { ResourceMap } from '@/components/dashboard/resource-map'
import { DisasterFeed } from '@/components/dashboard/disaster-feed'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export default function ShurukkhaDashboard() {
  const [isOffline, setIsOffline] = useState(false)

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
                {isOffline && (
                  <Badge variant="destructive" className="h-4 text-[8px] uppercase px-1 gap-1">
                    <WifiOff size={8} /> Survival Mode
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm font-headline font-bold text-primary hover:text-primary/80 transition-colors">ড্যাশবোর্ড</a>
              <a href="#" className="text-sm font-headline font-bold text-muted-foreground hover:text-primary transition-colors">মানচিত্র</a>
              <a href="#" className="text-sm font-headline font-bold text-muted-foreground hover:text-primary transition-colors">হেল্পলাইন</a>
            </nav>
            <div className="h-6 w-px bg-white/10" />
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
          
          <Button size="icon" variant="ghost" className="md:hidden">
            <Menu size={24} />
          </Button>
        </div>
      </header>

      {isOffline && (
        <div className="bg-destructive/20 border-b border-destructive/30 py-2">
          <div className="container mx-auto px-4 flex items-center justify-center gap-3">
            <Zap size={14} className="text-destructive animate-pulse" />
            <p className="text-xs font-headline font-bold text-destructive uppercase tracking-widest">
              আপনি এখন অফলাইন মোডে আছেন। সংরক্ষিত ডেটা ও ডিরেক্টরি ব্যবহার করুন।
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SOSButton />
          
          <div className="p-4 bg-muted/40 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-headline font-bold uppercase tracking-wider text-muted-foreground">তড়িৎ তথ্য</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Wind size={18} className="text-accent" />
                  <span className="text-sm font-body">বাতাস</span>
                </div>
                <span className="text-sm font-headline font-bold">১২ কি.মি./ঘণ্টা</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Compass size={18} className="text-accent" />
                  <span className="text-sm font-body">আর্দ্রতা</span>
                </div>
                <span className="text-sm font-headline font-bold">৭৮%</span>
              </div>
            </div>
          </div>
          
          <AIAdviceTool />
          <DisasterFeed />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <RiverTelemetry />
            </div>
            <div className="md:col-span-2 h-[450px]">
              <ResourceMap />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <IncidentReport />
          <EmergencyDirectory />
          
          <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden group cursor-pointer">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Shield size={18} />
                <h4 className="text-sm font-headline font-bold">অফলাইন সুরক্ষা গাইড</h4>
              </div>
              <p className="text-xs font-body text-primary/80 leading-relaxed">জরুরি নির্দেশিকা ও নম্বরগুলো এখন অফলাইনেও সংরক্ষিত।</p>
              <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs">বুকমার্ক দেখুন →</Button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Shield size={80} className="text-primary" />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground font-body">Shurukkha Hub © ২০২৪ | সিরাজগঞ্জ জেলা প্রশাসন কর্তৃক পরিচালিত</p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  )
}
