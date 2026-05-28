import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Use the same configuration from the central config file
const firebaseConfig = {
  apiKey: "AIzaSyBLbITdW2B346Nx4w8-30aVpeljpJGBLic",
  authDomain: "studio-8077560128-6f1fe.firebaseapp.com",
  projectId: "studio-8077560128-6f1fe",
  storageBucket: "studio-8077560128-6f1fe.firebasestorage.app",
  messagingSenderId: "941903403355",
  appId: "1:941903403355:web:0608b3ea718bcf0e36227e",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
