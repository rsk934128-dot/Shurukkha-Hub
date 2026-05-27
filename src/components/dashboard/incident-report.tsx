"use client"

import React, { useState } from 'react'
import { PlusCircle, MapPin, Camera, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function IncidentReport() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  if (submitted) {
    return (
      <Card className="bg-card border-white/5 h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 size={32} className="text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-headline font-bold text-accent">রিপোর্ট সফল হয়েছে</h3>
          <p className="text-sm font-body text-muted-foreground">আপনার তথ্য স্থানীয় প্রশাসনের কাছে পাঠানো হয়েছে। ধন্যবাদ।</p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="border-accent/30 text-accent">
          আরেকটি রিপোর্ট করুন
        </Button>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-white/5 flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <PlusCircle className="text-accent" size={20} />
          ঘটনা রিপোর্ট করুন
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-headline uppercase text-muted-foreground tracking-wider">ঘটনার ধরণ</label>
            <Select required>
              <SelectTrigger className="bg-muted border-none h-11 focus:ring-accent">
                <SelectValue placeholder="নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theft">চুরি / ছিনতাই</SelectItem>
                <SelectItem value="accident">সড়ক দুর্ঘটনা</SelectItem>
                <SelectItem value="road">রাস্তা বন্ধ / জ্যাম</SelectItem>
                <SelectItem value="other">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-headline uppercase text-muted-foreground tracking-wider">বিস্তারিত তথ্য</label>
            <Textarea 
              placeholder="কি ঘটেছে সংক্ষেপে লিখুন..." 
              className="bg-muted border-none resize-none h-20 focus:ring-accent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="border-accent/20 h-11 font-body text-xs gap-2 hover:bg-accent/10">
              <MapPin size={16} /> অবস্থান যোগ করুন
            </Button>
            <Button type="button" variant="outline" className="border-accent/20 h-11 font-body text-xs gap-2 hover:bg-accent/10">
              <Camera size={16} /> ছবি তুলুন
            </Button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-12 bg-accent hover:bg-accent/90 text-background font-headline font-bold">
            {loading ? "প্রসেসিং..." : "রিপোর্ট পাঠান"} <Send size={18} className="ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}