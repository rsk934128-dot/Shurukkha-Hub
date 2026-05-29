
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useFirestore, useUser } from '@/firebase'
import { collection, query, where, onSnapshot, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { NotificationManager } from '@/lib/notification-manager'
import { CallOverlay } from '@/components/dashboard/call-overlay'
import { Toaster } from '@/components/ui/toaster'
import { AlertCenter } from '@/components/dashboard/alert-center'
import { usePathname } from 'next/navigation'

/**
 * @fileOverview Global Signal Handler.
 * Intercepts calls and messages across the entire application (Landing Page + Dashboard).
 */
export function GlobalSignalHandler() {
  const { user } = useUser()
  const firestore = useFirestore()
  const pathname = usePathname()
  const [activeCall, setActiveCall] = useState<any>(null)
  const lastProcessedMsgId = useRef<string | null>(null)
  const lastProcessedCallId = useRef<string | null>(null)

  useEffect(() => {
    if (!user || !firestore) return;

    // 1. Universal Message Listener
    const msgQuery = query(
      collection(db, "messages"),
      where("recipientId", "==", user.uid),
      limit(1)
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
    });

    // 2. Universal Incoming Call Listener
    const callsQ = query(
      collection(db, 'webrtc_sessions'),
      where('recipientId', '==', user.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribeCalls = onSnapshot(callsQ, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !activeCall) {
          const data = change.doc.data();
          if (lastProcessedCallId.current === change.doc.id) return;

          setActiveCall({
            sessionId: change.doc.id,
            callerId: data.callerId,
            callerName: data.callerName,
            callerAvatar: data.callerAvatar,
            type: data.type,
            isIncoming: true
          });
          
          NotificationManager.sendCallNotification(
            data.callerName || "অজ্ঞাত নাগরিক",
            data.type === 'video' ? "ভিডিও কল দিচ্ছেন..." : "অডিও কল দিচ্ছেন...",
            change.doc.id
          );
          
          lastProcessedCallId.current = change.doc.id;
        }
      });
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeCalls();
    };
  }, [user, firestore, activeCall]);

  // Handle call acceptance from notification (simulated via postMessage from SW)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === 'ACCEPT_CALL_FROM_NOTIFICATION') {
        // The CallOverlay is already rendering due to the Firestore listener
        // This just ensures the UI is prominent
        console.log("[Signal] Call accepted from background notification.");
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <CallOverlay callData={activeCall} onClose={() => setActiveCall(null)} />
      <AlertCenter />
      <Toaster />
    </>
  )
}
