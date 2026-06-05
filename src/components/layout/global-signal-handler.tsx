"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useFirestore, useUser } from '@/firebase'
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore'
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

    const sessionsRef = collection(db, 'webrtc_sessions');
    // Enhanced query: Listen for all ringing calls involving the user, ordered by newest first
    const callsQ = query(
      sessionsRef,
      where('status', '==', 'ringing'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const sessionId = doc.id;
        
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;
        if (processedCallIds.current.has(sessionId)) return;

        // Skip very old calls (from previous sessions) but be more lenient
        const sessionTime = data.timestamp?.toMillis?.() || data.timestamp?.seconds * 1000 || Date.now();
        if (sessionTime < appMountTime.current - 60000) return; // 1 min buffer

        if (!activeCall && isRecipient) {
          console.warn(`[Signal Hub] ALERT: Incoming Signal Detected! ID: ${sessionId}`);
          
          setActiveCall({
            sessionId,
            callerId: data.callerId,
            callerName: data.callerName || "অজ্ঞাত নাগরিক",
            callerAvatar: data.callerAvatar || '',
            type: data.type,
            isIncoming: true
          });
          
          MobileBridge.vibrate([500, 200, 500]);
          
          NotificationManager.sendCallNotification(
            data.callerName || "অজ্ঞাত নাগরিক",
            data.type === 'video' ? "ভিডিও কল দিচ্ছেন..." : "অডিও কল দিচ্ছেন...",
            sessionId
          );
        } else if (!activeCall && isCaller) {
          console.log(`[Signal Hub] Initiating Outbound UI for Session: ${sessionId}`);
          setActiveCall({
            sessionId,
            callerId: data.recipientId,
            callerName: data.recipientName || "Recipient",
            callerAvatar: data.recipientAvatar || '',
            type: data.type,
            isIncoming: false
          });
        }
      });

      // If active call is no longer in 'ringing' status and we haven't transitioned to 'connected' internally,
      // it means the call might have been ended by the other side before it even started.
      if (activeCall) {
        const currentDoc = snapshot.docs.find(d => d.id === activeCall.sessionId);
        // Note: transitions to 'connected' are handled inside CallOverlay
      }
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
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
