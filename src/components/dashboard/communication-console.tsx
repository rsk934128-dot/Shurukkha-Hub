
"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Send, Paperclip, Mic, Phone, Video, User, Circle, ShieldCheck, MoreVertical, Search, Download, FileText, Loader2, Signal, Landmark, UserPlus, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunicationOrchestrator, Message } from '@/lib/communication-orchestrator'
import { db } from '@/lib/firebase'
import { useUser } from '@/firebase'
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'

const COMMAND_CENTER_CONTACT = { id: 'command_center', name: "Sovereign Command", role: "Authority", status: 'online', avatar: '' }

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

  // Fetch users for the contact list
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), limit(100));
        const snap = await getDocs(q);
        const otherUsers = snap.docs
          .map(doc => ({ 
            id: doc.id, 
            name: doc.data().displayName || "Anonymous User", 
            role: doc.data().role || "Citizen",
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

  // Filtered contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  // Real-time message listener
  useEffect(() => {
    if (!user || !selectedContact) return;

    const orchestrator = CommunicationOrchestrator.getInstance();
    const currentChatId = orchestrator.getChatId(user.uid, selectedContact.id);

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", currentChatId),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      const lastMsg = chatMsgs[chatMsgs.length - 1];
      
      // Audio alert for new inbound messages
      if (lastMsg && lastMsg.id !== lastMessageId.current && lastMsg.senderId !== user.uid) {
        playMessageSound();
        lastMessageId.current = lastMsg.id || null;
      } else if (lastMsg) {
        lastMessageId.current = lastMsg.id || null;
      }

      setMessages(chatMsgs);
      setTimeout(scrollToBottom, 100);
    }, (err) => {
      console.error("[Chat Query] Signal Interruption:", err);
    });

    return () => unsubscribe();
  }, [selectedContact, user, playMessageSound])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const comm = CommunicationOrchestrator.getInstance();
    await comm.sendMessage({
      senderId: user.uid,
      recipientId: selectedContact.id,
      content: input,
      type: 'text'
    });
    setInput('');
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
              <AvatarFallback>{selectedContact.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${selectedContact.status === 'online' ? 'bg-accent animate-pulse' : 'bg-muted'}`} />
          </div>
          <div>
            <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">{selectedContact.name}</CardTitle>
            <p className="text-[9px] text-muted-foreground font-mono uppercase">{selectedContact.role} • SOVEREIGN_CHANNEL_v3.1</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8 border-white/10 text-primary hover:bg-primary/10">
            <Phone size={14} />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 border-white/10 text-accent hover:bg-accent/10">
            <Video size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreVertical size={14} />
          </Button>
        </div>
      </CardHeader>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Contacts & Search */}
        <div className="w-20 md:w-72 border-r border-white/5 flex flex-col bg-black/20">
          <div className="p-4 border-b border-white/5 space-y-3 hidden md:block">
            <div className="flex items-center justify-between">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Signals</h4>
               <Button variant="ghost" size="sm" onClick={startNewSignal} className="h-6 px-2 text-[9px] font-bold text-primary hover:bg-primary/10 gap-1">
                 <Plus size={12} /> NEW
               </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input 
                ref={searchInputRef}
                placeholder="Search Citizens..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-[11px] bg-background/50 border-white/10 rounded-xl focus:ring-primary/40" 
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredContacts.length === 0 ? (
                <div className="py-8 text-center px-4 hidden md:block">
                  <p className="text-[10px] text-muted-foreground italic">No citizen found with that identity.</p>
                </div>
              ) : (
                filteredContacts.map(res => (
                  <div 
                    key={res.id} 
                    onClick={() => { setSelectedContact(res); setSearchQuery(''); }}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${selectedContact.id === res.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                  >
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={res.avatar} />
                      <AvatarFallback>{res.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold truncate text-foreground">{res.name}</p>
                        {res.id === 'command_center' && <Badge variant="outline" className="text-[6px] h-3 border-primary/40 text-primary">CORE</Badge>}
                      </div>
                      <p className="text-[8px] text-muted-foreground uppercase tracking-tight">{res.role}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar: Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <ScrollArea ref={scrollRef} className="flex-1 p-6 bg-[url('https://www.transparenttextures.com/patterns/grid.png')] bg-fixed opacity-[0.98]">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="text-[8px] border-white/5 text-muted-foreground uppercase py-1 px-4 gap-2 bg-black/20 backdrop-blur-sm">
                  <ShieldCheck size={10} className="text-accent" /> RSA_V2 Secure Bridge Active
                </Badge>
              </div>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/30 animate-pulse">
                  <Signal size={64} className="mb-4" />
                  <p className="text-xs uppercase font-bold tracking-[0.3em]">নতুন সিগন্যাল শুরু করুন</p>
                  <p className="text-[10px] mt-2 italic">Awaiting first frequency match...</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1.5`}>
                        <div className={`p-3.5 rounded-2xl border text-[13px] leading-relaxed shadow-xl ${isMe ? 'bg-primary text-background border-primary/20 rounded-tr-none font-medium' : 'bg-muted/80 backdrop-blur-md border-white/10 rounded-tl-none text-foreground'}`}>
                          {msg.type === 'file' ? (
                            <div className="flex items-center gap-3 p-1">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isMe ? 'bg-black/20' : 'bg-black/40'}`}>
                                <FileText size={18} className={isMe ? "text-background" : "text-accent"} />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-bold truncate max-w-[140px] text-[11px]">{msg.content}</p>
                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`text-[9px] flex items-center gap-1 hover:underline font-bold ${isMe ? 'text-background/80' : 'text-accent'}`}>
                                  <Download size={10} /> DOWNLOAD_DEOS_VAULT
                                </a>
                              </div>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[9px] font-mono text-muted-foreground">
                            {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <Badge variant="outline" className="text-[7px] h-3.5 border-accent/40 text-accent uppercase font-mono px-1.5">{msg.status}</Badge>}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-background/80 border-t border-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 px-4 shadow-2xl transition-all focus-within:border-primary/40">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-muted-foreground hover:text-primary transition-colors"
              >
                <Paperclip size={20} />
              </Button>
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={`সুরক্ষিত বার্তা পাঠান ${selectedContact.name} কে...`} 
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-[13px] h-10 placeholder:text-muted-foreground/40"
              />
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-accent transition-colors">
                  <Mic size={20} />
                </Button>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-9 w-9 rounded-xl bg-primary text-background shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
