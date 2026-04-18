import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  ActivityIndicator, TouchableOpacity, Alert, Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FriendsStackParamList } from '../../types/navigation';
import { getUserProfile, removeFriend, subscribeToUserAnimals } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/user';
import { CollectedAnimal } from '../../types/animal';
import { COLORS, SIZES, ANIMAL_SUBCATEGORIES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<FriendsStackParamList, 'FriendProfile'>;
type Category = 'land' | 'sea' | 'air';

const TABS: { key: Category; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'land', label: 'Land', icon: 'leaf',  color: COLORS.land },
  { key: 'sea',  label: 'Sea',  icon: 'water', color: COLORS.sea  },
  { key: 'air',  label: 'Air',  icon: 'cloud', color: COLORS.air  },
];

const CATEGORY_EMOJIS: Record<string, Record<string, string>> = {
  land: { dogs: '🐶', cats: '🐱', horses: '🐴', cattle: '🐄', deer: '🦌', foxes: '🦊', bears: '🐻', elephants: '🐘', lions: '🦁', tigers: '🐯', primates: '🐒', reptiles: '🦎', insects: '🐛', 'other land': '🐾' },
  sea:  { fish: '🐟', sharks: '🦈', dolphins: '🐬', whales: '🐋', turtles: '🐢', crabs: '🦀', jellyfish: '🪼', octopus: '🐙', coral: '🪸', 'other sea': '🌊' },
  air:  { eagles: '🦅', owls: '🦉', parrots: '🦜', pigeons: '🕊️', ducks: '🦆', penguins: '🐧', bats: '🦇', butterflies: '🦋', 'other air': '💨' },
};

