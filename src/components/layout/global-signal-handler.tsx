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
    const callsQ = query(
      sessionsRef,
      where('status', '==', 'ringing'),
      limit(5)
    );

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const sessionId = doc.id;
        
        // Identity Matching: Must be the recipient or the caller
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;

        // Skip if already processed or terminated
        if (processedCallIds.current.has(sessionId)) return;

        // Time-Fence: Ignore sessions created 20 seconds before page load to prevent "Ghost Calls"
        const sessionTime = data.timestamp?.toMillis?.() || data.timestamp?.seconds * 1000 || Date.now();
        if (sessionTime < appMountTime.current - 20000) return;

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
          
          NotificationManager.sendCallNotification(
            data.callerName || "অজ্ঞাত নাগরিক",
            data.type === 'video' ? "ভিডিও কল দিচ্ছেন..." : "অডিও কল দিচ্ছেন...",
            sessionId
          );
        } else if (!activeCall && isCaller && !processedCallIds.current.has(sessionId)) {
          // Outgoing call display setup
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

      // Remote termination tracking
      if (activeCall) {
        const currentDoc = snapshot.docs.find(d => d.id === activeCall.sessionId);
        if (currentDoc && currentDoc.data().status === 'ended') {
          console.log("[Signal Hub] Termination signal synced from remote.");
          processedCallIds.current.add(activeCall.sessionId);
          setActiveCall(null);
        } else if (!currentDoc && !snapshot.metadata.fromCache) {
          // If document is missing and we are online, it means it was purged
          // We don't immediately nullify to avoid UI flickering during minor sync delays
        }
      }
    });

    return () => unsubscribeCalls();
  }, [currentUser, firestore, activeCall, authLoading]);

  // Audio Routing Sensor for call privacy
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
        SovereignAudit.logMilestone('PHASE_35.0_CALLING', 'Locked-Identity Protocol engaged.');
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
        <CallOverlay 
          callData={activeCall} 
          onClose={() => {
            if (activeCall) {
              processedCallIds.current.add(activeCall.sessionId);
              setActiveCall(null);
            }
          }} 
        />
      )}
      <AlertCenter />
      <Toaster />
    </>
  )
}
