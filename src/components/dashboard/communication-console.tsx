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
import { collection, query, limit, onSnapshot, where, getDocs, setDoc, doc, serverTimestamp, orderBy, updateDoc, writeBatch } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { DisasterStorage } from '@/lib/disaster-storage'
import { NotificationManager } from '@/lib/notification-manager'

const COMMAND_CENTER_CONTACT = { id: 'command_center', name: "Sovereign Command", role: "admin", status: 'online', avatar: '' }

export function CommunicationConsole() {
  const { user } = useUser()
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([COMMAND_CENTER_CONTACT])
  const [serverMessages, setServerMessages] = useState<Message[]>([])
  const [unreadCountMap, setUnreadCountMap] = useState<Record<string, number>>({})
  const [input, setInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showMobileList, setShowMobileList] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [lastInteractionMap, setLastInteractionMap] = useState<Record<string, number>>({})
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Global Message Listener for Priority Sorting and Badge Updates
  useEffect(() => {
    if (!user) return;

    const qAll = query(
      collection(db, "messages"),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(qAll, (snapshot) => {
      const newInteractionMap = { ...lastInteractionMap };
      const newUnreadMap: Record<string, number> = {};
      let hasChange = false;

      snapshot.docs.forEach(doc => {
        const d = doc.data();
        const isRecipient = d.recipientId === user.uid;
        const isSender = d.senderId === user.uid;

        if (isRecipient || isSender) {
          const otherId = isRecipient ? d.senderId : d.recipientId;
          const ts = d.timestamp?.toMillis?.() || (d.timestamp?.seconds ? d.timestamp.seconds * 1000 : null) || Date.now();
          
          if (!newInteractionMap[otherId] || ts > newInteractionMap[otherId]) {
            newInteractionMap[otherId] = ts;
            hasChange = true;
          }

          if (isRecipient && d.read === false) {
            newUnreadMap[d.senderId] = (newUnreadMap[d.senderId] || 0) + 1;
          }
        }
      });

      if (hasChange) setLastInteractionMap(newInteractionMap);
      setUnreadCountMap(newUnreadMap);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // 2. User Directory sync
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
    });

    return () => unsubscribeUsers();
  }, [user])

  // 3. Selective Chat Listener - Handles 'read' status only
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
      
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const d = change.doc.data();
          // Clear notification count by marking as read if the console is open for this contact
          if (d.recipientId === user.uid && d.read === false) {
            updateDoc(doc(db, "messages", change.doc.id), { read: true });
          }
        }
      });

      setServerMessages(chatMsgs);
      setTimeout(scrollToBottom, 200);
    });

    return () => unsubscribe();
  }, [selectedContact, user]);

  const sortedAndFilteredContacts = useMemo(() => {
    let filtered = contacts;
    if (searchQuery) {
      filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [...filtered].sort((a, b) => (lastInteractionMap[b.id] || 0) - (lastInteractionMap[a.id] || 0));
  }, [contacts, searchQuery, lastInteractionMap]);

  const messages = useMemo(() => {
    if (!selectedContact || !user) return [];
    const currentChatId = CommunicationOrchestrator.getChatId(user.uid, selectedContact.id);
    const localMsgs = DisasterStorage.getLocalMessages().filter(m => m.chatId === currentChatId);
    
    const combined = [...serverMessages];
    localMsgs.forEach(lm => {
      if (!combined.find(sm => sm.content === lm.content)) combined.push(lm);
    });

    return combined.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : a.timestamp);
      const timeB = b.timestamp?.toMillis?.() || (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : b.timestamp);
      return timeA - timeB;
    });
  }, [serverMessages, selectedContact, user]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
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
      setLastInteractionMap(prev => ({ ...prev, [selectedContact.id]: Date.now() }));
    } catch (err) {
       setInput(content); 
    } finally {
      setIsSending(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  const handleSelectContact = async (contact: any) => {
    setSelectedContact(contact);
    setShowMobileList(false);
    if (user && unreadCountMap[contact.id] > 0) {
      const q = query(
        collection(db, "messages"),
        where("recipientId", "==", user.uid),
        where("senderId", "==", contact.id),
        where("read", "==", false)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.update(d.ref, { read: true }));
      await batch.commit();
    }
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
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{selectedContact.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-[11px] md:text-sm font-headline font-bold uppercase tracking-widest">{selectedContact.name}</CardTitle>
                <p className="text-[7px] md:text-[9px] text-muted-foreground font-mono">{selectedContact.status === 'online' ? 'SIGNAL_ACTIVE' : 'SIGNAL_IDLE'}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Signal className="text-primary" size={20} />
              <CardTitle className="text-xs md:text-sm font-headline font-bold uppercase tracking-widest">Sovereign Channels</CardTitle>
            </div>
          )}
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-72 border-r border-white/5 flex-col bg-black/20`}>
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-9 pl-9 text-[11px] bg-background/50 border-white/10 rounded-xl" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sortedAndFilteredContacts.map(res => (
                <div key={res.id} onClick={() => handleSelectContact(res)} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContact?.id === res.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5'}`}>
                  <div className="relative">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={res.avatar || undefined} />
                      <AvatarFallback className="text-[10px] font-bold">{res.name[0]}</AvatarFallback>
                    </Avatar>
                    {res.status === 'online' && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card bg-green-500 animate-pulse" />}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold truncate">{res.name}</p>
                      {unreadCountMap[res.id] > 0 && (
                        <Badge className="bg-primary text-background h-4 min-w-4 px-1 flex items-center justify-center font-bold text-[9px] animate-pulse">{unreadCountMap[res.id]}</Badge>
                      )}
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase">{res.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 flex-col relative`}>
          {selectedContact ? (
            <>
              <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-6">
                <div className="flex flex-col gap-4">
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === user?.uid;
                    const ts = msg.timestamp?.toMillis ? msg.timestamp.toMillis() : msg.timestamp;
                    return (
                      <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                          <div className={`p-3 rounded-2xl text-[13px] md:text-[14px] ${isMe ? 'bg-primary text-background rounded-br-none' : 'bg-muted/80 border border-white/10 rounded-tl-none'}`}>
                            {msg.content}
                          </div>
                          <span className="text-[7px] font-mono text-muted-foreground opacity-60 uppercase">{ts ? new Date(ts).toLocaleTimeString() : 'Syncing...'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
              <div className="p-3 md:p-4 bg-background/80 border-t border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 md:gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 px-3">
                  <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Send message..." disabled={isSending} className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[12px] h-8 md:h-10" />
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