export default function FriendProfileScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
  const [animals, setAnimals] = useState<CollectedAnimal[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('land');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let unsubAnimals: (() => void) | null = null;

    Promise.all([
      getUserProfile(params.friendId),
      user ? getUserProfile(user.uid) : Promise.resolve(null),
    ]).then(([fp, mp]) => {
      setFriendProfile(fp);
      setMyProfile(mp);
      setLoading(false);

      const alreadyFriend = mp?.friends?.includes(params.friendId) ?? false;
      if (alreadyFriend) {
        unsubAnimals = subscribeToUserAnimals(params.friendId, null, setAnimals);
      }
    }).catch(() => setLoading(false));

    return () => { unsubAnimals?.(); };
  }, [params.friendId, user?.uid]);

  // Reset subcategory when tab changes
  useEffect(() => { setSelectedSubcategory(null); }, [activeTab]);

  const isFriend = myProfile?.friends?.includes(params.friendId) ?? false;
  const tabAnimals = animals.filter((a) => a.category === activeTab);
  const color = TABS.find((t) => t.key === activeTab)?.color ?? COLORS.primary;

  const handleRemoveFriend = () => {
    Alert.alert(
      'Remove Friend',
      `Remove ${params.friendName ?? 'this friend'} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setRemoving(true);
            try {
              await removeFriend(user.uid, params.friendId);
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not remove friend.');
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  // ── Subcategory animal grid ────────────────────────────────────────────────
  if (selectedSubcategory) {
    const subAnimals = tabAnimals.filter(
      (a) => a.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase()
    );
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backRow} onPress={() => setSelectedSubcategory(null)}>
          <Ionicons name="chevron-back" size={20} color={color} />
          <Text style={[styles.backText, { color }]}>
            {selectedSubcategory.charAt(0).toUpperCase() + selectedSubcategory.slice(1)}
          </Text>
        </TouchableOpacity>
        <FlatList
          data={subAnimals}
          keyExtractor={(a) => a.animalId}
          numColumns={2}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={
            <View style={styles.empty}><Text style={styles.emptyText}>No animals here yet.</Text></View>
          }
          renderItem={({ item }) => (
            <View style={styles.animalCard}>
              <Image source={{ uri: item.photoURL }} style={styles.animalImg} />
              <View style={styles.animalInfo}>
                <Text style={[styles.animalName, { color }]} numberOfLines={1}>{item.commonName}</Text>
                <Text style={styles.animalSci} numberOfLines={1}>{item.scientificName}</Text>
              </View>
            </View>
          )}
        />
      </View>
    );
  }

  // ── Main profile + subcategory list ───────────────────────────────────────
  const subcategories = ANIMAL_SUBCATEGORIES[activeTab] ?? [];
  const grouped: Record<string, number> = {};
  tabAnimals.forEach((a) => {
    const key = a.subcategory?.toLowerCase() ?? 'other';
    grouped[key] = (grouped[key] ?? 0) + 1;
  });
  const activeSubs = subcategories.filter((s) => grouped[s] > 0);
  Object.keys(grouped).forEach((k) => { if (!activeSubs.includes(k)) activeSubs.push(k); });

  return (
    <View style={styles.container}>
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(params.friendName ?? 'F').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{params.friendName}</Text>

        {isFriend ? (
          <>
            <View style={styles.statsRow}>
              <StatPill label="Land" count={friendProfile?.landCount ?? 0} color={COLORS.land} />
              <StatPill label="Sea"  count={friendProfile?.seaCount  ?? 0} color={COLORS.sea}  />
              <StatPill label="Air"  count={friendProfile?.airCount  ?? 0} color={COLORS.air}  />
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', { friendId: params.friendId, friendName: params.friendName })}
              >
                <Ionicons name="chatbubble" size={16} color={COLORS.white} />
                <Text style={styles.chatBtnText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tradeBtn}
                onPress={() => navigation.navigate('Trade', { mode: 'offer', friendId: params.friendId, friendName: params.friendName })}
              >
                <Ionicons name="swap-horizontal" size={16} color={COLORS.white} />
                <Text style={styles.tradeBtnText}>Trade</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveFriend} disabled={removing}>
                {removing
                  ? <ActivityIndicator size="small" color={COLORS.error} />
                  : <>
                      <Ionicons name="person-remove-outline" size={16} color={COLORS.error} />
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </>
                }
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.pendingBox}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.pendingText}>Accept the request to see their collection and chat.</Text>
          </View>
        )}
      </View>

      {isFriend && (
        <>
          {/* Tab bar */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const count = animals.filter((a) => a.category === tab.key).length;
              const active = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, active && { borderBottomColor: tab.color, borderBottomWidth: 3 }]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Ionicons name={tab.icon} size={18} color={active ? tab.color : COLORS.textSecondary} />
                  <Text style={[styles.tabLabel, active && { color: tab.color, fontWeight: '800' }]}>{tab.label}</Text>
                  <Text style={[styles.tabCount, { color: tab.color }]}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Subcategory cards */}
          {tabAnimals.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📷</Text>
              <Text style={styles.emptyText}>No {activeTab} animals yet!</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.subContent}>
              <Text style={styles.total}>{tabAnimals.length} animal{tabAnimals.length !== 1 ? 's' : ''} collected</Text>
              {activeSubs.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subCard, { borderColor: color }]}
                  onPress={() => setSelectedSubcategory(sub)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.subIconArea, { backgroundColor: color + '22' }]}>
                    <Text style={styles.subEmoji}>{CATEGORY_EMOJIS[activeTab]?.[sub] ?? '🐾'}</Text>
                  </View>
                  <View style={styles.subInfo}>
                    <Text style={[styles.subName, { color }]}>
                      {(sub ?? 'Other').charAt(0).toUpperCase() + (sub ?? 'other').slice(1)}
                    </Text>
                    <Text style={styles.subCount}>{grouped[sub]} collected</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} style={{ marginRight: 14 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

function StatPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillCount, { color }]}>{count}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  profileHeader: { alignItems: 'center', padding: SIZES.padding, paddingTop: 20, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, color: COLORS.white, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginTop: 10 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pill: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center', backgroundColor: COLORS.background },
  pillCount: { fontSize: 18, fontWeight: '900' },
  pillLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, gap: 6 },
  chatBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  tradeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF9500', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, gap: 6 },
  tradeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, gap: 6, borderWidth: 1.5, borderColor: COLORS.error },
  removeBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 14 },
  pendingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: COLORS.background, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border },
  pendingText: { flex: 1, fontSize: 13, color: COLORS.textSecondary },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 2, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabEmoji: { fontSize: 18 },
  tabLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  tabCount: { fontSize: 11, fontWeight: '700' },

  // Subcategory list
  subContent: { padding: SIZES.padding, paddingBottom: 32 },
  total: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  subCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 12, height: 80,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  subIconArea: { width: 72, height: '100%', alignItems: 'center', justifyContent: 'center' },
  subEmoji: { fontSize: 30 },
  subInfo: { flex: 1, paddingHorizontal: 14 },
  subName: { fontSize: 16, fontWeight: '800' },
  subCount: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },

  // Animal grid (subcategory drill-down)
  backRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 4, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backText: { fontSize: 16, fontWeight: '700' },
  grid: { padding: SIZES.paddingSmall, paddingBottom: 32 },
  animalCard: {
    flex: 1, margin: SIZES.paddingSmall, backgroundColor: COLORS.card, borderRadius: 16,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  animalImg: { width: '100%', height: 130 },
  animalInfo: { padding: 10 },
  animalName: { fontSize: 13, fontWeight: '800' },
  animalSci: { fontSize: 11, fontStyle: 'italic', color: COLORS.textSecondary, marginTop: 1 },

  // Empty
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
});
