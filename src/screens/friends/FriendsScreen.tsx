import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, TextInput, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFriends } from '../../hooks/useFriends';
import { COLORS, SIZES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';
import { searchUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, FriendRequest } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/user';

export default function FriendsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { friends, pendingRequests, sentRequestUids, leaderboard, loading } = useFriends();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [actingUid, setActingUid] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastIsError, setToastIsError] = useState(false);
  const toastY = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message: string, isError = false) => {
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
        ]).start();
      }, 2500);
    });
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const results = await searchUsers(text, user?.uid ?? '');
      setSearchResults(results);
    } catch (e: any) {
      setSearchResults([]);
    } finally { setSearching(false); }
  };

  const handleSendRequest = async (targetUid: string, targetName: string) => {
    if (!user || actingUid) return;
    setActingUid(targetUid);
    try {
      await sendFriendRequest(user.uid, targetUid, user.displayName ?? 'Explorer');
      showToast(`Friend request sent to ${targetName}! 📨`);
      setQuery('');
      setSearchResults([]);
    } catch (e: any) {
      showToast(e.message ?? 'Could not send request.', true);
    } finally { setActingUid(null); }
  };

  const handleAccept = async (req: FriendRequest) => {
    if (!user || actingUid) return;
    setActingUid(req.fromUid);
    try {
      await acceptFriendRequest(req.id, user.uid, user.displayName ?? 'Explorer', req.fromUid);
      showToast(`${req.fromName} is now your friend! 🤝`);
    } catch (e: any) {
      showToast(e.message ?? 'Could not accept request.', true);
    } finally { setActingUid(null); }
  };

  const handleDecline = async (req: FriendRequest) => {
    if (!user || actingUid) return;
    setActingUid(req.fromUid);
    try {
      await declineFriendRequest(req.id);
    } catch { } finally { setActingUid(null); }
  };

  const getButtonState = (uid: string) => {
    if (friends.some((f) => f.uid === uid)) return 'friends';
    if (sentRequestUids.includes(uid)) return 'sent';
    return 'none';
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator color={COLORS.primary} size="large" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Toast */}
      <Animated.View style={[styles.toast, toastIsError ? styles.toastError : undefined, { transform: [{ translateY: toastY }], opacity: toastOpacity }]}>
        <Ionicons name={toastIsError ? 'close-circle' : 'checkmark-circle'} size={22} color={COLORS.white} />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      <FlatList
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
                      {entry.photoURL
                        ? <Image source={{ uri: entry.photoURL }} style={styles.lbAvatarImg} />
                        : <Text style={styles.lbAvatarText}>🧭</Text>}
                    </View>
                    <Text style={styles.lbName} numberOfLines={1}>{entry.displayName ?? 'Explorer'}</Text>
                    <Text style={styles.lbScore}>{entry.totalAnimals} 🐾</Text>
                  </View>
                ))
              )}
            </View>

            {/* Pending incoming requests */}
            {pendingRequests.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>📬 Friend Requests</Text>
                <View style={styles.requestsCard}>
                  {pendingRequests.map((req) => (
                    <View key={req.id} style={styles.requestRow}>
                      <View style={styles.resultAvatar}>
                        <Text style={styles.resultAvatarText}>🧭</Text>
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{req.fromName ?? 'Explorer'}</Text>
                        <Text style={styles.resultCount}>wants to be your friend</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAccept(req)}
                        disabled={!!actingUid}
                      >
                        {actingUid === req.fromUid
                          ? <ActivityIndicator size="small" color={COLORS.white} />
                          : <Text style={styles.acceptBtnText}>✓ Accept</Text>}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleDecline(req)}
                        disabled={!!actingUid}
                      >
                        <Ionicons name="close" size={18} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Search bar */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>🔍 Find Friends</Text>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for friends by name..."
                placeholderTextColor={COLORS.textSecondary}
                value={query}
                onChangeText={handleSearch}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(''); setSearchResults([]); }}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search results */}
            {searching && <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />}
            {searchResults.length > 0 && (
              <View style={styles.resultsCard}>
                <Text style={styles.resultsTitle}>Results</Text>
                {searchResults.map((u) => {
                  const state = getButtonState(u.uid);
                  return (
                    <View key={u.uid} style={styles.resultRow}>
                      <View style={styles.resultAvatar}>
                        {u.photoURL
                          ? <Image source={{ uri: u.photoURL }} style={styles.resultAvatarImg} />
                          : <Text style={styles.resultAvatarText}>🧭</Text>}
                      </View>
                      <View style={styles.resultInfo}>
                        <Text style={styles.resultName}>{u.displayName}</Text>
                        <Text style={styles.resultCount}>{u.totalAnimals ?? 0} animals</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.addBtn,
                          state === 'friends' ? styles.addBtnFriends : undefined,
                          state === 'sent' ? styles.addBtnSent : undefined,
                        ]}
                        onPress={() => state === 'none' ? handleSendRequest(u.uid, u.displayName ?? 'Explorer') : undefined}
                        disabled={!!actingUid || state !== 'none'}
                      >
                        {actingUid === u.uid
                          ? <ActivityIndicator size="small" color={COLORS.white} />
                          : <Text style={styles.addBtnText}>
                              {state === 'friends' ? '✓ Friends' : state === 'sent' ? 'Requested' : '+ Add'}
                            </Text>
                        }
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            {query.trim().length >= 2 && !searching && searchResults.length === 0 && (
              <Text style={styles.noResults}>No users found for "{query}"</Text>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>👥 Friends</Text>
          </>
        }
        data={friends}
        keyExtractor={(f) => f.uid}
        ListEmptyComponent={
          <View style={styles.noFriends}>
            <Text style={styles.noFriendsEmoji}>🤝</Text>
            <Text style={styles.noFriendsText}>No friends yet. Search above to add friends!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendCard}
            onPress={() => navigation.navigate('FriendProfile', { friendId: item.uid, friendName: item.displayName })}
            activeOpacity={0.85}
          >
            <View style={styles.friendAvatar}>
              {item.photoURL
                ? <Image source={{ uri: item.photoURL }} style={styles.friendAvatarImg} />
                : <Text style={styles.friendAvatarText}>🧭</Text>}
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.displayName ?? 'Unknown'}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  toast: {
    position: 'absolute', top: 56, left: 16, right: 16,
    backgroundColor: COLORS.success, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
    zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 10,
  },
  toastError: { backgroundColor: COLORS.error },
  toastText: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: '700' },
  content: { padding: SIZES.padding, paddingTop: 48, paddingBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },

  // Leaderboard
  leaderboardCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 16, borderWidth: 1.5, borderColor: '#FFD54F' },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  lbRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  lbRank: { fontSize: 15, fontWeight: '900', color: COLORS.secondary, width: 30 },
  lbAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  lbAvatarText: { fontSize: 18 },
  lbAvatarImg: { width: 36, height: 36, borderRadius: 18 },
  lbName: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.text },
  lbScore: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // Pending requests
  requestsCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 4, borderWidth: 1.5, borderColor: COLORS.primary },
  requestRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  acceptBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  acceptBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  declineBtn: { padding: 6 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFEFEF', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  noResults: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 13, marginBottom: 16 },
  resultsCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  resultsTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 10 },
  resultRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  resultAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  resultAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  resultAvatarText: { fontSize: 20 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  resultCount: { fontSize: 12, color: COLORS.textSecondary },
  addBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnFriends: { backgroundColor: COLORS.textSecondary },
  addBtnSent: { backgroundColor: '#9C8FD9' },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  // Friends list
  noFriends: { alignItems: 'center', padding: 32 },
  noFriendsEmoji: { fontSize: 48 },
  noFriendsText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  friendCard: { backgroundColor: COLORS.card, borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 14, marginBottom: 10, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  friendAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  friendAvatarText: { fontSize: 22 },
  friendAvatarImg: { width: 44, height: 44, borderRadius: 22 },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  friendCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  chatBtn: { padding: 8 },
});
