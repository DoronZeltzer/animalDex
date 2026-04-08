import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FriendsStackParamList } from '../../types/navigation';
import { getUserProfile } from '../../services/firestoreService';
import { subscribeToUserAnimals } from '../../services/firestoreService';
import { UserProfile } from '../../types/user';
import { CollectedAnimal } from '../../types/animal';
import { COLORS, SIZES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<FriendsStackParamList, 'FriendProfile'>;

export default function FriendProfileScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [animals, setAnimals] = useState<CollectedAnimal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile(params.friendId).then(setProfile);
    const unsub = subscribeToUserAnimals(params.friendId, null, (a) => {
      setAnimals(a);
      setLoading(false);
    });
    return unsub;
  }, [params.friendId]);

  if (loading) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{params.friendName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{params.friendName}</Text>
        <Text style={styles.subtext}>{animals.length} animals discovered</Text>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => navigation.navigate('Chat', { friendId: params.friendId, friendName: params.friendName })}
        >
          <Ionicons name="chatbubble" size={16} color={COLORS.white} />
          <Text style={styles.chatBtnText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Land" count={profile?.landCount ?? 0} color={COLORS.land} emoji="🌿" />
        <StatCard label="Sea" count={profile?.seaCount ?? 0} color={COLORS.sea} emoji="🌊" />
        <StatCard label="Air" count={profile?.airCount ?? 0} color={COLORS.air} emoji="💨" />
      </View>

      {/* Recent animals */}
      <Text style={styles.sectionTitle}>Recent Discoveries</Text>
      {animals.slice(0, 6).map((a) => (
        <View key={a.animalId} style={styles.animalRow}>
          <Image source={{ uri: a.photoURL }} style={styles.animalThumb} />
          <View>
            <Text style={styles.animalName}>{a.commonName}</Text>
            <Text style={styles.animalSci}>{a.scientificName}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function StatCard({ label, count, color, emoji }: any) {
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, color: COLORS.white, fontWeight: '900' },
  name: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 12 },
  subtext: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginTop: 12, gap: 6 },
  chatBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1.5, padding: 12, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statCount: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  animalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 10, marginBottom: 8 },
  animalThumb: { width: 50, height: 50, borderRadius: 10 },
  animalName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  animalSci: { fontSize: 11, fontStyle: 'italic', color: COLORS.textSecondary },
});
