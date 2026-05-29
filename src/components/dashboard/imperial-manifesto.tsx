
"use client"

import React from 'react'
import { Scale, ShieldCheck, TrendingUp, AlertTriangle, Globe, Star, Zap, Landmark, Users, Gavel, History, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function ImperialManifesto() {
  const sections = [
    {
      title: "সামাজিক ও রাষ্ট্রীয় স্বীকৃতি (Recognition)",
      icon: Star,
      color: "text-primary",
      desc: "সমাজ ও দেশ এটাকে একটি 'জীবন রক্ষাকারী বর্ম' হিসেবে গ্রহণ করবে। যেহেতু এটি সরাসরি জেলা প্রশাসনের মাধ্যমে পরিচালিত এবং ৪২টি ডিস্ট্রিবিউটেড নোডে সুরক্ষিত, তাই এর আইনি ভিত্তি হবে অজেয়।"
    },
    {
      title: "ক্ষমতা ও প্রাধান্য (Power & Priority)",
      icon: Gavel,
      color: "text-accent",
      desc: "এর ক্ষমতা কেবল তথ্য আদান-প্রদানে সীমাবদ্ধ নয়। এটি রাজস্ব সংগ্রহ (Treasury), জরুরি উদ্ধার (SOS) এবং তথ্যের বিশুদ্ধতা (Audit) নিয়ন্ত্রণের চূড়ান্ত চাবিকাঠি।"
    },
    {
      title: "প্রশ্নমুখীর হওয়ার ঝুঁকি (Scrutiny Risk)",
      icon: AlertTriangle,
      color: "text-destructive",
      desc: "রাষ্ট্রীয় কাজে স্বচ্ছতা নিয়ে প্রশ্ন উঠতে পারে। তবে আমাদের 'Immutable Audit Trail' এবং RSA v2 এনক্রিপশন প্রমাণ করবে যে প্রতিটি সেকেন্ডের রেকর্ড অপরিবর্তনীয় এবং সত্য।"
    },
    {
      title: "টিকে থাকার স্থায়িত্ব (Sustainability)",
      icon: History,
      color: "text-primary",
      desc: "এটি কোনো সাধারণ ক্লাউড অ্যাপ নয় যা সার্ভার বন্ধ হলে মুছে যাবে। এটি একটি সেল্ফ-হিলিং নেটওয়ার্ক। যতদিন ৪২টি নোডের একটিও জীবিত থাকবে, আপনার সাম্রাজ্য টিকে থাকবে।"
    },
    {
      title: "সাফল্য ও অগ্রযাত্রা (Success & Potential)",
      icon: TrendingUp,
      color: "text-accent",
      desc: "এর সাফল্য পরিমাপ করা হবে 'শূন্য প্রাণহানি' এবং 'অর্থনৈতিক স্বচ্ছতা' দিয়ে। ভবিষ্যতে এটি ব্লুটুথ মেশ-নেটওয়ার্ক এবং স্যাটেলাইট লিঙ্কের মাধ্যমে মহাকাশ পর্যন্ত বিস্তৃত হওয়ার সম্ভাবনা রাখে।"
    }
  ];

  return (
    <Card className="bg-card/40 border-primary/20 overflow-hidden relative group animate-in fade-in duration-1000">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
        <Scale size={240} className="text-primary" />
      </div>
      <CardHeader className="bg-primary/10 border-b border-white/5 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl md:text-2xl font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-3">
              <ShieldCheck className="animate-pulse" /> IMPERIAL VISION & STRATEGY
            </CardTitle>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase font-bold tracking-[0.3em]">সাম্রাজ্যের স্বীকৃতি, ক্ষমতা ও স্থায়িত্বের রাজকীয় খতিয়ান</p>
          </div>
          <Badge className="bg-accent text-background font-bold tracking-widest px-4 h-8 uppercase">SOVEREIGN_DOC_V1</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((item, i) => (
            <div key={i} className="p-5 bg-black/40 rounded-[2rem] border border-white/5 hover:border-primary/40 transition-all group/item flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-white/10 group-hover/item:scale-110 transition-transform ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <h4 className="text-xs md:text-sm font-headline font-bold uppercase tracking-tight text-foreground">{item.title}</h4>
              </div>
              <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed italic font-light">
                "{item.desc}"
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-8 bg-primary/5 border border-primary/20 border-dashed rounded-[3rem] text-center space-y-6">
           <div className="flex justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                 <p className="text-2xl font-headline font-bold text-primary">১০০%</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground">সাফল্য সম্ভাবনা</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                 <p className="text-2xl font-headline font-bold text-accent">অজেয়</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground">আইনি স্বীকৃতি</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                 <p className="text-2xl font-headline font-bold text-primary">অনন্ত</p>
                 <p className="text-[8px] uppercase font-bold text-muted-foreground">টিকে থাকার ক্ষমতা</p>
              </div>
           </div>
           <p className="max-w-2xl mx-auto text-xs md:text-sm text-muted-foreground leading-relaxed italic">
             "মহামান্য সম্রাট, আপনার এই পরিকাঠামোটি কেবল একটি প্রযুক্তির প্রদর্শনী নয়; এটি একটি জাতির নিরাপত্তার গ্যারান্টি। সমাজ এটাকে প্রকৃতির বিরুদ্ধে মানুষের বিজয়ের হাতিয়ার হিসেবে দেখবে। এর স্বীকৃতি হবে আকাশচুম্বী এবং এর ক্ষমতা হবে প্রজাদের কল্যাণে উৎসর্গীকৃত।"
           </p>
        </div>
      </CardContent>
    </Card>
  )
}
