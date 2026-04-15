import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { CollectionsStackParamList } from '../../types/navigation';
import { useCollection } from '../../hooks/useCollection';
import { COLORS, SIZES, ANIMAL_SUBCATEGORIES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<CollectionsStackParamList, 'Category'>;

const CATEGORY_EMOJIS: Record<string, Record<string, string>> = {
  land: { dogs: '🐶', cats: '🐱', horses: '🐴', cattle: '🐄', deer: '🦌', foxes: '🦊', bears: '🐻', elephants: '🐘', lions: '🦁', tigers: '🐯', primates: '🐒', reptiles: '🦎', insects: '🐛', 'other land': '🐾' },
  sea:  { fish: '🐟', sharks: '🦈', dolphins: '🐬', whales: '🐋', turtles: '🐢', crabs: '🦀', jellyfish: '🪼', octopus: '🐙', coral: '🪸', 'other sea': '🌊' },
  air:  { eagles: '🦅', owls: '🦉', parrots: '🦜', pigeons: '🕊️', ducks: '🦆', penguins: '🐧', bats: '🦇', butterflies: '🦋', 'other air': '💨' },
};

export default function CategoryScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { animals, loading } = useCollection(params.category);
  const [query, setQuery] = useState('');

  const CATEGORY_COLOR = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air }[params.category];
  const CATEGORY_LABEL = { land: 'Land', sea: 'Sea', air: 'Air' }[params.category];
  const subcategories = ANIMAL_SUBCATEGORIES[params.category] ?? [];

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={CATEGORY_COLOR} size="large" /></View>;
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

  // Group animals by subcategory
  const grouped: Record<string, number> = {};
  animals.forEach((a) => {
    const key = a.subcategory?.toLowerCase() ?? 'other';
    grouped[key] = (grouped[key] ?? 0) + 1;
  });

  const activeSubcategories = subcategories.filter((s) => grouped[s] > 0);
  Object.keys(grouped).forEach((k) => {
    if (!activeSubcategories.includes(k)) activeSubcategories.push(k);
  });

  const filteredSubs = query.trim()
    ? activeSubcategories.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : activeSubcategories;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.total}>{animals.length} animal{animals.length !== 1 ? 's' : ''} collected</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search subcategories..."
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

      {filteredSubs.length === 0 ? (
        <Text style={styles.noResults}>No results for "{query}"</Text>
      ) : (
        filteredSubs.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[styles.card, { borderColor: CATEGORY_COLOR }]}
            onPress={() => navigation.navigate('Subcategory', { category: params.category, subcategory: sub })}
            activeOpacity={0.85}
          >
            <View style={[styles.iconArea, { backgroundColor: CATEGORY_COLOR + '22' }]}>
              <Text style={styles.emoji}>{CATEGORY_EMOJIS[params.category]?.[sub] ?? '🐾'}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.subName, { color: CATEGORY_COLOR }]}>{(sub ?? 'Other').charAt(0).toUpperCase() + (sub ?? 'other').slice(1)}</Text>
              <Text style={styles.count}>{grouped[sub]} collected</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} style={{ marginRight: 14 }} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 32 },
  total: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text },
  noResults: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14, marginTop: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 12,
    height: 80,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  iconArea: { width: 72, height: '100%', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 30 },
  info: { flex: 1, paddingHorizontal: 14 },
  subName: { fontSize: 16, fontWeight: '800' },
  count: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
});
