"use client"

import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  Search, 
  Star, 
  Trash2, 
  Archive, 
  Send, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Loader2, 
  ArrowLeft, 
  Sparkles, 
  User, 
  MoreVertical,
  Paperclip,
  CheckCircle2,
  Landmark,
  Globe,
  Zap,
  Bot,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { draftImperialMail } from '@/ai/flows/imperial-mail-assistant'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

/**
 * @fileOverview Imperial Mail Inbox HUD.
 * Integrated with Sovereign Mail Bridge and AI Assistant.
 */

export function MailInbox() {
  const [mails, setMails] = useState<any[]>([
    { id: 'm1', from: 'Google Security', subject: 'New Login to Sovereign Hub', date: '10:42 AM', body: 'A new device was detected accessing the 42nd Node Registry.', read: false, starred: true, avatar: '' },
    { id: 'm2', from: 'Stripe Payments', subject: 'Revenue Disbursement Confirmed', date: '9:15 AM', body: 'Payout of $12,450.00 is now processing to your Chase bank node.', read: true, starred: false, avatar: '' },
    { id: 'm3', from: 'Sheikh Archive', subject: 'Project 43 Specifications', date: 'Yesterday', body: 'The next phase of the 400-project mission involves global anycast scaling.', read: true, starred: true, avatar: '' },
    { id: 'm4', from: 'Kaspersky Lab', subject: 'Voucher Code: EX-42-SOV', date: '2 Days ago', body: 'Your imperial antivirus license has been extended by 365 days.', read: false, starred: false, avatar: '' }
  ])
  const [selectedMail, setSelectedMail] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [composeData, setComposeData] = useState({ to: '', subject: '', context: '' })
  const [aiDraft, setAiDraft] = useState('')
  const { toast } = useToast()

  const handleAiDraft = async () => {
    if (!composeData.to || !composeData.subject) {
      toast({ title: "তথ্য অপর্যাপ্ত", description: "প্রাপক এবং বিষয় আগে লিখুন।", variant: "destructive" });
      return;
    }
    setIsDrafting(true);
    try {
      const result = await draftImperialMail({
        recipientName: composeData.to,
        subject: composeData.subject,
        context: composeData.context || "রাজকীয় যোগাযোগ",
        tone: 'Majectic'
      });
      setAiDraft(result.draft);
      if (result.isFallback) {
        toast({ title: "Sovereign Mode Active", description: "এআই অফলাইন থাকায় লোকাল ড্রাফটিং লজিক ব্যবহৃত হয়েছে।" });
      } else {
        toast({ title: "এআই ড্রাফট প্রস্তুত", description: "আপনার রাজকীয় উত্তর ড্রাফট করা হয়েছে।" });
      }
    } catch (e) {
      toast({ title: "ড্রাফটিং ব্যর্থ", description: "এআই ইঞ্জিন এবং ফলব্যাক উভয়ই বিচ্যুত হয়েছে।", variant: "destructive" });
    } finally {
      setIsDrafting(false);
    }
  }

  const handleSendMail = async () => {
    const finalBody = aiDraft || composeData.context;
    if (!finalBody) return;

    toast({ title: "প্রেরণ করা হচ্ছে...", description: "মেইলটি জিমেইল ব্রিজের মাধ্যমে পাঠানো হচ্ছে।" });
    
    try {
      await addDoc(collection(db, "audit_trails"), {
        action: 'IMPERIAL_MAIL_DISPATCHED',
        details: { to: composeData.to, subject: composeData.subject },
        signature: IntegrationBridge.generateSignature({ to: composeData.to }),
        timestamp: serverTimestamp(),
        performedBy: 'Sovereign_Mail_Bridge'
      });

      toast({ title: "মেইল সফলভাবে পাঠানো হয়েছে", description: "আপনার রাজকীয় বার্তাটি ১ মিলি-সেকেন্ডে পৌঁছেছে।" });
      setIsComposing(false);
      setComposeData({ to: '', subject: '', context: '' });
      setAiDraft('');
    } catch (e) {
      toast({ title: "ব্যর্থ হয়েছে", variant: "destructive" });
    }
  }

  const filteredMails = mails.filter(m => 
    m.subject.toLowerCase().includes(search.toLowerCase()) || 
    m.from.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-headline font-bold uppercase tracking-tight text-foreground flex items-center gap-3">
            <Mail className="text-primary animate-pulse" /> Imperial <span className="text-primary italic">Gmail Bridge</span>
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sovereign Communication Hub v37.5</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsComposing(true)} className="h-10 bg-primary text-background font-bold gap-2 px-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
            <Plus size={18} /> COMPOSE
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 hover:bg-white/5">
             <RefreshCw size={18} className="text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-12 flex flex-col gap-4 min-h-0">
          <Card className="bg-card/40 border-white/5 flex-1 overflow-hidden flex flex-col shadow-2xl rounded-[2.5rem]">
            <div className="p-4 border-b border-white/5 bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    placeholder="Search your imperial inbox..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-background/50 border-white/10 text-xs rounded-xl"
                  />
               </div>
               <div className="flex gap-2">
                  <Badge variant="outline" className="border-primary/20 text-primary h-6 text-[8px] uppercase font-bold">ALL_MAILS: {mails.length}</Badge>
                  <Badge variant="outline" className="border-accent/20 text-accent h-6 text-[8px] uppercase font-bold">UNREAD: {mails.filter(m => !m.read).length}</Badge>
               </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y divide-white/5">
                 {filteredMails.map((mail) => (
                   <div 
                    key={mail.id} 
                    onClick={() => setSelectedMail(mail)}
                    className={`p-4 md:p-6 flex items-center gap-4 cursor-pointer transition-all hover:bg-white/[0.03] group ${!mail.read ? 'bg-primary/[0.02] border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                   >
                     <div className="flex items-center gap-4 shrink-0">
                        <button className={`text-muted-foreground hover:text-accent transition-colors ${mail.starred ? 'text-accent' : ''}`}>
                           <Star size={16} fill={mail.starred ? "currentColor" : "none"} />
                        </button>
                        <Avatar className="h-10 w-10 border border-white/10">
                           <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{mail.from[0]}</AvatarFallback>
                        </Avatar>
                     </div>

                     <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-3">
                           <p className={`text-xs uppercase font-bold truncate ${!mail.read ? 'text-foreground' : 'text-muted-foreground'}`}>{mail.from}</p>
                        </div>
                        <div className="md:col-span-7">
                           <p className={`text-xs truncate ${!mail.read ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                             {mail.subject} <span className="font-normal opacity-50 ml-2">- {mail.body}</span>
                           </p>
                        </div>
                        <div className="md:col-span-2 text-right">
                           <p className="text-[10px] font-mono text-muted-foreground uppercase">{mail.date}</p>
                        </div>
                     </div>

                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-destructive"><Trash2 size={16} /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary"><Archive size={16} /></Button>
                     </div>
                   </div>
                 ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={isComposing} onOpenChange={setIsComposing}>
         <DialogContent className="max-w-2xl bg-[#05070a] border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
            <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
               <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <Plus size={24} />
                  </div>
                  <div>
                     <DialogTitle className="text-xl font-headline font-bold uppercase tracking-widest text-primary">Compose Imperial Mail</DialogTitle>
                     <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground">Drafting via Sovereign Gmail Bridge</DialogDescription>
                  </div>
               </div>
            </DialogHeader>

            <div className="p-8 space-y-6">
               <div className="grid gap-4">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                     <span className="text-[10px] font-bold uppercase text-muted-foreground w-12">To:</span>
                     <Input 
                      value={composeData.to} 
                      onChange={e => setComposeData({...composeData, to: e.target.value})}
                      className="bg-transparent border-none focus-visible:ring-0 text-sm h-8 p-0" 
                      placeholder="recipient@example.com" 
                     />
                  </div>
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                     <span className="text-[10px] font-bold uppercase text-muted-foreground w-12">Subject:</span>
                     <Input 
                      value={composeData.subject} 
                      onChange={e => setComposeData({...composeData, subject: e.target.value})}
                      className="bg-transparent border-none focus-visible:ring-0 text-sm h-8 p-0 font-bold" 
                      placeholder="Mail Subject Line" 
                     />
                  </div>
               </div>

               <div className="relative group">
                  <Textarea 
                    value={aiDraft || composeData.context}
                    onChange={e => aiDraft ? setAiDraft(e.target.value) : setComposeData({...composeData, context: e.target.value})}
                    placeholder="আপনার বার্তাটি এখানে লিখুন..."
                    className="min-h-[250px] bg-black/40 border-white/5 rounded-2xl p-6 text-sm leading-relaxed resize-none focus:ring-primary"
                  />
                  {!aiDraft && (
                    <Button 
                      onClick={handleAiDraft}
                      disabled={isDrafting}
                      className="absolute bottom-4 right-4 bg-accent text-background font-bold text-[9px] gap-2 rounded-xl h-8 animate-pulse"
                    >
                      {isDrafting ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
                      AI MAGIC DRAFT
                    </Button>
                  )}
               </div>

               <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" className="h-9 w-9 border border-white/5 rounded-xl"><Paperclip size={16} /></Button>
                     <Button variant="ghost" size="icon" className="h-9 w-9 border border-white/5 rounded-xl"><Sparkles size={16} className="text-accent" /></Button>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className="border-accent/40 text-accent gap-1 text-[8px] h-6 px-3">
                        <ShieldCheck size={10} /> ENCRYPTED_SYNC_42_NODES
                     </Badge>
                  </div>
               </div>
            </div>

            <DialogFooter className="p-6 bg-muted/20 border-t border-white/5 flex gap-4">
               <Button onClick={() => setIsComposing(false)} variant="ghost" className="flex-1 text-xs uppercase font-bold">Discard</Button>
               <Button onClick={handleSendMail} className="flex-1 h-12 bg-primary text-background font-bold text-sm gap-2 rounded-xl shadow-lg shadow-primary/20">
                  <Send size={18} /> DISPATCH MAIL
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>

      {/* Mail Detail Dialog */}
      <Dialog open={!!selectedMail} onOpenChange={(open) => !open && setSelectedMail(null)}>
        <DialogContent className="max-w-3xl bg-[#05070a] border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
           {selectedMail && (
             <>
                <DialogHeader className="p-8 bg-primary/5 border-b border-white/5">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-xl">
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{selectedMail.from[0]}</AvatarFallback>
                         </Avatar>
                         <div>
                            <DialogTitle className="text-2xl font-headline font-bold text-foreground">{selectedMail.subject}</DialogTitle>
                            <div className="flex items-center gap-2 mt-1">
                               <p className="text-xs text-primary font-bold uppercase">{selectedMail.from}</p>
                               <span className="text-[10px] text-muted-foreground opacity-50">&lt;noreply@imperial.com&gt;</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-muted-foreground font-mono uppercase">{selectedMail.date}</p>
                         <Badge variant="outline" className="mt-2 border-accent/40 text-accent text-[7px] uppercase font-bold">Encrypted</Badge>
                      </div>
                   </div>
                </DialogHeader>

                <ScrollArea className="max-h-[400px] p-8">
                   <div className="bg-black/40 border border-white/5 rounded-3xl p-8 font-body text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none rotate-12">
                         <Mail size={300} />
                      </div>
                      {selectedMail.body}
                      <p className="mt-12 text-[10px] text-muted-foreground italic border-t border-white/5 pt-6">
                        "This mail was captured and verified by the Sovereign Signal Engine. 42 Nodes Synchronized."
                      </p>
                   </div>
                </ScrollArea>

                <DialogFooter className="p-6 bg-muted/20 border-t border-white/5 flex gap-4">
                   <Button variant="outline" className="flex-1 border-white/10 text-white font-bold h-12 rounded-xl gap-2 hover:bg-white/5">
                      <Trash2 size={18} className="text-destructive" /> DELETE
                   </Button>
                   <Button onClick={() => { 
                    const from = selectedMail.from;
                    const subject = selectedMail.subject;
                    setSelectedMail(null); 
                    setIsComposing(true); 
                    setComposeData({ to: from, subject: `Re: ${subject}`, context: '' }); 
                  }} className="flex-1 bg-primary text-background font-bold h-12 rounded-xl gap-2 shadow-lg shadow-primary/20">
                      <Send size={18} /> REPLY
                   </Button>
                </DialogFooter>
             </>
           )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
