import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { FriendsStackParamList } from '../../types/navigation';
import { getUserProfile, removeFriend } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/user';
import { COLORS, SIZES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<FriendsStackParamList, 'FriendProfile'>;

export default function FriendProfileScreen() {
  const navigation = useNavigation<any>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [friendProfile, setFriendProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    Promise.all([
      getUserProfile(params.friendId),
      user ? getUserProfile(user.uid) : Promise.resolve(null),
    ]).then(([fp, mp]) => {
      setFriendProfile(fp);
      setMyProfile(mp);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.friendId, user?.uid]);

  const isFriend = myProfile?.friends?.includes(params.friendId) ?? false;

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar + name */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(params.friendName ?? 'F').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{params.friendName}</Text>

        {isFriend ? (
          <>
            <Text style={styles.subtext}>{friendProfile?.totalAnimals ?? 0} animals discovered</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => navigation.navigate('Chat', { friendId: params.friendId, friendName: params.friendName })}
              >
                <Ionicons name="chatbubble" size={16} color={COLORS.white} />
                <Text style={styles.chatBtnText}>Chat</Text>
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
            <Text style={styles.pendingText}>Friend request pending — accept the request to see their collection and chat.</Text>
          </View>
        )}
      </View>

      {/* Stats — only visible to accepted friends */}
      {isFriend && (
        <View style={styles.statsRow}>
          <StatCard label="Land" count={friendProfile?.landCount ?? 0} color={COLORS.land} emoji="🌿" />
          <StatCard label="Sea" count={friendProfile?.seaCount ?? 0} color={COLORS.sea} emoji="🌊" />
          <StatCard label="Air" count={friendProfile?.airCount ?? 0} color={COLORS.air} emoji="💨" />
        </View>
      )}
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
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  chatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, gap: 6 },
  chatBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, gap: 6, borderWidth: 1.5, borderColor: COLORS.error },
  removeBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 14 },
  pendingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: COLORS.border, maxWidth: 300 },
  pendingText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1.5, padding: 12, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statCount: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
});
