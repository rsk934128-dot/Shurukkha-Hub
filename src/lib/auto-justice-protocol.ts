/**
 * @fileOverview Imperial Auto-Justice Protocol.
 * Executes "sentences" on confirmed high-threat actors and manages the Evidence Vault.
 * Updated: Supports Imperial Decrees and Historical Evidence recording.
 */

import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { IntegrationBridge } from './integration-bridge';

export interface JusticeSentence {
  targetFingerprint: string;
  action: 'MONITOR' | 'RESTRICT' | 'EXILE' | 'PERMANENT_BAN';
  reason: string;
  evidenceId: string;
  timestamp: string;
}

export const AutoJustice = {
  /**
   * Executes a judicial sentence on a suspect profile based on intelligence data.
   */
  async executeSentence(profileId: string, fingerprint: string, threatLevel: string) {
    console.log(`[Judiciary] Passing sentence on profile: ${profileId} | Fingerprint: ${fingerprint}`);
    
    let action: 'MONITOR' | 'RESTRICT' | 'EXILE' | 'PERMANENT_BAN' = 'MONITOR';
    let reason = "Suspected malicious activity.";

    if (threatLevel === 'critical') {
      action = 'PERMANENT_BAN';
      reason = "Multiple phishing attempts and deep-inspection violations detected.";
    } else if (threatLevel === 'high') {
      action = 'EXILE';
      reason = "Repeated policy violations and unauthorized scanning.";
    }

    try {
      // 1. Update the suspect profile status in Firestore
      await updateDoc(doc(db, "suspect_profiles", profileId), {
        status: action === 'PERMANENT_BAN' || action === 'EXILE' ? 'blacklisted' : 'monitored',
        judicialAction: action,
        sentenceDate: new Date().toISOString()
      });

      // 2. Create forensic evidence entry
      const evidenceId = 'evid_' + Math.random().toString(36).substring(2, 12);
      await addDoc(collection(db, "audit_trails"), {
        action: 'JUDICIAL_SENTENCE_EXECUTED',
        details: { 
          profileId, 
          fingerprint, 
          sentence: action, 
          reason, 
          evidenceId,
          sovereignToken: IntegrationBridge.generateEphemeralToken() 
        },
        signature: IntegrationBridge.generateSignature({ profileId, action }),
        timestamp: serverTimestamp(),
        performedBy: 'imperial_justice_v1'
      });

      console.log(`[Judiciary] Sentence EXECUTED: ${action} for fingerprint ${fingerprint}.`);
      
      return { success: true, action, evidenceId };
    } catch (e) {
      console.error("[Judiciary] Failed to execute justice.", e);
      return { success: false };
    }
  },

  /**
   * Records specific forensic data into the secure Evidence Vault.
   */
  async recordEvidence(data: any) {
    const signature = IntegrationBridge.generateSignature(data);
    await addDoc(collection(db, "audit_trails"), {
      action: 'EVIDENCE_RECORDED',
      details: { ...data, vaultStatus: 'ENCRYPTED' },
      signature,
      timestamp: serverTimestamp(),
      performedBy: 'sovereign_archivist_v1'
    });
  },

  /**
   * Records high-priority evidence based on Imperial decree (User inputs).
   */
  async recordImperialEvidence(caseTitle: string, data: any) {
    const evidenceId = 'imp_evid_' + Math.random().toString(36).substring(2, 10);
    const signature = IntegrationBridge.generateSignature(data);
    
    await addDoc(collection(db, "audit_trails"), {
      action: 'IMPERIAL_EVIDENCE_RECORDED',
      details: { 
        title: caseTitle,
        evidenceId,
        metadata: data,
        purity: 'VERIFIED_IMPERIAL',
        timestamp: new Date().toISOString()
      },
      signature,
      timestamp: serverTimestamp(),
      performedBy: 'Imperial_Sovereign_v26'
    });

    console.log(`[Evidence Vault] High-Priority Case Recorded: ${caseTitle}`);
    return evidenceId;
  }
};
