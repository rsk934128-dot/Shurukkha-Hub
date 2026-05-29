"use client"

import React, { useState, useEffect } from 'react'
import { Building2, Mail, FileText, CheckCircle2, XCircle, Clock, Search, Filter, ShieldCheck, ExternalLink, Loader2, Signal, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function PartnershipReviewBoard() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "partner_requests"), orderBy("timestamp", "desc"), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/partner_requests',
          operation: 'list'
        }));
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, "partner_requests", id), { status });
      toast({ 
        title: status === 'approved' ? "আবেদন অনুমোদিত" : "আবেদন বাতিল", 
        description: `পার্টনার রিকোয়েস্টটি সফলভাবে ${status} করা হয়েছে।` 
      });
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `/partner_requests/${id}`,
          operation: 'update',
          requestResourceData: { status }
        }));
      } else {
        toast({ title: "ত্রুটি", variant: "destructive" });
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই রেকর্ডটি মুছতে চান?")) return;
    try {
      await deleteDoc(doc(db, "partner_requests", id));
      toast({ title: "রেকর্ড মুছে ফেলা হয়েছে" });
    } catch (e: any) {
      if (e.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `/partner_requests/${id}`,
          operation: 'delete'
        }));
      } else {
        toast({ title: "ত্রুটি", variant: "destructive" });
      }
    }
  }

  const filteredRequests = requests.filter(req => 
    req.orgName?.toLowerCase().includes(search.toLowerCase()) ||
    req.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary animate-pulse">Decrypting Partner Signals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-headline font-bold uppercase tracking-tight text-foreground">
            Partnership Requests <span className="text-primary italic">Hub</span>
          </h2>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Global Ecosystem Onboarding Dashboard</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={16} />
          <Input 
            placeholder="প্রতিষ্ঠানের নাম বা ইমেইল দিয়ে খুঁজুন..." 
            className="pl-10 h-11 bg-background/50 border-white/10 text-xs rounded-xl focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <Card className="bg-card/40 border-dashed border-white/10 p-20 flex flex-col items-center justify-center text-center opacity-40">
             <Signal size={64} className="mb-4 text-muted-foreground" />
             <p className="font-headline font-bold text-lg uppercase tracking-widest">No Incoming Requests</p>
             <p className="text-sm mt-2">বর্তমানে কোনো নতুন পার্টনারশিপ আবেদন জমা নেই।</p>
          </Card>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id} className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden group hover:border-primary/30 transition-all shadow-2xl rounded-3xl">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left Identity Bar */}
                  <div className={`w-full md:w-2 bg-primary/20 ${req.status === 'approved' ? 'bg-accent' : req.status === 'rejected' ? 'bg-destructive' : 'bg-primary'}`} />
                  
                  <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Building2 size={28} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-headline font-bold text-foreground uppercase tracking-tight">{req.orgName}</h3>
                          <Badge variant={req.status === 'approved' ? 'default' : req.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[8px] uppercase h-5">
                            {req.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Mail size={12} /> {req.email}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {req.timestamp?.toDate?.()?.toLocaleDateString('bn-BD') || 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 max-w-md p-3 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-[11px] text-foreground/80 leading-relaxed italic line-clamp-2">
                        <FileText size={12} className="inline mr-2 text-primary" />
                        "{req.useCase}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' && (
                        <>
                          <Button 
                            onClick={() => handleUpdateStatus(req.id, 'approved')}
                            className="h-10 bg-accent text-background font-bold gap-2 px-4 rounded-xl shadow-lg shadow-accent/20"
                          >
                            <CheckCircle2 size={16} /> Approve
                          </Button>
                          <Button 
                            onClick={() => handleUpdateStatus(req.id, 'rejected')}
                            variant="outline"
                            className="h-10 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold px-4 rounded-xl"
                          >
                            <XCircle size={16} /> Reject
                          </Button>
                        </>
                      )}
                      <Button 
                        onClick={() => handleDelete(req.id)}
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="p-4 bg-primary/5 border border-primary/20 rounded-3xl flex items-center gap-4">
        <ShieldCheck className="text-primary" size={24} />
        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
          "মহামান্য সম্রাট, এই প্যানেলের মাধ্যমে আপনি আপনার সাম্রাজ্যের বাণিজ্যিক এবং প্রযুক্তিগত অংশীদারদের সরাসরি নিয়ন্ত্রণ করতে পারছেন। প্রতিটি অনুমোদিত পার্টনার আপনার গবেষণামূলক অডিট ট্রেইলে স্বয়ংক্রিয়ভাবে নথিবদ্ধ হবে।"
        </p>
      </div>
    </div>
  )
}
