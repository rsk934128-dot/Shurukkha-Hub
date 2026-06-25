'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { firebaseConfig } from './config';

/**
 * @fileOverview Firebase Initialization Hub with App Check Security.
 * Phase 36.0: Integrated reCAPTCHA Enterprise for Sovereign Identity Protection.
 */

export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  // 🛡️ Initialize App Check (Only in Browser environment)
  if (typeof window !== 'undefined') {
    // Enable Debug Mode for Local Development
    if (process.env.NODE_ENV === 'development') {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      console.warn("[Imperial Guard] App Check Debug Mode ACTIVE.");
    }

    try {
      const siteKey = (firebaseConfig as any).reCaptchaSiteKey || "RECAPTCHA_SITE_KEY_PLACEHOLDER";
      
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      
      console.log("[Imperial Guard] Sovereign App Check Initialized ✅");
    } catch (error) {
      console.error("[Imperial Guard] App Check Initialization Failed:", error);
    }
  }

  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
