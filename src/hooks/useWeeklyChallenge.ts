import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { getRegionForCountry, ChallengeAnimal } from '../data/challengeAnimals';
import { Region } from '../data/challengeAnimals';
import { getWeeklyChallenge, getCurrentWeekId, daysLeftInWeek } from '../utils/challengeUtils';
import { getChallengeCompletion } from '../services/firestoreService';

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
  const [state, setState] = useState<WeeklyChallengeState>({
    challenge: null,
    weekId: getCurrentWeekId(),
    region: 'europe',
    daysLeft: daysLeftInWeek(),
    completed: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Get location permission (ask gently, don't block the app)
        let countryCode = 'NL'; // sensible default
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
        const weekId = getCurrentWeekId();
        const challenge = getWeeklyChallenge(region);

        // 2. Check if user already completed this week's challenge
        let completed = false;
        if (user) {
          const completion = await getChallengeCompletion(user.uid, weekId);
          completed = !!completion;
        }

        if (!cancelled) {
          setState({ challenge, weekId, region, daysLeft: daysLeftInWeek(), completed, loading: false });
        }
      } catch {
        // Location failed — still show a challenge based on default region
        const weekId = getCurrentWeekId();
        const challenge = getWeeklyChallenge('europe');
        if (!cancelled) {
          setState({ challenge, weekId, region: 'europe', daysLeft: daysLeftInWeek(), completed: false, loading: false });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.uid]);

  return state;
}
