import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/constants';
import { AnimalCategory } from '../../types/animal';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const BOOK_CONFIG: Record<AnimalCategory, {
  color: string;
  lightColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  emoji: string;
}> = {
  land: { color: COLORS.land, lightColor: COLORS.landLight, icon: 'leaf', label: 'Land', emoji: '🪨' },
  sea: { color: COLORS.sea, lightColor: COLORS.seaLight, icon: 'water', label: 'Sea', emoji: '🌊' },
  air: { color: COLORS.air, lightColor: COLORS.airLight, icon: 'cloud', label: 'Air', emoji: '💨' },
};

interface Props {
  category: AnimalCategory;
  count: number;
  onPress: () => void;
}

export default function CategoryBook({ category, count, onPress }: Props) {
  const config = BOOK_CONFIG[category];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      style={[styles.book, { backgroundColor: config.lightColor, borderColor: config.color }, animStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.94); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      activeOpacity={1}
    >
      {/* Count badge */}
      <View style={[styles.badge, { backgroundColor: config.color }]}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>

      {/* Icon */}
      <Text style={styles.emoji}>{config.emoji}</Text>
      <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={24} color={COLORS.white} />
      </View>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      <Text style={styles.sublabel}>Animals</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  book: {
    width: SIZES.bookWidth,
    height: SIZES.bookHeight,
    borderRadius: SIZES.borderRadius,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  emoji: { fontSize: 20 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 15, fontWeight: '800', marginTop: 4 },
  sublabel: { fontSize: 11, color: COLORS.textSecondary },
});
