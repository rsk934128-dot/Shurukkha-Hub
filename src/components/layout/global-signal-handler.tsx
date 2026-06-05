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
  const sensorLogged = useRef(false)
  // Record the time when the handler was mounted to filter out old calls
  const mountTime = useRef<number>(Date.now())

  useEffect(() => {
    if (!currentUser || !firestore || authLoading) return;

    console.log(`[Imperial Signal Hub] Sovereign Monitor ACTIVE for: ${currentUser.displayName || currentUser.email}`);

    // High-availability query for WebRTC sessions
    const sessionsRef = collection(db, 'webrtc_sessions');
    const callsQ = query(sessionsRef, limit(20));

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Client-side sort: Ensure latest activity is processed
      docs.sort((a, b) => {
        const timeA = a.timestamp?.toMillis?.() || a.timestamp?.seconds * 1000 || Date.now();
        const timeB = b.timestamp?.toMillis?.() || b.timestamp?.seconds * 1000 || Date.now();
        return timeB - timeA;
      });

      docs.forEach((data) => {
        const sessionId = data.id;
        
        // 1. If the call is already marked as ended, just clean up if it's currently showing
        if (data.status === 'ended') {
          if (activeCall?.sessionId === sessionId) {
             console.log(`[Signal Hub] Terminating UI for Session: ${sessionId}`);
             setActiveCall(null);
          }
          processedCallIds.current.add(sessionId);
          return;
        }

        // 2. Security Check: Only process calls that were created AFTER the app was opened
        // This prevents old "ringing" sessions from 1 hour ago from popping up automatically.
        const callTime = data.timestamp?.toMillis?.() || data.timestamp?.seconds * 1000 || 0;
        // If the callTime is 0 or significantly before mountTime, ignore it.
        // We allow a 5-second buffer for server-client clock sync drift.
        if (callTime > 0 && callTime < mountTime.current - 5000) {
          processedCallIds.current.add(sessionId);
          return;
        }
        
        const isRecipient = data.recipientId === currentUser.uid;
        const isCaller = data.callerId === currentUser.uid;
        
        if (!isRecipient && !isCaller) return;
        if (processedCallIds.current.has(sessionId)) return;

        // 3. Trigger Call HUD if status is strictly 'ringing'
        if (data.status === 'ringing') {
          if (!activeCall) {
            console.warn(`[Signal Hub] NEW SOVEREIGN SIGNAL DETECTED: ${sessionId}`);
            
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
        <div className="fixed inset-0 z-[10000] pointer-events-auto overflow-hidden">
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
