import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { UserProfile } from '../types/user';

async function createUserProfile(uid: string, displayName: string, email: string, photoURL = '') {
  const profile: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
    uid,
    displayName,
    email,
    photoURL,
    totalAnimals: 0,
    landCount: 0,
    seaCount: 0,
    airCount: 0,
    achievements: [],
    friends: [],
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'users', uid), profile);
  return profile;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await createUserProfile(credential.user.uid, displayName, email);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function signInWithGoogle(idToken: string) {
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const credential = await signInWithCredential(auth, googleCredential);
  const user = credential.user;

  // Create profile only if it doesn't exist
  const profileRef = doc(db, 'users', user.uid);
  const existing = await getDoc(profileRef);
  if (!existing.exists()) {
    await createUserProfile(
      user.uid,
      user.displayName ?? 'Explorer',
      user.email ?? '',
      user.photoURL ?? ''
    );
  }
  return user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}
