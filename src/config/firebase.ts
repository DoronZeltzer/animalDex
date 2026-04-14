import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────────────────────────
// Go to console.firebase.google.com → your project → Project Settings →
// Your Apps → Web app → copy the config object values below.
const FIREBASE_API_KEY        = process.env.EXPO_PUBLIC_FIREBASE_API_KEY        ?? 'AIzaSyDXHQt1U0Vc-VYmca92B69UxNVXEG05cWw';
const FIREBASE_AUTH_DOMAIN    = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN    ?? 'animaldex-b7859.firebaseapp.com';
const FIREBASE_PROJECT_ID     = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID     ?? 'animaldex-b7859';
const FIREBASE_STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'animaldex-b7859.firebasestorage.app';
const FIREBASE_SENDER_ID      = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '631337717859';
const FIREBASE_APP_ID         = process.env.EXPO_PUBLIC_FIREBASE_APP_ID         ?? '1:631337717859:web:2d783c1ea7e467543ca856';
// ─────────────────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIGURED = !!FIREBASE_API_KEY && !!FIREBASE_PROJECT_ID;

const app = FIREBASE_CONFIGURED
  ? (getApps().length === 0
      ? initializeApp({ apiKey: FIREBASE_API_KEY, authDomain: FIREBASE_AUTH_DOMAIN, projectId: FIREBASE_PROJECT_ID, storageBucket: FIREBASE_STORAGE_BUCKET, messagingSenderId: FIREBASE_SENDER_ID, appId: FIREBASE_APP_ID })
      : getApp())
  : ({} as any);

function getFirebaseAuth() {
  if (!FIREBASE_CONFIGURED) return {} as any;
  try {
    return initializeAuth(app, {
      persistence: (require('firebase/auth') as any).getReactNativePersistence?.(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}
export const auth = getFirebaseAuth();

export const db      = FIREBASE_CONFIGURED ? getFirestore(app) : ({} as any);
export const storage = FIREBASE_CONFIGURED ? getStorage(app)   : ({} as any);
export default app;
