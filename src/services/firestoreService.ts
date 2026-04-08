import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  addDoc,
  where,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CollectedAnimal, AnimalCategory } from '../types/animal';
import { UserProfile, LeaderboardEntry } from '../types/user';

// ── User profile ──────────────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function subscribeToUserProfile(uid: string, onUpdate: (profile: UserProfile) => void): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snap) => {
    if (snap.exists()) onUpdate(snap.data() as UserProfile);
  });
}

// ── Animals ───────────────────────────────────────────────────────────────────

export async function addAnimalToCollection(uid: string, animal: CollectedAnimal): Promise<void> {
  const animalRef = doc(db, 'users', uid, 'animals', animal.animalId);
  await setDoc(animalRef, animal);

  // Update user counters
  const countField = `${animal.category}Count`;
  await updateDoc(doc(db, 'users', uid), {
    totalAnimals: increment(1),
    [countField]: increment(1),
  });

  // Update leaderboard
  await setDoc(doc(db, 'leaderboard', uid), {
    uid,
    totalAnimals: increment(1),
    weeklyCaptures: increment(1),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToUserAnimals(
  uid: string,
  category: AnimalCategory | null,
  onUpdate: (animals: CollectedAnimal[]) => void
): Unsubscribe {
  const animalsRef = collection(db, 'users', uid, 'animals');
  const q = category
    ? query(animalsRef, where('category', '==', category), orderBy('capturedAt', 'desc'))
    : query(animalsRef, orderBy('capturedAt', 'desc'));

  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => d.data() as CollectedAnimal));
  });
}

export async function getAnimalById(uid: string, animalId: string): Promise<CollectedAnimal | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'animals', animalId));
  return snap.exists() ? (snap.data() as CollectedAnimal) : null;
}

export async function hasAnimal(uid: string, commonName: string): Promise<boolean> {
  const animalsRef = collection(db, 'users', uid, 'animals');
  const q = query(animalsRef, where('commonName', '==', commonName), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ── Friends ───────────────────────────────────────────────────────────────────

export async function addFriend(uid: string, friendUid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), {
    friends: ([] as string[]).concat([friendUid]),
  });
}

export async function getFriendProfiles(friendUids: string[]): Promise<UserProfile[]> {
  const profiles = await Promise.all(
    friendUids.map((uid) => getUserProfile(uid))
  );
  return profiles.filter(Boolean) as UserProfile[];
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(friendUids: string[]): Promise<LeaderboardEntry[]> {
  const entries: LeaderboardEntry[] = [];
  for (const uid of friendUids) {
    const snap = await getDoc(doc(db, 'leaderboard', uid));
    if (snap.exists()) {
      entries.push(snap.data() as LeaderboardEntry);
    }
  }
  return entries.sort((a, b) => b.totalAnimals - a.totalAnimals).map((e, i) => ({ ...e, rank: i + 1 }));
}

// ── Chat ──────────────────────────────────────────────────────────────────────

function getChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

export function subscribeToChat(
  myUid: string,
  friendUid: string,
  onMessages: (messages: any[]) => void
): Unsubscribe {
  const chatId = getChatId(myUid, friendUid);
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('sentAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    onMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage(myUid: string, friendUid: string, text: string): Promise<void> {
  const chatId = getChatId(myUid, friendUid);
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId: myUid,
    text,
    sentAt: serverTimestamp(),
  });
}
