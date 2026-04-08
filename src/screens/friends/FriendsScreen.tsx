import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFriends } from '../../hooks/useFriends';
import { COLORS, SIZES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsScreen() {
  const navigation = useNavigation<any>();
  const { friends, leaderboard, loading } = useFriends();

  if (loading) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  return (
    <FlatList
      style={{ backgroundColor: COLORS.background }}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Friends</Text>

          {/* Leaderboard */}
          <View style={styles.leaderboardCard}>
            <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
            {leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>Add friends to see the leaderboard!</Text>
            ) : (
              leaderboard.slice(0, 5).map((entry) => (
                <View key={entry.uid} style={styles.lbRow}>
                  <Text style={styles.lbRank}>#{entry.rank}</Text>
                  <View style={styles.lbAvatar}>
                    <Text style={styles.lbAvatarText}>{entry.displayName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.lbName} numberOfLines={1}>{entry.displayName}</Text>
                  <Text style={styles.lbScore}>{entry.totalAnimals} 🐾</Text>
                </View>
              ))
            )}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>👥 Friends</Text>
        </>
      }
      data={friends}
      keyExtractor={(f) => f.uid}
      ListEmptyComponent={
        <View style={styles.noFriends}>
          <Text style={styles.noFriendsEmoji}>🤝</Text>
          <Text style={styles.noFriendsText}>No friends yet. Invite friends to join AnimalDex!</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.friendCard}
          onPress={() => navigation.navigate('FriendProfile', { friendId: item.uid, friendName: item.displayName })}
          activeOpacity={0.85}
        >
          <View style={styles.friendAvatar}>
            <Text style={styles.friendAvatarText}>{item.displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.displayName}</Text>
            <Text style={styles.friendCount}>{item.totalAnimals} animals collected</Text>
          </View>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', { friendId: item.uid, friendName: item.displayName })}
          >
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 16 },
  leaderboardCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#FFD54F' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  lbRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  lbRank: { fontSize: 15, fontWeight: '900', color: COLORS.secondary, width: 30 },
  lbAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  lbAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  lbName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  lbScore: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  noFriends: { alignItems: 'center', padding: 32 },
  noFriendsEmoji: { fontSize: 48 },
  noFriendsText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  friendCard: { backgroundColor: COLORS.card, borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  friendAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 18 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  friendCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  chatBtn: { padding: 8 },
});
