
"use client"

import React, { useState, useEffect } from 'react'
import { Store, User, Plus, Search, ShieldCheck, Key, CreditCard, Activity, Trash2, CheckCircle2, Loader2, Globe, TrendingUp, Landmark } from 'lucide-react'
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

export function MerchantRegistry() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [search, setSearch] = useState('')
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
        onboardedAt: new Date().toISOString()
      };

      await addDoc(collection(db, "merchants"), merchantData);

      // Log to Audit Trail
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

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই মার্চেন্টকে গ্রিড থেকে সরাতে চান?")) return;
    try {
      await deleteDoc(doc(db, "merchants", id));
      toast({ title: "মার্চেন্ট অপসারিত" });
    } catch (e) { toast({ title: "ত্রুটি", variant: "destructive" }); }
  }

  const filteredMerchants = merchants.filter(m => 
    m.businessName.toLowerCase().includes(search.toLowerCase()) ||
    m.merchantId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="মার্চেন্ট বা SMID দিয়ে খুঁজুন..." 
            className="pl-10 h-11 bg-background/50 border-white/10 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-background font-bold h-11 gap-2 rounded-xl shadow-lg shadow-primary/20"
        >
          {isAdding ? <Activity size={18} /> : <Plus size={18} />}
          {isAdding ? "তালিকা দেখুন" : "নতুন মার্চেন্ট যোগ করুন"}
        </Button>
      </div>

      {isAdding ? (
        <Card className="bg-card/40 border-primary/20 overflow-hidden animate-in slide-in-from-top-2">
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
                    placeholder="উদা: সিরাজগঞ্জ টেক্সটাইল মিল" 
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
                <Select onValueChange={val => setForm({...form, category: val})} defaultValue="Textile">
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
                  {loading ? <Loader2 className="animate-spin" /> : "অনবোর্ডিং প্রসেস শুরু করুন"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.length === 0 ? (
            <div className="col-span-full py-20 text-center opacity-30">
               <Store size={64} className="mx-auto mb-4" />
               <p className="font-headline font-bold uppercase tracking-widest">No Merchants Found</p>
            </div>
          ) : (
            filteredMerchants.map(merchant => (
              <Card key={merchant.id} className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden group hover:border-primary/30 transition-all flex flex-col h-full shadow-2xl">
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
                         <span className="text-[10px] font-bold">৳{merchant.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[9px] text-muted-foreground">Tax Contributed</span>
                         <span className="text-[10px] font-bold text-primary">৳{merchant.taxCollected.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="pt-2 flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-[8px] text-muted-foreground font-mono bg-muted/20 p-1.5 rounded truncate">
                         <Key size={10} className="text-primary" /> API: {merchant.apiKey}
                      </div>
                   </div>
                </CardContent>
                <div className="px-5 py-3 bg-muted/20 border-t border-white/5 flex gap-2">
                   <Button variant="outline" className="flex-1 h-8 text-[9px] font-bold uppercase border-primary/20 hover:bg-primary/10 text-primary rounded-lg">
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
      )}
    </div>
  )
}
