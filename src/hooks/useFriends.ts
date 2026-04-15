import { useEffect, useState } from 'react';
import { UserProfile, LeaderboardEntry } from '../types/user';
import {
  getFriendProfiles,
  getLeaderboard,
  subscribeToUserProfile,
  subscribeToIncomingRequests,
  subscribeToSentRequests,
  finalizeAcceptedRequest,
  FriendRequest,
} from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequestUids, setSentRequestUids] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Leaderboard
  useEffect(() => {
    if (!user) return;
    getLeaderboard().then(setLeaderboard).catch(() => {});
  }, [user]);

  // Profile → friends list
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsubProfile = subscribeToUserProfile(user.uid, async (p) => {
      try {
        const [friendProfiles, board] = await Promise.all([
          getFriendProfiles(p.friends ?? []),
          getLeaderboard(),
        ]);
        setFriends(friendProfiles);
        setLeaderboard(board);
      } catch {} finally {
        setLoading(false);
      }
    });

    const fallback = setTimeout(() => setLoading(false), 3000);
    return () => { unsubProfile(); clearTimeout(fallback); };
  }, [user]);

  // Incoming requests (pending = show in UI, accepted = auto-finalize)
  useEffect(() => {
    if (!user) return;

    const unsub = subscribeToIncomingRequests(user.uid, (requests) => {
      const pending = requests.filter((r) => r.type === 'pending');
      const accepted = requests.filter((r) => r.type === 'accepted');

      setPendingRequests(pending);

      // Auto-finalize: add each acceptor to my friends and clean up
      accepted.forEach((req) => {
        finalizeAcceptedRequest(req.id, user.uid, req.fromUid).catch(() => {});
      });
    });

    return unsub;
  }, [user]);

  // Sent (outgoing) requests — track which UIDs I've already sent to
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToSentRequests(user.uid, setSentRequestUids);
    return unsub;
  }, [user]);

  return { friends, pendingRequests, sentRequestUids, leaderboard, loading };
}
