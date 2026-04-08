import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../../config/constants';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  onPress: () => void;
}

export default function CameraButton({ onPress }: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => { scale.value = withSpring(0.96); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <AnimatedTouchable
      style={[styles.btn, animStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Ionicons name="camera" size={28} color={COLORS.white} />
      <Text style={styles.label}>Scan Animal</Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: '100%',
    height: SIZES.cameraButtonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
