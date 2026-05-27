"use client"

import React from 'react'
import { Phone, Building2, HeartPulse, FlameKindling, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const contacts = [
  { name: "সিরাজগঞ্জ সদর থানা", phone: "০১৩২০০০৫৫৫৫", icon: ShieldCheck, type: "Police" },
  { name: "ফায়ার সার্ভিস", phone: "০১৭৩০০৫৫৫৫", icon: FlameKindling, type: "Fire" },
  { name: "২৫০ শয্যা বিশিষ্ট হাসপাতাল", phone: "০৭৫১-৬২৫৪৪", icon: HeartPulse, type: "Medical" },
  { name: "জেলা ত্রাণ অফিস", phone: "০১৩২০০০৫৫৮৮", icon: Building2, type: "Relief" },
  { name: "উপজেলা স্বাস্থ্য কমপ্লেক্স", phone: "০৭৫২-৫৬০১৩", icon: HeartPulse, type: "Medical" },
]

export function EmergencyDirectory() {
  return (
    <Card className="bg-card border-white/5 flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <Phone className="text-primary" size={20} />
          জরুরি ডিরেক্টরি
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-[250px] px-6">
          <div className="py-4 space-y-4">
            {contacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <contact.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-headline font-medium group-hover:text-primary transition-colors">{contact.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{contact.type}</p>
                  </div>
                </div>
                <a 
                  href={`tel:${contact.phone}`} 
                  className="p-2 rounded-full hover:bg-primary/10 transition-colors text-primary"
                >
                  <Phone size={18} />
                </a>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}