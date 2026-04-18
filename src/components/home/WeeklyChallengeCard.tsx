import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';
import { WeeklyChallengeState } from '../../hooks/useWeeklyChallenge';

const CATEGORY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  land: 'leaf',
  sea: 'water',
  air: 'cloud',
};

const CATEGORY_COLOR: Record<string, string> = {
  land: COLORS.land,
  sea: COLORS.sea,
  air: COLORS.air,
};

interface Props {
  challenge: WeeklyChallengeState;
}

export default function WeeklyChallengeCard({ challenge }: Props) {
  const shimmer = useRef(new Animated.Value(0)).current;

  // Pulse animation on the trophy when complete
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (challenge.completed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    }
  }, [challenge.completed]);

  if (challenge.loading || !challenge.challenge) {
    return (
      <View style={styles.skeleton}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
      </View>
    );
  }

  const { challenge: animal, daysLeft, completed } = challenge;
  const catColor = CATEGORY_COLOR[animal.category];
  const catIcon = CATEGORY_ICON[animal.category];

  if (completed) {
    return (
      <View style={[styles.card, styles.completedCard]}>
        <View style={styles.completedHeader}>
          <Animated.Text style={[styles.trophy, { transform: [{ scale: pulse }] }]}>🏆</Animated.Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.completedTitle}>Challenge Complete!</Text>
            <Text style={styles.completedSub}>You found this week's animal</Text>
          </View>
        </View>
        <View style={styles.completedAnimalRow}>
          <View style={[styles.catDot, { backgroundColor: catColor }]}>
            <Ionicons name={catIcon} size={13} color="#fff" />
          </View>
          <Text style={styles.completedAnimalName}>{animal.name}</Text>
        </View>
        <Text style={styles.resetNote}>Next challenge in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <Ionicons name="trophy-outline" size={15} color={COLORS.primary} />
          <Text style={styles.badgeText}>Weekly Challenge</Text>
        </View>
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
          <Text style={styles.timerText}>{daysLeft}d left</Text>
        </View>
      </View>

      {/* Animal to find */}
      <View style={styles.targetRow}>
        <View style={[styles.iconCircle, { backgroundColor: catColor + '20', borderColor: catColor }]}>
          <Text style={styles.questionMark}>?</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.findLabel}>Find this animal near you</Text>
          <Text style={styles.animalName}>{animal.name}</Text>
          <View style={styles.catRow}>
            <Ionicons name={catIcon} size={13} color={catColor} />
            <Text style={[styles.catLabel, { color: catColor }]}>
              {animal.category.charAt(0).toUpperCase() + animal.category.slice(1)} animal
            </Text>
          </View>
        </View>
      </View>

      {/* Hint */}
      <View style={styles.hintBox}>
        <Ionicons name="bulb-outline" size={15} color="#F59E0B" />
        <Text style={styles.hintText}>{animal.hint}</Text>
      </View>

      <Text style={styles.cta}>📷 Scan it to complete the challenge!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  completedCard: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBEA',
  },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  timerText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  // Target
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  questionMark: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  findLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 2 },
  animalName: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  catLabel: { fontSize: 12, fontWeight: '700' },

  // Hint
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFFBEA', borderRadius: 12, padding: 10,
  },
  hintText: { flex: 1, fontSize: 12, color: COLORS.text, lineHeight: 18, fontWeight: '500' },

  // CTA
  cta: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },

  // Completed
  completedHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trophy: { fontSize: 40 },
  completedTitle: { fontSize: 18, fontWeight: '900', color: '#92400E' },
  completedSub: { fontSize: 12, color: '#B45309', fontWeight: '600' },
  completedAnimalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  completedAnimalName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  resetNote: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },

  // Skeleton
  skeleton: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  skeletonLine: { height: 16, backgroundColor: COLORS.border, borderRadius: 8, width: '80%' },
});
