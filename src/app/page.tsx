"use client"

import React from 'react'
import { Shield, Bell, Menu, User, Search, Map as MapIcon, Wind, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SOSButton } from '@/components/dashboard/sos-button'
import { RiverTelemetry } from '@/components/dashboard/river-telemetry'
import { AIAdviceTool } from '@/components/intelligence/ai-advice-tool'
import { EmergencyDirectory } from '@/components/dashboard/emergency-directory'
import { IncidentReport } from '@/components/dashboard/incident-report'
import { ResourceMap } from '@/components/dashboard/resource-map'
import { Toaster } from '@/components/ui/toaster'

export default function ShurukkhaDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold tracking-tighter leading-none">SHURUKKHA HUB</h1>
              <span className="text-[10px] text-muted-foreground font-body font-medium uppercase tracking-[0.2em]">Sirajganj Operations</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm font-headline font-bold text-primary hover:text-primary/80 transition-colors">ড্যাশবোর্ড</a>
              <a href="#" className="text-sm font-headline font-bold text-muted-foreground hover:text-primary transition-colors">মানচিত্র</a>
              <a href="#" className="text-sm font-headline font-bold text-muted-foreground hover:text-primary transition-colors">বন্যা আপডেট</a>
              <a href="#" className="text-sm font-headline font-bold text-muted-foreground hover:text-primary transition-colors">হেল্পলাইন</a>
            </nav>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex items-center gap-2">
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

      {/* Main Grid Content */}
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - High Priority Actions */}
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
        </div>

        {/* Center Column - Real-time Monitoring */}
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

        {/* Right Column - Secondary Actions & Directory */}
        <div className="lg:col-span-3 space-y-6">
          <IncidentReport />
          <EmergencyDirectory />
          
          {/* Offline Handbook Teaser */}
          <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 relative overflow-hidden group cursor-pointer">
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Shield size={18} />
                <h4 className="text-sm font-headline font-bold">অফলাইন সুরক্ষা গাইড</h4>
              </div>
              <p className="text-xs font-body text-primary/80 leading-relaxed">নেটওয়ার্ক না থাকলেও জরুরি নির্দেশিকা ও নম্বরগুলো দেখুন। এখনই সেভ করুন।</p>
              <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs">আরও জানুন →</Button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Shield size={80} className="text-primary" />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile SOS Trigger (Floating) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button size="icon" className="w-16 h-16 rounded-full bg-destructive shadow-2xl animate-sos-pulse border-4 border-background">
          <Shield className="text-white" size={28} />
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground font-body">Shurukkha Hub © ২০২৪ | সিরাজগঞ্জ জেলা প্রশাসন কর্তৃক পরিচালিত</p>
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground font-headline uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">গোপনীয়তা নীতি</a>
            <a href="#" className="hover:text-primary transition-colors">শর্তাবলী</a>
            <a href="#" className="hover:text-primary transition-colors">যোগাযোগ</a>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>
  )
}