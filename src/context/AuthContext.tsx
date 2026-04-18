import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, FIREBASE_CONFIGURED, db } from '../config/firebase';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut } from '../services/authService';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!FIREBASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    const timeout = setTimeout(() => setLoading(false), 3000);
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        clearTimeout(timeout);
        setUser(firebaseUser);
        setLoading(false);

        // Sync Firebase Auth display name to Firestore if missing
        if (firebaseUser && db) {
          try {
            const profileRef = doc(db, 'users', firebaseUser.uid);
            const snap = await getDoc(profileRef);
            const data = snap.data();
            if (!data?.displayName && firebaseUser.displayName) {
              await setDoc(profileRef, {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName,
                email: firebaseUser.email ?? '',
                photoURL: firebaseUser.photoURL ?? '',
              }, { merge: true });
            }
          } catch {}
        }
      });
    } catch {
      clearTimeout(timeout);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    await signUpWithEmail(email, password, displayName);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const googleSignIn = async (idToken: string) => {
    await signInWithGoogle(idToken);
  };

  const logout = async () => {
    await signOut();
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, googleSignIn, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
