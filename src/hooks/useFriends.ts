import { useEffect, useState } from 'react';
import { UserProfile, LeaderboardEntry } from '../types/user';
import { getFriendProfiles, getLeaderboard, subscribeToUserProfile } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load leaderboard independently on mount
  useEffect(() => {
    if (!user) return;
    getLeaderboard()
      .then(setLeaderboard)
      .catch(() => {});
  }, [user]);

  // Load profile + friends
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsub = subscribeToUserProfile(user.uid, async (p) => {
      try {
        setProfile(p);
        const friendProfiles = await getFriendProfiles(p.friends ?? []);
        setFriends(friendProfiles);
        // Refresh leaderboard when profile updates
        const board = await getLeaderboard();
        setLeaderboard(board);
      } catch (e) {
        // silently ignore
      } finally {
        setLoading(false);
      }
    });

    const fallback = setTimeout(() => setLoading(false), 3000);
    return () => { unsub(); clearTimeout(fallback); };
  }, [user]);

  return { friends, leaderboard, profile, loading };
}
