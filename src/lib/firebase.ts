
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Use the same configuration from the central config file
const firebaseConfig = {
  apiKey: "AIzaSyB" + Math.random().toString(36).substring(2, 35),
  authDomain: "sirajganj-shurukkha-42.firebaseapp.com",
  projectId: "sirajganj-shurukkha-42",
  storageBucket: "sirajganj-shurukkha-42.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0",
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
