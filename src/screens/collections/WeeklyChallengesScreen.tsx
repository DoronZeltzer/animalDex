import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { useGoldTheme } from '../../context/GoldThemeContext';
import { ChallengeCompletion } from '../../services/firestoreService';
import { getRegionForCountry, Region } from '../../data/challengeAnimals';
import { getWeeklyChallenge, getCurrentWeekId, getLastNWeekIds, weekIdToLabel } from '../../utils/challengeUtils';
import { COLORS, SIZES } from '../../config/constants';

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  land: 'leaf', sea: 'water', air: 'cloud',
};
const CATEGORY_COLOR: Record<string, string> = {
  land: COLORS.land, sea: COLORS.sea, air: COLORS.air,
};

export default function WeeklyChallengesScreen() {
  const { user } = useAuth();
  const { goldLevel, card } = useGoldTheme();
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>('europe');
  const [history, setHistory] = useState<Record<string, ChallengeCompletion>>({});
  const currentWeekId = getCurrentWeekId();
  const weekIds = getLastNWeekIds(8); // current + 7 past weeks

  // ── Load region once ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        let country = 'NL';
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
          const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          country = geo?.isoCountryCode ?? 'NL';
        }
        setRegion(getRegionForCountry(country));
      } catch {}
    })();
  }, []);

  // ── Real-time subscription to challenges subcollection ───────────────────
  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }

    const unsub = onSnapshot(
      collection(db, 'users', user.uid, 'challenges'),
      (snap) => {
        const map: Record<string, ChallengeCompletion> = {};
        snap.docs.forEach(d => {
          const data = d.data() as ChallengeCompletion;
          // Use doc ID as weekId fallback in case data.weekId is missing
          map[data.weekId ?? d.id] = data;
        });
        setHistory(map);
        setLoading(false);
      },
      () => { setLoading(false); }  // permission error → just show empty
    );

    return () => unsub();
  }, [user?.uid]);

  const totalCompleted = Object.keys(history).length;
  // Streak = consecutive weeks from current going back
  let streak = 0;
  for (const wid of weekIds) {
    if (history[wid]) streak++;
    else break;
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: '#FAFAF5' }]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stats banner */}
      <View style={[styles.statsBanner, { backgroundColor: goldLevel > 0 ? '#FFF3C4' : COLORS.card }]}>
        <StatBox label="Completed" value={String(totalCompleted)} icon="trophy" color="#D97706" />
        <View style={styles.statDivider} />
        <StatBox label="Current Streak" value={`${streak}🔥`} icon="flame" color="#EF4444" />
        <View style={styles.statDivider} />
        <StatBox label="Gold Level" value={`${Math.min(goldLevel, 10)}/10`} icon="star" color="#F59E0B" />
      </View>

      {/* Gold level bar */}
      <View style={styles.goldBarWrap}>
        <Text style={styles.goldBarLabel}>Gold Streak Progress</Text>
        <View style={styles.goldBarBg}>
          <View style={[styles.goldBarFill, { width: `${Math.min(goldLevel, 10) * 10}%` as any }]} />
        </View>
        <Text style={styles.goldBarHint}>
          {goldLevel >= 10 ? '✨ Maximum gold unlocked!' : `Complete ${10 - Math.min(goldLevel, 10)} more to reach max gold`}
        </Text>
      </View>

      {/* History list */}
      <Text style={styles.sectionTitle}>Challenge History</Text>
      {weekIds.map((weekId, i) => {
        const animal = getWeeklyChallenge(region, weekId);
        const completion = history[weekId];
        const isCurrent = weekId === currentWeekId;
        const completed = !!completion;
        const catColor = CATEGORY_COLOR[animal.category];
        const catIcon = CATEGORY_ICON[animal.category];

        return (
          <View key={weekId} style={[styles.row, { backgroundColor: card }, completed && styles.rowCompleted, isCurrent && styles.rowCurrent]}>
            {/* Left status icon */}
            <View style={[styles.statusIcon, { backgroundColor: completed ? '#16A34A20' : isCurrent ? COLORS.primary + '20' : '#6B728020' }]}>
              <Ionicons
                name={completed ? 'checkmark-circle' : isCurrent ? 'time' : 'close-circle'}
                size={24}
                color={completed ? '#16A34A' : isCurrent ? COLORS.primary : COLORS.textSecondary}
              />
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.weekLabel}>
                  {isCurrent ? 'This Week' : `Week of ${weekIdToLabel(weekId)}`}
                </Text>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.animalName, !completed && !isCurrent && styles.animalNameMuted]}>
                {completed ? completion.animalName : animal.name}
              </Text>
              <View style={styles.catRow}>
                <Ionicons name={catIcon} size={11} color={catColor} />
                <Text style={[styles.catLabel, { color: catColor }]}>
                  {animal.category.charAt(0).toUpperCase() + animal.category.slice(1)}
                </Text>
              </View>
            </View>

            {/* Right status */}
            <Text style={[styles.statusText, completed && styles.statusDone, !completed && !isCurrent && styles.statusMissed]}>
              {completed ? '✅ Done' : isCurrent ? '⏳ Active' : '❌ Missed'}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  statsBanner: {
    flexDirection: 'row', borderRadius: 20, padding: 16,
    borderWidth: 1.5, borderColor: '#FDE68A', marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: 'center', gap: 3 },
  statDivider: { width: 1, backgroundColor: '#FDE68A', marginHorizontal: 8 },
  statValue: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, textAlign: 'center' },

  goldBarWrap: { marginBottom: 24, gap: 6 },
  goldBarLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  goldBarBg: { height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden' },
  goldBarFill: { height: '100%', backgroundColor: '#F59E0B', borderRadius: 5 },
  goldBarHint: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  rowCompleted: { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' },
  rowCurrent: { borderColor: COLORS.primary + '60' },
  statusIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  weekLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  currentBadge: { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  currentBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  animalName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  animalNameMuted: { color: COLORS.textSecondary },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  catLabel: { fontSize: 11, fontWeight: '600' },
  statusText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  statusDone: { color: '#16A34A' },
  statusMissed: { color: '#9CA3AF' },
});
