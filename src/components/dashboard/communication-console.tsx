
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Send, Paperclip, Phone, Video, User, ShieldCheck, Search, Loader2, Signal, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunicationOrchestrator, Message } from '@/lib/communication-orchestrator'
import { db } from '@/lib/firebase'
import { useUser } from '@/firebase'
import { collection, query, limit, onSnapshot, where, getDocs, setDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { DisasterStorage } from '@/lib/disaster-storage'

const COMMAND_CENTER_CONTACT = { id: 'command_center', name: "Sovereign Command", role: "admin", status: 'online', avatar: '' }

export function CommunicationConsole() {
  const { user } = useUser()
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([COMMAND_CENTER_CONTACT])
  const [serverMessages, setServerMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMobileList, setShowMobileList] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [lastInteractionMap, setLastInteractionMap] = useState<Record<string, number>>({})
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const { playMessageSound } = useAudioEngine()
  const lastMessageId = useRef<string | null>(null)

  // 1. Listen for global messages involving the current user to update sorting order
  useEffect(() => {
    if (!user) return;

    // Listen to the last 100 messages where the user could be involved
    const qGlobal = query(
      collection(db, "messages"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(qGlobal, (snapshot) => {
      const newInteractionMap = { ...lastInteractionMap };
      let hasChange = false;

      snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (d.senderId === user.uid || d.recipientId === user.uid) {
          const otherId = d.senderId === user.uid ? d.recipientId : d.senderId;
          const ts = d.timestamp?.toMillis?.() || (d.timestamp?.seconds ? d.timestamp.seconds * 1000 : null) || Date.now();
          
          if (!newInteractionMap[otherId] || ts > newInteractionMap[otherId]) {
            newInteractionMap[otherId] = ts;
            hasChange = true;
          }
        }
      });

      if (hasChange) {
        setLastInteractionMap(newInteractionMap);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. Fetch User Directory
  useEffect(() => {
    if (!user) return;

    const usersQuery = query(collection(db, "users"), limit(100));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const otherUsers = snapshot.docs
        .map(doc => ({ 
          id: doc.id, 
          name: doc.data().displayName || "Anonymous User", 
          role: doc.data().role || "citizen",
          avatar: doc.data().photoURL || '',
          email: doc.data().email || '',
          status: doc.data().status || 'offline',
          lastActive: doc.data().lastActive
        }))
        .filter(u => u.id !== user.uid);
      
      setContacts([COMMAND_CENTER_CONTACT, ...otherUsers]);
      setLoading(false);
    }, (err) => {
      console.warn("[Comm] Contact sync failed.");
    });

    return () => unsubscribeUsers();
  }, [user])

  // 3. Sort and Filter Contacts
  const sortedAndFilteredContacts = useMemo(() => {
    // First apply search filter
    let filtered = contacts;
    if (searchQuery) {
      filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Then sort by last interaction (highest timestamp first)
    return [...filtered].sort((a, b) => {
      const timeA = lastInteractionMap[a.id] || 0;
      const timeB = lastInteractionMap[b.id] || 0;
      
      // If timestamps are equal, maintain alphabetical or role-based order
      if (timeB === timeA) return 0;
      return timeB - timeA;
    });
  }, [contacts, searchQuery, lastInteractionMap]);

  // Combine server messages with local queued messages for the active chat
  const messages = useMemo(() => {
    if (!selectedContact || !user) return [];
    const currentChatId = CommunicationOrchestrator.getChatId(user.uid, selectedContact.id);
    const localMsgs = DisasterStorage.getLocalMessages().filter(m => m.chatId === currentChatId);
    
    const combined = [...serverMessages];
    localMsgs.forEach(lm => {
      if (!combined.find(sm => sm.content === lm.content && Math.abs((sm.timestamp?.toMillis?.() || sm.timestamp) - lm.timestamp) < 5000)) {
        combined.push(lm);
      }
    });

    return combined.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : null) || Date.now() + 1000;
      const timeB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : null) || Date.now() + 1000;
      return timeA - timeB;
    });
  }, [serverMessages, selectedContact, user]);

  useEffect(() => {
    if (!user || !selectedContact) return;

    const currentChatId = CommunicationOrchestrator.getChatId(user.uid, selectedContact.id);
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", currentChatId),
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

      setServerMessages(chatMsgs);
      setTimeout(scrollToBottom, 200);
    }, (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/messages', operation: 'list' }));
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
    if (!input.trim() || !user || !selectedContact || isSending) return;
    
    setIsSending(true);
    const content = input;
    setInput(''); 
    
    try {
      await CommunicationOrchestrator.getInstance().sendMessage({
        senderId: user.uid,
        recipientId: selectedContact.id,
        content: content,
        type: 'text'
      });
      // Force update sorting on send
      setLastInteractionMap(prev => ({ ...prev, [selectedContact.id]: Date.now() }));
    } catch (err) {
       console.error("[Comm] Send failed", err);
       setInput(content); 
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
       errorEmitter.emit('permission-error', new FirestorePermissionError({ path: sessionRef.path, operation: 'create' }));
    }
  }

  const handleSelectContact = (contact: any) => {
    setSelectedContact(contact);
    setShowMobileList(false);
    setServerMessages([]); 
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
              <div className="relative">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border border-primary/40">
                  <AvatarImage src={selectedContact.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] md:text-xs font-bold">
                    {selectedContact.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${selectedContact.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
              </div>
              <div>
                <CardTitle className="text-[11px] md:text-sm font-headline font-bold uppercase tracking-widest truncate max-w-[100px] md:max-w-none">
                  {selectedContact.name}
                </CardTitle>
                <p className="text-[7px] md:text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">
                  {selectedContact.status === 'online' ? 'SIGNAL_ACTIVE' : 'SIGNAL_IDLE'}
                </p>
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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-[11px] bg-background/50 border-white/10 rounded-xl" 
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sortedAndFilteredContacts.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => handleSelectContact(res)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContact?.id === res.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={res.avatar || undefined} />
                      <AvatarFallback className="text-[10px] font-bold">{res.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${res.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold truncate text-foreground">{res.name}</p>
                      {lastInteractionMap[res.id] && (
                        <span className="text-[7px] text-primary font-mono ml-2">Active</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] text-muted-foreground uppercase tracking-tight">{res.role}</p>
                      {res.status === 'online' && <span className="text-[7px] font-bold text-green-500 uppercase tracking-widest">Online</span>}
                    </div>
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
                <div className="flex flex-col gap-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 animate-pulse">
                      <Signal size={64} className="mb-4" />
                      <p className="text-[10px] md:text-xs uppercase font-bold tracking-[0.3em]">No signal history</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.senderId === user?.uid;
                      const ts = msg.timestamp?.toMillis ? msg.timestamp.toMillis() : (msg.timestamp?.seconds ? msg.timestamp.seconds * 1000 : msg.timestamp);
                      
                      return (
                        <div key={msg.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                          <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1.5`}>
                            <div className={`p-3.5 px-4 rounded-[1.5rem] border text-[13px] md:text-[14px] shadow-sm leading-relaxed ${isMe ? 'bg-primary text-background border-primary/20 rounded-br-none' : 'bg-muted/80 backdrop-blur-md border-white/10 rounded-tl-none'}`}>
                              {msg.content}
                              {msg.status === 'queued' && (
                                <span className="ml-2 inline-block animate-pulse opacity-50"><Loader2 size={10} /></span>
                              )}
                            </div>
                            <span className="text-[8px] font-mono text-muted-foreground opacity-60 px-1 uppercase tracking-tighter">
                              {ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Syncing...'}
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
                  <Input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Send message..." 
                    disabled={isSending}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[12px] md:text-[13px] h-8 md:h-10"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || isSending || !selectedContact} className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary text-background shadow-lg transition-transform active:scale-95">
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
