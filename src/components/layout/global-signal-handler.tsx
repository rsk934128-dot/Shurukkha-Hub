"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useFirestore, useUser } from '@/firebase'
import { collection, query, onSnapshot, limit, where } from 'firebase/firestore'
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
  const sensorLogged = useRef(false)
  const mountTime = useRef<number>(Date.now())

  useEffect(() => {
    if (!currentUser || !firestore || authLoading) return;

    console.log(`[Signal Hub] Sovereign Monitor ACTIVE for: ${currentUser.email}`);

    // High-availability query for WebRTC sessions
    // We remove some filtering to avoid index errors and handle logic client-side
    const sessionsRef = collection(db, 'webrtc_sessions');
    const callsQ = query(sessionsRef, limit(10));

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data() as any;
        const sessionId = change.doc.id;

        // 1. Cleanup logic for ended calls
        if (data.status === 'ended') {
          if (activeCall?.sessionId === sessionId) {
            setActiveCall(null);
          }
          processedCallIds.current.add(sessionId);
          return;
        }

        // 2. Identify if I am part of this call
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;

        // 3. New Signal Logic
        if (data.status === 'ringing') {
          // Prevent re-processing the same call that we already closed or are showing
          if (processedCallIds.current.has(sessionId)) return;
          if (activeCall && activeCall.sessionId === sessionId) return;

          // Time Guard: Only accept calls created near or after mountTime
          const callTime = data.timestamp?.toMillis?.() || data.timestamp?.seconds * 1000 || Date.now();
          if (callTime < mountTime.current - 30000) { // 30 second buffer for old signals
             processedCallIds.current.add(sessionId);
             return;
          }

          console.warn(`[Signal Hub] TRIGGERING CALL UI: ${sessionId}`);
          
          const callPayload = {
            sessionId,
            callerId: isRecipient ? data.callerId : data.recipientId,
            callerName: isRecipient ? (data.callerName || "অজ্ঞাত নাগরিক") : (data.recipientName || "প্রাপক"),
            callerAvatar: isRecipient ? data.callerAvatar : data.recipientAvatar,
            type: data.type,
            isIncoming: isRecipient
          };

          setActiveCall(callPayload);
          
          if (isRecipient) {
            MobileBridge.triggerHaptic('WARNING');
            NotificationManager.sendCallNotification(
              data.callerName || "অজ্ঞাত নাগরিক",
              data.type === 'video' ? "ভিডিও কল দিচ্ছে..." : "অডিও কল দিচ্ছে...",
              sessionId
            );
          }
        }
      });
    }, (err) => {
      console.error("[Signal Hub] Snapshot Error:", err);
    });

    return () => unsubscribeCalls();
  }, [currentUser?.uid, firestore, activeCall, authLoading]);

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
        SovereignAudit.logMilestone('PHASE_35.5_CALLING', 'Locked-Identity Protocol engaged.');
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
