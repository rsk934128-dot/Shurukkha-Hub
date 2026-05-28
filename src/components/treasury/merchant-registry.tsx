"use client"

import React, { useState, useEffect } from 'react'
import { Store, User, Plus, Search, ShieldCheck, Key, CreditCard, Activity, Trash2, CheckCircle2, Loader2, Globe, TrendingUp, Landmark, FileText, Download, Share2, Sparkles, MessageSquare, Zap, Target, FilePlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc, orderBy } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { IntegrationBridge } from '@/lib/integration-bridge'
import { AppLogo } from '@/components/ui/app-logo'
import { PaymentHandler } from '@/lib/payment-handler'

const SECTOR_TEMPLATES = [
  { label: 'Textile (Handloom)', value: 'Textile', desc: 'সিরাজগঞ্জ হ্যান্ডলুম প্রোডাকশন হাউস' },
  { label: 'Agro-Processing', value: 'Emergency', desc: 'স্থানীয় ডেইরি বা পোল্ট্রি ফার্ম' },
  { label: 'E-commerce Hub', value: 'Service', desc: 'ডিজিটাল ডেলিভারি ও লজিস্টিক' },
  { label: 'Emergency Pharmacy', value: 'Emergency', desc: 'ইমার্জেন্সি রেসপন্স ইন্টিগ্রেশন' },
  { label: 'Wholesale Grocery', value: 'Grocery', desc: 'পাইকারি পণ্য সরবরাহকারী' },
]

