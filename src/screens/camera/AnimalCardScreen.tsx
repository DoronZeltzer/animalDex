import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Animated, Easing,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CameraStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { addAnimalToCollection, hasAnimal } from '../../services/firestoreService';
import { COLORS, SIZES } from '../../config/constants';
import { getCategoryLabel } from '../../utils/animalUtils';
import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp } from 'firebase/firestore';

type Route = RouteProp<CameraStackParamList, 'AnimalCard'>;

export default function AnimalCardScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const { identification, photoUri } = params;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Card reveal animation
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Toast animation
  const toastY = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const CATEGORY_COLOR = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air }[identification.category];

  const showToast = () => {
    Animated.parallel([
      Animated.timing(toastY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastY, { toValue: -100, duration: 350, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          navigation.navigate('CameraTab', { screen: 'Camera' });
        });
      }, 2500);
    });
  };

  const handleAddToCollection = async () => {
    if (!user || saving || saved) return;
    try {
      setSaving(true);

      const alreadyHas = await hasAnimal(user.uid, identification.commonName);
      if (alreadyHas) {
        Alert.alert('Already Collected!', `${identification.commonName} is already in your collection.`);
        setSaving(false);
        return;
      }

      const animalId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const photoURL = photoUri;

      await addAnimalToCollection(user.uid, {
        animalId,
        commonName: identification.commonName,
        scientificName: identification.scientificName,
        category: identification.category,
        subcategory: identification.subcategory,
        breed: identification.breed ?? undefined,
        photoURL,
        thumbnailURL: photoURL,
        lifespan: identification.lifespan,
        averageSize: identification.averageSize,
        weight: identification.weight,
        history: identification.history,
        funFact: identification.funFact,
        capturedAt: serverTimestamp(),
        claudeConfidence: identification.confidence,
        isFirstCapture: true,
      });

      setSaved(true);
      showToast();
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to save animal.');
      setSaving(false);
    }
  };

  return (
    <>
      {/* Toast notification */}
      <Animated.View style={[styles.toast, { transform: [{ translateY: toastY }], opacity: toastOpacity }]}>
        <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
        <Text style={styles.toastText}>
          {identification.commonName} added to {identification.category} collection!
        </Text>
      </Animated.View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}>
          <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />

          <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLOR }]}>
            <Text style={styles.categoryText}>{getCategoryLabel(identification.category)}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.commonName}>{identification.commonName}</Text>
            <Text style={styles.scientificName}>{identification.scientificName}</Text>

            {identification.breed && (
              <View style={styles.breedBadge}>
                <Text style={styles.breedText}>Breed: {identification.breed}</Text>
              </View>
            )}

            <View style={styles.statsGrid}>
              <StatItem icon="time-outline" label="Lifespan" value={identification.lifespan} />
              <StatItem icon="resize-outline" label="Size" value={identification.averageSize} />
              <StatItem icon="barbell-outline" label="Weight" value={identification.weight} />
              <StatItem icon="star-outline" label="Confidence" value={`${Math.round(identification.confidence * 100)}%`} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bodyText}>{identification.history}</Text>
            </View>

            <View style={[styles.section, styles.funFactBox]}>
              <Text style={styles.funFactEmoji}>💡</Text>
              <Text style={styles.funFactText}>{identification.funFact}</Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[styles.collectBtn, { backgroundColor: CATEGORY_COLOR }, (saving || saved) && styles.collectBtnDisabled]}
          onPress={handleAddToCollection}
          disabled={saving || saved}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.collectBtnText}>
              {saved ? '✓ Collected!' : `Add to ${identification.category.charAt(0).toUpperCase() + identification.category.slice(1)} Collection`}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function StatItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  backBtn: { marginBottom: 12, padding: 4, alignSelf: 'flex-start' },
  toast: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    backgroundColor: COLORS.success,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: COLORS.card, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  photo: { width: '100%', height: 260 },
  categoryBadge: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  info: { padding: 20 },
  commonName: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  scientificName: { fontSize: 15, fontStyle: 'italic', color: COLORS.textSecondary, marginTop: 2 },
  breedBadge: { backgroundColor: COLORS.landLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 8 },
  breedText: { fontSize: 13, color: COLORS.land, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 },
  statItem: { flex: 1, minWidth: '45%', backgroundColor: COLORS.background, borderRadius: 12, padding: 12, gap: 4 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 14, color: COLORS.text, fontWeight: '800' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  bodyText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  funFactBox: { backgroundColor: '#FFF9E6', borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  funFactEmoji: { fontSize: 20 },
  funFactText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
  collectBtn: { borderRadius: 16, paddingVertical: 17, alignItems: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  collectBtnDisabled: { opacity: 0.6 },
  collectBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
});
