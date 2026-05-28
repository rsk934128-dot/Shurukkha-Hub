"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, MessageSquare, Loader2, Bot, User, Zap, ChevronUp, Landmark, ShieldAlert, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { askAssistant, type AssistantOutput } from '@/ai/flows/sovereign-assistant-flow'
import { useToast } from '@/hooks/use-toast'

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function SovereignAssistantChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'মহামান্য, আমি সেনটিনেল এআই। আপনার সাম্রাজ্য পরিচালনায় আমি কীভাবে সাহায্য করতে পারি? পেমেন্ট, রিচার্জ বা সুরক্ষা—যেকোনো বিষয়ে আমাকে প্রশ্ন করুন।' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userQuery = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userQuery }])
    setLoading(true)

    try {
      const result = await askAssistant({ query: userQuery })
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }])
      
      if (result.suggestedAction !== 'NONE') {
        handleAction(result.suggestedAction)
      }
    } catch (error) {
      toast({ title: "সংযোগ বিচ্ছিন্ন", description: "এআই সার্ভারে পৌঁছানো যাচ্ছে না।", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (action: string) => {
    toast({
      title: "Action Suggested",
      description: `এআই আপনাকে ${action.replace('_', ' ')} মডিউলটি ব্যবহারের পরামর্শ দিচ্ছে।`,
    })
  }

  return (
    <div className="fixed bottom-6 left-6 z-[100] no-print">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(117,151,255,0.4)] border-4 border-background group"
        >
          <Bot className="text-background group-hover:scale-110 transition-transform" size={28} />
          <div className="absolute -top-1 -right-1">
             <div className="w-4 h-4 bg-accent rounded-full animate-ping opacity-75" />
          </div>
        </Button>
      ) : (
        <Card className="w-80 md:w-96 h-[500px] border-primary/30 bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left-10 zoom-in-95">
          <CardHeader className="bg-primary/10 border-b border-white/5 py-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
               <Bot className="text-primary animate-pulse" size={20} />
               <div>
                  <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-primary">Sentinel AI Assistant</CardTitle>
                  <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-tighter">Gemini 2.5 Flash Intelligence</p>
               </div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs md:text-sm shadow-md ${msg.role === 'user' ? 'bg-primary text-background rounded-tr-none' : 'bg-muted/80 border border-white/5 rounded-tl-none'}`}>
                      <div className="flex items-center gap-2 mb-1 opacity-50">
                        {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                        <span className="text-[8px] uppercase font-bold">{msg.role === 'user' ? 'You' : 'Sentinel'}</span>
                      </div>
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="bg-muted/40 p-3 rounded-2xl border border-white/5">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-white/5 bg-black/20">
              <div className="flex gap-2">
                <Input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="আপনার প্রশ্নটি এখানে লিখুন..."
                  className="bg-background/50 border-white/10 h-10 text-xs focus:ring-primary rounded-xl"
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()} className="h-10 w-10 shrink-0 bg-primary text-background rounded-xl shadow-lg">
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                 <Badge onClick={() => setInput('আমি কীভাবে রিচার্জ করব?')} variant="outline" className="text-[8px] border-white/5 hover:bg-white/5 cursor-pointer transition-colors uppercase font-bold tracking-tighter">
                   <Landmark size={8} className="mr-1" /> রিচার্জ
                 </Badge>
                 <Badge onClick={() => setInput('এখন কি বন্যার বিপদ আছে?')} variant="outline" className="text-[8px] border-white/5 hover:bg-white/5 cursor-pointer transition-colors uppercase font-bold tracking-tighter">
                   <Globe size={8} className="mr-1" /> বন্যা
                 </Badge>
                 <Badge onClick={() => setInput('জরুরি সাহায্য চাই')} variant="outline" className="text-[8px] border-white/5 hover:bg-white/5 cursor-pointer transition-colors uppercase font-bold tracking-tighter text-destructive">
                   <ShieldAlert size={8} className="mr-1" /> SOS
                 </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