export function MerchantRegistry() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showPitch, setShowPitch] = useState(false)
  const [search, setSearch] = useState('')
  const [lastOnboarded, setLastOnboarded] = useState<any>(null)
  const [isInvoicing, setIsInvoicing] = useState<string | null>(null)
  const { toast } = useToast()

  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    category: 'Textile'
  })

  useEffect(() => {
    const q = query(collection(db, "merchants"), orderBy("onboardedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMerchants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [])

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const merchantId = `SMID-${Math.floor(1000 + Math.random() * 9000)}`;
      const apiKey = `sk_sov_${Math.random().toString(36).substring(2, 24)}`;
      
      const merchantData = {
        ...form,
        merchantId,
        apiKey,
        status: 'active',
        totalRevenue: 0,
        taxCollected: 0,
        onboardedAt: new Date().toISOString(),
        purity: 'VERIFIED_IMPERIAL'
      };

      const docRef = await addDoc(collection(db, "merchants"), merchantData);
      setLastOnboarded({ ...merchantData, id: docRef.id });

      await addDoc(collection(db, "audit_trails"), {
        action: 'MERCHANT_ONBOARDED',
        details: { businessName: form.businessName, merchantId },
        signature: IntegrationBridge.generateSignature({ merchantId }),
        timestamp: serverTimestamp(),
        performedBy: 'Imperial_Treasury_Admin'
      });

      toast({ title: "সফল অনবোর্ডিং", description: `${form.businessName} এখন আপনার গ্রিডে সক্রিয়।` });
      setIsAdding(false);
      setForm({ businessName: '', ownerName: '', category: 'Textile' });
    } catch (e) {
      toast({ title: "ব্যর্থ!", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  const handleIssueInvoice = async (merchant: any) => {
    setIsInvoicing(merchant.id);
    try {
      const amount = 5000; // Mock invoice amount
      await PaymentHandler.generateInvoice(merchant, amount, "Imperial Service Fee - Phase 31 Verification");
      toast({ title: "ইনভয়েস জেনারেটেড", description: `${merchant.businessName} এর জন্য ইনভয়েস পাঠানো হয়েছে।` });
    } catch (e) {
      toast({ title: "ইনভয়েস জেনারেশন ব্যর্থ", variant: "destructive" });
    } finally {
      setIsInvoicing(null);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই মার্চেন্টকে গ্রিড থেকে সরাতে চান?")) return;
    try {
      await deleteDoc(doc(db, "merchants", id));
      toast({ title: "মার্চেন্ট অপসারিত" });
    } catch (e) { toast({ title: "ত্রুটি", variant: "destructive" }); }
  }

  const applyTemplate = (tpl: any) => {
    setForm({
      businessName: tpl.desc,
      ownerName: 'Pending Verification',
      category: tpl.value
    });
    toast({ title: "টেমপ্লেট সক্রিয়", description: `${tpl.label} এর জন্য ডাটা কনফিগার করা হয়েছে।` });
  }

  const filteredMerchants = merchants.filter(m => 
    m.businessName?.toLowerCase().includes(search.toLowerCase()) ||
    m.merchantId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <Sparkles className="text-primary animate-pulse" size={24} />
           </div>
           <div>
              <h4 className="text-sm font-headline font-bold text-foreground uppercase tracking-widest">Smart Onboarding Assistant</h4>
              <p className="text-[10px] text-muted-foreground italic">মহামান্য সম্রাট, আপনার ৫টি প্রধান মার্চেন্ট অনবোর্ড করার জন্য আমি প্রস্তুত।</p>
           </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <Button 
            onClick={() => setShowPitch(!showPitch)}
            variant="outline" 
            className="flex-1 md:flex-none border-primary/20 text-primary text-[10px] uppercase font-bold gap-2 h-10 rounded-xl"
          >
            <MessageSquare size={16} /> {showPitch ? "কমান্ড ভিউ" : "পিচ গাইড"}
          </Button>
          <Button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex-1 md:flex-none bg-primary text-background font-bold h-10 gap-2 rounded-xl shadow-lg shadow-primary/20"
          >
            {isAdding ? <Activity size={18} /> : <Plus size={18} />}
            {isAdding ? "তালিকা" : "নতুন মার্চেন্ট"}
          </Button>
        </div>
      </div>

      {showPitch && (
        <Card className="bg-card/40 border-accent/20 border-dashed animate-in zoom-in-95 duration-500 rounded-[2rem] overflow-hidden">
           <CardHeader className="bg-accent/5 border-b border-accent/10">
              <CardTitle className="text-xs font-headline font-bold text-accent uppercase tracking-[0.3em] flex items-center gap-2">
                <Target size={14} /> Strategic Pitch Deck
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-primary uppercase">১. সার্বভৌম নিরাপত্তা</h5>
                 <p className="text-[11px] text-muted-foreground leading-relaxed">মার্চেন্টদের বলুন যে তাদের প্রতিটি ট্রানজেকশন RSA v2 এনক্রিপশন এবং ৪২টি নোড দ্বারা সুরক্ষিত।</p>
              </div>
              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-accent uppercase">২. ইমার্জেন্সি সাপোর্ট</h5>
                 <p className="text-[11px] text-muted-foreground leading-relaxed">বন্যার সময় বা যেকোনো দুর্ঘটনায় তাদের ব্যবসা সিরাজগঞ্জ সুরক্ষার ১-ক্লিক SOS ডিরেক্টরি থেকে সরাসরি সহায়তা পাবে।</p>
              </div>
              <div className="space-y-2">
                 <h5 className="text-[10px] font-bold text-primary uppercase">৩. গ্লোবাল কানেক্টিভিটি</h5>
                 <p className="text-[11px] text-muted-foreground leading-relaxed">১৫৫+ দেশের ব্যাংকিং নোডের সাথে তাদের ব্যবসা যুক্ত হবে, যা বৈশ্বিক বাণিজ্যের দুয়ার খুলে দেবে।</p>
              </div>
           </CardContent>
        </Card>
      )}

      {isAdding && (
        <div className="space-y-6">
           <div className="flex flex-wrap gap-2">
              {SECTOR_TEMPLATES.map((tpl, i) => (
                <Badge 
                  key={i} 
                  onClick={() => applyTemplate(tpl)}
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10 border-primary/20 text-primary py-1.5 px-3 rounded-xl transition-all"
                >
                   <Zap size={10} className="mr-1.5 fill-primary" /> {tpl.label}
                </Badge>
              ))}
           </div>

          <Card className="bg-card/40 border-primary/20 overflow-hidden animate-in slide-in-from-top-2 rounded-[2rem]">
            <CardHeader className="bg-primary/5 border-b border-white/5">
              <CardTitle className="text-sm font-headline uppercase tracking-widest flex items-center gap-2">
                <Store className="text-primary" size={18} /> নতুন মার্চেন্ট অনবোর্ডিং
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleOnboard} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">ব্যবসার নাম</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input 
                      required 
                      value={form.businessName}
                      onChange={e => setForm({...form, businessName: e.target.value})}
                      placeholder="উদা: সিরাজগঞ্জ হ্যান্ডলুম হাউস" 
                      className="pl-10 bg-background/50 border-white/10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">মালিকের নাম</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input 
                      required 
                      value={form.ownerName}
                      onChange={e => setForm({...form, ownerName: e.target.value})}
                      placeholder="মালিকের নাম লিখুন" 
                      className="pl-10 bg-background/50 border-white/10 h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">ক্যাটাগরি</label>
                  <Select onValueChange={val => setForm({...form, category: val})} value={form.category}>
                    <SelectTrigger className="bg-background/50 border-white/10 h-12">
                      <SelectValue placeholder="নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Textile">টেক্সটাইল / লুঙ্গি</SelectItem>
                      <SelectItem value="Grocery">মুদি / পাইকারি</SelectItem>
                      <SelectItem value="Service">সেবা খাত</SelectItem>
                      <SelectItem value="Emergency">জরুরি সেবা</SelectItem>
                      <SelectItem value="Other">অন্যান্য</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 pt-4">
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-background font-bold text-lg rounded-2xl shadow-xl hover:scale-[1.01] transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : "অনবোর্ডিং প্রসেস সম্পন্ন করুন"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {lastOnboarded && !isAdding && (
        <Card className="bg-accent/5 border-accent/20 rounded-[2.5rem] overflow-hidden animate-in zoom-in-95">
           <div className="p-8 flex flex-col md:flex-row items-center gap-8 relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <AppLogo size={200} />
              </div>
              <div className="w-32 h-32 bg-accent/10 rounded-full flex items-center justify-center border-4 border-accent/20 shrink-0">
                 <CheckCircle2 className="text-accent animate-bounce" size={64} />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left">
                 <div>
                    <Badge className="bg-accent text-background font-bold uppercase text-[8px] tracking-widest mb-2">Registration Success</Badge>
                    <h3 className="text-2xl font-headline font-bold text-foreground">{lastOnboarded.businessName}</h3>
                    <p className="text-xs text-muted-foreground">আপনার মার্চেন্ট এখন সিরাজগঞ্জ সুরক্ষার ৪২টি নোডে নিবন্ধিত।</p>
                 </div>
                 <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="outline" className="border-white/10 text-[9px] font-mono">ID: {lastOnboarded.merchantId}</Badge>
                    <Badge variant="outline" className="border-white/10 text-[9px] font-mono">KEY: {lastOnboarded.apiKey.substring(0, 10)}...</Badge>
                 </div>
                 <div className="flex gap-3 justify-center md:justify-start">
                    <Button variant="outline" className="h-9 text-[10px] uppercase font-bold gap-2 border-accent/40 text-accent rounded-xl">
                       <Download size={14} /> ডাউনলোড কিট
                    </Button>
                    <Button onClick={() => setLastOnboarded(null)} variant="ghost" className="h-9 text-[10px] uppercase font-bold text-muted-foreground">
                       বন্ধ করুন
                    </Button>
                 </div>
              </div>
           </div>
        </Card>
      )}

      {!isAdding && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="মার্চেন্ট বা SMID দিয়ে খুঁজুন..." 
              className="pl-10 h-11 bg-background/50 border-white/10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.length === 0 ? (
              <div className="col-span-full py-20 text-center opacity-30">
                 <Store size={64} className="mx-auto mb-4" />
                 <p className="font-headline font-bold uppercase tracking-widest">No Merchants Found</p>
              </div>
            ) : (
              filteredMerchants.map(merchant => (
                <Card key={merchant.id} className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden group hover:border-primary/30 transition-all flex flex-col h-full shadow-2xl rounded-[2rem]">
                  <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                             <Landmark size={20} className="text-primary" />
                          </div>
                          <div>
                             <h3 className="text-sm font-headline font-bold truncate max-w-[150px]">{merchant.businessName}</h3>
                             <Badge variant="outline" className="text-[7px] border-primary/20 text-primary h-4">{merchant.category}</Badge>
                          </div>
                       </div>
                       <Badge className="bg-accent text-background text-[8px] h-4">ACTIVE</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 flex-1 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <p className="text-[8px] uppercase font-bold text-muted-foreground">Imperial ID</p>
                           <code className="text-[10px] font-mono font-bold text-accent">{merchant.merchantId}</code>
                        </div>
                        <div className="space-y-1 text-right">
                           <p className="text-[8px] uppercase font-bold text-muted-foreground">Owner</p>
                           <p className="text-[10px] font-bold truncate">{merchant.ownerName}</p>
                        </div>
                     </div>

                     <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] text-muted-foreground">Revenue Flow</span>
                           <span className="text-[10px] font-bold">৳{merchant.totalRevenue?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] text-muted-foreground">Tax Contributed</span>
                           <span className="text-[10px] font-bold text-primary">৳{merchant.taxCollected?.toLocaleString() || 0}</span>
                        </div>
                     </div>
                  </CardContent>
                  <div className="px-5 py-3 bg-muted/20 border-t border-white/5 flex gap-2">
                     <Button 
                      onClick={() => handleIssueInvoice(merchant)}
                      disabled={isInvoicing === merchant.id}
                      variant="outline" 
                      className="flex-1 h-8 text-[9px] font-bold uppercase border-primary/20 hover:bg-primary/10 text-primary rounded-lg"
                     >
                        {isInvoicing === merchant.id ? <Loader2 size={12} className="animate-spin mr-1" /> : <FilePlus size={12} className="mr-1" />} Invoice
                     </Button>
                     <Button variant="outline" className="flex-1 h-8 text-[9px] font-bold uppercase border-accent/20 hover:bg-accent/10 text-accent rounded-lg">
                        <TrendingUp size={12} className="mr-1" /> Analytics
                     </Button>
                     <Button size="icon" variant="ghost" onClick={() => handleDelete(merchant.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                     </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}