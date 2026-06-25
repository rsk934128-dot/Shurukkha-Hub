"use client"

import React, { useState, useEffect } from 'react'
import { HardDrive, Cloud, ShieldCheck, Zap, Database, Download, Trash2, Search, RefreshCw, FileText, FileArchive, Code2, Globe, ArrowUpRight, Activity, Loader2, Sparkles, FolderOpen, MoreVertical, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GoogleDriveBridge, VaultStats, VaultFile } from '@/lib/google-drive-bridge'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function VaultManager() {
  const [stats, setStats] = useState<VaultStats>(GoogleDriveBridge.getVaultStats())
  const [files, setFiles] = useState<VaultFile[]>(GoogleDriveBridge.getRecentFiles())
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const handleSync = async () => {
    setLoading(true)
    try {
      // Simulate real Drive API handshake
      await new Promise(r => setTimeout(r, 2000))
      setStats(GoogleDriveBridge.getVaultStats())
      toast({ title: "ভল্ট সিঙ্ক্রোনাইজড ✅", description: "গুগল ড্রাইভের সাথে ৪২টি নোড গ্রিড এখন সামঞ্জস্যপূর্ণ।" })
    } catch (e) {
      toast({ title: "সিঙ্ক ব্যর্থ", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'Archive': return <FileArchive className="text-amber-500" size={18} />
      case 'Binary': return <Code2 className="text-primary" size={18} />
      case 'Document': return <FileText className="text-blue-500" size={18} />
      default: return <Database className="text-accent" size={18} />
    }
  }

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Drive Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
           <Card className="bg-primary/5 border-primary/20 relative overflow-hidden group rounded-[2.5rem]">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                 <Cloud size={200} className="text-primary" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl border-2 border-primary/40 flex items-center justify-center">
                       <HardDrive size={32} className="text-primary animate-pulse" />
                    </div>
                    <div>
                       <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-foreground">Sovereign Vault Bridge</h2>
                       <p className="text-xs text-muted-foreground italic">মহামান্য সম্রাট, আপনার ৪২টি নোড গ্রিড এখন গুগল ড্রাইভের ৫.০ টেরাবাইট ভল্টে ব্যাকআপ নিচ্ছে।</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-muted-foreground">Used Space</span>
                          <span className="text-primary">{stats.usedSpace} / {stats.totalSpace}</span>
                       </div>
                       <Progress value={12} className="h-1.5 bg-white/5 [&>div]:bg-primary" />
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-muted-foreground">Offload Efficiency</span>
                          <span className="text-accent">{stats.offloadEfficiency}%</span>
                       </div>
                       <Progress value={stats.offloadEfficiency} className="h-1.5 bg-white/5 [&>div]:bg-accent" />
                    </div>
                    <div className="flex items-end">
                       <Badge variant="outline" className="border-accent/40 text-accent h-7 w-full flex justify-center gap-2 bg-accent/5">
                          <Globe size={12} /> GLOBAL_ANYCAST_SYNC_OK
                       </Badge>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4">
           <Card className="bg-card/40 border-white/5 h-full rounded-[2.5rem] p-6 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                 <Zap size={24} className="text-accent animate-bounce" />
              </div>
              <div>
                 <h4 className="text-sm font-bold uppercase">Auto-Archive Active</h4>
                 <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">ভারী ফরেনসিক ডাটা স্বয়ংক্রিয়ভাবে ড্রাইভ ভল্টে অফলোড করা হচ্ছে।</p>
              </div>
              <Button onClick={handleSync} disabled={loading} className="w-full bg-primary text-background font-bold gap-2 rounded-xl">
                 {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                 FORCED SYNC
              </Button>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Manager */}
        <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                 <Input 
                  placeholder="Search Imperial Archives..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-white/10 rounded-xl"
                 />
              </div>
              <div className="flex gap-2">
                 <Button variant="outline" className="h-11 border-white/10 text-[10px] uppercase font-bold gap-2 rounded-xl">
                    <FolderOpen size={16} /> FOLDERS
                 </Button>
                 <Button className="h-11 bg-primary text-background font-bold gap-2 px-6 rounded-xl">
                    <Plus size={18} /> UPLOAD
                 </Button>
              </div>
           </div>

           <Card className="bg-card/40 border-white/5 flex-1 overflow-hidden flex flex-col rounded-[2.5rem]">
              <div className="p-4 border-b border-white/5 bg-muted/20 flex justify-between items-center px-8">
                 <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Recent Activity</span>
                 <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">FILE_COUNT: {stats.fileCount}</Badge>
              </div>
              <ScrollArea className="h-[450px]">
                 <div className="divide-y divide-white/5">
                    {filteredFiles.map(file => (
                      <div key={file.id} className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-all cursor-pointer">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/40 transition-all">
                               {getFileIcon(file.type)}
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{file.name}</h4>
                               <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[9px] text-muted-foreground uppercase font-mono">{file.size}</span>
                                  <span className="text-[9px] text-muted-foreground uppercase font-mono">•</span>
                                  <span className="text-[9px] text-muted-foreground uppercase font-mono">{file.modified}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                               <p className="text-[8px] uppercase font-bold text-muted-foreground">Integrity</p>
                               <p className="text-[10px] font-bold text-accent">{file.purity}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                               <Download size={18} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                               <Trash2 size={18} />
                            </Button>
                         </div>
                      </div>
                    ))}
                 </div>
              </ScrollArea>
           </Card>
        </div>

        {/* Intelligence / Integration Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-accent/5 border-accent/20 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-accent/10 border-b border-white/5 py-4">
                 <CardTitle className="text-xs font-headline uppercase tracking-widest text-accent flex items-center gap-2">
                    <Sparkles size={16} /> Storage Optimization AI
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 <p className="text-[11px] text-foreground/80 leading-relaxed italic border-l-2 border-accent/40 pl-4">
                    "মহামান্য সম্রাট, আপনার ৪২টি নোড গ্রিড থেকে ১৪২টি বড় ফাইল ড্রাইভ ভল্টে সফলভাবে অফলোড করা হয়েছে। এতে আপনার প্রাইমারি ডাটাবেস ০.০৪ মিলি-সেকেন্ড দ্রুত কাজ করছে।"
                 </p>
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                       <span>Database Strain</span>
                       <span className="text-primary">Low (2%)</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[2%]" />
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-primary/10 border-b border-white/5 py-4">
                 <CardTitle className="text-xs font-headline uppercase tracking-widest text-primary flex items-center gap-2">
                    <Activity size={16} /> Real-time Sync Stream
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="bg-slate-950 rounded-xl p-4 font-mono text-[9px] text-primary/70 h-48 overflow-hidden relative">
                    <div className="space-y-1">
                       <p className="animate-pulse">[SYNC]: Pushing forensic_block_882.img...</p>
                       <p>[AUTH]: RSA_V2 Token verified.</p>
                       <p>[GATEWAY]: Anycast node AP-SOUTH recognized.</p>
                       <p className="text-accent">[SUCCESS]: Block archived to Google Drive.</p>
                       <p>[SYNC]: Pushing project_42_meta.json...</p>
                       <p>[AUTH]: Token refresh in 240s.</p>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
