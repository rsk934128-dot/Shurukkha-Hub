'use client';

// Shurukkha Hub Sovereign Configuration
// Phase 31.0: Sovereign Evolution - Real API Integration
// UPDATED: Phase 36.0 - Added App Check Support
export const firebaseConfig = {
  apiKey: "AIzaSyBLbITdW2B346Nx4w8-30aVpeljpJGBLic",
  authDomain: "studio-8077560128-6f1fe.firebaseapp.com",
  projectId: "studio-8077560128-6f1fe",
  storageBucket: "studio-8077560128-6f1fe.firebasestorage.app",
  messagingSenderId: "941903403355",
  appId: "1:941903403355:web:0608b3ea718bcf0e36227e",
  // সম্রাট, এখানে আপনার reCAPTCHA Enterprise সাইট কী-টি বসান।
  reCaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeRxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};
