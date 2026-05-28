
"use client"

import React, { useState } from 'react'
import { PlusCircle, MapPin, Camera, Send, CheckCircle2, Loader2, MapPinned } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { DisasterStorage } from '@/lib/disaster-storage'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

export function IncidentReport() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    type: '',
    description: ''
  })

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "ব্রাউজার সাপোর্ট করছে না", description: "আপনার ব্রাউজারটি লোকেশন সার্ভিস সাপোর্ট করে না।", variant: "destructive" })
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsGettingLocation(false)
        toast({ title: "অবস্থান শনাক্ত হয়েছে", description: "আপনার ভৌগোলিক স্থানাঙ্ক সফলভাবে যুক্ত করা হয়েছে।" })
      },
      (error) => {
        console.error("Location Error:", error)
        setIsGettingLocation(false)
        toast({ title: "লোকেশন পাওয়া যায়নি", description: "দয়া করে লোকেশন পারমিশন চেক করুন।", variant: "destructive" })
      },
      { enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const reportData = {
      ...formData,
      coordinates: locationData,
      timestamp: serverTimestamp(),
      status: 'new'
    }

    try {
      await addDoc(collection(db, "incidents"), reportData);
      setSubmitted(true)
    } catch (error) {
      console.error("Incident Sync Error:", error);
      // Offline Fallback
      DisasterStorage.saveReport({ ...reportData, timestamp: new Date().toISOString() });
      setSubmitted(true);
    } finally {
      setLoading(false)
    }
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
        <Button onClick={() => { setSubmitted(false); setLocationData(null); }} variant="outline" className="border-accent/30 text-accent">
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
            <Select 
              required 
              onValueChange={(val) => setFormData({...formData, type: val})}
            >
              <SelectTrigger className="bg-muted border-none h-11 focus:ring-accent">
                <SelectValue placeholder="নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theft">চুরি / ছিনতাই</SelectItem>
                <SelectItem value="accident">সড়ক দুর্ঘটনা</SelectItem>
                <SelectItem value="road">রাস্তা বন্ধ / জ্যাম</SelectItem>
                <SelectItem value="flood">বন্যা / পানিবন্দী</SelectItem>
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
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {locationData && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <MapPinned size={14} className="text-accent" />
                <span className="text-[10px] font-mono text-accent">Lat: {locationData.lat.toFixed(4)}, Lng: {locationData.lng.toFixed(4)}</span>
              </div>
              <Badge variant="outline" className="text-[8px] border-accent/30 text-accent">সংযুক্ত</Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className={`border-accent/20 h-11 font-body text-xs gap-2 transition-all ${locationData ? 'bg-accent/10 border-accent/40' : 'hover:bg-accent/10'}`}
            >
              {isGettingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />} 
              {locationData ? "অবস্থান পরিবর্তন" : "অবস্থান যোগ করুন"}
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
