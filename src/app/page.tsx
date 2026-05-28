"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, User, Video, LayoutDashboard, Radio, Play, Loader2, Wifi, WifiOff, RefreshCw, Share2, BrainCircuit, Zap, BarChart3, Activity, PowerOff, Globe, Lock, Landmark, Database, Star, Network, Menu, LogOut, LogIn, Fingerprint } from 'lucide-react'
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
import { NetworkStatusBoard } from '@/components/dashboard/network-status-board'
import { SovereignNetworkMap } from '@/components/dashboard/sovereign-network-map'
import { SovereignDomainManager } from '@/components/dashboard/sovereign-domain-manager'
import { BankDirectory } from '@/components/treasury/bank-directory'
import { AlertCenter } from '@/components/dashboard/alert-center'
import { SovereignStatusWidget } from '@/components/dashboard/sovereign-status-widget'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DisasterStorage } from '@/lib/disaster-storage'
import { useFirestore, useUser, useAuth } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { AutonomousOrchestrator } from '@/lib/orchestrator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { SovereignAudit } from '@/lib/sovereign-audit'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut } from 'firebase/auth'
import { AuthGuard } from '@/lib/auth-guard'
import { DeviceValidator } from '@/lib/device-fingerprint-validator'
import { useRouter } from 'next/navigation'

