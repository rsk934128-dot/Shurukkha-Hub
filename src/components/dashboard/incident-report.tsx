"use client"

import React, { useState, useRef } from 'react'
import { PlusCircle, MapPin, Camera, Send, CheckCircle2, Loader2, MapPinned, X, Trash2, ShieldCheck, Image as ImageIcon } from 'lucide-react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

export function IncidentReport() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationData, setLocationData] = useState<{ lat: number; lng: number; address?: string } | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
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

  const startCamera = async () => {
    try {
      setIsCameraOpen(true)
      setIsCapturing(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCapturing(false)
    } catch (err) {
      console.error("Camera Error:", err)
      toast({ title: "ক্যামেরা ত্রুটি", description: "আপনার ডিভাইসের ক্যামেরা এক্সেস করা সম্ভব হচ্ছে না।", variant: "destructive" })
      setIsCameraOpen(false)
      setIsCapturing(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(dataUrl)
        stopCamera()
        toast({ title: "ছবি তোলা হয়েছে", description: "আপনার ফরেনসিক ছবি সফলভাবে যুক্ত হয়েছে।" })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const reportData = {
      ...formData,
      coordinates: locationData,
      image: capturedImage,
      timestamp: serverTimestamp(),
      status: 'new',
      purity: 'SOVEREIGN_V31'
    }

    try {
      await addDoc(collection(db, "incidents"), reportData);
      setSubmitted(true)
      toast({ title: "রিপোর্ট পাঠানো হয়েছে", description: "আপনার তথ্য সরাসরি কমান্ড সেন্টারে পৌঁছেছে।" })
    } catch (error) {
      console.error("Incident Sync Error:", error);
      // Offline Fallback
      DisasterStorage.saveReport({ ...reportData, timestamp: new Date().toISOString(), syncedFromOffline: false });
      setSubmitted(true);
      toast({ 
        title: "অফলাইন মোডে সংরক্ষিত", 
        description: "ইন্টারনেট না থাকায় আপনার রিপোর্ট স্থানীয়ভাবে সংরক্ষিত হয়েছে। সংযোগ পেলেই সিঙ্ক হবে।" 
      })
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
        <Button onClick={() => { setSubmitted(false); setLocationData(null); setCapturedImage(null); }} variant="outline" className="border-accent/30 text-accent">
          আরেকটি রিপোর্ট করুন
        </Button>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-white/5 flex flex-col h-full overflow-hidden">
      <CardHeader className="pb-2 bg-accent/5">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <PlusCircle className="text-accent" size={20} />
          ঘটনা রিপোর্ট করুন
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-6 pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-headline uppercase text-muted-foreground tracking-wider">ঘটনার ধরণ</label>
            <Select 
              required 
              onValueChange={(val) => setFormData({...formData, type: val})}
            >
              <SelectTrigger className="bg-muted/40 border-white/5 h-11 focus:ring-accent rounded-xl">
                <SelectValue placeholder="নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                <SelectItem value="theft">চুরি / ছিনতাই</SelectItem>
                <SelectItem value="accident">সড়ক দুর্ঘটনা</SelectItem>
                <SelectItem value="road">রাস্তা বন্ধ / জ্যাম</SelectItem>
                <SelectItem value="flood">বন্যা / পানিবন্দী</SelectItem>
                <SelectItem value="medical">জরুরি চিকিৎসা প্রয়োজন</SelectItem>
                <SelectItem value="other">অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-headline uppercase text-muted-foreground tracking-wider">বিস্তারিত তথ্য</label>
            <Textarea 
              placeholder="কি ঘটেছে সংক্ষেপে লিখুন..." 
              className="bg-muted/40 border-white/5 resize-none h-20 focus:ring-accent rounded-xl"
              required
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Location & Image Indicators */}
          <div className="flex flex-wrap gap-2">
            {locationData && (
              <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent gap-1.5 py-1 px-3 rounded-full">
                <MapPinned size={12} /> অক্ষাংশ: {locationData.lat.toFixed(3)}
              </Badge>
            )}
            {capturedImage && (
              <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary gap-1.5 py-1 px-3 rounded-full">
                <ImageIcon size={12} /> ছবি যুক্ত
              </Badge>
            )}
          </div>

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border border-white/5">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  type="button" 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setCapturedImage(null)}
                  className="gap-2 rounded-full font-bold"
                >
                  <Trash2 size={14} /> ছবি মুছুন
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className={`border-white/5 bg-muted/20 h-12 font-body text-xs gap-2 transition-all rounded-xl ${locationData ? 'bg-accent/10 border-accent/40 text-accent' : 'hover:bg-accent/10 hover:border-accent/20'}`}
            >
              {isGettingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />} 
              {locationData ? "অবস্থান শনাক্ত" : "অবস্থান যোগ করুন"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={startCamera}
              className={`border-white/5 bg-muted/20 h-12 font-body text-xs gap-2 hover:bg-primary/10 hover:border-primary/20 rounded-xl ${capturedImage ? 'bg-primary/10 border-primary/40 text-primary' : ''}`}
            >
              <Camera size={16} /> {capturedImage ? "ছবি পরিবর্তন" : "ছবি তুলুন"}
            </Button>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-14 bg-accent hover:bg-accent/90 text-background font-headline font-bold text-lg rounded-2xl shadow-lg shadow-accent/20 transition-all hover:scale-[1.02] active:scale-95 group">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                <span>প্রসেসিং...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>রিপোর্ট পাঠান</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>

      {/* Camera Dialog */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-md bg-card border-primary/20 p-0 overflow-hidden rounded-[2rem]">
          <DialogHeader className="sr-only">
            <DialogTitle>Incident Recon Lens</DialogTitle>
            <DialogDescription>Capture visual evidence for the sovereign registry.</DialogDescription>
          </DialogHeader>

          <div className="relative aspect-video bg-black flex items-center justify-center">
            {isCapturing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={32} />
                <p className="text-[10px] font-mono uppercase text-muted-foreground animate-pulse">Initializing Sovereign Lens...</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Scan Lines Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            
            <Badge variant="outline" className="absolute top-4 left-4 border-primary/40 text-primary bg-black/40 backdrop-blur-md text-[8px] uppercase tracking-widest gap-2">
              <ShieldCheck size={10} /> SECURE_RECON_FEED
            </Badge>

            <Button 
              size="icon" 
              variant="ghost" 
              onClick={stopCamera} 
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full h-8 w-8"
            >
              <X size={20} />
            </Button>
          </div>

          <div className="p-6 bg-muted/10 border-t border-white/5 text-center space-y-4">
            <p className="text-xs text-muted-foreground italic">আপনার ডিভাইসের ক্যামেরা দিয়ে ঘটনার একটি পরিষ্কার ছবি তুলুন।</p>
            <div className="flex justify-center">
              <Button 
                onClick={capturePhoto}
                disabled={isCapturing}
                className="h-16 w-16 rounded-full bg-white text-black hover:bg-white/90 border-8 border-primary/20 shadow-2xl transition-transform active:scale-90"
              >
                <div className="h-4 w-4 rounded-full bg-black" />
              </Button>
            </div>
            <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">IMPERIAL_LENS_PRO_V1</p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hidden canvas for photo processing */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  )
}
