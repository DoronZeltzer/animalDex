import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  increment,
  query as firestoreQuery,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  addDoc,
  where,
  limit,
  arrayUnion,
  arrayRemove,
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
  // Save the animal — this is the critical write
  const animalRef = doc(db, 'users', uid, 'animals', animal.animalId);
  await Promise.race([
    setDoc(animalRef, animal),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Save timed out. Check your Firestore rules.')), 8000)),
  ]);

  // Fire-and-forget counter + leaderboard updates (non-blocking)
  const countField = `${animal.category}Count`;
  setDoc(doc(db, 'users', uid), {
    totalAnimals: increment(1),
    [countField]: increment(1),
  }, { merge: true }).catch(() => {});

  setDoc(doc(db, 'leaderboard', uid), {
    uid,
    totalAnimals: increment(1),
    weeklyCaptures: increment(1),
    updatedAt: serverTimestamp(),
  }, { merge: true }).catch(() => {});
}

export function subscribeToUserAnimals(
  uid: string,
  category: AnimalCategory | null,
  onUpdate: (animals: CollectedAnimal[]) => void
): Unsubscribe {
  const animalsRef = collection(db, 'users', uid, 'animals');
  const q = category
    ? firestoreQuery(animalsRef, where('category', '==', category))
    : firestoreQuery(animalsRef, orderBy('capturedAt', 'desc'));

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
  const q = firestoreQuery(animalsRef, where('commonName', '==', commonName), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ── Friends ───────────────────────────────────────────────────────────────────

export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  fromName: string;
  type: 'pending' | 'accepted';
  createdAt: any;
}

// Send a friend request — writes only to friendRequests collection (no cross-user writes)
export async function sendFriendRequest(myUid: string, targetUid: string, myName: string): Promise<void> {
  const requestId = `${myUid}_${targetUid}`;
  await setDoc(doc(db, 'friendRequests', requestId), {
    fromUid: myUid,
    toUid: targetUid,
    fromName: myName,
    type: 'pending',
    createdAt: serverTimestamp(),
  });
}

// Accept: delete the pending request, add requester to my friends,
// create an 'accepted' notification so requester adds me back automatically
export async function acceptFriendRequest(
  requestId: string,
  myUid: string,
  myName: string,
  requesterUid: string
): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, 'friendRequests', requestId)),
    setDoc(doc(db, 'users', myUid), { friends: arrayUnion(requesterUid) }, { merge: true }),
    addDoc(collection(db, 'friendRequests'), {
      fromUid: myUid,
      toUid: requesterUid,
      fromName: myName,
      type: 'accepted',
      createdAt: serverTimestamp(),
    }),
  ]);
}

// Decline: just delete the request
export async function declineFriendRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, 'friendRequests', requestId));
}

// Called by requester when they see their 'accepted' notification:
// add the acceptor to their own friends, then delete the notification
export async function finalizeAcceptedRequest(notificationId: string, myUid: string, acceptorUid: string): Promise<void> {
  await Promise.all([
    setDoc(doc(db, 'users', myUid), { friends: arrayUnion(acceptorUid) }, { merge: true }),
    deleteDoc(doc(db, 'friendRequests', notificationId)),
  ]);
}

// Real-time listener: all friendRequests where I am the recipient
export function subscribeToIncomingRequests(myUid: string, onUpdate: (requests: FriendRequest[]) => void): Unsubscribe {
  const q = firestoreQuery(collection(db, 'friendRequests'), where('toUid', '==', myUid));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FriendRequest)));
  });
}

// Real-time listener: pending requests I sent
export function subscribeToSentRequests(myUid: string, onUpdate: (targetUids: string[]) => void): Unsubscribe {
  const q = firestoreQuery(collection(db, 'friendRequests'), where('fromUid', '==', myUid), where('type', '==', 'pending'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => d.data().toUid as string));
  });
}

export async function removeFriend(uid: string, friendUid: string): Promise<void> {
  await Promise.all([
    setDoc(doc(db, 'users', uid), { friends: arrayRemove(friendUid) }, { merge: true }),
    setDoc(doc(db, 'users', friendUid), { friends: arrayRemove(uid) }, { merge: true }),
  ]);
}

export async function searchUsers(query: string, currentUid: string): Promise<UserProfile[]> {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) =>
      u.uid !== currentUid &&
      (u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    )
    .slice(0, 10);
}

export async function getFriendProfiles(friendUids: string[]): Promise<UserProfile[]> {
  const profiles = await Promise.all(
    friendUids.map((uid) => getUserProfile(uid))
  );
  return profiles.filter(Boolean) as UserProfile[];
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const usersSnap = await getDocs(collection(db, 'users'));
  const entries: LeaderboardEntry[] = usersSnap.docs.map((d) => {
    const data = d.data() as any;
    return {
      uid: data.uid,
      displayName: data.displayName ?? 'Explorer',
      photoURL: data.photoURL ?? '',
      totalAnimals: data.totalAnimals ?? 0,
      weeklyCaptures: 0,
      rank: 0,
    };
  });
  return entries
    .sort((a, b) => b.totalAnimals - a.totalAnimals)
    .map((e, i) => ({ ...e, rank: i + 1 }));
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
  const q = firestoreQuery(
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
