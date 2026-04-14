import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CollectionsStackParamList } from '../../types/navigation';
import { useCollection } from '../../hooks/useCollection';
import { COLORS, SIZES } from '../../config/constants';
import { CollectedAnimal } from '../../types/animal';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<CollectionsStackParamList, 'Subcategory'>;

export default function SubcategoryScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { animals, loading } = useCollection(params.category);
  const [query, setQuery] = useState('');

  const CATEGORY_COLOR = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air }[params.category];

  const filtered = animals.filter(
    (a) => a.subcategory?.toLowerCase() === params.subcategory.toLowerCase()
  );

  const results = query.trim()
    ? filtered.filter((a) =>
        a.commonName.toLowerCase().includes(query.toLowerCase()) ||
        a.scientificName?.toLowerCase().includes(query.toLowerCase())
      )
    : filtered;

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={CATEGORY_COLOR} size="large" /></View>;
  }

  if (filtered.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📷</Text>
        <Text style={styles.emptyTitle}>No {params.subcategory} yet!</Text>
        <Text style={styles.emptyText}>Photograph some to add them here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(a) => a.animalId}
      numColumns={2}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.total}>{filtered.length} animal{filtered.length !== 1 ? 's' : ''} collected</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search animals..."
              placeholderTextColor={COLORS.textSecondary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          {query.trim().length > 0 && results.length === 0 && (
            <Text style={styles.noResults}>No results for "{query}"</Text>
          )}
        </View>
      }
      contentContainerStyle={styles.content}
      style={{ backgroundColor: COLORS.background }}
      renderItem={({ item }) => (
        <AnimalCard
          animal={item}
          color={CATEGORY_COLOR}
          onPress={() => navigation.navigate('AnimalDetail', { animalId: item.animalId })}
        />
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
  header: { paddingHorizontal: SIZES.paddingSmall, paddingTop: SIZES.paddingSmall, paddingBottom: 4 },
  total: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text },
  noResults: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14, marginVertical: 12 },
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
});
