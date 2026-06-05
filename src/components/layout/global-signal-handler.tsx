
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useFirestore, useUser } from '@/firebase'
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { NotificationManager } from '@/lib/notification-manager'
import { CallOverlay } from '@/components/dashboard/call-overlay'
import { Toaster } from '@/components/ui/toaster'
import { AlertCenter } from '@/components/dashboard/alert-center'
import { usePathname } from 'next/navigation'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { AVController } from '@/lib/av-controller'
import { SovereignAudit } from '@/lib/sovereign-audit'

export function GlobalSignalHandler() {
  const { user } = useUser()
  const firestore = useFirestore()
  const [activeCall, setActiveCall] = useState<any>(null)
  const lastProcessedMsgId = useRef<string | null>(null)
  const lastProcessedCallId = useRef<string | null>(null)
  const terminatedCallIds = useRef<Set<string>>(new Set())
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
    if (!user || !firestore) return;

    // Messaging Listener - Filtered for User
    const messagesRef = collection(db, "messages");
    const msgQuery = query(
      messagesRef,
      where("recipientId", "==", user.uid),
      limit(10)
    );

    const unsubscribeMsgs = onSnapshot(msgQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data.senderId !== user.uid && lastProcessedMsgId.current !== change.doc.id) {
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

    // WebRTC Signaling Listener - Improved Filtering and State Locking
    const sessionsRef = collection(db, 'webrtc_sessions');
    const callsQ = query(
      sessionsRef,
      where('status', 'in', ['ringing', 'connected', 'ended']),
      limit(50)
    );

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const isRecipient = data.recipientId === user.uid;
        const isCaller = data.callerId === user.uid;
        
        if (isRecipient || isCaller) {
          const sessionId = doc.id;

          // Critical Protection: Prevent multiple overlays for the same active or terminated session
          if (data.status === 'ringing' && !activeCall && lastProcessedCallId.current !== sessionId && !terminatedCallIds.current.has(sessionId)) {
            console.log(`[Signal Bridge] Call Detected: ${sessionId} | Role: ${isRecipient ? 'Recipient' : 'Caller'}`);
            
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
          
          // Remote termination logic
          else if (data.status === 'ended' && (activeCall?.sessionId === sessionId || lastProcessedCallId.current === sessionId)) {
            if (!terminatedCallIds.current.has(sessionId)) {
              console.log(`[Signal Bridge] Remote termination signal for ${sessionId}.`);
              terminatedCallIds.current.add(sessionId);
              setActiveCall(null);
            }
          }
        }
      });

      // Cleanup local state if doc is purged from grid
      if (activeCall) {
        const activeDoc = snapshot.docs.find(d => d.id === activeCall.sessionId);
        if (!activeDoc && !terminatedCallIds.current.has(activeCall.sessionId)) {
          console.log("[Signal Bridge] Active session doc purged from grid.");
          terminatedCallIds.current.add(activeCall.sessionId);
          setActiveCall(null);
        }
      }
    }, async (err) => {
      if (err.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: '/webrtc_sessions',
          operation: 'list'
        }));
      }
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeCalls();
    };
  }, [user, firestore, activeCall]);

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
