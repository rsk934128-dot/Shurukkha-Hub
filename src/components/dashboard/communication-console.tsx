"use client"

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Paperclip, Mic, Phone, Video, User, Circle, ShieldCheck, MoreVertical, Search, Download, FileText, Loader2, Signal, Landmark } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommunicationOrchestrator, Message } from '@/lib/communication-orchestrator'
import { db } from '@/lib/firebase'
import { useUser } from '@/firebase'
import { collection, query, orderBy, limit, onSnapshot, where, getDocs, or } from 'firebase/firestore'
import { useAudioEngine } from '@/hooks/use-audio-engine'

const COMMAND_CENTER_CONTACT = { id: 'command_center', name: "Sovereign Command", role: "Authority", status: 'online', avatar: '' }

export function CommunicationConsole() {
  const { user } = useUser()
  const [selectedContact, setSelectedContact] = useState<any>(COMMAND_CENTER_CONTACT)
  const [contacts, setContacts] = useState<any[]>([COMMAND_CENTER_CONTACT])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { playMessageSound } = useAudioEngine()

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const q = query(collection(db, "users"), limit(20));
      const snap = await getDocs(q);
      const otherUsers = snap.docs
        .map(doc => ({ 
          id: doc.id, 
          name: doc.data().displayName || "Anonymous User", 
          role: doc.data().role || "Citizen",
          status: 'online',
          avatar: doc.data().photoURL || ''
        }))
        .filter(u => u.id !== user.uid);
      
      setContacts([COMMAND_CENTER_CONTACT, ...otherUsers]);
      setLoading(false);
    }

    fetchUsers();
  }, [user])

  useEffect(() => {
    if (!user || !selectedContact) return;

    // Fixed Query: Fetch messages where user is sender OR recipient
    const q = query(
      collection(db, "messages"),
      or(
        where("senderId", "==", user.uid),
        where("recipientId", "==", user.uid)
      ),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      
      // Local filtering for specific conversation
      const filtered = allMsgs.filter(m => 
        (m.senderId === user.uid && m.recipientId === selectedContact.id) ||
        (m.senderId === selectedContact.id && m.recipientId === user.uid) ||
        (selectedContact.id === 'command_center' && m.recipientId === 'command_center' && m.senderId === user.uid)
      );

      const lastMsg = filtered[filtered.length - 1];
      if (lastMsg && lastMsg.senderId !== user.uid && !messages.find(m => m.id === lastMsg.id)) {
        playMessageSound();
      }

      setMessages(filtered);
      setTimeout(scrollToBottom, 100);
    }, (err) => {
      console.error("[Chat Query] Permission Error:", err);
    });

    return () => unsubscribe();
  }, [selectedContact, user, playMessageSound])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
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
    await comm.uploadFile(file, selectedContact.id);
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
            <p className="text-[9px] text-muted-foreground font-mono uppercase">{selectedContact.role} • SECURE_NODE_V3</p>
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
        <div className="w-20 md:w-64 border-r border-white/5 flex flex-col bg-black/20">
          <div className="p-3 border-b border-white/5 hidden md:block">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              <Input placeholder="Search Users..." className="h-8 pl-8 text-[10px] bg-background/50 border-white/10" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {contacts.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => setSelectedContact(res)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${selectedContact.id === res.id ? 'bg-primary/20 border border-primary/30' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={res.avatar} />
                    <AvatarFallback>{res.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block overflow-hidden">
                    <p className="text-[10px] font-bold truncate">{res.name}</p>
                    <p className="text-[8px] text-muted-foreground uppercase">{res.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col relative">
          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Badge variant="outline" className="text-[8px] border-white/5 text-muted-foreground uppercase py-1 px-4 gap-2">
                  <ShieldCheck size={10} /> End-to-End Encrypted Signal Active
                </Badge>
              </div>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-20">
                  <MessageSquare size={48} className="mb-4" />
                  <p className="text-xs uppercase font-bold tracking-widest">নতুন সিগন্যাল শুরু করুন</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.uid;
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1.5`}>
                        <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${isMe ? 'bg-primary/10 border-primary/30 rounded-tr-none' : 'bg-muted/40 border-white/10 rounded-tl-none'}`}>
                          {msg.type === 'file' ? (
                            <div className="flex items-center gap-3 p-1">
                              <div className="w-8 h-8 bg-black/40 rounded flex items-center justify-center">
                                <FileText size={16} className="text-accent" />
                              </div>
                              <div className="overflow-hidden">
                                <p className="font-bold truncate max-w-[120px]">{msg.content}</p>
                                <a href={msg.fileUrl} className="text-[8px] text-accent flex items-center gap-1 hover:underline">
                                  <Download size={8} /> DOWNLOAD_DEOS_VAULT
                                </a>
                              </div>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[8px] font-mono text-muted-foreground">{new Date(msg.timestamp?.toDate?.() || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMe && <Badge variant="outline" className="text-[6px] h-3 border-accent/30 text-accent uppercase">{msg.status}</Badge>}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-4 bg-muted/20 border-t border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 px-4 shadow-inner">
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
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Paperclip size={18} />
              </Button>
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={`সুরক্ষিত বার্তা পাঠান ${selectedContact.name} কে...`} 
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-xs h-9 placeholder:text-muted-foreground/50"
              />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
                  <Mic size={18} />
                </Button>
                <Button 
                  onClick={handleSend}
                  className="h-8 w-8 rounded-xl bg-primary text-background shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}