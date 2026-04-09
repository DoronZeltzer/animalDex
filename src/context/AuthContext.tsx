import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, FIREBASE_CONFIGURED } from '../config/firebase';
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOut } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  googleSignIn: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
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
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        clearTimeout(timeout);
        setUser(firebaseUser);
        setLoading(false);
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

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, googleSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
