"use client"

import * as React from "react"
import { 
  LayoutDashboard, 
  Radio, 
  FileText, 
  Landmark, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Bell, 
  Menu,
  Star,
  Lock,
  Zap,
  Globe,
  Database,
  LogOut,
  UserCircle
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { AppLogo } from "@/components/ui/app-logo"

interface AppSidebarProps {
  userRole: 'citizen' | 'authority' | 'admin'
  onNavigate: (tab: string) => void
  onLogout?: () => void
  activeTab: string
}

export function AppSidebar({ userRole, onNavigate, onLogout, activeTab }: AppSidebarProps) {
  const { setOpenMobile } = useSidebar()

  const handleNav = (tab: string) => {
    onNavigate(tab)
    setOpenMobile(false)
  }

  return (
    <Sidebar className="border-r border-white/5 bg-card/60 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <AppLogo size={32} />
          <div>
            <h2 className="text-sm font-headline font-bold tracking-tight uppercase">SHURUKKHA HUB</h2>
            <p className="text-[8px] text-primary/60 uppercase font-bold tracking-[0.2em]">Sovereign Grid v31.0</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* User Identity Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase font-bold text-muted-foreground/50 px-4">আপনার পরিচয়</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'profile'} 
                  onClick={() => handleNav('profile')}
                  className="px-4 h-10 gap-3"
                >
                  <UserCircle size={18} className={activeTab === 'profile' ? "text-accent" : "text-muted-foreground"} />
                  <span className="font-medium">প্রোফাইল আইডি</span>
                  <Badge variant="outline" className="ml-auto text-[7px] h-3 border-accent/20 text-accent uppercase font-bold">SOVEREIGN</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Public Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase font-bold text-muted-foreground/50 px-4">পাবলিক সার্ভিস</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'citizen'} 
                  onClick={() => handleNav('citizen')}
                  className="px-4 h-10 gap-3"
                >
                  <LayoutDashboard size={18} className={activeTab === 'citizen' ? "text-primary" : "text-muted-foreground"} />
                  <span className="font-medium">সুরক্ষা ড্যাশবোর্ড</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Command Center for Admin/Authority */}
        {(userRole === 'authority' || userRole === 'admin') && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase font-bold text-primary/40 px-4">কমান্ড ও কন্ট্রোল</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === 'ops'} 
                    onClick={() => handleNav('ops')}
                    className="px-4 h-10 gap-3"
                  >
                    <Radio size={18} className="text-destructive animate-pulse" />
                    <span className="font-medium">জরুরি ডিসপ্যাচ</span>
                    <Badge variant="destructive" className="ml-auto text-[8px] h-4">LIVE</Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === 'analytics'} 
                    onClick={() => handleNav('analytics')}
                    className="px-4 h-10 gap-3"
                  >
                    <Activity size={18} className="text-accent" />
                    <span className="font-medium">সিস্টেম হেলথ</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === 'audits'} 
                    onClick={() => handleNav('audits')}
                    className="px-4 h-10 gap-3"
                  >
                    <ShieldCheck size={18} className="text-primary" />
                    <span className="font-medium">নিরাপত্তা অডিট</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === 'integrations'} 
                    onClick={() => handleNav('integrations')}
                    className="px-4 h-10 gap-3"
                  >
                    <Globe size={18} className="text-accent" />
                    <span className="font-medium">নেটওয়ার্ক ম্যাপ</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={activeTab === 'treasury'} 
                    onClick={() => handleNav('treasury')}
                    className="px-4 h-10 gap-3"
                  >
                    <Landmark size={18} className="text-primary" />
                    <span className="font-medium">গ্লোবাল ট্রেজারি</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Advanced Modules for Admin only */}
        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase font-bold text-accent/40 px-4">অ্যাডভান্সড ভল্ট</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="px-4 h-10 gap-3 text-muted-foreground opacity-60">
                    <Database size={18} />
                    <span className="font-medium">ডেটা ইন্টেলিজেন্স</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton className="px-4 h-10 gap-3 text-muted-foreground opacity-60">
                    <Lock size={18} />
                    <span className="font-medium">ক্রিপ্টো কি-রোটেশন</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/5 space-y-4">
        {onLogout && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={onLogout}
                className="px-4 h-10 gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut size={18} />
                <span className="font-medium">লগআউট করুন</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={12} className="text-primary fill-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Status: Sovereign</span>
          </div>
          <p className="text-[8px] text-muted-foreground italic">আপনার সাম্রাজ্য এখন ১০০% নিরাপদ।</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
