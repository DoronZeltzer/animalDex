import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CollectionsStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { getAnimalById } from '../../services/firestoreService';
import { CollectedAnimal } from '../../types/animal';
import { COLORS, SIZES } from '../../config/constants';
import { getCategoryLabel } from '../../utils/animalUtils';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<CollectionsStackParamList, 'AnimalDetail'>;

export default function AnimalDetailScreen() {
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const [animal, setAnimal] = useState<CollectedAnimal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getAnimalById(user.uid, params.animalId).then((a) => {
      setAnimal(a);
      setLoading(false);
    });
  }, [params.animalId, user]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  if (!animal) return <View style={styles.loading}><Text>Animal not found.</Text></View>;

  const color = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air }[animal.category];

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: animal.photoURL }} style={styles.photo} />
      <View style={[styles.categoryBadge, { backgroundColor: color }]}>
        <Text style={styles.categoryText}>{getCategoryLabel(animal.category)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{animal.commonName}</Text>
        <Text style={styles.scientific}>{animal.scientificName}</Text>
        <View style={styles.statsGrid}>
          <StatItem icon="time-outline" label="Lifespan" value={animal.lifespan} />
          <StatItem icon="resize-outline" label="Size" value={animal.averageSize} />
          <StatItem icon="barbell-outline" label="Weight" value={animal.weight} />
        </View>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{animal.history}</Text>
        <View style={styles.funFactBox}>
          <Text style={styles.funFactEmoji}>💡</Text>
          <Text style={styles.funFact}>{animal.funFact}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StatItem({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 280 },
  categoryBadge: { position: 'absolute', top: 16, right: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  info: { padding: SIZES.padding },
  name: { fontSize: 26, fontWeight: '900', color: COLORS.text },
  scientific: { fontSize: 15, fontStyle: 'italic', color: COLORS.textSecondary, marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 10, marginTop: 20, flexWrap: 'wrap' },
  statItem: { flex: 1, minWidth: '30%', backgroundColor: COLORS.card, borderRadius: 12, padding: 10, gap: 3 },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 13, color: COLORS.text, fontWeight: '800' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginTop: 20, marginBottom: 8 },
  body: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  funFactBox: { flexDirection: 'row', gap: 10, backgroundColor: '#FFF9E6', borderRadius: 14, padding: 14, marginTop: 16, alignItems: 'flex-start' },
  funFactEmoji: { fontSize: 20 },
  funFact: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
});
