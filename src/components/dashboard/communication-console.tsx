
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Send, Paperclip, Mic, Phone, Video, User, Circle, ShieldCheck, MoreVertical, Search, Download, FileText, Loader2, Signal, Landmark, UserPlus, Plus, Shield, CheckCircle2, ArrowLeft } from 'lucide-react'
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
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([COMMAND_CENTER_CONTACT])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMobileList, setShowMobileList] = useState(true)
  const [isSending, setIsSending] = useState(false)
  
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

    // Filter by chatId - index not required for simple where if small collection
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", currentChatId),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Robust client-side sorting that handles serverTimestamp() null state (pending)
      const chatMsgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Message))
        .sort((a, b) => {
          const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds * 1000 || Date.now();
          const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds * 1000 || Date.now();
          return timeA - timeB;
        });
      
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      
      if (lastMsg && lastMsg.id !== lastMessageId.current) {
        if (lastMsg.senderId !== user.uid) {
          playMessageSound();
        }
        lastMessageId.current = lastMsg.id || null;
      }

      setMessages(chatMsgs);
      setTimeout(scrollToBottom, 300);
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/messages',
          operation: 'list'
        }));
      }
    });

    return () => unsubscribe();
  }, [selectedContact, user, playMessageSound]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !user || isSending) return;
    
    setIsSending(true);
    const content = input;
    const comm = CommunicationOrchestrator.getInstance();
    
    try {
      await comm.sendMessage({
        senderId: user.uid,
        recipientId: selectedContact.id,
        content: content,
        type: 'text'
      });
      setInput(''); 
    } catch (err) {
       console.error("[Comm] Send failed", err);
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  const handleCall = async (type: 'audio' | 'video') => {
    if (!user || !selectedContact) return;
    const callSessionId = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sessionRef = doc(db, 'webrtc_sessions', callSessionId);
    
    try {
      await setDoc(sessionRef, {
        callerId: user.uid,
        callerName: user.displayName || 'Sovereign Node',
        callerAvatar: user.photoURL || '',
        recipientId: selectedContact.id,
        recipientName: selectedContact.name,
        recipientAvatar: selectedContact.avatar || '',
        status: 'ringing',
        type: type,
        timestamp: serverTimestamp()
      });
    } catch (err: any) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
         path: `/webrtc_sessions/${callSessionId}`,
         operation: 'create'
       }));
    }
  }

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    setShowMobileList(false);
  }

  return (
    <Card className="bg-card/40 border-primary/20 flex flex-col h-full overflow-hidden neon-glow-primary">
      <CardHeader className="bg-primary/5 border-b border-white/5 py-3 md:py-4 px-4 md:px-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {!showMobileList && (
            <Button variant="ghost" size="icon" onClick={() => setShowMobileList(true)} className="md:hidden h-8 w-8">
              <ArrowLeft size={20} />
            </Button>
          )}
          {selectedContact && !showMobileList ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-primary/40">
                <AvatarImage src={selectedContact.avatar || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] md:text-xs font-bold">
                  {selectedContact.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <CardTitle className="text-[11px] md:text-sm font-headline font-bold uppercase tracking-widest truncate max-w-[100px] md:max-w-none">
                    {selectedContact.name}
                  </CardTitle>
                </div>
                <p className="text-[7px] md:text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">SECURE_CHANNEL</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Signal className="text-primary" size={20} />
              <CardTitle className="text-xs md:text-sm font-headline font-bold uppercase tracking-widest">Sovereign Channels</CardTitle>
            </div>
          )}
        </div>
        
        {selectedContact && !showMobileList && (
          <div className="flex items-center gap-1 md:gap-2">
            <Button onClick={() => handleCall('audio')} variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 border-white/10 text-primary hover:bg-primary/10">
              <Phone size={14} />
            </Button>
            <Button onClick={() => handleCall('video')} variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 border-white/10 text-accent hover:bg-accent/10">
              <Video size={14} />
            </Button>
          </div>
        )}
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-72 border-r border-white/5 flex-col bg-black/20`}>
          <div className="p-4 border-b border-white/5 space-y-3">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Identities</h4>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                ref={searchInputRef}
                placeholder="Search..." 
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
                  onClick={() => handleSelectContact(res)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContact?.id === res.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <Avatar className="h-9 w-9 border border-white/10">
                    <AvatarImage src={res.avatar || undefined} />
                    <AvatarFallback className="text-[10px] font-bold">{res.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden flex-1">
                    <p className="text-[11px] font-bold truncate text-foreground">{res.name}</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-tight">{res.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 flex-col relative bg-[url('https://www.transparenttextures.com/patterns/grid.png')] bg-fixed`}>
          {selectedContact ? (
            <>
              <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-6">
                <div className="space-y-6">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 animate-pulse">
                      <Signal size={64} className="mb-4" />
                      <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.3em]">No signal history</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.senderId === user?.uid;
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                          <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                            <div className={`p-3 rounded-2xl border text-[12px] md:text-[13px] shadow-lg ${isMe ? 'bg-primary text-background border-primary/20 rounded-tr-none' : 'bg-muted/80 backdrop-blur-md border-white/10 rounded-tl-none'}`}>
                              {msg.type === 'file' ? (
                                <div className="flex items-center gap-3">
                                  <FileText size={18} className={isMe ? "text-background" : "text-accent"} />
                                  <a href={msg.fileUrl} target="_blank" className="hover:underline font-bold text-[9px] md:text-[10px] uppercase">Download File</a>
                                </div>
                              ) : msg.content}
                            </div>
                            <span className="text-[7px] md:text-[8px] font-mono text-muted-foreground opacity-50 px-1">
                              {msg.timestamp?.toMillis ? new Date(msg.timestamp.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending...'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>

              <div className="p-3 md:p-4 bg-background/80 border-t border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 md:gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 px-3 md:px-4 shadow-2xl">
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && user) CommunicationOrchestrator.getInstance().uploadFile(file, selectedContact.id, user.uid);
                  }} className="hidden" />
                  <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Paperclip size={18} />
                  </Button>
                  <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Send message..." 
                    disabled={isSending}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[12px] md:text-[13px] h-8 md:h-10"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || isSending} className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary text-background shadow-lg">
                    {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-20 hidden md:flex">
              <MessageSquare size={64} className="mb-4" />
              <p className="font-headline font-bold uppercase tracking-[0.2em] text-xs">Select a contact</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
