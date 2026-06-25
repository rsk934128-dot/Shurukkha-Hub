"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Shield, Bell, User, Video, LayoutDashboard, Radio, Play, Loader2, Wifi, WifiOff, RefreshCw, Share2, BrainCircuit, Zap, BarChart3, Activity, PowerOff, Globe, Lock, Landmark, Database, Star, Network, Menu, LogOut, LogIn, Fingerprint, FileSearch, Sparkles, CreditCard, UserCircle, Signal, SignalHigh, SignalLow, Plane, Smartphone, ShieldAlert, FileText, SearchCode, MessageSquare, Handshake, Box, Scale, Settings, Search, BookOpen, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SOSButton } from '@/components/dashboard/sos-button'
import { AIAdviceTool } from '@/components/intelligence/ai-advice-tool'
import { IncidentReport } from '@/components/dashboard/incident-report'
import { DispatcherConsole } from '@/components/dashboard/dispatcher-console'
import { SystemHealth } from '@/components/dashboard/system-health'
import { NetworkStatusBoard } from '@/components/dashboard/network-status-board'
import { SovereignNetworkMap } from '@/components/dashboard/sovereign-network-map'
import { SovereignDomainManager } from '@/components/dashboard/sovereign-domain-manager'
import { BankDirectory } from '@/components/treasury/bank-directory'
import { SovereignStatusWidget } from '@/components/dashboard/sovereign-status-widget'
import { AuditPanel } from '@/components/dashboard/audit-panel'
import { ImperialOverview } from '@/components/dashboard/imperial-overview'
import { SovereignIDCard } from '@/components/dashboard/sovereign-id-card'
import { IncidentReviewBoard } from '@/components/dashboard/incident-review-board'
import { CommunicationConsole } from '@/components/dashboard/communication-console'
import { SovereignLens } from '@/components/dashboard/sovereign-lens'
import { SovereignAssistantChat } from '@/components/intelligence/sovereign-assistant-chat'
import { PartnershipReviewBoard } from '@/components/dashboard/partnership-review-board'
import { SovereignStatusReport } from '@/components/dashboard/sovereign-status-report'
import { ReliefManagement } from '@/components/dashboard/relief-management'
import { ImperialManifesto } from '@/components/dashboard/imperial-manifesto'
import { NotificationHub } from '@/components/dashboard/notification-hub'
import { ImperialManagement } from '@/components/dashboard/imperial-management'
import { IntegrationPanel } from '@/components/dashboard/integration-panel'
import { LiveShield } from '@/components/security/live-shield'
import { ImperialNotificationCenter } from '@/components/dashboard/imperial-notification-center'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFirestore, useUser, useAuth } from '@/firebase'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { signOut } from 'firebase/auth'
import { AuthGuard } from '@/lib/auth-guard'
import { DeviceValidator } from '@/lib/device-fingerprint-validator'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppLogo } from '@/components/ui/app-logo'
import { CommunicationOrchestrator } from '@/lib/communication-orchestrator'
import { NotificationManager } from '@/lib/notification-manager'
import { KnowledgeStore } from '@/lib/knowledge-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const ADMIN_EMAILS = ['rubels1k994@gmail.com', 'rsk755734@gmail.com'];

