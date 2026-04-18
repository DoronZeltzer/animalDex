import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToUserProfile, resetGoldLevel } from '../services/firestoreService';
import { getGoldColors, getCurrentWeekId, getPreviousWeekId } from '../utils/challengeUtils';

interface GoldTheme {
  bg: string;
  card: string;
  tabBar: string;
  goldLevel: number;
}

const DEFAULT: GoldTheme = {
  bg: '#FAFAF5',
  card: '#FFFFFF',
  tabBar: '#FFFFFF',
  goldLevel: 0,
};

const GoldThemeContext = createContext<GoldTheme>(DEFAULT);

export function GoldThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<GoldTheme>(DEFAULT);

  useEffect(() => {
    if (!user) { setTheme(DEFAULT); return; }

    const unsub = subscribeToUserProfile(user.uid, async (profile) => {
      const rawLevel = profile.goldLevel ?? 0;
      const level = Math.min(rawLevel, 10);

      // ── Missed-week detection ────────────────────────────────────────────
      // If the user's last completed week is older than the previous week,
      // they missed at least one challenge → reset gold level to 0.
      const lastDone: string | undefined = (profile as any).lastCompletedWeekId;
      const prevWeekId = getPreviousWeekId();
      const currentWeekId = getCurrentWeekId();

      if (lastDone && lastDone < prevWeekId && level > 0) {
        // They haven't completed either this week or last week → reset
        resetGoldLevel(user.uid).catch(() => {});
        setTheme({ ...getGoldColors(0), goldLevel: 0 });
        return;
      }

      setTheme({ ...getGoldColors(level), goldLevel: level });
    });

    return () => unsub();
  }, [user?.uid]);

  return (
    <GoldThemeContext.Provider value={theme}>
      {children}
    </GoldThemeContext.Provider>
  );
}

export function useGoldTheme(): GoldTheme {
  return useContext(GoldThemeContext);
}
