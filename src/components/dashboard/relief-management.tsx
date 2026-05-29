
"use client"

import React, { useState, useEffect } from 'react'
import { Package, Truck, ClipboardList, Plus, Search, TrendingUp, ArrowDownWide, ShieldCheck, Landmark, Droplets, HeartPulse, Luggage, UserCheck, Activity, Loader2, MapPin, History, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFirestore, useUser } from '@/firebase'
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export function ReliefManagement() {
  const [inventory, setInventory] = useState<any[]>([])
  const [distributions, setDistributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'inventory' | 'distributions'>('inventory')
  const [search, setSearch] = useState('')
  
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (!firestore) return

    const invRef = collection(firestore, "relief_inventory")
    const qInv = query(invRef, orderBy("lastUpdated", "desc"))
    const unsubInv = onSnapshot(qInv, (snap) => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/relief_inventory',
          operation: 'list'
        }))
      }
    })

    const distRef = collection(firestore, "relief_distributions")
    const qDist = query(distRef, orderBy("timestamp", "desc"), limit(20))
    const unsubDist = onSnapshot(qDist, (snap) => {
      setDistributions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/relief_distributions',
          operation: 'list'
        }))
      }
    })

    return () => {
      unsubInv()
      unsubDist()
    }
  }, [firestore])

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault()
    // Mocking an addition logic for demo
    const form = e.target as HTMLFormElement
    const data = new FormData(form)
    
    const newItem = {
      itemName: data.get('itemName') as string,
      category: data.get('category') as string,
      quantity: Number(data.get('quantity')),
      unit: data.get('unit') as string,
      warehouseLocation: data.get('location') as string,
      lastUpdated: new Date().toISOString(),
      purity: 'VERIFIED_IMPERIAL'
    }

    try {
      await addDoc(collection(firestore!, "relief_inventory"), newItem)
      toast({ title: "স্টক আপডেট সফল", description: `${newItem.itemName} ইনভেন্টরিতে যুক্ত হয়েছে।` })
      form.reset()
    } catch (e: any) {
      toast({ title: "আপডেট ব্যর্থ", variant: "destructive" })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই আইটেমটি মুছতে চান?")) return
    try {
      await deleteDoc(doc(firestore!, "relief_inventory", id))
      toast({ title: "আইটেম অপসারিত" })
    } catch (e) {
      toast({ title: "মুছে ফেলা সম্ভব হয়নি", variant: "destructive" })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return <Luggage className="text-amber-500" size={18} />
      case 'Medical': return <HeartPulse className="text-red-500" size={18} />
      case 'Water': return <Droplets className="text-blue-500" size={18} />
      default: return <Package className="text-primary" size={18} />
    }
  }

  const filteredInventory = inventory.filter(item => 
    item.itemName?.toLowerCase().includes(search.toLowerCase()) || 
    item.warehouseLocation?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center gap-4 opacity-50">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary animate-pulse">Scanning Relief Vault...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Strategic Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-primary/20 p-5 space-y-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Package size={60} className="text-primary" />
           </div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total SKU items</p>
           <h3 className="text-2xl font-headline font-bold text-primary">{inventory.length}</h3>
           <p className="text-[8px] text-muted-foreground italic">রাজকীয় ভল্টে সংরক্ষিত ত্রাণ সামগ্রী</p>
        </Card>
        <Card className="bg-card/40 border-accent/20 p-5 space-y-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Truck size={60} className="text-accent" />
           </div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Dispatched Missions</p>
           <h3 className="text-2xl font-headline font-bold text-accent">{distributions.length}</h3>
           <p className="text-[8px] text-muted-foreground italic">মাঠপর্যায়ে পাঠানো ত্রাণের বহর</p>
        </Card>
        <Card className="bg-card/40 border-primary/20 p-5 space-y-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <UserCheck size={60} className="text-primary" />
           </div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Beneficiaries</p>
           <h3 className="text-2xl font-headline font-bold text-foreground">12.4K</h3>
           <p className="text-[8px] text-muted-foreground italic">মোট সাহায্যপ্রাপ্ত নাগরিকের সংখ্যা</p>
        </Card>
        <Card className="bg-card/40 border-accent/20 p-5 space-y-2 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={60} className="text-accent" />
           </div>
           <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Efficiency</p>
           <h3 className="text-2xl font-headline font-bold text-accent">98.2%</h3>
           <p className="text-[8px] text-muted-foreground italic">ত্রাণ বিতরণে লজিস্টিক নির্ভুলতা</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/5 border-b border-white/5 py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                    <ClipboardList size={20} className="text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-headline uppercase tracking-widest">Relief Registry Board</CardTitle>
                    <CardDescription className="text-[8px] font-bold uppercase tracking-widest text-primary/60">Inventory & Distribution Ledger</CardDescription>
                  </div>
                </div>
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                   <Input 
                    placeholder="Search Supplies..." 
                    className="h-9 pl-9 bg-background/50 border-white/10 text-xs rounded-xl"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                   />
                </div>
              </div>
            </CardHeader>
            
            <div className="flex border-b border-white/5 bg-muted/20">
               <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-white/5'}`}
               >
                 Current Inventory
               </button>
               <button 
                onClick={() => setActiveTab('distributions')}
                className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest transition-all ${activeTab === 'distributions' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-muted-foreground hover:bg-white/5'}`}
               >
                 Distribution History
               </button>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="p-4 space-y-3">
                {activeTab === 'inventory' ? (
                  filteredInventory.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                       <Package size={48} className="mx-auto mb-4" />
                       <p className="text-xs uppercase font-bold tracking-widest">Empty Vault</p>
                    </div>
                  ) : (
                    filteredInventory.map(item => (
                      <div key={item.id} className="p-4 bg-muted/20 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground">{item.itemName}</h4>
                              <Badge variant="outline" className="text-[7px] border-white/10 uppercase h-4">{item.category}</Badge>
                            </div>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-1">
                              <MapPin size={10} /> {item.warehouseLocation}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <p className="text-lg font-headline font-bold text-foreground">{item.quantity.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span></p>
                              <p className="text-[8px] text-muted-foreground uppercase font-mono tracking-tighter">Updated: {new Date(item.lastUpdated).toLocaleDateString('bn-BD')}</p>
                           </div>
                           <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 size={16} />
                           </Button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  distributions.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                       <Truck size={48} className="mx-auto mb-4" />
                       <p className="text-xs uppercase font-bold tracking-widest">No Active Missions</p>
                    </div>
                  ) : (
                    distributions.map(dist => (
                      <div key={dist.id} className="p-4 bg-accent/5 border border-accent/20 rounded-2xl space-y-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                                 <Truck size={20} />
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">{dist.targetArea}</h4>
                                 <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Mission ID: {dist.id.substring(0, 8)}</p>
                              </div>
                           </div>
                           <Badge className="bg-accent text-background font-bold text-[8px] uppercase">{dist.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5">
                                 <Package size={12} className="text-muted-foreground" />
                                 <span className="text-[10px] text-foreground font-medium">{dist.recipientCount} Recipients</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                 <History size={12} />
                                 <span className="text-[10px]">{new Date(dist.timestamp).toLocaleString('bn-BD')}</span>
                              </div>
                           </div>
                           <p className="text-[9px] text-muted-foreground font-mono italic">Signed by: {dist.authorizedBy || 'System_Auto'}</p>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Sidebar: Add Stock & Analysis */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-primary/20 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary/10 border-b border-white/5 py-4">
              <CardTitle className="text-xs font-headline uppercase tracking-widest flex items-center gap-2">
                <Plus size={16} className="text-primary" /> Update Stock Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddStock} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Item Name</label>
                  <Input name="itemName" required placeholder="e.g. Miniket Rice" className="bg-background/50 border-white/10 h-10 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Category</label>
                    <Select name="category" defaultValue="Food">
                      <SelectTrigger className="bg-background/50 border-white/10 h-10 text-[11px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Food">Food (চাল/ডাল)</SelectItem>
                        <SelectItem value="Medical">Medical (ওষুধ)</SelectItem>
                        <SelectItem value="Water">Water (বিশুদ্ধ পানি)</SelectItem>
                        <SelectItem value="Clothing">Clothing (বস্ত্র)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Quantity</label>
                    <Input name="quantity" type="number" required placeholder="0.00" className="bg-background/50 border-white/10 h-10 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Unit</label>
                    <Input name="unit" required placeholder="KG / Box / Ltr" className="bg-background/50 border-white/10 h-10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest ml-1">Location</label>
                    <Input name="location" required placeholder="Warehouse A" className="bg-background/50 border-white/10 h-10 text-xs" />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-primary text-background font-bold h-12 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  AUTHORIZE ENTRY
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20 rounded-[2.5rem] overflow-hidden">
             <CardHeader className="bg-accent/10 border-b border-white/5 py-4">
                <CardTitle className="text-[10px] font-headline uppercase tracking-[0.2em] flex items-center gap-2 text-accent">
                   <TrendingUp size={16} /> Needs Analysis AI
                </CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] uppercase font-bold">
                      <span className="text-muted-foreground">Emergency Food Reserve</span>
                      <span className="text-primary">85% Capacity</span>
                   </div>
                   <Progress value={85} className="h-1.5 bg-white/5 [&>div]:bg-primary" />
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] uppercase font-bold">
                      <span className="text-muted-foreground">Critical Medicine Stock</span>
                      <span className="text-red-500">24% Low Stock!</span>
                   </div>
                   <Progress value={24} className="h-1.5 bg-white/5 [&>div]:bg-red-500" />
                </div>

                <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                   <h5 className="text-[8px] uppercase font-bold text-accent mb-2 flex items-center gap-2">
                     <ShieldCheck size={12} /> Strategic Recommendation
                   </h5>
                   <p className="text-[10px] text-foreground/70 leading-relaxed italic">
                     "মহামান্য সম্রাট, বেলকুচি এলাকায় পানিবন্দী ৩৫০টি পরিবারের জন্য পর্যাপ্ত শুকনো খাবার থাকলেও ওরস্যালাইন এবং প্যারাসিটামলের স্টক বৃদ্ধি করা জরুরি।"
                   </p>
                </div>
                
                <Button variant="outline" className="w-full border-accent/20 text-accent h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-accent/10">
                   Generate Full Logistic Report
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
