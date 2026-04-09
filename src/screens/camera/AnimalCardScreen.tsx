import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Modal, Animated, Easing,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CameraStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { addAnimalToCollection, hasAnimal } from '../../services/firestoreService';
import { uploadAnimalPhoto } from '../../services/storageService';
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
  const [showAnimation, setShowAnimation] = useState(false);

  // Card reveal animation
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  // Paper-suck animation values
  const animScale = useRef(new Animated.Value(1)).current;
  const animOpacity = useRef(new Animated.Value(1)).current;
  const animTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const CATEGORY_COLOR = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air }[identification.category];

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
      const photoURL = await uploadAnimalPhoto(user.uid, animalId, photoUri);

      await addAnimalToCollection(user.uid, {
        animalId,
        commonName: identification.commonName,
        scientificName: identification.scientificName,
        category: identification.category,
        subcategory: identification.subcategory,
        breed: identification.breed,
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

      // Paper-suck animation
      setShowAnimation(true);
      Animated.parallel([
        Animated.timing(animScale, {
          toValue: 0.1,
          duration: 800,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(animTranslateY, {
          toValue: -300,
          duration: 800,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start(() => onAnimationDone());
    } catch (error: any) {
      Alert.alert('Error', error.message ?? 'Failed to save animal.');
      setSaving(false);
    }
  };

  const onAnimationDone = () => {
    setSaved(true);
    setShowAnimation(false);
    Alert.alert(
      '🎉 Collected!',
      `${identification.commonName} added to your ${identification.category} collection!`,
      [{ text: 'Awesome!', onPress: () => navigation.navigate('HomeTab', { screen: 'Home' }) }]
    );
  };

  return (
    <>
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

      <Modal visible={showAnimation} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.animCard, {
            opacity: animOpacity,
            transform: [{ scale: animScale }, { translateY: animTranslateY }],
          }]}>
            <Image source={{ uri: photoUri }} style={styles.animPhoto} resizeMode="cover" />
            <Text style={styles.animName}>{identification.commonName}</Text>
          </Animated.View>
          <Text style={styles.sucking}>Adding to collection...</Text>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  animCard: { backgroundColor: COLORS.card, borderRadius: 20, overflow: 'hidden', width: 200, alignItems: 'center' },
  animPhoto: { width: 200, height: 120 },
  animName: { fontSize: 16, fontWeight: '800', color: COLORS.text, padding: 12 },
  sucking: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginTop: 24 },
});
