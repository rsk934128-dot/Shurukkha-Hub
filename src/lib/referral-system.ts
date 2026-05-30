/**
 * @fileOverview Imperial Referral Catalyst.
 * Manages affiliate links and ecosystem expansion trackers.
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IntegrationBridge } from './integration-bridge';

export const ReferralSystem = {
  /**
   * Generates a unique referral code for an identity.
   */
  generateCode: (userId: string) => {
    const ts = Date.now().toString(36).toUpperCase();
    return `SOV-${userId.substring(0, 5).toUpperCase()}-${ts}`;
  },

  /**
   * Logs a referral conversion in the audit registry.
   */
  async trackReferral(referralCode: string, newUserId: string) {
    const details = {
      referralCode,
      newUserId,
      status: 'CONVERTED',
      purity: 'VERIFIED_IMPERIAL',
      timestamp: new Date().toISOString()
    };

    console.log(`[Ecosystem] Referral conversion tracked: ${referralCode}`);

    await addDoc(collection(db, "audit_trails"), {
      action: 'ECOSYSTEM_REFERRAL_CONVERTED',
      details,
      signature: IntegrationBridge.generateSignature(details),
      timestamp: serverTimestamp(),
      performedBy: 'Referral_Engine_v35'
    });
  }
};
