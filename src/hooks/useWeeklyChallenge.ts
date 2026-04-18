import { useState, useEffect } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { getRegionForCountry, ChallengeAnimal, Region } from '../data/challengeAnimals';
import { getWeeklyChallenge, getCurrentWeekId, daysLeftInWeek } from '../utils/challengeUtils';

export interface WeeklyChallengeState {
  challenge: ChallengeAnimal | null;
  weekId: string;
  region: Region;
  daysLeft: number;
  completed: boolean;
  loading: boolean;
}

export function useWeeklyChallenge(): WeeklyChallengeState {
  const { user } = useAuth();
  const weekId = getCurrentWeekId();

  const [state, setState] = useState<WeeklyChallengeState>({
    challenge: null,
    weekId,
    region: 'europe',
    daysLeft: daysLeftInWeek(),
    completed: false,
    loading: true,
  });

  // ── 1. Get location once and determine challenge ───────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        let countryCode = 'NL';
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          const [geo] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          countryCode = geo?.isoCountryCode ?? 'NL';
        }

        const region = getRegionForCountry(countryCode);
        const challenge = getWeeklyChallenge(region);

        if (!cancelled) {
          setState(prev => ({ ...prev, challenge, region, loading: false }));
        }
      } catch {
        const challenge = getWeeklyChallenge('europe');
        if (!cancelled) {
          setState(prev => ({ ...prev, challenge, loading: false }));
        }
      }
    }

    loadLocation();
    return () => { cancelled = true; };
  }, []);

  // ── 2. Subscribe to Firestore so completion updates in real-time ──────────
  useEffect(() => {
    if (!user || !db) return;

    const ref = doc(db, 'users', user.uid, 'challenges', weekId);
    const unsub = onSnapshot(ref, (snap) => {
      setState(prev => ({ ...prev, completed: snap.exists() }));
    }, () => {});

    return () => unsub();
  }, [user?.uid, weekId]);

  return state;
}
