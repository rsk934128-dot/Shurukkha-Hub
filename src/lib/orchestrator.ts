
/**
 * @fileOverview Autonomous Orchestrator for Shurukkha Hub.
 * Coordinates between SOS triggers, AI flows, and the Dispatcher console.
 * Includes hardening and fail-safe logic for mission-critical reliability.
 */

import { db } from './firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, arrayUnion, addDoc, serverTimestamp } from 'firebase/firestore';
import { suggestResponder } from '@/ai/flows/suggest-responder-flow';
import { IntegrationBridge } from './integration-bridge';

const MOCK_RESPONDERS = [
  { id: 'r1', name: "সদর থানা টিম এ", type: "Police", location: "সিরাজগঞ্জ বাজার", status: "available" },
  { id: 'r2', name: "ফায়ার সার্ভিস ইউনিট ১", type: "Fire", location: "স্টেশন রোড", status: "available" },
  { id: 'r3', name: "রেড ক্রিসেন্ট ভলান্টিয়ার", type: "Volunteer", location: "সিরাজগঞ্জ কলেজ", status: "available" },
];

export class AutonomousOrchestrator {
  private static isAutoMode = false;

  static setAutoMode(enabled: boolean) {
    this.isAutoMode = enabled;
    console.log(`[Orchestrator] Autonomous Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Start listening for pending SOS alerts to handle them autonomously
   */
  static startMonitoring() {
    const q = query(collection(db, "sos_alerts"), where("status", "==", "pending"));
    
    return onSnapshot(q, async (snapshot) => {
      if (!this.isAutoMode) return;

      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const alert = { id: change.doc.id, ...change.doc.data() } as any;
          // Avoid re-processing if already assigned by some race condition
          if (alert.assignedResponder) continue;
          
          await this.processAlertAutonomously(alert);
        }
      }
    });
  }

  private static async processAlertAutonomously(alert: any) {
    console.log(`[Orchestrator] Autonomously processing alert: ${alert.id}`);
    
    try {
      // 1. Trigger AI Analysis
      // Hardening: Wrap AI call in a timeout or error boundary
      const recommendation = await suggestResponder({
        sosType: alert.type || "Emergency",
        location: alert.location || "Unknown",
        availableResponders: MOCK_RESPONDERS.map(r => ({ ...r, type: r.type as any }))
      });

      if (!recommendation || !recommendation.recommendedResponderId) {
        throw new Error("Invalid AI Recommendation");
      }

      const responder = MOCK_RESPONDERS.find(r => r.id === recommendation.recommendedResponderId);
      const note = `[AUTONOMOUS DISPATCH] ${recommendation.reasoning}. ${responder?.name} কে পাঠানো হয়েছে।`;

      // 2. Self-Healing/Auto-Dispatch Action
      const alertRef = doc(db, "sos_alerts", alert.id);
      await updateDoc(alertRef, {
        status: 'dispatched',
        assignedResponder: recommendation.recommendedResponderId,
        timeline: arrayUnion({
          status: 'dispatched',
          note: note,
          timestamp: new Date().toISOString(),
          automated: true
        })
      });

      // 3. Log Audit Trail
      await addDoc(collection(db, "audit_trails"), {
        action: 'AUTONOMOUS_DISPATCH_TRIGGERED',
        details: { alertId: alert.id, responderId: recommendation.recommendedResponderId, priority: recommendation.priority },
        timestamp: serverTimestamp(),
        performedBy: 'autonomous_orchestrator_v1'
      });

      // 4. Broadcast via Integration Bridge
      IntegrationBridge.broadcastEvent({
        type: 'STATUS_UPDATED',
        payload: { alertId: alert.id, status: 'dispatched', responder: responder?.name },
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("[Orchestrator] Autonomous processing failed. Falling back to MANUAL.", error);
      
      // FAIL-SAFE: Revert to manual status or add a warning note
      try {
        const alertRef = doc(db, "sos_alerts", alert.id);
        await updateDoc(alertRef, {
          timeline: arrayUnion({
            status: 'pending',
            note: `[SYSTEM WARNING] Autonomous dispatch failed: ${error.message}. Manual intervention required.`,
            timestamp: new Date().toISOString(),
            automated: true,
            isError: true
          })
        });
      } catch (innerError) {
        console.error("Fail-safe logging failed", innerError);
      }
    }
  }
}
