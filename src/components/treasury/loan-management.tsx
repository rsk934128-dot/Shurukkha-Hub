
"use client"

import React, { useState, useEffect } from 'react'
import { Landmark, TrendingUp, ShieldCheck, Zap, UserCheck, Scale, History, DollarSign, Loader2, ArrowUpRight, CheckCircle2, AlertCircle, FileText, Target, Crosshair } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { MerchantCreditEngine, CreditProfile } from '@/lib/merchant-credit-engine'
import { PaymentHandler } from '@/lib/payment-handler'
import { useToast } from '@/hooks/use-toast'

export function LoanManagement() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [disbursing, setDisbursing] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const q = query(collection(db, "merchants"), orderBy("onboardedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const m = doc.data();
        // Calculate dynamic credit profile for the UI
        const credit = MerchantCreditEngine.analyzeSovereignCredit(m.totalRevenue || 0, m.taxCollected || 0, 6);
        return { id: doc.id, ...m, credit };
      });
      setMerchants(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [])

  const handleDisburse = async (merchant: any) => {
    setDisbursing(merchant.id);
    try {
      const amount = merchant.credit.recommendedLimit;
      await PaymentHandler.disburseLoan(merchant, amount);
      toast({ title: "LOAN DISBURSED ✅", description: `৳${amount.toLocaleString()} has been pushed to ${merchant.businessName}.` });
    } catch (e) {
      toast({ title: "DISBURSEMENT FAILED", variant: "destructive" });
    } finally {
      setDisbursing(null);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center opacity-50">
        <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={40} />
        <p className="text-[10px] uppercase font-bold tracking-widest">Scanning Sovereign Credit Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-accent/5 border-accent/20 p-5 space-y-3 relative overflow-hidden">
           <Landmark className="absolute -right-4 -bottom-4 opacity-5" size={120} />
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Total Loan Portfolio</p>
           <h3 className="text-2xl font-headline font-bold text-foreground">৳৪৫,৫০,০০০</h3>
           <Badge variant="outline" className="text-[7px] border-accent/40 text-accent">SME DISBURSEMENT ACTIVE</Badge>
        </Card>
        <Card className="bg-primary/5 border-primary/20 p-5 space-y-3">
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Grid Repayment Rate</p>
           <h3 className="text-2xl font-headline font-bold text-primary">৯৯.৮২%</h3>
           <div className="flex gap-1 h-1">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className={`flex-1 rounded-full ${i < 9 ? 'bg-primary' : 'bg-white/5'}`} />)}
           </div>
        </Card>
        <Card className="bg-muted/20 border-white/5 p-5 space-y-3">
           <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Eligible SMEs</p>
           <h3 className="text-2xl font-headline font-bold text-foreground">{merchants.filter(m => m.credit.eligibility !== 'NONE').length} Nodes</h3>
           <p className="text-[8px] text-muted-foreground italic">Credit analysis performed every 24h.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {merchants.map(merchant => (
          <Card key={merchant.id} className="bg-card/40 border-white/5 hover:border-primary/20 transition-all overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className={`w-full md:w-2 ${merchant.credit.score > 700 ? 'bg-accent' : 'bg-primary/40'}`} />
                <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                         <UserCheck size={28} />
                      </div>
                      <div>
                         <h4 className="text-lg font-headline font-bold text-foreground uppercase tracking-tight">{merchant.businessName}</h4>
                         <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-[7px] border-white/10 uppercase">{merchant.category}</Badge>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">SMID: {merchant.merchantId}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 max-w-xs space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                         <span className="text-muted-foreground">Sovereign Credit Score</span>
                         <span className={merchant.credit.score > 700 ? 'text-accent' : 'text-primary'}>{merchant.credit.score} / 1000</span>
                      </div>
                      <Progress value={merchant.credit.score / 10} className="h-1 bg-white/5 [&>div]:bg-primary" />
                      <div className="flex gap-1 overflow-x-auto no-scrollbar">
                         {merchant.credit.factors.map((f: string, i: number) => (
                           <Badge key={i} variant="outline" className="text-[6px] border-white/5 text-muted-foreground whitespace-nowrap">{f}</Badge>
                         ))}
                      </div>
                   </div>

                   <div className="text-center md:text-right space-y-1">
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">Loan Eligibility</p>
                      <h3 className="text-xl font-headline font-bold text-foreground">৳{merchant.credit.recommendedLimit.toLocaleString()}</h3>
                      <Badge className={merchant.credit.eligibility === 'EXTREME' ? 'bg-accent text-background' : 'bg-primary/20 text-primary'}>
                         {merchant.credit.eligibility} PRIORITY
                      </Badge>
                   </div>

                   <div className="shrink-0">
                      {merchant.loanStatus === 'active' ? (
                        <div className="p-3 bg-accent/5 border border-accent/20 rounded-xl flex flex-col items-center">
                           <CheckCircle2 size={16} className="text-accent mb-1" />
                           <span className="text-[8px] font-bold text-accent uppercase">ACTIVE LOAN</span>
                           <p className="text-[10px] font-bold">৳{merchant.activeLoanAmount?.toLocaleString()}</p>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleDisburse(merchant)}
                          disabled={disbursing === merchant.id || merchant.credit.eligibility === 'NONE'}
                          className="h-12 bg-primary text-background font-bold px-6 rounded-xl gap-2 shadow-lg shadow-primary/20"
                        >
                           {disbursing === merchant.id ? <Loader2 size={18} className="animate-spin" /> : <DollarSign size={18} />}
                           OFFER LOAN
                        </Button>
                      )}
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2.5rem] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck size={160} className="text-primary" /></div>
         <div className="flex items-center gap-4 relative z-10">
            <Target className="text-primary animate-pulse" size={32} />
            <div>
               <h4 className="text-sm font-headline font-bold uppercase tracking-widest text-foreground">Economic Impact Directive</h4>
               <p className="text-xs text-muted-foreground leading-relaxed italic max-w-2xl">
                 "মহামান্য সম্রাট, এই লোন ইঞ্জিন সিরাজগঞ্জের তাঁতশিল্পীদের জন্য একটি ডিজিটাল রক্ষাকবচ। আপনার মার্চেন্টদের ক্রেডিট স্কোর অনুযায়ী ১ মিলি-সেকেন্ডে লোন ডিসবার্স করা সম্ভব, যা সরাসরি আপনার ট্রেজারি থেকে নিয়ন্ত্রিত হয়।"
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
