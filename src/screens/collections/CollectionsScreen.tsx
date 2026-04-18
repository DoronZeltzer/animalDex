import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../config/constants';
import { useCollection } from '../../hooks/useCollection';
import { useWeeklyChallenge } from '../../hooks/useWeeklyChallenge';
import { useGoldTheme } from '../../context/GoldThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { CollectedAnimal } from '../../types/animal';

export default function CollectionsScreen() {
  const navigation = useNavigation<any>();
  const { animals: land } = useCollection('land');
  const { animals: sea } = useCollection('sea');
  const { animals: air } = useCollection('air');
  const { goldLevel } = useGoldTheme();
  const weeklyChallenge = useWeeklyChallenge();
  const [query, setQuery] = useState('');

  const total = land.length + sea.length + air.length;
  const allAnimals = [...land, ...sea, ...air];

  const searchResults = query.trim().length > 0
    ? allAnimals.filter((a) =>
        a.commonName.toLowerCase().includes(query.toLowerCase()) ||
        a.scientificName?.toLowerCase().includes(query.toLowerCase()) ||
        a.subcategory?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const CATEGORY_COLOR = { land: COLORS.land, sea: COLORS.sea, air: COLORS.air };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Collections</Text>
      <Text style={styles.subtitle}>{total} animals discovered</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search animals..."
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {query.trim().length > 0 ? (
        searchResults.length === 0 ? (
          <Text style={styles.noResults}>No animals found for "{query}"</Text>
        ) : (
          searchResults.map((animal) => (
            <TouchableOpacity
              key={animal.animalId}
              style={styles.resultRow}
              onPress={() => navigation.navigate('AnimalDetail', { animalId: animal.animalId })}
              activeOpacity={0.8}
            >
              <View style={[styles.resultDot, { backgroundColor: CATEGORY_COLOR[animal.category] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resultName}>{animal.commonName}</Text>
                <Text style={styles.resultSub}>{animal.subcategory} · {animal.category}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))
        )
      ) : (
        <>
          <CategoryCard
            icon="leaf"
            title="Land Animals"
            description="Mammals, reptiles, insects and more"
            count={land.length}
            color={COLORS.land}
            lightColor={COLORS.landLight}
            onPress={() => navigation.navigate('Category', { category: 'land' })}
          />
          <CategoryCard
            icon="water"
            title="Sea Animals"
            description="Fish, mammals, and ocean creatures"
            count={sea.length}
            color={COLORS.sea}
            lightColor={COLORS.seaLight}
            onPress={() => navigation.navigate('Category', { category: 'sea' })}
          />
          <CategoryCard
            icon="cloud"
            title="Air Animals"
            description="Birds, bats, and flying insects"
            count={air.length}
            color={COLORS.air}
            lightColor={COLORS.airLight}
            onPress={() => navigation.navigate('Category', { category: 'air' })}
          />
          <CategoryCard
            icon="trophy"
            title="Weekly Challenges"
            description={weeklyChallenge.completed ? `This week's challenge done! 🏆` : `This week: ${weeklyChallenge.challenge?.name ?? '...'}`}
            count={goldLevel}
            countLabel="gold level"
            color="#D97706"
            lightColor="#FEF3C7"
            onPress={() => navigation.navigate('WeeklyChallenges')}
          />
        </>
      )}
    </ScrollView>
  );
}

function CategoryCard({ icon, title, description, count, countLabel = 'collected', color, lightColor, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconArea, { backgroundColor: lightColor }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
        <Text style={[styles.cardCount, { color }]}>{count} {countLabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingTop: 48, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 16, marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.text },
  noResults: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14, marginTop: 24 },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resultDot: { width: 10, height: 10, borderRadius: 5 },
  resultName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  resultSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    height: 90,
  },
  iconArea: { width: 80, height: '100%', alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 36 },
  cardInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardCount: { fontSize: 13, fontWeight: '700', marginTop: 6 },
});
