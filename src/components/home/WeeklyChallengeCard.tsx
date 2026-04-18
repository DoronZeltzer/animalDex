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

// 8 confetti pieces — positions spread across the card width (0..1)
const PARTICLES = [
  { emoji: '🎉', x: 0.05 },
  { emoji: '✨', x: 0.20 },
  { emoji: '🐾', x: 0.35 },
  { emoji: '⭐', x: 0.50 },
  { emoji: '🌟', x: 0.65 },
  { emoji: '🎊', x: 0.75 },
  { emoji: '💫', x: 0.88 },
  { emoji: '🏅', x: 0.45 },
];

interface Props {
  challenge: WeeklyChallengeState;
}

export default function WeeklyChallengeCard({ challenge }: Props) {
  // Trophy pulse
  const pulse = useRef(new Animated.Value(1)).current;

  // Card entrance scale (fires when completed flips to true)
  const cardScale = useRef(new Animated.Value(1)).current;

  // Gold shimmer opacity
  const shimmer = useRef(new Animated.Value(0)).current;

  // Confetti — one set of anims per particle, allocated once
  const particleAnims = useRef(
    PARTICLES.map(() => ({
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!challenge.completed) return;

    // 1. Card pop-in
    cardScale.setValue(0.92);
    Animated.spring(cardScale, {
      toValue: 1,
      damping: 10,
      stiffness: 120,
      useNativeDriver: true,
    }).start();

    // 2. Trophy pulse (infinite)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // 3. Gold shimmer (infinite)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0.3, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // 4. Confetti particles — each floats up with a staggered delay, then loops
    particleAnims.forEach((anim, i) => {
      const delay = i * 120;
      const runOne = () => {
        anim.y.setValue(0);
        anim.opacity.setValue(0);
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(anim.opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(anim.y, { toValue: -90, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
          Animated.timing(anim.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => runOne()); // loop
      };
      runOne();
    });
  }, [challenge.completed]);

  // ── Skeleton ────────────────────────────────────────────────────────────────
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
  const catIcon  = CATEGORY_ICON[animal.category];

  // ── Completed state ─────────────────────────────────────────────────────────
  if (completed) {
    return (
      <Animated.View style={[styles.card, styles.completedCard, { transform: [{ scale: cardScale }] }]}>

        {/* Gold shimmer border overlay */}
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmerBorder, { opacity: shimmer }]}
        />

        {/* Floating confetti particles */}
        {PARTICLES.map((p, i) => (
          <Animated.Text
            key={i}
            pointerEvents="none"
            style={[
              styles.particle,
              {
                left: `${p.x * 100}%` as any,
                transform: [{ translateY: particleAnims[i].y }],
                opacity: particleAnims[i].opacity,
              },
            ]}
          >
            {p.emoji}
          </Animated.Text>
        ))}

        {/* Trophy row */}
        <View style={styles.completedHeader}>
          <Animated.Text style={[styles.trophy, { transform: [{ scale: pulse }] }]}>🏆</Animated.Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.completedTitle}>Challenge Complete!</Text>
            <Text style={styles.completedSub}>You found this week's animal</Text>
          </View>
          <View style={styles.starsBadge}>
            <Text style={styles.starsText}>+⭐</Text>
          </View>
        </View>

        {/* Animal name */}
        <View style={styles.completedAnimalRow}>
          <View style={[styles.catDot, { backgroundColor: catColor }]}>
            <Ionicons name={catIcon} size={13} color="#fff" />
          </View>
          <Text style={styles.completedAnimalName}>{animal.name}</Text>
          <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
        </View>

        {/* Divider + reset note */}
        <View style={styles.divider} />
        <Text style={styles.resetNote}>
          🔁 New challenge in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
        </Text>
      </Animated.View>
    );
  }

  // ── Active (not completed) state ────────────────────────────────────────────
  return (
    <View style={styles.card}>
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

  // ── Completed ──────────────────────────────────────────────────────────────
  completedCard: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBEA',
    overflow: 'hidden',      // clips confetti to card bounds
  },
  shimmerBorder: {
    position: 'absolute', inset: 0,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FFD700',
  },
  particle: {
    position: 'absolute',
    bottom: 10,
    fontSize: 18,
    zIndex: 10,
  },
  completedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trophy: { fontSize: 44 },
  completedTitle: { fontSize: 18, fontWeight: '900', color: '#92400E' },
  completedSub: { fontSize: 12, color: '#B45309', fontWeight: '600', marginTop: 1 },
  starsBadge: {
    backgroundColor: '#FEF08A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  starsText: { fontSize: 13, fontWeight: '800', color: '#92400E' },
  completedAnimalRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  completedAnimalName: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.text },
  divider: { height: 1, backgroundColor: '#FDE68A' },
  resetNote: { fontSize: 12, color: '#B45309', fontWeight: '600', textAlign: 'center' },

  // ── Active ─────────────────────────────────────────────────────────────────
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  timerText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  questionMark: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  findLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 2 },
  animalName: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  catLabel: { fontSize: 12, fontWeight: '700' },
  hintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFFBEA', borderRadius: 12, padding: 10,
  },
  hintText: { flex: 1, fontSize: 12, color: COLORS.text, lineHeight: 18, fontWeight: '500' },
  cta: { fontSize: 13, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },

  // ── Skeleton ───────────────────────────────────────────────────────────────
  skeleton: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  skeletonLine: { height: 16, backgroundColor: COLORS.border, borderRadius: 8, width: '80%' },
});
