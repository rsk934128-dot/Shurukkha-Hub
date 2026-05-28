
"use client"

import React, { useState, useEffect } from 'react'
import { Shield, Bell, User, Video, LayoutDashboard, Radio, Play, Loader2, Wifi, WifiOff, RefreshCw, Share2, BrainCircuit, Zap, BarChart3, Activity, PowerOff, Globe, Lock, Landmark, Database, Star, Network, Menu, LogOut, LogIn, Fingerprint, FileSearch, Sparkles, CreditCard, UserCircle, Signal, SignalHigh, SignalLow, Plane, Smartphone, ShieldAlert, FileText, SearchCode, MessageSquare } from 'lucide-react'
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
import { IncidentReviewBoard } from '@/components/dashboard/incident-review-board'
import { CommunicationConsole } from '@/components/dashboard/communication-console'
import { SovereignLens } from '@/components/dashboard/sovereign-lens'
import { CallOverlay } from '@/components/dashboard/call-overlay'
import { Toaster } from '@/components/ui/toaster'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { DisasterStorage } from '@/lib/disaster-storage'
import { useFirestore, useUser, useAuth } from '@/firebase'
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
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
import { CommunicationOrchestrator } from '@/lib/communication-orchestrator'
import { db } from '@/lib/firebase'

