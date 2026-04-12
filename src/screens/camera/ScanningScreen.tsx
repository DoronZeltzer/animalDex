import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, Alert, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraStackParamList } from '../../types/navigation';
import { identifyAnimal } from '../../services/claudeService';
import { COLORS } from '../../config/constants';
import * as SecureStore from 'expo-secure-store';

type Nav = RouteProp<CameraStackParamList, 'Scanning'>;

const STATUS_MESSAGES = [
  'Scanning animal...',
  'Analyzing species...',
  'Consulting database...',
  'Almost there...',
];

export default function ScanningScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Nav>();
  const [statusIdx, setStatusIdx] = useState(0);
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      })
    ).start();

    const interval = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function scan() {
      try {
        const apiKey =
          (await SecureStore.getItemAsync('GOOGLE_API_KEY')) ??
          process.env.EXPO_PUBLIC_GOOGLE_API_KEY ??
          '';
        if (!apiKey) {
          Alert.alert(
            'API Key Missing',
            'Set your Google API key in the Profile tab → Settings.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
          return;
        }
        const result = await identifyAnimal(params.base64, apiKey);
        if (!result.isAnimal) {
          Alert.alert('No Animal Found', 'Could not identify an animal. Try again!', [
            { text: 'Try Again', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        navigation.replace('AnimalCard', { identification: result, photoUri: params.photoUri });
      } catch (error: any) {
        const apiErr = error.response?.data?.error;
        const msg = apiErr ? `${apiErr.message} (${apiErr.status ?? apiErr.code})` : (error.message ?? 'Could not identify animal.');
        Alert.alert('Scan Failed', msg, [
          { text: 'Try Again', onPress: () => navigation.goBack() },
        ]);
      }
    }
    scan();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Image source={{ uri: params.photoUri }} style={StyleSheet.absoluteFill} blurRadius={20} />
      <View style={styles.overlay} />

      <View style={styles.radarContainer}>
        <View style={styles.radarOuter}>
          <View style={styles.radarMid} />
          <View style={styles.radarInner} />
          <Animated.View style={[styles.sweep, { transform: [{ rotate: spin }] }]} />
        </View>
        <Text style={styles.paw}>🐾</Text>
      </View>

      <Text style={styles.status}>{STATUS_MESSAGES[statusIdx]}</Text>
      <ActivityIndicator color={COLORS.primary} style={{ marginTop: 12 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  radarContainer: { alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  radarOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  radarMid: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: `${COLORS.primary}80`,
  },
  radarInner: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: `${COLORS.primary}50`,
  },
  sweep: {
    position: 'absolute',
    width: 100,
    height: 2,
    backgroundColor: COLORS.primary,
    top: 99,
    left: 100,
    opacity: 0.9,
  },
  paw: { position: 'absolute', fontSize: 32, zIndex: 2 },
  status: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginTop: 32, zIndex: 1 },
});
