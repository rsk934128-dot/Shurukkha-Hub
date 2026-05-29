
"use client"

import React, { useState, useEffect } from 'react'
import { Eye, MapPin, Clock, ShieldCheck, Image as ImageIcon, Trash2, ExternalLink, Filter, Search, SearchCode, Camera, Signal, Loader2, Sparkles, Navigation, CheckCircle2, AlertCircle, Share2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

export function IncidentReviewBoard() {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "incidents"), orderBy("timestamp", "desc"), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "incidents", id), { status });
      toast({ title: "স্ট্যাটাস আপডেট করা হয়েছে", description: `রিপোর্টটি এখন ${status} হিসেবে চিহ্নিত।` });
    } catch (e) {
      toast({ title: "ত্রুটি", variant: "destructive" });
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই রিপোর্টটি মুছতে চান?")) return;
    try {
      await deleteDoc(doc(db, "incidents", id));
      toast({ title: "রিপোর্ট মুছে ফেলা হয়েছে" });
    } catch (e) {
      toast({ title: "ত্রুটি", variant: "destructive" });
    }
  }

  const handleShareIncident = async (incident: any) => {
    const text = `ইমার্জেন্সি রিপোর্ট: ${getTypeLabel(incident.type)} \nবর্ণনা: ${incident.description} \nলোকেশন: ${incident.coordinates ? `${incident.coordinates.lat}, ${incident.coordinates.lng}` : 'N/A'}`;
    const url = window.location.origin;

    const fallbackCopy = async () => {
      try {
        await navigator.clipboard.writeText(text + `\nলিঙ্ক: ${url}`);
        toast({ title: "রিপোর্ট কপি করা হয়েছে", description: "শেয়ার করার জন্য তথ্য ক্লিপবোর্ডে সংরক্ষিত হয়েছে।" });
      } catch (err) {
        toast({ title: "শেয়ার ব্যর্থ", description: "তথ্য কপি করা সম্ভব হয়নি।", variant: "destructive" });
      }
    };

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Intel Report',
          text: text,
          url: url
        });
      } else {
        await fallbackCopy();
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        await fallbackCopy();
      }
    }
  }

  const filteredIncidents = incidents.filter(inc => 
    inc.description?.toLowerCase().includes(search.toLowerCase()) ||
    inc.type?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge className="bg-primary text-background animate-pulse uppercase text-[8px]">New Signal</Badge>;
      case 'verified': return <Badge className="bg-accent text-background uppercase text-[8px]">Verified</Badge>;
      case 'resolved': return <Badge variant="outline" className="border-accent/40 text-accent uppercase text-[8px]">Resolved</Badge>;
      default: return <Badge variant="secondary" className="uppercase text-[8px]">{status}</Badge>;
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      theft: 'চুরি / ছিনতাই',
      accident: 'সড়ক দুর্ঘটনা',
      road: 'রাস্তা বন্ধ',
      flood: 'বন্যা / প্লাবন',
      medical: 'জরুরি চিকিৎসা',
      other: 'অন্যান্য'
    };
    return labels[type] || type;
  }

  if (loading) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary animate-pulse">Decrypting Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchCode className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
          <Input 
            placeholder="গোয়েন্দা তথ্যের ধরণ বা বর্ণনা দিয়ে খুঁজুন..." 
            className="pl-10 h-12 bg-background/50 border-white/10 text-xs rounded-xl focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 h-10 px-4 gap-2 text-[10px] uppercase font-bold">
            <Signal size={12} className="animate-pulse" /> {incidents.length} TOTAL REPORTS
          </Badge>
        </div>
      </div>

      {filteredIncidents.length === 0 ? (
        <Card className="bg-card/40 border-dashed border-white/10 p-20 flex flex-col items-center justify-center text-center opacity-40">
           <AlertCircle size={64} className="mb-4 text-muted-foreground" />
           <p className="font-headline font-bold text-lg uppercase tracking-widest">No Intelligence Found</p>
           <p className="text-sm mt-2">এখন পর্যন্ত কোনো ইনসিডেন্ট রিপোর্ট দাখিল করা হয়নি।</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden group hover:border-primary/30 transition-all flex flex-col h-full shadow-2xl">
              {/* Card Header with Media */}
              <div className="relative aspect-video bg-muted overflow-hidden">
                {incident.image ? (
                  <>
                    <img 
                      src={incident.image} 
                      alt="Intelligence Forensic" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setSelectedImage(incident.image)}
                      className="absolute bottom-2 right-2 h-8 w-8 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye size={16} />
                    </Button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/40">
                    <ImageIcon className="text-muted-foreground opacity-20" size={48} />
                    <p className="text-[10px] uppercase font-bold text-muted-foreground/40 tracking-widest">No Visual Evidence</p>
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                   {getStatusBadge(incident.status)}
                   <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[8px] uppercase tracking-widest gap-1">
                     <Clock size={10} /> {incident.timestamp?.toDate?.()?.toLocaleTimeString('bn-BD') || 'Just Now'}
                   </Badge>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleShareIncident(incident)}
                  className="absolute top-3 right-3 h-8 w-8 bg-black/40 text-white rounded-full border border-white/10 hover:bg-primary/20"
                >
                  <Share2 size={14} />
                </Button>
              </div>

              {/* Card Content */}
              <CardContent className="flex-1 p-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-headline font-bold text-foreground uppercase tracking-tight">
                       {getTypeLabel(incident.type)}
                     </h3>
                     <Badge variant="outline" className="text-[7px] border-white/5 opacity-50">ID: {incident.id.substring(0, 8)}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                    "{incident.description}"
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  {incident.coordinates && (
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground bg-black/20 p-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-accent" />
                        <span className="font-mono">{incident.coordinates.lat.toFixed(4)}, {incident.coordinates.lng.toFixed(4)}</span>
                      </div>
                      <a 
                        href={`https://www.google.com/maps?q=${incident.coordinates.lat},${incident.coordinates.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-accent hover:underline flex items-center gap-1 font-bold"
                      >
                        <Navigation size={10} /> GO TO MAP
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                    <ShieldCheck size={12} className="text-primary" />
                    <span>INTEGRITY: 100.0% | PROTOCOL: {incident.purity || 'SOVEREIGN_V31'}</span>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer Actions */}
              <div className="px-5 py-4 bg-muted/20 border-t border-white/5 flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleUpdateStatus(incident.id, 'verified')}
                  className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest border-primary/20 hover:bg-primary/10 text-primary rounded-xl"
                >
                  <CheckCircle2 size={14} className="mr-1" /> Verify
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUpdateStatus(incident.id, 'resolved')}
                  className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest border-accent/20 hover:bg-accent/10 text-accent rounded-xl"
                >
                   Resolve
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handleDelete(incident.id)}
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image Zoom Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-black/90 border-primary/20 p-0 overflow-hidden rounded-[2rem]">
          <div className="relative w-full aspect-video">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Full Intelligence Evidence" 
                className="w-full h-full object-contain"
              />
            )}
            <div className="absolute top-4 left-4 flex gap-2">
               <Badge className="bg-primary text-background font-bold uppercase text-[10px]">Forensic Evidence</Badge>
               <Badge variant="outline" className="bg-black/60 border-white/20 text-white text-[10px]">ULTRA_HD_SCAN</Badge>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
               <Button onClick={() => setSelectedImage(null)} variant="outline" className="rounded-full bg-white/10 border-white/20 backdrop-blur-xl text-white font-bold h-10 px-8 hover:bg-white/20">
                 CLOSE HUD
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
