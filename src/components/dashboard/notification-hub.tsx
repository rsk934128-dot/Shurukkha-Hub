
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Bell, Folder, MessageSquare, Send, Share2, Search, Filter, Trash2, ShieldCheck, Zap, ArrowRight, Loader2, Signal, ExternalLink, Globe, Smartphone, Mail, Box, Forward } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit, addDoc, updateDoc, doc, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function NotificationHub() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedNotif, setSelectedNotif] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "external_notifications"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/external_notifications',
          operation: 'list'
        }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const folders = useMemo(() => {
    const apps = Array.from(new Set(notifications.map(n => n.companyName || n.sourceApp)));
    return apps.sort();
  }, [notifications]);

  const filteredNotifs = useMemo(() => {
    return notifications.filter(n => {
      const matchesFolder = !selectedFolder || (n.companyName === selectedFolder || n.sourceApp === selectedFolder);
      const matchesSearch = n.content?.toLowerCase().includes(search.toLowerCase()) || 
                            n.companyName?.toLowerCase().includes(search.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  }, [notifications, selectedFolder, search]);

  const handleReply = async () => {
    if (!selectedNotif || !replyText.trim()) return;
    setIsReplying(true);
    try {
      const notifRef = doc(db, "external_notifications", selectedNotif.id);
      const replyData = {
        text: replyText,
        timestamp: new Date().toISOString()
      };
      
      await updateDoc(notifRef, {
        status: 'replied',
        replies: arrayUnion(replyData)
      });

      await addDoc(collection(db, "audit_trails"), {
        action: 'SIGNAL_REPLY_SENT',
        details: { company: selectedNotif.companyName, text: replyText },
        signature: IntegrationBridge.generateSignature({ reply: replyText }),
        timestamp: serverTimestamp(),
        performedBy: 'Imperial_Signal_Admin'
      });

      toast({ title: "রিপ্লাই পাঠানো হয়েছে", description: `${selectedNotif.companyName} এর সাথে যোগাযোগ সফল হয়েছে।` });
      setReplyText('');
    } catch (e) {
      toast({ title: "প্রেরণ ব্যর্থ", variant: "destructive" });
    } finally {
      setIsReplying(false);
    }
  };

  const handleForward = async () => {
    if (!selectedNotif) return;
    toast({ title: "সিগন্যাল ফরোয়ার্ড করা হচ্ছে", description: "এটি আপনার রাজকীয় ডিরেক্টরিতে পাঠানো হচ্ছে।" });
    // Simulate forwarding logic
  };

  const mockIngest = async (company: string, content: string) => {
    try {
      await addDoc(collection(db, "external_notifications"), {
        sourceApp: company,
        companyName: company,
        content: content,
        category: 'Service',
        status: 'unread',
        timestamp: new Date().toISOString(),
        externalLink: 'https://core.sheikh/verify'
      });
      toast({ title: "নতুন সিগন্যাল প্রাপ্ত", description: `${company} থেকে একটি নতুন মেসেজ এসেছে।` });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary animate-pulse">Scanning Anycast Signals...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-headline font-bold uppercase tracking-tight text-foreground flex items-center gap-3">
            <Signal className="text-accent animate-pulse" /> Sovereign <span className="text-primary italic">Signal Hub</span>
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cross-App Notification Monitoring & Response</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => mockIngest('Kaspersky', 'Your Antivirus Voucher EX-42 is ready for renewal.')} variant="outline" size="sm" className="h-9 border-primary/20 text-primary text-[8px] uppercase font-bold">
            Mock Antivirus Signal
          </Button>
          <Button onClick={() => mockIngest('bKash', 'Voucher Received: 50% discount on Imperial Services.')} variant="outline" size="sm" className="h-9 border-accent/20 text-accent text-[8px] uppercase font-bold">
            Mock Voucher Signal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Folders */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-card/40 border-white/5 h-full overflow-hidden flex flex-col">
            <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
               <CardTitle className="text-xs uppercase tracking-widest font-headline">Signal Folders</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1">
               <div className="p-2 space-y-1">
                  <div 
                    onClick={() => setSelectedFolder(null)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${!selectedFolder ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}
                  >
                    <Box size={18} className={!selectedFolder ? 'text-primary' : 'text-muted-foreground'} />
                    <span className="text-xs font-bold uppercase">All Signals</span>
                  </div>
                  {folders.map(folder => (
                    <div 
                      key={folder}
                      onClick={() => setSelectedFolder(folder)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedFolder === folder ? 'bg-accent/20 border border-accent/30' : 'hover:bg-white/5'}`}
                    >
                      <Folder size={18} className={selectedFolder === folder ? 'text-accent' : 'text-muted-foreground'} />
                      <span className="text-xs font-bold uppercase truncate">{folder}</span>
                    </div>
                  ))}
               </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Center: List */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search notifications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-white/10 h-11 text-xs rounded-xl"
            />
          </div>
          
          <Card className="bg-card/40 border-white/5 flex-1 overflow-hidden flex flex-col">
             <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                   {filteredNotifs.length === 0 ? (
                     <div className="py-20 text-center opacity-20">
                        <Bell size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">No Signals Captured</p>
                     </div>
                   ) : (
                     filteredNotifs.map(notif => (
                       <div 
                        key={notif.id}
                        onClick={() => setSelectedNotif(notif)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${selectedNotif?.id === notif.id ? 'bg-primary/10 border-primary' : 'bg-muted/20 border-white/5 hover:border-primary/40'}`}
                       >
                          <div className="flex justify-between items-start mb-2">
                             <Badge variant="outline" className="text-[7px] border-primary/20 text-primary uppercase font-bold">{notif.companyName}</Badge>
                             <span className="text-[8px] text-muted-foreground font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-relaxed">"{notif.content}"</p>
                          <div className="flex items-center gap-2 mt-3">
                             {notif.status === 'replied' && <Badge className="bg-accent text-background text-[6px] uppercase">Replied</Badge>}
                             {notif.status === 'unread' && <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </ScrollArea>
          </Card>
        </div>

        {/* Right: Details & Reply */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          {selectedNotif ? (
            <Card className="bg-card/60 backdrop-blur-xl border-primary/20 h-full overflow-hidden flex flex-col shadow-2xl">
              <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                          <Smartphone size={20} className="text-primary" />
                       </div>
                       <div>
                          <CardTitle className="text-sm font-headline uppercase tracking-tight">{selectedNotif.companyName}</CardTitle>
                          <CardDescription className="text-[9px] uppercase font-bold">Signal Source: {selectedNotif.sourceApp}</CardDescription>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={handleForward} variant="outline" size="icon" className="h-8 w-8 border-white/10 hover:bg-primary/10 text-primary">
                          <Forward size={14} />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 size={14} />
                       </Button>
                    </div>
                 </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                   <div className="p-5 bg-black/40 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><Zap size={100} /></div>
                      <p className="text-sm text-foreground leading-relaxed italic relative z-10">"{selectedNotif.content}"</p>
                      <div className="mt-4 flex items-center gap-2 text-[9px] font-mono text-muted-foreground border-t border-white/5 pt-4">
                         <Globe size={12} className="text-primary" />
                         <span>ENCRYPTED_SIGNAL_V3.1 | AUTH: IMPERIAL</span>
                      </div>
                   </div>

                   {selectedNotif.replies?.map((reply: any, i: number) => (
                     <div key={i} className="flex justify-end animate-in slide-in-from-right-2">
                        <div className="max-w-[80%] bg-primary text-background p-3 rounded-2xl rounded-tr-none text-xs font-medium shadow-lg">
                           <p>{reply.text}</p>
                           <span className="text-[7px] opacity-60 mt-1 block uppercase font-mono">{new Date(reply.timestamp).toLocaleTimeString()}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </ScrollArea>

              <div className="p-4 bg-muted/20 border-t border-white/5">
                 <div className="flex gap-3 bg-black/40 p-2 rounded-2xl border border-white/10 shadow-inner">
                    <Input 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                      placeholder="সাম্রাজ্যের উত্তর লিখুন..."
                      className="bg-transparent border-none focus-visible:ring-0 text-xs h-10"
                    />
                    <Button 
                      onClick={handleReply} 
                      disabled={isReplying || !replyText.trim()}
                      className="h-10 px-6 bg-primary text-background font-bold rounded-xl gap-2 hover:scale-[1.02] transition-all"
                    >
                       {isReplying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                       SEND
                    </Button>
                 </div>
                 <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 border-white/10 text-[8px] uppercase h-6 px-3" onClick={() => setReplyText('Verified and Saved to Vault.')}>Verify</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 border-white/10 text-[8px] uppercase h-6 px-3" onClick={() => setReplyText('Forwarding to Administration.')}>Forward</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 border-white/10 text-[8px] uppercase h-6 px-3" onClick={() => setReplyText('Imperial Receipt Logged.')}>Receipt</Badge>
                 </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 border-2 border-dashed border-white/10 rounded-[3rem]">
               <MessageSquare size={80} className="mb-6" />
               <p className="font-headline font-bold text-lg uppercase tracking-[0.2em]">Awaiting Signal Selection</p>
               <p className="text-xs mt-2">ফোল্ডার থেকে যেকোনো একটি সিগন্যাল নির্বাচন করুন।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
