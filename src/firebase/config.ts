'use client';

/**
 * @fileOverview Shurukkha Hub Sovereign Configuration.
 * Phase 36.0: Added reCAPTCHA Enterprise Site Key for App Check.
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBLbITdW2B346Nx4w8-30aVpeljpJGBLic",
  authDomain: "studio-8077560128-6f1fe.firebaseapp.com",
  projectId: "studio-8077560128-6f1fe",
  storageBucket: "studio-8077560128-6f1fe.firebasestorage.app",
  messagingSenderId: "941903403355",
  appId: "1:941903403355:web:0608b3ea718bcf0e36227e",
  // সম্রাট, ফায়ারবেস কনসোল থেকে প্রাপ্ত আপনার reCAPTCHA Enterprise সাইট কী এখানে বসান।
  // reCAPTCHA Enterprise প্রতি মাসে ১০,০০০ অ্যাসেসমেন্ট বিনামূল্যে প্রদান করে।
  reCaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeRxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
};
