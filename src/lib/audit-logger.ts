/**
 * @fileOverview Imperial Audit Logger.
 * Standardizes the recording of security and administrative events.
 * Every log is signed with the Imperial Master Key to ensure immutability.
 */

import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { IntegrationBridge } from './integration-bridge';

export type SecurityEvent = 
  | 'LOGIN_SUCCESS' 
  | 'LOGIN_FAILURE' 
  | '2FA_VERIFIED' 
  | '2FA_FAILED' 
  | 'LOCKDOWN_TRIGGERED' 
  | 'SENSITIVE_DATA_ACCESS' 
  | 'TREASURY_WITHDRAWAL';

export const AuditLogger = {
  /**
   * Records a security event to the immutable audit registry.
   */
  async logEvent(event: SecurityEvent, details: any, userId?: string) {
    const logData = {
      action: event,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        nodeId: 'core.sheikh.primary'
      },
      userId: userId || 'anonymous',
      performedBy: 'Imperial_Sentinel_v30',
      timestamp: serverTimestamp(),
    };

    const signature = IntegrationBridge.generateSignature(logData.details);

    try {
      await addDoc(collection(db, "audit_trails"), {
        ...logData,
        signature
      });
      console.log(`[Audit] ${event} recorded and signed.`);
    } catch (e) {
      console.error("[Audit] Logging failed", e);
    }
  }
};
