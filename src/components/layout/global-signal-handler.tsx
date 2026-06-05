"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useFirestore, useUser } from '@/firebase'
import { collection, query, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { NotificationManager } from '@/lib/notification-manager'
import { CallOverlay } from '@/components/dashboard/call-overlay'
import { Toaster } from '@/components/ui/toaster'
import { AlertCenter } from '@/components/dashboard/alert-center'
import { AVController } from '@/lib/av-controller'
import { SovereignAudit } from '@/lib/sovereign-audit'
import { MobileBridge } from '@/lib/mobile-bridge'

export function GlobalSignalHandler() {
  const { user: currentUser, loading: authLoading } = useUser()
  const firestore = useFirestore()
  const [activeCall, setActiveCall] = useState<any>(null)
  
  const processedCallIds = useRef<Set<string>>(new Set())
  const appMountTime = useRef<number>(Date.now())
  const sensorLogged = useRef(false)

  useEffect(() => {
    if (!currentUser || !firestore || authLoading) return;

    console.log(`[Signal Hub] Sovereign Monitor Active for UID: ${currentUser.uid}`);

    // Simplify query to the absolute minimum to avoid Index Errors
    const sessionsRef = collection(db, 'webrtc_sessions');
    const callsQ = query(sessionsRef, limit(10));

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Sort client-side to ensure newest first
      docs.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds * 1000 || 0;
        const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds * 1000 || 0;
        return timeB - timeA;
      });

      docs.forEach((data) => {
        const sessionId = data.id;
        
        // Skip ended calls or calls where current user is not involved
        if (data.status === 'ended') return;
        
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;
        if (processedCallIds.current.has(sessionId)) return;

        // Ensure we only process recent "ringing" calls
        if (data.status === 'ringing') {
          const sessionTime = data.timestamp?.toMillis?.() || data.timestamp?.seconds * 1000 || Date.now();
          // Be more lenient with timing in the prototype
          if (sessionTime < appMountTime.current - 120000) return; 

          if (!activeCall) {
            console.warn(`[Signal Hub] SIGNAL DETECTED: ${sessionId} | Incoming: ${isRecipient}`);
            
            setActiveCall({
              sessionId,
              callerId: isRecipient ? data.callerId : data.recipientId,
              callerName: isRecipient ? (data.callerName || "অজ্ঞাত নাগরিক") : (data.recipientName || "Recipient"),
              callerAvatar: isRecipient ? data.callerAvatar : data.recipientAvatar,
              type: data.type,
              isIncoming: isRecipient
            });
            
            if (isRecipient) {
              MobileBridge.vibrate([500, 200, 500]);
              NotificationManager.sendCallNotification(
                data.callerName || "অজ্ঞাত নাগরিক",
                data.type === 'video' ? "ভিডিও কল দিচ্ছেন..." : "অডিও কল দিচ্ছেন...",
                sessionId
              );
            }
          }
        }
      });
    }, (err) => {
      console.error("[Signal Hub] Snapshot Error:", err);
    });

    return () => unsubscribeCalls();
  }, [currentUser, firestore, activeCall, authLoading]);

  useEffect(() => {
    if (!activeCall) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity;
      if (accel && accel.z && accel.z > 8) {
        AVController.setAudioRoute('earpiece');
      } else {
        AVController.setAudioRoute('speaker');
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      if (!sensorLogged.current) {
        SovereignAudit.logMilestone('PHASE_35.5_CALLING', 'Locked-Identity Protocol engaged with Mobile Bridge.');
        sensorLogged.current = true;
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [activeCall]);

  return (
    <>
      {activeCall && (
        <div className="fixed inset-0 z-[9999] pointer-events-auto">
          <CallOverlay 
            callData={activeCall} 
            onClose={() => {
              if (activeCall) {
                processedCallIds.current.add(activeCall.sessionId);
                setActiveCall(null);
              }
            }} 
          />
        </div>
      )}
      <AlertCenter />
      <Toaster />
    </>
  )
}
