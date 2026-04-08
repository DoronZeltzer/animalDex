import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CollectionsStackParamList } from '../../types/navigation';
import { useCollection } from '../../hooks/useCollection';
import { COLORS, SIZES } from '../../config/constants';
import { CollectedAnimal } from '../../types/animal';

type Route = RouteProp<CollectionsStackParamList, 'Category'>;

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { animals, loading } = useCollection(params.category);

  const CATEGORY_COLOR = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air }[params.category];
  const CATEGORY_LABEL = { land: 'Land', sea: 'Sea', air: 'Air' }[params.category];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={CATEGORY_COLOR} size="large" />
      </View>
    );
  }

  if (animals.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📷</Text>
        <Text style={styles.emptyTitle}>No {CATEGORY_LABEL} animals yet!</Text>
        <Text style={styles.emptyText}>Use the camera to photograph and collect {CATEGORY_LABEL.toLowerCase()} animals.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={animals}
      keyExtractor={(a) => a.animalId}
      numColumns={2}
      contentContainerStyle={styles.content}
      style={{ backgroundColor: COLORS.background }}
      renderItem={({ item }) => (
        <AnimalCard animal={item} color={CATEGORY_COLOR} onPress={() => navigation.navigate('AnimalDetail', { animalId: item.animalId })} />
      )}
    />
  );
}

function AnimalCard({ animal, color, onPress }: { animal: CollectedAnimal; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: animal.photoURL }} style={styles.photo} />
      <View style={styles.cardInfo}>
        <Text style={[styles.name, { color }]} numberOfLines={1}>{animal.commonName}</Text>
        <Text style={styles.scientific} numberOfLines={1}>{animal.scientificName}</Text>
        <Text style={styles.subcategory}>{animal.subcategory}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  content: { padding: SIZES.paddingSmall },
  card: {
    flex: 1,
    margin: SIZES.paddingSmall,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  photo: { width: '100%', height: 130 },
  cardInfo: { padding: 10 },
  name: { fontSize: 13, fontWeight: '800' },
  scientific: { fontSize: 11, fontStyle: 'italic', color: COLORS.textSecondary, marginTop: 1 },
  subcategory: { fontSize: 10, color: COLORS.textSecondary, marginTop: 3, textTransform: 'capitalize' },
});
