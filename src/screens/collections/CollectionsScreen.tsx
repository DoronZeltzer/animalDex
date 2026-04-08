import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '../../config/constants';
import { useCollection } from '../../hooks/useCollection';
import { Ionicons } from '@expo/vector-icons';

export default function CollectionsScreen() {
  const navigation = useNavigation<any>();
  const { animals: land } = useCollection('land');
  const { animals: sea } = useCollection('sea');
  const { animals: air } = useCollection('air');

  const total = land.length + sea.length + air.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Collections</Text>
      <Text style={styles.subtitle}>{total} animals discovered</Text>

      <CategoryCard
        emoji="🌿"
        title="Land Animals"
        description="Mammals, reptiles, insects and more"
        count={land.length}
        color={COLORS.land}
        lightColor={COLORS.landLight}
        onPress={() => navigation.navigate('Category', { category: 'land' })}
      />
      <CategoryCard
        emoji="🌊"
        title="Sea Animals"
        description="Fish, mammals, and ocean creatures"
        count={sea.length}
        color={COLORS.sea}
        lightColor={COLORS.seaLight}
        onPress={() => navigation.navigate('Category', { category: 'sea' })}
      />
      <CategoryCard
        emoji="💨"
        title="Air Animals"
        description="Birds, bats, and flying insects"
        count={air.length}
        color={COLORS.air}
        lightColor={COLORS.airLight}
        onPress={() => navigation.navigate('Category', { category: 'air' })}
      />
    </ScrollView>
  );
}

function CategoryCard({ emoji, title, description, count, color, lightColor, onPress }: any) {
  return (
    <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconArea, { backgroundColor: lightColor }]}>
        <Text style={styles.cardEmoji}>{emoji}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
        <Text style={[styles.cardCount, { color }]}>{count} collected</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 24, marginTop: 4 },
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
  },
  iconArea: { width: 80, height: 90, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 36 },
  cardInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  cardCount: { fontSize: 13, fontWeight: '700', marginTop: 6 },
});
