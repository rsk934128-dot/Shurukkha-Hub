
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Send, Paperclip, Mic, Phone, Video, User, Circle, ShieldCheck, MoreVertical, Search, Download, FileText, Loader2, Signal, Landmark, UserPlus, Plus, Shield, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunicationOrchestrator, Message } from '@/lib/communication-orchestrator'
import { db } from '@/lib/firebase'
import { useUser } from '@/firebase'
import { collection, query, orderBy, limit, onSnapshot, where, getDocs, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

const COMMAND_CENTER_CONTACT = { id: 'command_center', name: "Sovereign Command", role: "admin", status: 'online', avatar: '' }

export function CommunicationConsole() {
  const { user } = useUser()
  const [selectedContact, setSelectedContact] = useState<any>(COMMAND_CENTER_CONTACT)
  const [contacts, setContacts] = useState<any[]>([COMMAND_CENTER_CONTACT])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { playMessageSound } = useAudioEngine()
  const lastMessageId = useRef<string | null>(null)

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), limit(200));
        const snap = await getDocs(q);
        const otherUsers = snap.docs
          .map(doc => ({ 
            id: doc.id, 
            name: doc.data().displayName || "Anonymous User", 
            role: doc.data().role || "citizen",
            status: 'online',
            avatar: doc.data().photoURL || '',
            email: doc.data().email || ''
          }))
          .filter(u => u.id !== user.uid);
        
        setContacts([COMMAND_CENTER_CONTACT, ...otherUsers]);
      } catch (e) {
        console.warn("[Comm] Failed to fetch contact list.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [user])

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  useEffect(() => {
    if (!user || !selectedContact) return;

    const currentChatId = CommunicationOrchestrator.getChatId(user.uid, selectedContact.id);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", currentChatId),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      
      if (lastMsg && lastMsg.id !== lastMessageId.current) {
        if (lastMsg.senderId !== user.uid) {
          playMessageSound();
        }
        lastMessageId.current = lastMsg.id || null;
      }

      setMessages(chatMsgs);
      setTimeout(scrollToBottom, 300);
    }, async (err) => {
      if (err.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: '/messages',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    });

    return () => unsubscribe();
  }, [selectedContact, user, playMessageSound])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const comm = CommunicationOrchestrator.getInstance();
    const content = input;
    setInput(''); // Clear immediately for UX
    
    await comm.sendMessage({
      senderId: user.uid,
      recipientId: selectedContact.id,
      content: content,
      type: 'text'
    });
  }

  const handleCall = async (type: 'audio' | 'video') => {
    if (!user || !selectedContact) return;
    const chatId = CommunicationOrchestrator.getChatId(user.uid, selectedContact.id);
    
    // Create a WebRTC session doc to notify the recipient
    const sessionRef = doc(db, 'webrtc_sessions', chatId);
    await setDoc(sessionRef, {
      callerId: user.uid,
      callerName: user.displayName || 'Sovereign Node',
      callerAvatar: user.photoURL || '',
      recipientId: selectedContact.id,
      status: 'ringing',
      type: type,
      timestamp: serverTimestamp()
    });
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const comm = CommunicationOrchestrator.getInstance();
    await comm.uploadFile(file, selectedContact.id, user.uid);
  }

  const startNewSignal = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  }

  return (
    <Card className="bg-card/40 border-primary/20 flex flex-col h-full overflow-hidden neon-glow-primary">
      <CardHeader className="bg-primary/5 border-b border-white/5 py-4 px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-primary/40">
              <AvatarImage src={selectedContact.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {selectedContact.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${selectedContact.status === 'online' ? 'bg-accent animate-pulse' : 'bg-muted'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">{selectedContact.name}</CardTitle>
              {selectedContact.role === 'admin' && <Badge variant="outline" className="text-[7px] border-accent/40 text-accent uppercase font-bold bg-accent/5">Imperial Admin</Badge>}
            </div>
            <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">CHANNEL_v3.1_ENCRYPTED</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleCall('audio')} variant="outline" size="icon" className="h-8 w-8 border-white/10 text-primary hover:bg-primary/10">
            <Phone size={14} />
          </Button>
          <Button onClick={() => handleCall('video')} variant="outline" size="icon" className="h-8 w-8 border-white/10 text-accent hover:bg-accent/10">
            <Video size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical size={14} />
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-20 md:w-72 border-r border-white/5 flex flex-col bg-black/20">
          <div className="p-4 border-b border-white/5 space-y-3 hidden md:block">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sovereign Signals</h4>
               <Button variant="ghost" size="sm" onClick={startNewSignal} className="h-6 px-2 text-[9px] font-bold text-primary hover:bg-primary/10 gap-1">
                 <Plus size={12} /> NEW
               </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                ref={searchInputRef}
                placeholder="Search Identity..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-[11px] bg-background/50 border-white/10 rounded-xl focus:ring-primary/40" 
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredContacts.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => { setSelectedContact(res); setSearchQuery(''); }}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContact.id === res.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={res.avatar} />
                      <AvatarFallback className="text-[10px] font-bold">{res.name[0]}</AvatarFallback>
                    </Avatar>
                    {res.role === 'admin' && <div className="absolute -top-1 -right-1 bg-accent p-0.5 rounded-full"><Shield size={8} className="text-background fill-accent" /></div>}
                  </div>
                  <div className="hidden md:block overflow-hidden flex-1">
                    <p className="text-[11px] font-bold truncate text-foreground">{res.name}</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-tight">{res.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col relative">
          <ScrollArea ref={scrollRef} className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] bg-fixed">
            <div className="space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 animate-pulse">
                  <Signal size={64} className="mb-4" />
                  <p className="text-xs uppercase font-bold tracking-[0.3em]">নতুন সিগন্যাল শুরু করুন</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                        <div className={`p-3 rounded-2xl border text-[13px] shadow-lg ${isMe ? 'bg-primary text-background border-primary/20 rounded-tr-none' : 'bg-muted/80 backdrop-blur-md border-white/10 rounded-tl-none'}`}>
                          {msg.type === 'file' ? (
                            <div className="flex items-center gap-3">
                              <FileText size={18} className={isMe ? "text-background" : "text-accent"} />
                              <a href={msg.fileUrl} target="_blank" className="hover:underline font-bold text-[10px] uppercase">Download Vault</a>
                            </div>
                          ) : msg.content}
                        </div>
                        <span className="text-[8px] font-mono text-muted-foreground opacity-50 px-1">
                          {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-background/80 border-t border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 px-4 shadow-2xl">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary">
                <Paperclip size={20} />
              </Button>
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="সুরক্ষিত বার্তা পাঠান..." 
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[13px]"
              />
              <Button onClick={handleSend} disabled={!input.trim()} className="h-9 w-9 rounded-xl bg-primary text-background shadow-lg shadow-primary/30">
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
