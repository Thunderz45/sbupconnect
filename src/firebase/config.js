import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAAf6EWyhBcbOQcGmdXN-95XL7cNbPl0NM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sbupconnect-3ff6c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sbupconnect-3ff6c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sbupconnect-3ff6c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "842142539208",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:842142539208:web:a212b274aef1b37e93b4fd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-TQLDK4CB9Z"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

try {
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    getAnalytics(app);
  }
} catch (e) {
  /* analytics not available in dev or ssr */
}

export default app;
