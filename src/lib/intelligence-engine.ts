
/**
 * @fileOverview Adaptive Threat Intelligence Engine.
 * Implements self-learning blacklisting and attacker profiling.
 * Updated: Engages Counter-Intelligence offensive logic.
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, limit } from 'firebase/firestore';
import { SelfHealing } from './self-healing';
import { CounterIntelligence } from './counter-intelligence';

export interface ThreatAnalysis {
  ip: string;
  source: 'gatekeeper' | 'honeypot' | 'deep_inspection';
  violationType: string;
  metadata?: any;
}

export const IntelligenceEngine = {
  /**
   * Logs a threat incident and updates the suspect profile.
   */
  logIncident: async (analysis: ThreatAnalysis) => {
    console.log(`[Intelligence Engine] Processing threat from ${analysis.ip} via ${analysis.source}...`);

    try {
      const suspectsRef = collection(db, "suspect_profiles");
      const q = query(suspectsRef, where("ipAddress", "==", analysis.ip), limit(1));
      const snapshot = await getDocs(q);

      // Engaged Offensive Counter-Intel
      await CounterIntelligence.applyLatencyTrap(analysis.ip);

      // Trigger Self-Healing if threat is from a deep inspection or honeypot
      if (analysis.source === 'honeypot' || analysis.source === 'deep_inspection') {
        SelfHealing.initiateRecovery(analysis.source, analysis.violationType);
      }

      if (snapshot.empty) {
        // Create new profile
        await addDoc(suspectsRef, {
          ipAddress: analysis.ip,
          violationCount: 1,
          threatLevel: analysis.source === 'honeypot' ? 'high' : 'medium',
          lastIncident: new Date().toISOString(),
          capturedAt: analysis.source,
          status: analysis.source === 'honeypot' ? 'blacklisted' : 'monitored',
          metadata: analysis.metadata || {},
          timestamp: serverTimestamp()
        });
      } else {
        // Update existing profile
        const profile = snapshot.docs[0];
        const newViolationCount = (profile.data().violationCount || 0) + 1;
        const newStatus = newViolationCount >= 3 || analysis.source === 'honeypot' ? 'blacklisted' : 'monitored';
        
        await updateDoc(doc(db, "suspect_profiles", profile.id), {
          violationCount: newViolationCount,
          lastIncident: new Date().toISOString(),
          threatLevel: newViolationCount >= 5 ? 'critical' : 'high',
          status: newStatus,
          timestamp: serverTimestamp()
        });
      }

      console.log(`[Intelligence Engine] Attacker at ${analysis.ip} engaged and neutralized.`);
    } catch (error) {
      console.error("[Intelligence Engine] Failed to profile attacker.", error);
    }
  },

  /**
   * Checks if an IP is blacklisted.
   */
  isBlacklisted: async (ip: string): Promise<boolean> => {
    const suspectsRef = collection(db, "suspect_profiles");
    const q = query(suspectsRef, where("ipAddress", "==", ip), where("status", "==", "blacklisted"), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }
};
