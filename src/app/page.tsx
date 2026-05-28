
"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, User, Video, LayoutDashboard, Radio, Play, Loader2, Wifi, WifiOff, RefreshCw, Share2, BrainCircuit, Zap, BarChart3, Activity, PowerOff, Globe, Lock, Landmark, Database, Star, Network, Menu, LogOut, LogIn, Fingerprint, FileSearch, Sparkles } from 'lucide-react'
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
import { AuditPanel } from '@/components/dashboard/audit-panel'
import { ImperialOverview } from '@/components/dashboard/imperial-overview'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DisasterStorage } from '@/lib/disaster-storage'
import { useFirestore, useUser, useAuth } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore'
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
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppLogo } from '@/components/ui/app-logo'

export default function ShurukkhaDashboard() {
  const [isOffline, setIsOffline] = useState(false)
  const [userRole, setUserRole] = useState<'citizen' | 'authority' | 'admin'>('citizen')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAutoMode, setIsAutoMode] = useState(false)
  const [isLockedDown, setIsLockedDown] = useState(false)
  const [sessionValid, setSessionValid] = useState(true)
  const [activeView, setActiveView] = useState('citizen')
  const [activeSubTab, setActiveSubTab] = useState('ops')
  
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
      const isAdmin = user.email === 'rubels1k994@gmail.com';
      const userRef = doc(firestore, "users", user.uid);
      
      getDoc(userRef).then(snap => {
        const data = snap.data();
        const currentRole = isAdmin ? 'admin' : (data?.role || 'citizen');
        setUserRole(currentRole as any);

        setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: currentRole,
          lastLogin: new Date().toISOString(),
          deviceFingerprint: DeviceValidator.generateFingerprint()
        }, { merge: true });

        if (currentRole === 'admin' || currentRole === 'authority') {
          setActiveView('ops');
        }
      });
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
    SovereignAudit.logMilestone('Phase_31.0', 'Admin Decree: rubels1k994@gmail.com Elevated to Sovereign Admin');

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
      description: enabled ? "সিস্টেম এখন স্বয়ংক্রিয়ভাবে ডিসপ্যাচ ম্যানেজ করবে।" : "কর্তৃপক্ষকে এখন ম্যানুয়ালি ডিসপ্যাচ হ্যান্ডেল করতে হবে।",
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

  const handleSidebarNavigate = (view: string) => {
    setActiveView(view);
    if (['ops', 'analytics', 'audits', 'integrations', 'treasury'].includes(view)) {
      setActiveSubTab(view);
    }
  }

  if (authLoading || (user && !sessionValid)) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
          <AppLogo size={120} className="animate-sos-pulse relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin text-primary" size={16} />
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary animate-pulse">Establishing Sovereign Handshake...</p>
          </div>
          <p className="text-[8px] text-muted-foreground font-mono">PROJECT_ID: 42ND_ARCHIVE | v31.0</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full text-foreground transition-all duration-500 ${isLockedDown ? 'grayscale-[0.5] contrast-125' : ''}`}>
        <AppSidebar userRole={userRole} onNavigate={handleSidebarNavigate} activeTab={activeView} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className={`sticky top-0 z-40 border-b transition-colors duration-500 ${isLockedDown ? 'bg-destructive/20 border-destructive/40' : 'bg-background/80 border-white/5'} backdrop-blur-lg`}>
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="h-10 w-10 md:hidden" />
                <AppLogo size={32} variant={isLockedDown ? 'accent' : 'default'} className="md:w-10 md:h-10" />
                <div className="hidden xs:block">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm md:text-xl font-headline font-bold tracking-tighter leading-none uppercase">SHURUKKHA</h1>
                    <Badge variant="outline" className="hidden lg:flex h-4 text-[7px] border-primary/20 text-primary uppercase tracking-[0.2em] font-bold">
                      <Star size={8} fill="currentColor" className="mr-1" /> 42nd Project
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <span className="text-[8px] md:text-[10px] text-muted-foreground font-body font-medium uppercase tracking-[0.2em]">v31.0_SOVEREIGN</span>
                    {isLockedDown && <Badge variant="destructive" className="h-3 md:h-4 text-[6px] md:text-[8px] animate-pulse px-1">LOCKDOWN</Badge>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-6 flex-1 justify-end">
                <Link href="/welcome" className="hidden lg:block">
                  <Button variant="outline" size="sm" className="h-8 border-accent/20 text-accent gap-2 text-[10px] font-bold uppercase tracking-widest bg-accent/5 hover:bg-accent/10">
                    <Sparkles size={14} /> ফিচার ট্যুর
                  </Button>
                </Link>
                <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-accent/5 border border-accent/20 rounded-full">
                  <Lock size={12} className="text-accent" />
                  <span className="text-[9px] font-mono text-accent uppercase tracking-tighter">Encrypted_Session_Active</span>
                </div>
                <SovereignStatusWidget />
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] font-bold leading-none">{user.displayName}</p>
                      <p className="text-[8px] text-primary uppercase tracking-widest font-bold">{userRole}</p>
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
                {(userRole === 'authority' || userRole === 'admin') && (
                  <div className="hidden md:flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border border-white/5">
                    <BrainCircuit size={14} className={isAutoMode ? "text-accent animate-pulse" : "text-muted-foreground"} />
                    <Label htmlFor="auto-mode" className="text-[10px] uppercase font-bold tracking-widest cursor-pointer">Auto</Label>
                    <Switch id="auto-mode" checked={isAutoMode} onCheckedChange={handleAutoModeToggle} className="scale-75 data-[state=checked]:bg-accent" />
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-4 md:py-8 overflow-x-hidden">
            {(userRole === 'admin' || userRole === 'authority') && <ImperialOverview />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-3xl font-headline font-bold tracking-tight">
                    {activeView === 'citizen' ? 'সুরক্ষা ড্যাশবোর্ড' : 'কমান্ড সেন্টার'}
                  </h2>
                  {(isLockedDown || userRole === 'admin') && (
                    <Badge variant="outline" className={`${userRole === 'admin' ? 'border-accent/40 text-accent' : 'border-destructive/30 text-destructive'} gap-1 text-[8px] h-5`}>
                      <Lock size={8} /> {userRole === 'admin' ? 'SUPREME ADMIN' : 'SOVEREIGN'}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs md:text-sm font-body">
                  {activeView === 'citizen' ? 'সিরাজগঞ্জ পাবলিক সেফটি পোর্টাল' : 'মনিটরিং ও ডিসপ্যাচ ম্যানেজমেন্ট'}
                </p>
              </div>
            </div>

            {activeView === 'citizen' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
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
              </div>
            )}

            {(activeView !== 'citizen') && (
              <div className="w-full">
                <Tabs value={activeSubTab} onValueChange={handleSidebarNavigate} className="w-full">
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
                  <TabsContent value="audits" className="space-y-6 mt-0">
                    <AuditPanel />
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
              </div>
            )}
          </main>

          <footer className="border-t border-white/5 py-6 md:py-8 bg-muted/20 mt-12">
            <div className="container mx-auto px-4 text-center">
              <p className="text-[8px] md:text-xs text-muted-foreground font-body uppercase tracking-[0.2em] md:tracking-[0.4em]">Shurukkha Sovereign Hub © ২০২৪ | সিরাজগঞ্জ সুরক্ষা | 42nd Project</p>
            </div>
          </footer>
        </div>
      </div>
      <AlertCenter />
      <Toaster />
    </SidebarProvider>
  )
}
