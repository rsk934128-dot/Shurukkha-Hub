/**
 * @fileOverview Autonomous Orchestrator for Shurukkha Hub.
 * Coordinates between SOS triggers, AI flows, and the Dispatcher console.
 * UPDATED Phase 31.0: Adaptive "Iron Logic" for smart responder matching.
 */

import { db } from './firebase';
import { collection, onSnapshot, query, where, updateDoc, doc, arrayUnion, addDoc, serverTimestamp } from 'firebase/firestore';
import { suggestResponder } from '@/ai/flows/suggest-responder-flow';
import { IntegrationBridge } from './integration-bridge';

const MOCK_RESPONDERS = [
  { id: 'r1', name: "সদর থানা টিম এ", type: "Police", location: "সিরাজগঞ্জ বাজার", status: "available", gear: ["First-Aid", "Radio"] },
  { id: 'r2', name: "ফায়ার সার্ভিস ইউনিট ১", type: "Fire", location: "স্টেশন রোড", status: "available", gear: ["Rescue Boat", "Life-Jacket"] },
  { id: 'r3', name: "রেড ক্রিসেন্ট ভলান্টিয়ার", type: "Volunteer", location: "সিরাজগঞ্জ কলেজ", status: "available", gear: ["Dry Food", "Medical Kit"] },
];

export class AutonomousOrchestrator {
  private static isAutoMode = false;

  static setAutoMode(enabled: boolean) {
    this.isAutoMode = enabled;
    console.log(`[Orchestrator] Iron Logic Mode: ${enabled ? 'ACTIVE' : 'INACTIVE'}`);
  }

  static startMonitoring() {
    const q = query(collection(db, "sos_alerts"), where("status", "==", "pending"));
    
    return onSnapshot(q, async (snapshot) => {
      if (!this.isAutoMode) return;

      for (const change of snapshot.docChanges()) {
        if (change.type === "added") {
          const alert = { id: change.doc.id, ...change.doc.data() } as any;
          if (alert.assignedResponder) continue;
          
          await this.processAlertAutonomously(alert);
        }
      }
    });
  }

  private static async processAlertAutonomously(alert: any) {
    console.log(`[Iron Logic] Analyzing SOS ID: ${alert.id}...`);
    
    try {
      const startTime = performance.now();

      // 1. Adaptive AI Dispatch Analysis
      const recommendation = await suggestResponder({
        sosType: alert.type || "Emergency",
        location: alert.location || "Unknown",
        availableResponders: MOCK_RESPONDERS.map(r => ({ ...r, type: r.type as any }))
      });

      if (!recommendation || !recommendation.recommendedResponderId) {
        throw new Error("AI Recommendation Fault");
      }

      const responder = MOCK_RESPONDERS.find(r => r.id === recommendation.recommendedResponderId);
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(3);

      // 2. Imperial Execution
      const alertRef = doc(db, "sos_alerts", alert.id);
      const updatePayload = {
        status: 'dispatched',
        assignedResponder: recommendation.recommendedResponderId,
        timeline: arrayUnion({
          status: 'dispatched',
          note: `[IRON_LOGIC_AUTO] ${recommendation.reasoning}. Dispatch latency: ${executionTime}ms.`,
          timestamp: new Date().toISOString(),
          automated: true,
          purity: 'VERIFIED_IMPERIAL'
        })
      };

      await updateDoc(alertRef, updatePayload);

      // 3. Immutable Forensic Log
      await addDoc(collection(db, "audit_trails"), {
        action: 'AUTONOMOUS_IRON_DISPATCH',
        details: { 
          alertId: alert.id, 
          responderId: recommendation.recommendedResponderId, 
          executionTime: `${executionTime}ms`,
          purity: 'SOVEREIGN_V31'
        },
        signature: IntegrationBridge.generateSignature({ alertId: alert.id, status: 'EXECUTED' }),
        timestamp: serverTimestamp(),
        performedBy: 'Autonomous_Iron_Logic_v31'
      });

      // 4. Global Network Broadcast
      IntegrationBridge.broadcastEvent({
        type: 'STATUS_UPDATED',
        payload: { alertId: alert.id, status: 'dispatched', responder: responder?.name },
        timestamp: new Date().toISOString()
      });

    } catch (error: any) {
      console.error("[Iron Logic] Execution Failed", error);
    }
  }
}