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
  // Initialize user first to avoid ReferenceError
  const { user: currentUser } = useUser()
  const firestore = useFirestore()
  const [activeCall, setActiveCall] = useState<any>(null)
  
  const lastProcessedMsgId = useRef<string | null>(null)
  const lastProcessedCallId = useRef<string | null>(null)
  const terminatedCallIds = useRef<Set<string>>(new Set())
  const appMountTime = useRef<number>(Date.now())
  const sensorLogged = useRef(false);

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
        SovereignAudit.logMilestone('PHASE_31.5_AV_UPGRADE', 'Sensor-Aware Calling and AI Voice Isolation engaged.');
        sensorLogged.current = true;
      }
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [activeCall]);

  useEffect(() => {
    if (!currentUser || !firestore) return;

    console.log(`[Signal Hub] Listening for signals as: ${currentUser.uid}`);

    // Messaging Listener
    const messagesRef = collection(db, "messages");
    const msgQuery = query(
      messagesRef,
      where("recipientId", "==", currentUser.uid),
      limit(10)
    );

    const unsubscribeMsgs = onSnapshot(msgQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.senderId !== currentUser.uid && lastProcessedMsgId.current !== change.doc.id) {
             NotificationManager.sendNotification(
               "নতুন মেসেজ প্রাপ্ত হয়েছে",
               `আপনার পোর্টালে একটি রাজকীয় মেসেজ এসেছে।`,
               'new-msg'
             );
             lastProcessedMsgId.current = change.doc.id;
          }
        }
      });
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/messages',
          operation: 'list'
        }));
      }
    });

    // WebRTC Signaling Listener - Enhanced Recipient Detection
    const sessionsRef = collection(db, 'webrtc_sessions');
    // Listen for any session where user is either caller or recipient
    const callsQ = query(
      sessionsRef,
      where('status', '==', 'ringing'),
      limit(5)
    );

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const sessionId = doc.id;
        
        // Safety check: only process if user is a participant
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;

        const rawTimestamp = data.timestamp;
        const sessionTime = rawTimestamp?.toMillis?.() || rawTimestamp?.seconds * 1000 || Date.now();
        
        // Ignore stale sessions (older than 10s before mount)
        const isStale = rawTimestamp && sessionTime < appMountTime.current - 10000;

        if (data.status === 'ringing' && !isStale && !activeCall && lastProcessedCallId.current !== sessionId && !terminatedCallIds.current.has(sessionId)) {
          console.warn(`[Signal Hub] ALERT: Incoming Signal Detected! ID: ${sessionId}`);
          
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

      // Track remote termination logic
      if (activeCall) {
        const isActuallyEnded = snapshot.docChanges().some(change => 
          change.doc.id === activeCall.sessionId && 
          (change.type === 'removed' || change.doc.data().status === 'ended')
        );

        if (isActuallyEnded && !terminatedCallIds.current.has(activeCall.sessionId)) {
          console.log("[Signal Hub] Call terminated by remote peer.");
          terminatedCallIds.current.add(activeCall.sessionId);
          setActiveCall(null);
        }
      }
    }, (err) => {
      console.error("[Signal Hub] Listener fault:", err);
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeCalls();
    };
  }, [currentUser, firestore, activeCall]);

  return (
    <>
      <CallOverlay 
        callData={activeCall} 
        onClose={() => {
          if (activeCall) {
            terminatedCallIds.current.add(activeCall.sessionId);
            setActiveCall(null);
          }
        }} 
      />
      <AlertCenter />
      <Toaster />
    </>
  )
}
