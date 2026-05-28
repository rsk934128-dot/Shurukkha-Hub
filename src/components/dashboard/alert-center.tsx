"use client"

import React, { useState, useEffect } from 'react'
import { Bell, ShieldAlert, Skull, X, Zap, AlertTriangle, Eye, ShieldX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore'

export function AlertCenter() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const q = query(
      collection(db, "suspect_profiles"), 
      orderBy("timestamp", "desc"), 
      limit(5)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAlerts = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isNew: true 
      }));
      setAlerts(newAlerts);
      if (newAlerts.length > 0 && !isOpen) {
        // Simple notification sound or visual indicator logic could go here
      }
    });

    return () => unsubscribe();
  }, [isOpen])

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 shadow-[0_0_20px_rgba(239,68,68,0.5)] border-4 border-background animate-sos-pulse"
        >
          <Bell className="text-white animate-bounce" size={24} />
          <Badge className="absolute -top-1 -right-1 bg-white text-destructive border-destructive px-1.5 h-5 min-w-5 flex items-center justify-center font-bold">
            {alerts.length}
          </Badge>
        </Button>
      ) : (
        <Card className="w-80 border-destructive/30 bg-card/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-10">
          <CardHeader className="bg-destructive/10 border-b border-destructive/20 py-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-headline font-bold text-destructive flex items-center gap-2 uppercase tracking-widest">
              <ShieldAlert size={16} /> IMPERIAL ALERTS
            </CardTitle>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => setIsOpen(false)}>
              <X size={14} />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-3 space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3 bg-destructive/5 border border-destructive/10 rounded-xl space-y-2 group hover:bg-destructive/10 transition-all">
                    <div className="flex justify-between items-start">
                      <Badge variant="destructive" className="text-[7px] h-4 uppercase tracking-widest">
                        {alert.threatLevel} THREAT
                      </Badge>
                      <span className="text-[8px] text-muted-foreground font-mono">
                        {new Date(alert.lastIncident).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skull size={14} className="text-destructive" />
                      <p className="text-[10px] font-mono font-bold text-foreground">
                        {alert.ipAddress}
                      </p>
                    </div>
                    <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                      Captured at: <span className="text-foreground uppercase">{alert.capturedAt}</span>
                    </p>
                    <div className="flex gap-1 pt-1">
                      <Badge variant="outline" className="text-[7px] border-destructive/20 text-destructive bg-destructive/5">
                        <ShieldX size={8} className="mr-1" /> BLACKLISTED
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-white/5 bg-muted/20">
              <Button variant="ghost" className="w-full h-7 text-[8px] uppercase font-bold tracking-[0.2em] text-muted-foreground hover:text-primary">
                VIEW FULL INTELLIGENCE REPORT <Zap size={10} className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