const ADMIN_EMAILS = ['rubels1k994@gmail.com', 'rsk755734@gmail.com'];

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
  const [isCheckingSession, setIsCheckingCheckingSession] = useState(true)
  const [isLensOpen, setIsLensOpen] = useState(false)
  const [activeCall, setActiveCall] = useState<any>(null)
  
  const firestore = useFirestore()
  const auth = useAuth()
  const { user, loading: authLoading } = useUser()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login')
      return
    }

    const checkSession = () => {
      if (!AuthGuard.isValidSession()) {
        setSessionValid(false)
        router.replace('/login')
      } else {
        setIsCheckingCheckingSession(false)
      }
    }

    const timer = setTimeout(checkSession, 800);

    const storedFp = localStorage.getItem('sovereign_device_id')
    if (storedFp && !DeviceValidator.validateIntegrity(storedFp)) {
      handleEmergencyKillSwitch()
      toast({
        title: "SECURITY VIOLATION",
        description: "অননুমোদিত ডিভাইস শনাক্ত হয়েছে।",
        variant: "destructive"
      })
    }

    return () => clearTimeout(timer);
  }, [user, authLoading, router, toast])

  useEffect(() => {
    if (user && firestore) {
      const isAdmin = ADMIN_EMAILS.includes(user.email || '');
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
          console.warn("[Dashboard] Role fetch failed. Defaulting to citizen.");
          const currentRole = isAdmin ? 'admin' : 'citizen';
          setUserRole(currentRole as any);
        }
      };

      fetchRole();

      // Universal Call Listener - Incoming
      const callsQ = query(
        collection(db, 'webrtc_sessions'),
        where('recipientId', '==', user.uid),
        where('status', '==', 'ringing')
      );

      const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            setActiveCall({
              sessionId: change.doc.id,
              callerId: data.callerId,
              callerName: data.callerName,
              callerAvatar: data.callerAvatar,
              type: data.type,
              isIncoming: true
            });
          }
        });
      });

      // Self Call Listener - Outgoing (handles calls started from CommConsole)
      const myCallsQ = query(
        collection(db, 'webrtc_sessions'),
        where('callerId', '==', user.uid),
        where('status', '==', 'ringing')
      );

      const unsubscribeMyCalls = onSnapshot(myCallsQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            // Start overlay for caller
            if (!activeCall) {
              setActiveCall({
                sessionId: change.doc.id,
                callerId: data.callerId,
                callerName: data.recipientName || 'Identity',
                callerAvatar: data.recipientAvatar,
                type: data.type,
                isIncoming: false
              });
            }
          }
        });
      });

      return () => {
        unsubscribeCalls();
        unsubscribeMyCalls();
      };
    }
  }, [user, firestore, activeCall])

  useEffect(() => {
    const handleConnectivityChange = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
      CommunicationOrchestrator.getInstance().setConnectivity(online);
      if (!online) {
        setSurvivalMode(true);
        toast({ title: "SURVIVAL MODE ACTIVE", variant: "destructive" });
      } else {
        setSurvivalMode(false);
      }
    };
    
    window.addEventListener('online', handleConnectivityChange)
    window.addEventListener('offline', handleConnectivityChange)
    handleConnectivityChange();
    
    const unsubscribeOrchestrator = AutonomousOrchestrator.startMonitoring()
    return () => {
      window.removeEventListener('online', handleConnectivityChange)
      window.removeEventListener('offline', handleConnectivityChange)
      unsubscribeOrchestrator()
    }
  }, [toast])

  const handleEmergencyKillSwitch = () => {
    AuthGuard.clearSession();
    router.replace('/login')
  }

  const handleLogout = async () => {
    if (auth) {
      try {
        AuthGuard.clearSession();
        await signOut(auth)
        window.location.assign('/')
      } catch (e) {
        toast({ title: "লগআউট ব্যর্থ হয়েছে", variant: "destructive" })
      }
    }
  }

  const handleSidebarNavigate = (view: string) => {
    if (view === 'lens') {
      setIsLensOpen(true);
      return;
    }
    setActiveView(view);
    if (['ops', 'intelligence', 'analytics', 'audits', 'integrations', 'treasury', 'profile', 'messages'].includes(view)) {
      setActiveSubTab(view);
    }
  }

  if (authLoading || isCheckingSession || (user && !sessionValid)) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-8">
        <AppLogo size={120} className="animate-sos-pulse" />
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-primary" size={24} />
          <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary animate-pulse">Initializing Sovereign Grid...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className={`flex min-h-screen w-full text-foreground`}>
        <AppSidebar userRole={userRole} onNavigate={handleSidebarNavigate} onLogout={handleLogout} activeTab={activeView} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 border-b bg-background/80 border-white/5 backdrop-blur-lg">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="h-10 w-10 md:hidden" />
                <AppLogo size={32} />
                <div className="hidden xs:block">
                  <h1 className="text-sm md:text-xl font-headline font-bold tracking-tighter uppercase leading-none">SHURUKKHA</h1>
                  <span className="text-[8px] md:text-[10px] text-muted-foreground uppercase tracking-[0.2em]">v31.0_SOVEREIGN</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 justify-end flex-1">
                {survivalMode && <Badge variant="destructive" className="animate-pulse h-6 text-[8px]">SURVIVAL_MODE</Badge>}
                <SovereignStatusWidget />
                <Avatar className="h-8 w-8 border border-primary/20 cursor-pointer" onClick={() => setActiveView('profile')}>
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-[10px]">{user?.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-6 overflow-x-hidden">
            {(userRole === 'admin' || userRole === 'authority') && activeView !== 'profile' && activeView !== 'citizen' && activeView !== 'messages' && <ImperialOverview />}

            {activeView === 'citizen' && (
              <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <SOSButton />
                <div className="grid grid-cols-1 gap-6">
                  <AIAdviceTool />
                  <IncidentReport />
                </div>
                <Button onClick={() => setActiveView('messages')} className="w-full h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl gap-3 font-bold">
                  <MessageSquare size={20} /> কন্ট্রোল রুমের সাথে কথা বলুন
                </Button>
              </div>
            )}

            {activeView === 'messages' && <div className="h-[calc(100vh-180px)] max-w-5xl mx-auto w-full"><CommunicationConsole /></div>}
            {activeView === 'profile' && <div className="max-w-4xl mx-auto"><SovereignIDCard user={user} role={userRole} /></div>}

            {(activeView !== 'citizen' && activeView !== 'profile' && activeView !== 'messages') && (
              <Tabs value={activeSubTab} onValueChange={handleSidebarNavigate} className="w-full">
                <TabsContent value="ops" className="h-[calc(100vh-250px)]"><DispatcherConsole /></TabsContent>
                <TabsContent value="intelligence"><IncidentReviewBoard /></TabsContent>
                <TabsContent value="analytics"><SystemHealth /></TabsContent>
                <TabsContent value="audits"><AuditPanel /></TabsContent>
                <TabsContent value="integrations" className="space-y-6">
                  <SovereignNetworkMap />
                  <SovereignDomainManager />
                </TabsContent>
                <TabsContent value="treasury"><BankDirectory /></TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
      <SovereignLens isOpen={isLensOpen} onClose={() => setIsLensOpen(false)} />
      <CallOverlay callData={activeCall} onClose={() => setActiveCall(null)} />
      <AlertCenter />
      <Toaster />
    </SidebarProvider>
  )
}
