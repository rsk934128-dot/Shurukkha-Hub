"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useFirestore, useUser } from '@/firebase'
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { NotificationManager } from '@/lib/notification-manager'
import { CallOverlay } from '@/components/dashboard/call-overlay'
import { Toaster } from '@/components/ui/toaster'
import { AlertCenter } from '@/components/dashboard/alert-center'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { AVController } from '@/lib/av-controller'
import { SovereignAudit } from '@/lib/sovereign-audit'

export function GlobalSignalHandler() {
  const { user: currentUser, loading: authLoading } = useUser()
  const firestore = useFirestore()
  const [activeCall, setActiveCall] = useState<any>(null)
  
  const lastProcessedCallId = useRef<string | null>(null)
  const terminatedCallIds = useRef<Set<string>>(new Set())
  const appMountTime = useRef<number>(Date.now())
  const sensorLogged = useRef(false)

  // Listen for calls
  useEffect(() => {
    if (!currentUser || !firestore || authLoading) return;

    console.log(`[Signal Hub] Sovereign Monitor Active for: ${currentUser.uid}`);

    const sessionsRef = collection(db, 'webrtc_sessions');
    // Broad query for any ringing session
    const callsQ = query(
      sessionsRef,
      where('status', '==', 'ringing'),
      limit(10)
    );

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const sessionId = doc.id;
        
        // Filter: Must be a participant
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;

        // Filter: Ignore already terminated or processed IDs
        if (terminatedCallIds.current.has(sessionId) || lastProcessedCallId.current === sessionId) return;

        // Filter: Time-Fence (ignore calls older than 30s before mount)
        const rawTimestamp = data.timestamp;
        const sessionTime = rawTimestamp?.toMillis?.() || rawTimestamp?.seconds * 1000 || Date.now();
        if (sessionTime < appMountTime.current - 30000) return;

        if (!activeCall) {
          console.warn(`[Signal Hub] ALERT: Valid Call Signal Detected! ID: ${sessionId}`);
          
          setActiveCall({
            sessionId,
            callerId: data.callerId,
            callerName: isRecipient ? data.callerName : data.recipientName,
            callerAvatar: isRecipient ? data.callerAvatar : data.recipientAvatar,
            type: data.type,
            isIncoming: isRecipient
          });
          
          if (isRecipient) {
            NotificationManager.sendCallNotification(
              data.callerName || "অজ্ঞাত নাগরিক",
              data.type === 'video' ? "ভিডিও কল দিচ্ছেন..." : "অডিও কল দিচ্ছেন...",
              sessionId
            );
          }
          lastProcessedCallId.current = sessionId;
        }
      });

      // Handle remote termination
      if (activeCall) {
        const sessionDoc = snapshot.docs.find(d => d.id === activeCall.sessionId);
        if (sessionDoc && sessionDoc.data().status === 'ended' && !terminatedCallIds.current.has(activeCall.sessionId)) {
          console.log("[Signal Hub] Termination Signal Sync.");
          terminatedCallIds.current.add(activeCall.sessionId);
          setActiveCall(null);
        } else if (!sessionDoc && !terminatedCallIds.current.has(activeCall.sessionId)) {
          // Document deleted from server
          setActiveCall(null);
        }
      }
    });

    return () => unsubscribeCalls();
  }, [currentUser, firestore, activeCall, authLoading]);

  // Audio Routing Sensor
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
        SovereignAudit.logMilestone('PHASE_31.5_AV_UPGRADE', 'Sensor-Aware Calling engaged.');
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
              terminatedCallIds.current.add(activeCall.sessionId);
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