export default function ShurukkhaDashboard() {
  const [isOffline, setIsOffline] = useState(false)
  const [userRole, setUserRole] = useState<'citizen' | 'authority'>('citizen')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [isLockedDown, setIsLockedDown] = useState(false)
  const [sessionValid, setSessionValid] = useState(true)
  
  const { firestore } = useFirestore()
  const { auth } = useAuth()
  const { user, loading: authLoading } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user && !AuthGuard.isValidSession()) {
      setSessionValid(false)
      toast({
        title: "সেশন শেষ হয়েছে",
        description: "নিরাপত্তার স্বার্থে আবার লগইন করুন।",
        variant: "destructive"
      })
      router.push('/login')
    }

    // Check device integrity
    const storedFp = localStorage.getItem('sovereign_device_id')
    if (storedFp && !DeviceValidator.validateIntegrity(storedFp)) {
      handleEmergencyKillSwitch()
      toast({
        title: "SECURITY VIOLATION",
        description: "অননুমোদিত ডিভাইস শনাক্ত হয়েছে। সিস্টেম লকডাউন করা হচ্ছে।",
        variant: "destructive"
      })
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, "users", user.uid);
      setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
        deviceFingerprint: DeviceValidator.generateFingerprint()
      }, { merge: true });
    }
  }, [user, firestore])

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      syncOfflineData()
    }
    const handleOffline = () => setIsOffline(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOffline(!navigator.onLine)
    
    const interval = setInterval(() => {
      setIsLockedDown(IntegrationBridge.isLocked);
    }, 1000);

    const unsubscribeOrchestrator = AutonomousOrchestrator.startMonitoring()

    SovereignAudit.logMilestone('Phase_28.0', 'Imperial Multi-Layered Authentication & Zero-Trust Matrix Active');

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      unsubscribeOrchestrator()
      clearInterval(interval);
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
    IntegrationBridge.setLockdown(true)
    sessionStorage.clear()
    router.push('/login')
  }

  const syncOfflineData = async () => {
    const reports = DisasterStorage.getReports()
    if (reports.length === 0 || !firestore) return

    setIsSyncing(true)
    try {
      for (const report of reports) {
        await addDoc(collection(firestore, "incidents"), {
          ...report,
          timestamp: serverTimestamp(),
          syncedFromOffline: true
        })
      }
      DisasterStorage.clearReports()
      toast({ title: "অফলাইন ডেটা সিঙ্ক সফল" })
    } catch (e) {
      console.error("Sync Failed", e)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = () => {
    if (auth) {
      sessionStorage.clear()
      signOut(auth).then(() => {
        toast({ title: "সফলভাবে লগআউট করা হয়েছে" })
      })
    }
  }

  if (authLoading || (user && !sessionValid)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-xs uppercase tracking-[0.3em] font-bold text-primary/60 animate-pulse">Establishing Sovereign Handshake...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen text-foreground flex flex-col transition-all duration-500 ${isLockedDown ? 'grayscale-[0.5] contrast-125' : ''}`}>
      <header className={`sticky top-0 z-50 border-b transition-colors duration-500 ${isLockedDown ? 'bg-destructive/20 border-destructive/40' : 'bg-background/80 border-white/5'} backdrop-blur-lg`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center border transition-colors ${isLockedDown ? 'bg-destructive/20 border-destructive/40' : 'bg-primary/10 border-primary/20'}`}>
              <Shield className={isLockedDown ? "text-destructive" : "text-primary"} size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-xl font-headline font-bold tracking-tighter leading-none uppercase">SHURUKKHA</h1>
                <Badge variant="outline" className="hidden sm:flex h-4 text-[7px] border-primary/20 text-primary uppercase tracking-[0.2em] font-bold">
                  <Star size={8} fill="currentColor" className="mr-1" /> 42nd Project
                </Badge>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-[8px] md:text-[10px] text-muted-foreground font-body font-medium uppercase tracking-[0.2em]">v28.0</span>
                {isLockedDown && <Badge variant="destructive" className="h-3 md:h-4 text-[6px] md:text-[8px] animate-pulse px-1">LOCKDOWN</Badge>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/20 rounded-full">
              <Lock size={12} className="text-accent" />
              <span className="text-[9px] font-mono text-accent uppercase tracking-tighter">Encrypted_Session_Active</span>
            </div>
            
            <SovereignStatusWidget />
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] font-bold leading-none">{user.displayName}</p>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-widest">{userRole}</p>
                </div>
                <Avatar className="h-8 w-8 border border-primary/20">
                  <AvatarImage src={user.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-[10px]">{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <LogOut size={16} />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm" className="h-8 text-[10px] font-bold gap-2 bg-primary text-background">
                  <LogIn size={14} /> প্রবেশ করুন
                </Button>
              </Link>
            )}

            {userRole === 'authority' && (
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-white/5">
                  <BrainCircuit size={14} className={isAutoMode ? "text-accent animate-pulse" : "text-muted-foreground"} />
                  <Label htmlFor="auto-mode" className="text-[10px] uppercase font-bold tracking-widest cursor-pointer">Auto</Label>
                  <Switch 
                    id="auto-mode" 
                    checked={isAutoMode} 
                    onCheckedChange={handleAutoModeToggle}
                    className="scale-75 data-[state=checked]:bg-accent" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isLockedDown && (
        <div className="bg-destructive text-destructive-foreground py-1 text-center font-bold text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] animate-pulse">
          Sovereign Security Protocol Active
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-4 md:py-8">
        <Tabs defaultValue="citizen" value={userRole} onValueChange={(val: any) => setUserRole(val)} className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-3xl font-headline font-bold tracking-tight">
                  {userRole === 'citizen' ? 'সুরক্ষা ড্যাশবোর্ড' : 'কমান্ড সেন্টার'}
                </h2>
                {isLockedDown && userRole === 'authority' && (
                  <Badge variant="outline" className="border-destructive/30 text-destructive gap-1 text-[8px] h-5">
                    <Lock size={8} /> SOVEREIGN
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-xs md:text-sm font-body">
                {userRole === 'citizen' ? 'সিরাজগঞ্জ পাবলিক সেফটি পোর্টাল' : 'মনিটরিং ও ডিসপ্যাচ ম্যানেজমেন্ট'}
              </p>
            </div>
            <TabsList className="bg-muted/40 border border-white/5 w-full md:w-auto grid grid-cols-2 h-10">
              <TabsTrigger value="citizen" className="gap-2 text-xs"><LayoutDashboard size={14}/> পাবলিক</TabsTrigger>
              <TabsTrigger value="authority" className="gap-2 text-xs"><Radio size={14}/> অথরিটি</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="citizen" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
            <div className="lg:col-span-3 space-y-6 order-1">
              <SOSButton />
              <AIAdviceTool />
              <DisasterFeed />
            </div>
            <div className="lg:col-span-6 space-y-6 order-2">
              <RiverTelemetry />
              <ResourceMap />
            </div>
            <div className="lg:col-span-3 space-y-6 order-3">
              <IncidentReport />
              <EmergencyDirectory />
            </div>
          </TabsContent>

          <TabsContent value="authority" className="w-full">
            <Tabs defaultValue="ops" className="w-full">
              <TabsList className="mb-6 bg-muted/20 border border-white/5 p-1 h-auto flex flex-wrap md:flex-nowrap justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger value="ops" className="gap-2 h-10 px-4 whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold tracking-widest uppercase text-[9px] flex-1 md:flex-none">১. ডিসপ্যাচ</TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2 h-10 px-4 whitespace-nowrap data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold tracking-widest uppercase text-[9px] flex-1 md:flex-none">২. হেলথ</TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2 h-10 px-4 whitespace-nowrap data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold tracking-widest uppercase text-[9px] flex-1 md:flex-none">৩. নেটওয়ার্ক</TabsTrigger>
                <TabsTrigger value="treasury" className="gap-2 h-10 px-4 whitespace-nowrap data-[state=active]:bg-accent/10 data-[state=active]:text-accent font-bold tracking-widest uppercase text-[9px] flex-1 md:flex-none">৪. ট্রেজারি</TabsTrigger>
              </TabsList>

              <TabsContent value="ops" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
                <div className="lg:col-span-8 space-y-6">
                  {isAutoMode && !isLockedDown && (
                    <Alert className="bg-accent/10 border-accent/20 py-2">
                      <Zap className="h-3 w-3 text-accent" />
                      <AlertTitle className="text-[10px] font-bold uppercase text-accent">Autonomous Active</AlertTitle>
                    </Alert>
                  )}
                  <div className="h-auto md:h-[calc(100vh-450px)] min-h-[400px]">
                    <DispatcherConsole />
                  </div>
                  <div className="h-auto md:h-[350px]">
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

              <TabsContent value="integrations" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-12">
                    <SovereignNetworkMap />
                  </div>
                  <div className="lg:col-span-12">
                    <SovereignDomainManager />
                  </div>
                  <div className="lg:col-span-7">
                    <IntegrationPanel />
                  </div>
                  <div className="lg:col-span-5">
                    <NetworkStatusBoard />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="treasury" className="space-y-6 mt-0">
                <BankDirectory />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-white/5 py-6 md:py-8 bg-muted/20 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-[8px] md:text-xs text-muted-foreground font-body uppercase tracking-[0.2em] md:tracking-[0.4em]">Shurukkha Sovereign Hub © ২০২৪ | সিরাজগঞ্জ সুরক্ষা | 42nd Project</p>
        </div>
      </footer>
      
      <AlertCenter />
      <Toaster />
    </div>
  )
}
