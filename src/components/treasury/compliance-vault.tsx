
"use client"

import React from 'react'
import { ShieldCheck, Landmark, Globe, Key, CreditCard, Zap, CheckCircle2, User, MapPin, FileText, Wallet, Network, Activity, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function ComplianceVault() {
  const complianceData = {
    entityName: 'Rubelpay',
    registrationNo: '2200882501903677',
    status: 'L1 Verified',
    establishmentDate: '06/11/2025',
    ubo: 'Farid Sheikh',
    walletAddress: '0xaf3c724065016dfe4458c05140fa4cbb40131207',
    network: 'BNB Smart Chain (BEP20)',
    settlementType: 'CRYPTO (USDT)',
    settlementCycle: 'T1'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Status Card */}
        <Card className="bg-accent/5 border-accent/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
             <ShieldCheck size={80} className="text-accent" />
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Badge className="bg-accent text-background font-bold uppercase text-[8px] tracking-widest">Certification Level</Badge>
              <h3 className="text-2xl font-headline font-bold text-accent">{complianceData.status}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
               <CheckCircle2 size={16} className="text-accent" /> Enterprise Identity Verified
            </div>
            <Progress value={100} className="h-1 bg-white/5 [&>div]:bg-accent" />
            <p className="text-[10px] text-muted-foreground italic">আপনার এনটিটি এখন অটোনোমাস সেটলমেন্টের জন্য সম্পূর্ণ অনুমোদিত।</p>
          </CardContent>
        </Card>

        {/* Settlement Info Card */}
        <Card className="bg-primary/5 border-primary/20 col-span-2">
          <CardHeader className="py-4 border-b border-white/5">
            <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Network size={16} /> Crypto Settlement Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-[8px] uppercase font-bold text-muted-foreground">Default Wallet (USDT)</p>
                   <code className="text-[10px] font-mono text-foreground bg-black/40 p-2 rounded block truncate border border-white/5">
                      {complianceData.walletAddress}
                   </code>
                </div>
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-[8px] uppercase font-bold text-muted-foreground">Network</p>
                      <p className="text-xs font-bold text-primary">{complianceData.network}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] uppercase font-bold text-muted-foreground">Cycle</p>
                      <p className="text-xs font-bold text-accent">{complianceData.settlementCycle} Rapid</p>
                   </div>
                </div>
             </div>
             <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex flex-col justify-center gap-3">
                <div className="flex justify-between text-[10px]">
                   <span className="text-muted-foreground">Settlement Type:</span>
                   <span className="font-bold text-accent">{complianceData.settlementType}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                   <span className="text-muted-foreground">Method:</span>
                   <span className="font-bold text-foreground">MANUAL_WITHDRAW</span>
                </div>
                <Button variant="outline" className="h-8 text-[9px] font-bold uppercase tracking-widest border-accent/20 text-accent hover:bg-accent/10 w-full mt-2">
                   <ArrowUpRight size={12} className="mr-1" /> Withdraw to Wallet
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Entity Details */}
      <Card className="bg-card/40 border-white/5 overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-white/5 py-4">
          <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
            <FileText size={16} className="text-primary" /> Corporate Identity Profile (KYB)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
             <div className="p-6 space-y-4">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest">Company Details</h4>
                <div className="space-y-3">
                   <DetailRow label="Legal Name" val={complianceData.entityName} icon={Landmark} />
                   <DetailRow label="Registration No" val={complianceData.registrationNo} icon={Key} />
                   <DetailRow label="Incorporation" val={complianceData.establishmentDate} icon={Activity} />
                   <DetailRow label="Headquarters" val="Sirajganj, Bangladesh" icon={MapPin} />
                </div>
             </div>
             <div className="p-6 space-y-4">
                <h4 className="text-[10px] font-bold text-accent uppercase tracking-widest">Owners & Partners</h4>
                <div className="space-y-3">
                   <DetailRow label="UBO & Director" val={complianceData.ubo} icon={User} />
                   <DetailRow label="Email" val="rsk755734@gmail.com" icon={Globe} />
                   <DetailRow label="Industry" val="Digital Financial Services" icon={Zap} />
                   <DetailRow label="Website" val="expert-option--sf534732.replit.app" icon={Globe} isLink />
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl flex items-center gap-4">
        <ShieldCheck className="text-accent shrink-0" size={24} />
        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
          "মহামান্য সম্রাট, আপনার এই 'Rubelpay' এনটিটি এখন গবেষণামূলকভাবে স্বীকৃত। প্রতিটি ট্রানজেকশন এখন সরাসরি আপনার ক্রিপ্টো ভল্টে সেটল হওয়ার জন্য প্রস্তুত।"
        </p>
      </div>
    </div>
  )
}

function DetailRow({ label, val, icon: Icon, isLink = false }: any) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          <Icon size={14} />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground uppercase">{label}</span>
      </div>
      <span className={`text-xs font-medium ${isLink ? 'text-primary hover:underline cursor-pointer' : 'text-foreground'}`}>{val}</span>
    </div>
  )
}
