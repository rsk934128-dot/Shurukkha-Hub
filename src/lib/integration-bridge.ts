/**
 * @fileOverview Integration Bridge for Shurukkha Hub.
 * Manages API connectivity and outbound webhook events for third-party apps.
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

export interface IntegrationEvent {
  type: 'SOS_TRIGGERED' | 'STATUS_UPDATED' | 'FLOOD_ALERT' | 'ORCHESTRATION_EVENT';
  payload: any;
  timestamp: string;
}

export const IntegrationBridge = {
  /**
   * Register a third-party application
   */
  registerApp: async (appName: string, webhookUrl: string, events: string[]) => {
    const apiKey = 'sk_' + Math.random().toString(36).substr(2, 16);
    const appData = {
      appName,
      apiKey,
      webhookUrl,
      status: 'active',
      subscribedEvents: events,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "integrations"), appData);
    return { id: docRef.id, apiKey };
  },

  /**
   * Broadcast an event to all subscribed webhooks
   */
  broadcastEvent: async (event: IntegrationEvent) => {
    console.log(`[Integration Bridge] Broadcasting event: ${event.type}`);
    
    try {
      const q = query(collection(db, "integrations"), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      
      snapshot.forEach(doc => {
        const app = doc.data();
        if (app.subscribedEvents.includes(event.type)) {
          // Mocking the webhook POST request
          console.log(`[Webhook Push] Sending to ${app.appName} (${app.webhookUrl}):`, event.payload);
        }
      });

      // Log to audit trails
      await addDoc(collection(db, "audit_trails"), {
        action: event.type,
        details: event.payload,
        timestamp: serverTimestamp(),
        performedBy: 'system_bridge'
      });
    } catch (e) {
      console.error("Broadcast failed", e);
    }
  }
};
