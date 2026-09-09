import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDUAQN2-3-tBlWq0kGxN-wNud9Zmu2zV40",
  authDomain: "sbupconnect.firebaseapp.com",
  projectId: "sbupconnect",
  storageBucket: "sbupconnect.firebasestorage.app",
  messagingSenderId: "531957749526",
  appId: "1:531957749526:web:f465be8f237b94cfba2237",
  measurementId: "G-SM6PXN96ZY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence: multiple tabs, disabled for extra tab.');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported in this browser.');
  }
});

try { getAnalytics(app); } catch(e) {}

export default app;
