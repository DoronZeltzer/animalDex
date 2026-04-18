import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Animated, Easing,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FriendsStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { CollectedAnimal } from '../../types/animal';
import { sendTradeRequest, acceptTradeRequest } from '../../services/firestoreService';
import { COLORS, SIZES, ANIMAL_SUBCATEGORIES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<FriendsStackParamList, 'Trade'>;
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

export default function TradeScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();

  const [myAnimals, setMyAnimals] = useState<CollectedAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CollectedAnimal | null>(null);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<Category>('land');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState('');
  const [toastIsError, setToastIsError] = useState(false);
  const toastY = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, isError = false, onDone?: () => void) => {
    setToastMessage(message);
    setToastIsError(isError);
    Animated.parallel([
      Animated.timing(toastY, { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastY, { toValue: -100, duration: 350, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => { onDone?.(); });
      }, 2000);
    });
  };

  const isOffer = params.mode === 'offer';
  const color = TABS.find((t) => t.key === activeTab)?.color ?? COLORS.primary;

  useEffect(() => {
    if (!user) return;
    getDocs(collection(db, 'users', user.uid, 'animals')).then((snap) => {
      const animals = snap.docs.map((d) => d.data() as CollectedAnimal);
      animals.sort((a, b) => (b.capturedAt?.seconds ?? 0) - (a.capturedAt?.seconds ?? 0));
      setMyAnimals(animals);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  // Reset subcategory and selection when tab changes
  useEffect(() => { setSelectedSubcategory(null); setSelected(null); }, [activeTab]);

  const tabAnimals = myAnimals.filter((a) => a.category === activeTab);

  // Build subcategory groups
  const subcategories = ANIMAL_SUBCATEGORIES[activeTab] ?? [];
  const grouped: Record<string, number> = {};
  tabAnimals.forEach((a) => {
    const key = a.subcategory?.toLowerCase() ?? 'other';
    grouped[key] = (grouped[key] ?? 0) + 1;
  });
  const activeSubs = subcategories.filter((s) => grouped[s] > 0);
  Object.keys(grouped).forEach((k) => { if (!activeSubs.includes(k)) activeSubs.push(k); });

  const subAnimals = selectedSubcategory
    ? tabAnimals.filter((a) => a.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase())
    : [];

  const handleConfirm = async () => {
    if (!selected || !user) return;
    setSending(true);
    try {
      if (isOffer) {
        await sendTradeRequest(user.uid, params.friendId!, params.friendName!, selected);
        showToast(`Trade offer sent to ${params.friendName}! 🔄`, false, () => navigation.goBack());
      } else {
        await acceptTradeRequest(
          params.tradeId!,
          user.uid,
          params.fromUid!,
          selected,
          params.offeredAnimal!
        );
        showToast(`Trade complete! You got ${params.offeredAnimal!.commonName}! 🎉`, false, () => navigation.goBack());
      }
    } catch (e: any) {
      showToast(e.message ?? 'Trade failed.', true);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
  }

  // ── Subcategory animal grid (drill-down) ──────────────────────────────────
  if (selectedSubcategory) {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.toast, toastIsError && styles.toastError, { transform: [{ translateY: toastY }], opacity: toastOpacity }]}>
          <Ionicons name={toastIsError ? 'close-circle' : 'checkmark-circle'} size={22} color={COLORS.white} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
        {/* Offer banner */}
        {renderOfferBanner(isOffer, params)}

        {/* Back row */}
        <TouchableOpacity style={styles.backRow} onPress={() => { setSelectedSubcategory(null); setSelected(null); }}>
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
          columnWrapperStyle={{ gap: 10 }}
          ListEmptyComponent={
            <View style={styles.empty}><Text style={styles.emptyText}>No animals here yet.</Text></View>
          }
          renderItem={({ item }) => {
            const isSelected = selected?.animalId === item.animalId;
            return (
              <TouchableOpacity
                style={[styles.card, isSelected && { borderColor: color, borderWidth: 2.5 }]}
                onPress={() => setSelected(isSelected ? null : item)}
                activeOpacity={0.85}
              >
                <Image source={{ uri: item.photoURL }} style={styles.cardImg} />
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: color }]}>
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, isSelected && { color }]} numberOfLines={1}>{item.commonName}</Text>
                  <Text style={styles.cardSci} numberOfLines={1}>{item.scientificName}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {selected && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: color }]}
              onPress={handleConfirm}
              disabled={sending}
            >
              {sending
                ? <ActivityIndicator color={COLORS.white} />
                : <>
                    <Ionicons name="swap-horizontal" size={20} color={COLORS.white} />
                    <Text style={styles.confirmText}>
                      {isOffer ? `Offer ${selected.commonName}` : `Trade for ${params.offeredAnimal?.commonName}`}
                    </Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── Subcategory list ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.toast, toastIsError && styles.toastError, { transform: [{ translateY: toastY }], opacity: toastOpacity }]}>
        <Ionicons name={toastIsError ? 'close-circle' : 'checkmark-circle'} size={22} color={COLORS.white} />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>
      {/* Offer banner */}
      {renderOfferBanner(isOffer, params)}

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const count = myAnimals.filter((a) => a.category === tab.key).length;
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && { borderBottomColor: tab.color, borderBottomWidth: 3 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon} size={16} color={active ? tab.color : COLORS.textSecondary} />
              <Text style={[styles.tabLabel, active && { color: tab.color, fontWeight: '800' }]}>{tab.label}</Text>
              <Text style={[styles.tabCount, { color: tab.color }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {tabAnimals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No {activeTab} animals yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.subContent}>
          <Text style={styles.total}>{tabAnimals.length} animal{tabAnimals.length !== 1 ? 's' : ''}</Text>
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
    </View>
  );
}