export default function ShurukkhaDashboard() {
  const [isOffline, setIsOffline] = useState(false)
  const [userRole, setUserRole] = useState<'citizen' | 'authority' | 'admin'>('citizen')
  const [activeView, setActiveView] = useState('citizen')
  const [activeSubTab, setActiveSubTab] = useState('ops')
  const [survivalMode, setSurvivalMode] = useState(false)
  const [isCheckingSession, setIsCheckingCheckingSession] = useState(true)
  const [isLensOpen, setIsLensOpen] = useState(false)
  const [knowledgeSearch, setKnowledgeSearch] = useState('')
  
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
        router.replace('/login')
      } else {
        setIsCheckingCheckingSession(false)
      }
    }

    const timer = setTimeout(checkSession, 800);
    return () => clearTimeout(timer);
  }, [user, authLoading, router])

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
            status: 'online',
            lastActive: new Date().toISOString(),
            deviceFingerprint: DeviceValidator.generateFingerprint()
          }, { merge: true });

          if (currentRole === 'admin' || currentRole === 'authority') {
            setActiveView('ops');
          }
        } catch (e) {
          const currentRole = isAdmin ? 'admin' : 'citizen';
          setUserRole(currentRole as any);
        }
      };

      fetchRole();

      // Presence Cleanup
      const handleUnload = () => {
        updateDoc(userRef, { 
          status: 'offline',
          lastActive: new Date().toISOString()
        });
      };

      window.addEventListener('beforeunload', handleUnload);
      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        handleUnload();
      };
    }
  }, [user?.uid, firestore])

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
    
    return () => {
      window.removeEventListener('online', handleConnectivityChange)
      window.removeEventListener('offline', handleConnectivityChange)
    }
  }, [toast])

  const handleLogout = async () => {
    if (auth && user && firestore) {
      try {
        const userRef = doc(firestore, "users", user.uid);
        await updateDoc(userRef, { status: 'offline' });
        AuthGuard.clearSession();
        NotificationManager.deactivateSovereignSignal();
        await signOut(auth)
        window.location.assign('/')
      } catch (e) { toast({ title: "লগআউট ব্যর্থ হয়েছে", variant: "destructive" }) }
    }
  }

  const handleSidebarNavigate = (view: string) => {
    if (view === 'lens') { setIsLensOpen(true); return; }
    if (view === 'exchange') { window.open('/exchange', '_blank'); return; }
    setActiveView(view);
    if (['ops', 'intelligence', 'analytics', 'audits', 'integrations', 'treasury', 'profile', 'messages', 'partnerships', 'relief', 'manifesto', 'signals', 'management', 'security', 'knowledge'].includes(view)) {
      setActiveSubTab(view);
    }
  }

  if (authLoading || isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center gap-8">
        <AppLogo size={120} className="animate-sos-pulse" />
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    )
  }

  const solutions = KnowledgeStore.searchSolutions(knowledgeSearch);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full text-foreground bg-[#05070a]">
        <AppSidebar userRole={userRole} onNavigate={handleSidebarNavigate} onLogout={handleLogout} activeTab={activeView} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 border-b bg-background/80 border-white/5 backdrop-blur-lg px-2 md:px-4 h-14 md:h-16 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 md:hidden" />
              <AppLogo className="w-6 h-6 md:w-8 md:h-8" />
              <div className="hidden xs:block">
                <h1 className="text-xs md:text-sm font-headline font-bold uppercase leading-none">SHURUKKHA</h1>
                <span className="text-[6px] md:text-[8px] text-muted-foreground uppercase tracking-widest">v35.0</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              {survivalMode && <Badge variant="destructive" className="h-5 text-[6px] md:text-[8px]">SURVIVAL</Badge>}
              <SovereignStatusWidget />
              <ImperialNotificationCenter />
              <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-primary/20 cursor-pointer" onClick={() => setActiveView('profile')}>
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="bg-primary/10 text-[8px] md:text-[10px]">{user?.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 px-3 md:px-6 py-4 md:py-6 overflow-x-hidden">
            {(userRole === 'admin' || userRole === 'authority') && activeView !== 'profile' && activeView !== 'citizen' && activeView !== 'messages' && (
              <div className="space-y-6 md:space-y-8 mb-6 md:mb-8">
                <ImperialOverview />
                <SovereignStatusReport />
              </div>
            )}

            {activeView === 'citizen' && (
              <div className="max-w-md mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-5">
                <SOSButton />
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                  <AIAdviceTool />
                  <IncidentReport />
                </div>
                <Button onClick={() => setActiveView('messages')} className="w-full h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl gap-3 font-bold text-xs md:text-sm">
                  <MessageSquare size={18} /> কন্ট্রোল রুমের সাথে কথা বলুন
                </Button>
              </div>
            )}

            {activeView === 'messages' && <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] max-w-5xl mx-auto w-full"><CommunicationConsole /></div>}
            {activeView === 'profile' && <div className="max-w-4xl mx-auto"><SovereignIDCard user={user} role={userRole} /></div>}

            {(activeView !== 'citizen' && activeView !== 'profile' && activeView !== 'messages') && (
              <Tabs value={activeSubTab} onValueChange={handleSidebarNavigate} className="w-full">
                <TabsContent value="ops" className="h-[calc(100vh-220px)] md:h-[calc(100vh-250px)]"><DispatcherConsole /></TabsContent>
                <TabsContent value="management"><ImperialManagement /></TabsContent>
                <TabsContent value="security"><LiveShield /></TabsContent>
                <TabsContent value="knowledge" className="space-y-6">
                   <div className="relative max-w-lg mx-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
                      <Input 
                        placeholder="Search Solution Knowledge..." 
                        value={knowledgeSearch}
                        onChange={e => setKnowledgeSearch(e.target.value)}
                        className="pl-10 h-12 bg-background/50 border-primary/20 rounded-xl"
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {solutions.map(sol => (
                        <Card key={sol.id} className="bg-card/40 border-white/5 p-6 space-y-4 hover:border-primary/40 transition-all rounded-[2rem]">
                           <div className="flex justify-between items-start">
                              <Badge variant="outline" className="text-[7px] border-primary/20 text-primary">PROJ_42_{sol.projectIndex}</Badge>
                              <div className="flex gap-1">
                                 {sol.tags.map(t => <Badge key={t} className="text-[6px] bg-accent/10 text-accent border-none">{t}</Badge>)}
                              </div>
                           </div>
                           <h4 className="text-sm font-headline font-bold text-foreground">{sol.problem}</h4>
                           <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3">"{sol.solution}"</p>
                        </Card>
                      ))}
                   </div>
                </TabsContent>
                <TabsContent value="signals"><NotificationHub /></TabsContent>
                <TabsContent value="intelligence"><IncidentReviewBoard /></TabsContent>
                <TabsContent value="relief"><ReliefManagement /></TabsContent>
                <TabsContent value="manifesto"><ImperialManifesto /></TabsContent>
                <TabsContent value="analytics"><SystemHealth /></TabsContent>
                <TabsContent value="audits"><AuditPanel /></TabsContent>
                <TabsContent value="integrations" className="space-y-6">
                  <SovereignNetworkMap />
                  <SovereignDomainManager />
                  <IntegrationPanel />
                </TabsContent>
                <TabsContent value="treasury"><BankDirectory /></TabsContent>
                <TabsContent value="partnerships"><PartnershipReviewBoard /></TabsContent>
              </Tabs>
            )}
          </main>
        </div>
      </div>
      <SovereignLens isOpen={isLensOpen} onClose={() => setIsLensOpen(false)} />
      <SovereignAssistantChat />
    </SidebarProvider>
  )
}
