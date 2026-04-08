import { useEffect, useState } from 'react';
import { UserProfile, LeaderboardEntry } from '../types/user';
import { getFriendProfiles, getLeaderboard } from '../services/firestoreService';
import { subscribeToUserProfile } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserProfile(user.uid, async (p) => {
      setProfile(p);
      const friendProfiles = await getFriendProfiles(p.friends ?? []);
      setFriends(friendProfiles);
      const board = await getLeaderboard([user.uid, ...(p.friends ?? [])]);
      setLeaderboard(board);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { friends, leaderboard, profile, loading };
}
