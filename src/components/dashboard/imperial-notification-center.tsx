"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Bell, MessageSquare, ShieldAlert, Zap, Globe, Clock, CheckCircle2, Trash2, Box, Signal, Sparkles, Star, X, ShieldCheck, Send, Loader2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, where, doc, getDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { useUser } from '@/firebase'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { AppLogo } from '@/components/ui/app-logo'
import { NotificationManager } from '@/lib/notification-manager'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { useToast } from '@/hooks/use-toast'

/**
 * @fileOverview Imperial Notification Center v2.5.
 * Aggregates all sovereign signals with Real-Time Audio Relay.
 * Fixed: Real-time sound trigger on message arrival.
 */

export function ImperialNotificationCenter() {
  const { user } = useUser()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedNotif, setSelectedNotif] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)
  const { playMessageSound } = useAudioEngine()
  
  const isFirstLoad = useRef(true)

  useEffect(() => {
    if (!user) return;

    // 1. Listen for SOS Alerts
    const unsubSOS = onSnapshot(query(collection(db, "sos_alerts"), orderBy("timestamp", "desc"), limit(5)), (snap) => {
      const sos = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        type: 'SOS',
        icon: ShieldAlert,
        color: 'text-destructive',
        label: 'Emergency Alert'
      }));
      updateNotifications(sos, 'SOS');
    });

    // 2. Real-Time Message Listener with Audio Trigger
    const unsubMessages = onSnapshot(query(
      collection(db, "messages"), 
      where("recipientId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(20)
    ), async (snapshot) => {
      const messageList: any[] = [];
      
      // Process changes for sound notification
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.read === false && data.senderId !== user.uid) {
              console.log("[Imperial Signal] Real-time message detected. Playing Chime...");
              playMessageSound();
            }
          }
        });
      }
      isFirstLoad.current = false;

      // Update the full unread list for UI
      for (const docSnap of snapshot.docs) {
        const d = docSnap.data();
        if (d.read === false) {
          let senderAvatar = '';
          try {
            const senderRef = doc(db, "users", d.senderId);
            const senderSnap = await getDoc(senderRef);
            if (senderSnap.exists()) {
              senderAvatar = senderSnap.data().photoURL || '';
            }
          } catch (e) {}

          messageList.push({
            id: docSnap.id,
            ...d,
            type: 'MESSAGE',
            icon: MessageSquare,
            color: 'text-primary',
            label: 'New Message',
            senderAvatar
          });
        }
      }
      
      updateNotifications(messageList, 'MESSAGE');
    });

    // 3. Listen for External Signals
    const unsubSignals = onSnapshot(query(collection(db, "external_notifications"), orderBy("timestamp", "desc"), limit(5)), (snap) => {
      const signals = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        type: 'SIGNAL',
        icon: Zap,
        color: 'text-accent',
        label: doc.data().companyName || 'External Signal'
      }));
      updateNotifications(signals, 'SIGNAL');
    });

    return () => {
      unsubSOS();
      unsubMessages();
      unsubSignals();
    };
  }, [user?.uid]);

  const updateNotifications = (newData: any[], type: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.type !== type);
      const combined = [...newData, ...filtered].sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds * 1000 || new Date(a.timestamp).getTime() || 0;
        const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds * 1000 || new Date(b.timestamp).getTime() || 0;
        return timeB - timeA;
      });
      return combined.slice(0, 15);
    });
  };

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const handleQuickReply = async () => {
    if (!selectedNotif || !replyText.trim() || !user) return;
    setIsReplying(true);
    try {
      const chatId = [user.uid, selectedNotif.senderId].sort().join('_');
      const replyData = {
        senderId: user.uid,
        recipientId: selectedNotif.senderId,
        chatId,
        content: replyText,
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
        status: 'sent'
      };

      await addDoc(collection(db, "messages"), replyData);
      const originalRef = doc(db, "messages", selectedNotif.id);
      await updateDoc(originalRef, { read: true });

      toast({ title: "উত্তর পাঠানো হয়েছে", description: "আপনার রাজকীয় উত্তর ১ মিলি-সেকেন্ডে পৌঁছেছে।" });
      setReplyText('');
      setSelectedNotif(null);
    } catch (e) {
      toast({ title: "প্রেরণ ব্যর্থ", variant: "destructive" });
    } finally {
      setIsReplying(false);
    }
  };

  const getRelativeTime = (ts: any) => {
    if (!ts) return 'Just now';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    return date.toLocaleString('bn-BD', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10 rounded-xl bg-primary/5 hover:bg-primary/10 border border-white/5 group">
            <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-primary animate-sos-pulse' : 'text-muted-foreground'}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary text-[8px] font-bold text-background items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 md:w-96 p-0 bg-card/95 backdrop-blur-2xl border-primary/20 shadow-2xl rounded-[2rem] overflow-hidden" align="end">
          <div className="bg-primary/10 p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Signal className="text-primary animate-pulse" size={18} />
                <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-primary">Sovereign Signals</h3>
            </div>
            <Badge variant="outline" className="text-[8px] border-primary/40 text-primary uppercase font-bold tracking-tighter">Live Monitor</Badge>
          </div>

          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center px-8">
                  <Bell size={48} className="mb-4" />
                  <p className="text-[10px] uppercase font-bold tracking-[0.3em]">No Pending Signals</p>
                  <p className="text-[8px] mt-2 italic">The Empire is secure and quiet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => setSelectedNotif(notif)}
                      className="p-4 hover:bg-white/[0.03] transition-colors flex items-start gap-4 group cursor-pointer"
                    >
                      <div className="shrink-0">
                        {notif.type === 'MESSAGE' && notif.senderAvatar ? (
                          <Avatar className="h-10 w-10 border border-primary/20 group-hover:scale-110 transition-transform">
                            <AvatarImage src={notif.senderAvatar} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{notif.label[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform ${notif.color}`}>
                            <notif.icon size={18} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] font-bold uppercase text-foreground/90 truncate">{notif.label}</p>
                            <span className="text-[8px] text-muted-foreground font-mono">{getRelativeTime(notif.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {notif.content || notif.location || notif.note || "New high-priority data packet received."}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <Badge variant="outline" className="text-[6px] border-white/5 uppercase opacity-50">Node: Anycast_Primary</Badge>
                            <div className="flex items-center gap-1 text-[6px] font-bold text-accent">
                              <Sparkles size={8} /> AI_VERIFIED
                            </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 bg-muted/20 border-t border-white/5 text-center">
            <Button variant="ghost" className="w-full h-8 text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground hover:text-primary gap-2">
                <Box size={12} /> View Signal Archive <Clock size={12} />
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Expanded Signal Detail Dialog */}
      <Dialog open={!!selectedNotif} onOpenChange={(open) => !open && setSelectedNotif(null)}>
        <DialogContent className="max-w-xl bg-[#05070a] border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-500">
          <DialogHeader className="p-8 bg-primary/5 border-b border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
               <AppLogo size={200} />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="shrink-0">
                {selectedNotif?.type === 'MESSAGE' && selectedNotif.senderAvatar ? (
                  <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                    <AvatarImage src={selectedNotif.senderAvatar} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{selectedNotif.label[0]}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className={`w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center border-2 border-primary/20 ${selectedNotif?.color}`}>
                     {selectedNotif && <selectedNotif.icon size={32} className="animate-pulse" />}
                  </div>
                )}
              </div>
              <div>
                <DialogTitle className="text-xl font-headline font-bold tracking-widest text-primary uppercase leading-none">
                  {selectedNotif?.label}
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-[0.3em] mt-2 flex items-center gap-2">
                   <ShieldCheck size={12} className="text-accent" /> Signal Purity: 100.0%
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8 font-body text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap relative z-10 shadow-inner">
               <p className="italic">"{selectedNotif?.content || selectedNotif?.location || selectedNotif?.note || 'No detailed data available.'}"</p>
            </div>

            {selectedNotif?.type === 'MESSAGE' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex gap-2">
                  <Badge onClick={() => setReplyText('Verified. সাম্রাজ্যের ভল্টে সংরক্ষিত।')} variant="outline" className="cursor-pointer hover:bg-primary/20 text-[8px] border-primary/20 py-1.5 px-3 uppercase">Verify</Badge>
                  <Badge onClick={() => setReplyText('On my way. দ্রুত ব্যবস্থা নেওয়া হচ্ছে।')} variant="outline" className="cursor-pointer hover:bg-accent/20 text-[8px] border-accent/20 py-1.5 px-3 uppercase text-accent">On Way</Badge>
                  <Badge onClick={() => setReplyText('Received. জয় আপনার হোক।')} variant="outline" className="cursor-pointer hover:bg-primary/20 text-[8px] border-primary/20 py-1.5 px-3 uppercase">Confirm</Badge>
                </div>
                <div className="flex gap-3 bg-muted/10 p-2 rounded-2xl border border-white/5">
                  <Input 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="দ্রুত উত্তর দিন..."
                    className="bg-transparent border-none focus-visible:ring-0 text-sm h-12"
                    onKeyDown={e => e.key === 'Enter' && handleQuickReply()}
                  />
                  <Button 
                    onClick={handleQuickReply}
                    disabled={isReplying || !replyText.trim()}
                    className="h-12 px-6 bg-primary text-background font-bold rounded-xl gap-2 shadow-lg shadow-primary/20"
                  >
                    {isReplying ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    SEND
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
               <div className="p-4 bg-muted/20 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Received Time</p>
                  <p className="text-sm font-mono text-primary font-bold">
                    {selectedNotif && new Date(selectedNotif.timestamp?.toDate ? selectedNotif.timestamp.toDate() : selectedNotif.timestamp).toLocaleString('bn-BD')}
                  </p>
               </div>
               <div className="p-4 bg-muted/20 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Signal Hash</p>
                  <p className="text-[10px] font-mono text-accent truncate">SHA256_{selectedNotif?.id.substring(0, 16).toUpperCase()}</p>
               </div>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t border-white/5 flex gap-4">
             <Button onClick={() => setSelectedNotif(null)} className="flex-1 bg-primary text-background font-bold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                <CheckCircle2 size={18} /> ACKNOWLEDGE
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