function renderOfferBanner(isOffer: boolean, params: any) {
  if (!isOffer && params.offeredAnimal) {
    return (
      <View style={styles.offerBanner}>
        <Text style={styles.offerLabel}>{params.fromName} is offering:</Text>
        <View style={styles.offerCard}>
          <Image source={{ uri: params.offeredAnimal.photoURL }} style={styles.offerImg} />
          <View style={styles.offerInfo}>
            <Text style={styles.offerName}>{params.offeredAnimal.commonName}</Text>
            <Text style={styles.offerSci}>{params.offeredAnimal.scientificName}</Text>
            <Text style={[styles.offerCat, { color: COLORS[params.offeredAnimal.category as 'land' | 'sea' | 'air'] ?? COLORS.primary }]}>
              {params.offeredAnimal.category}
            </Text>
          </View>
        </View>
        <Text style={styles.pickLabel}>Pick one of your animals to trade back:</Text>
      </View>
    );
  }
  return (
    <View style={styles.offerBanner}>
      <Text style={styles.offerLabel}>Pick an animal to offer {params.friendName}:</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toast: {
    position: 'absolute', top: 8, left: 16, right: 16,
    backgroundColor: COLORS.success, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 10,
  },
  toastError: { backgroundColor: COLORS.error },
  toastText: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '700' },

  offerBanner: { backgroundColor: COLORS.card, padding: SIZES.padding, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  offerLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  offerCard: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 },
  offerImg: { width: 70, height: 70, borderRadius: 12 },
  offerInfo: { flex: 1 },
  offerName: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  offerSci: { fontSize: 12, fontStyle: 'italic', color: COLORS.textSecondary },
  offerCat: { fontSize: 12, fontWeight: '700', marginTop: 2, textTransform: 'capitalize' },
  pickLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  tabBar: { flexDirection: 'row', backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabEmoji: { fontSize: 16 },
  tabLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  tabCount: { fontSize: 10, fontWeight: '700' },

  // Subcategory list
  subContent: { padding: SIZES.padding, paddingBottom: 32 },
  total: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  subCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 16, borderWidth: 1.5, marginBottom: 12, height: 72,
    overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  subIconArea: { width: 64, height: '100%', alignItems: 'center', justifyContent: 'center' },
  subEmoji: { fontSize: 26 },
  subInfo: { flex: 1, paddingHorizontal: 12 },
  subName: { fontSize: 15, fontWeight: '800' },
  subCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Animal grid
  backRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 4, backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backText: { fontSize: 16, fontWeight: '700' },
  grid: { padding: SIZES.padding, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  card: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 14,
    overflow: 'hidden', borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardImg: { width: '100%', height: 110 },
  checkBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { padding: 8 },
  cardName: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  cardSci: { fontSize: 10, fontStyle: 'italic', color: COLORS.textSecondary, marginTop: 1 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: SIZES.padding, backgroundColor: COLORS.background,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 16, paddingVertical: 14,
  },
  confirmText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
