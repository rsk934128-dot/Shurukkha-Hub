"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, User, Video, LayoutDashboard, Radio, Play, Loader2, Wifi, WifiOff, RefreshCw, Share2, BrainCircuit, Zap, BarChart3, Activity, PowerOff, Globe, Lock, Landmark, Database, Star, Network, Menu, LogOut, LogIn, Fingerprint, FileSearch, Sparkles, CreditCard, UserCircle, Signal, SignalHigh, SignalLow, Plane, Smartphone, ShieldAlert } from 'lucide-react'
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
import { SovereignIDCard } from '@/components/dashboard/sovereign-id-card'
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
  const [survivalMode, setSurvivalMode] = useState(false)
  
  const firestore = useFirestore()
  const auth = useAuth()
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
      
      const fetchRole = async () => {
        try {
          const snap = await getDoc(userRef);
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
        } catch (e) {
          console.warn("[Dashboard] Role fetch failed. Defaulting to citizen/cached role.");
          const currentRole = isAdmin ? 'admin' : 'citizen';
          setUserRole(currentRole as any);
        }
      };

      fetchRole();
    }
  }, [user, firestore])

  useEffect(() => {
    const handleConnectivityChange = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
      if (online) {
        setSurvivalMode(false);
        syncOfflineData();
      } else {
        setSurvivalMode(true);
        toast({
          title: "SURVIVAL MODE ACTIVE",
          description: "ইন্টারনেট নেই। অফলাইন কিউয়িং শুরু হয়েছে।",
          variant: "destructive"
        });
      }
    };
    
    window.addEventListener('online', handleConnectivityChange)
    window.addEventListener('offline', handleConnectivityChange)
    handleConnectivityChange();
    
    const interval = setInterval(() => {
      setIsLockedDown(IntegrationBridge.isLocked);
    }, 1000);

    const unsubscribeOrchestrator = AutonomousOrchestrator.startMonitoring()
    SovereignAudit.logMilestone('Phase_31.0', 'Engineering Milestone: Sovereign Shield Expansion Active');

    return () => {
      window.removeEventListener('online', handleConnectivityChange)
      window.removeEventListener('offline', handleConnectivityChange)
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

  const handleLogout = async () => {
    if (auth) {
      try {
        sessionStorage.clear()
        localStorage.removeItem('sovereign_session_token')
        await signOut(auth)
        toast({ title: "সফলভাবে লগআউট করা হয়েছে" })
        router.push('/login')
      } catch (e) {
        toast({ title: "লগআউট ব্যর্থ হয়েছে", variant: "destructive" })
      }
    }
  }

  const handleSidebarNavigate = (view: string) => {
    setActiveView(view);
    if (['ops', 'analytics', 'audits', 'integrations', 'treasury', 'profile'].includes(view)) {
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
        <AppSidebar userRole={userRole} onNavigate={handleSidebarNavigate} onLogout={handleLogout} activeTab={activeView} />
        
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
                <div className="flex items-center gap-1">
                  <Button 
                    variant={activeView === 'citizen' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setActiveView('citizen')}
                    className="h-8 text-[8px] font-bold gap-1 rounded-full border-primary/20"
                  >
                    <Smartphone size={12} /> CITIZEN SHIELD
                  </Button>
                  <Button 
                    variant={activeView !== 'citizen' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => setActiveView('ops')}
                    className="h-8 text-[8px] font-bold gap-1 rounded-full border-primary/20"
                  >
                    <ShieldAlert size={12} /> COMMANDER
                  </Button>
                </div>
                {survivalMode && (
                  <Badge variant="destructive" className="animate-pulse gap-1 text-[8px] h-6 px-2">
                    <SignalLow size={10} /> SURVIVAL_MODE
                  </Badge>
                )}
                <SovereignStatusWidget />
                {user && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-primary/20 cursor-pointer" onClick={() => handleSidebarNavigate('profile')}>
                      <AvatarImage src={user.photoURL || ''} />
                      <AvatarFallback className="bg-primary/10 text-[10px]">{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-4 md:py-8 overflow-x-hidden">
            {(userRole === 'admin' || userRole === 'authority') && activeView !== 'profile' && activeView !== 'citizen' && <ImperialOverview />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl md:text-3xl font-headline font-bold tracking-tight">
                    {activeView === 'citizen' ? 'সুরক্ষা সিটিজেন শিল্ড' : activeView === 'profile' ? 'সার্বভৌম পরিচয়পত্র' : 'কমান্ড সেন্টার'}
                  </h2>
                </div>
                <p className="text-muted-foreground text-xs md:text-sm font-body">
                  {activeView === 'citizen' ? 'সরাসরি প্রশাসনকে সিগন্যাল পাঠান' : activeView === 'profile' ? 'আপনার রাজকীয় পরিচয় ও ফরেনসিক তথ্য' : 'DEOS অটোনোমাস ডিসপ্যাচ গ্রিড'}
                </p>
              </div>
            </div>

            {activeView === 'citizen' && (
              <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <div className="text-center space-y-2">
                  <Badge className="bg-primary/20 text-primary border-primary/40 uppercase tracking-[0.2em] font-bold text-[10px] px-4 py-1">Secure Sovereign Interface</Badge>
                  <p className="text-xs text-muted-foreground italic">আপনার প্রতিটি সিগন্যাল সরাসরি ৪২টি নোডের মাধ্যমে কন্ট্রোল রুমে পৌঁছাবে।</p>
                </div>
                <SOSButton />
                <div className="grid grid-cols-1 gap-6">
                  <AIAdviceTool />
                  <IncidentReport />
                </div>
                <div className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                        <SignalHigh className="text-accent animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Signal Status: Strong</p>
                        <p className="text-[10px] text-muted-foreground">Connected via core.sheikh</p>
                      </div>
                   </div>
                   <Badge variant="outline" className="text-[8px] border-accent/30 text-accent">ENCRYPTED</Badge>
                </div>
              </div>
            )}

            {activeView === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <SovereignIDCard user={user} role={userRole} />
              </div>
            )}

            {(activeView !== 'citizen' && activeView !== 'profile') && (
              <div className="w-full">
                <Tabs value={activeSubTab} onValueChange={handleSidebarNavigate} className="w-full">
                  <TabsContent value="ops" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-0">
                    <div className="lg:col-span-12 space-y-6 h-[calc(100vh-250px)]">
                      <DispatcherConsole />
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
                    </div>
                  </TabsContent>
                  <TabsContent value="treasury" className="space-y-6 mt-0">
                    <BankDirectory />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </main>
        </div>
      </div>
      <AlertCenter />
      <Toaster />
    </SidebarProvider>
  )
}
