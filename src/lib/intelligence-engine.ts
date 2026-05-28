
/**
 * @fileOverview Adaptive Threat Intelligence Engine.
 * Implements self-learning blacklisting and attacker profiling.
 * Updated: Engages Identity Correlation to link multiple attack vectors to a single actor.
 */

import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, limit } from 'firebase/firestore';
import { SelfHealing } from './self-healing';
import { CounterIntelligence } from './counter-intelligence';
import { SelfEvolutionEngine } from './self-evolution-engine';

export interface ThreatAnalysis {
  ip: string;
  source: 'gatekeeper' | 'honeypot' | 'deep_inspection';
  violationType: string;
  metadata?: any;
}

export const IntelligenceEngine = {
  /**
   * Generates a unique device fingerprint hash from request headers
   */
  generateFingerprint: (userAgent: string, ip: string) => {
    const raw = `${userAgent}-${ip.split('.').slice(0, 2).join('.')}`; // Salted IP prefix
    return 'fp_' + btoa(raw).substring(0, 16);
  },

  /**
   * Logs a threat incident and correlates identities based on fingerprints.
   */
  logIncident: async (analysis: ThreatAnalysis) => {
    const userAgent = analysis.metadata?.userAgent || 'unknown';
    const fingerprint = IntelligenceEngine.generateFingerprint(userAgent, analysis.ip);

    console.log(`[Intelligence Engine] Processing threat from ${analysis.ip} | Fingerprint: ${fingerprint}`);

    try {
      const suspectsRef = collection(db, "suspect_profiles");
      
      // Step 1: Check if this IP already exists
      const ipQuery = query(suspectsRef, where("ipAddress", "==", analysis.ip), limit(1));
      const ipSnapshot = await getDocs(ipQuery);

      // Step 2: Check for other IPs with the same fingerprint (Identity Correlation)
      const fpQuery = query(suspectsRef, where("fingerprint", "==", fingerprint));
      const fpSnapshot = await getDocs(fpQuery);
      const linkedIps = fpSnapshot.docs.map(d => d.data().ipAddress).filter(ip => ip !== analysis.ip);

      // Engaged Offensive Counter-Intel
      await CounterIntelligence.applyLatencyTrap(analysis.ip);

      if (analysis.source === 'honeypot' || analysis.source === 'deep_inspection') {
        SelfHealing.initiateRecovery(analysis.source, analysis.violationType);
        SelfEvolutionEngine.evolveFromThreat(analysis.violationType);
      }

      if (ipSnapshot.empty) {
        // Create new profile with Fingerprint and Linked Identities
        await addDoc(suspectsRef, {
          ipAddress: analysis.ip,
          fingerprint: fingerprint,
          linkedIdentities: linkedIps,
          violationCount: 1,
          threatLevel: analysis.source === 'honeypot' ? 'high' : 'medium',
          lastIncident: new Date().toISOString(),
          capturedAt: analysis.source,
          status: analysis.source === 'honeypot' ? 'blacklisted' : 'monitored',
          metadata: { ...analysis.metadata, userAgent },
          timestamp: serverTimestamp()
        });

        // Update previously captured suspects to include this new linked IP
        for (const suspectDoc of fpSnapshot.docs) {
          await updateDoc(doc(db, "suspect_profiles", suspectDoc.id), {
            linkedIdentities: [...(suspectDoc.data().linkedIdentities || []), analysis.ip]
          });
        }
      } else {
        // Update existing profile
        const profile = ipSnapshot.docs[0];
        const newViolationCount = (profile.data().violationCount || 0) + 1;
        const newStatus = newViolationCount >= 3 || analysis.source === 'honeypot' ? 'blacklisted' : 'monitored';
        
        await updateDoc(doc(db, "suspect_profiles", profile.id), {
          violationCount: newViolationCount,
          lastIncident: new Date().toISOString(),
          threatLevel: newViolationCount >= 5 ? 'critical' : 'high',
          status: newStatus,
          linkedIdentities: linkedIps,
          timestamp: serverTimestamp()
        });
      }

      console.log(`[Intelligence Engine] Identity correlation complete for fingerprint ${fingerprint}.`);
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
