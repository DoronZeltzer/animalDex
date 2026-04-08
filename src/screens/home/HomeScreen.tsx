import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, CameraStackParamList, CollectionsStackParamList, FriendsStackParamList } from '../../types/navigation';
import CameraButton from '../../components/home/CameraButton';
import CategoryBook from '../../components/home/CategoryBook';
import FriendStrip from '../../components/home/FriendStrip';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { COLORS, SIZES } from '../../config/constants';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { animals: landAnimals } = useCollection('land');
  const { animals: seaAnimals } = useCollection('sea');
  const { animals: airAnimals } = useCollection('air');
  const { width } = useWindowDimensions();

  const bookWidth = SIZES.bookWidth;
  const bookHeight = SIZES.bookHeight;
  const gap = 16;
  const triangleHeight = bookHeight + gap + bookHeight / 2;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>Hi, {user?.displayName?.split(' ')[0] ?? 'Explorer'}! 👋</Text>
        <Text style={styles.greetingSubtext}>What will you discover today?</Text>
      </View>

      {/* Camera Button */}
      <CameraButton onPress={() => navigation.navigate('CameraTab', { screen: 'Camera' })} />

      {/* Category Books - Triangle Layout */}
      <View style={styles.booksSection}>
        <Text style={styles.sectionTitle}>Your Collections</Text>
        <View style={[styles.triangle, { height: triangleHeight }]}>
          {/* Land - top center */}
          <View style={[styles.topBook, { left: width / 2 - bookWidth / 2 - 24 }]}>
            <CategoryBook
              category="land"
              count={landAnimals.length}
              onPress={() => navigation.navigate('CollectionsTab', { screen: 'Category', params: { category: 'land' } })}
            />
          </View>
          {/* Sea - bottom left */}
          <View style={[styles.bottomLeft]}>
            <CategoryBook
              category="sea"
              count={seaAnimals.length}
              onPress={() => navigation.navigate('CollectionsTab', { screen: 'Category', params: { category: 'sea' } })}
            />
          </View>
          {/* Air - bottom right */}
          <View style={[styles.bottomRight]}>
            <CategoryBook
              category="air"
              count={airAnimals.length}
              onPress={() => navigation.navigate('CollectionsTab', { screen: 'Category', params: { category: 'air' } })}
            />
          </View>
        </View>
      </View>

      {/* Friends Strip */}
      <FriendStrip onPress={() => navigation.navigate('FriendsTab', { screen: 'Friends' })} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard emoji="🌿" label="Land" count={landAnimals.length} color={COLORS.land} />
        <StatCard emoji="🌊" label="Sea" count={seaAnimals.length} color={COLORS.sea} />
        <StatCard emoji="💨" label="Air" count={airAnimals.length} color={COLORS.air} />
      </View>
    </ScrollView>
  );
}

function StatCard({ emoji, label, count, color }: { emoji: string; label: string; count: number; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 32 },
  greeting: { marginBottom: 16 },
  greetingText: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  greetingSubtext: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  booksSection: { marginTop: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  triangle: { position: 'relative', width: '100%' },
  topBook: { position: 'absolute', top: 0 },
  bottomLeft: { position: 'absolute', bottom: 0, left: 0 },
  bottomRight: { position: 'absolute', bottom: 0, right: 0 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  statEmoji: { fontSize: 20 },
  statCount: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
});
