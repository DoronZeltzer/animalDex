import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { COLORS, SIZES } from '../../config/constants';
import { ACHIEVEMENTS } from '../../types/user';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { animals: land } = useCollection('land');
  const { animals: sea } = useCollection('sea');
  const { animals: air } = useCollection('air');

  const total = land.length + sea.length + air.length;

  const handleSetApiKey = async () => {
    Alert.prompt(
      'Anthropic API Key',
      'Enter your Anthropic API key to enable animal identification.',
      async (key) => {
        if (key) {
          await SecureStore.setItemAsync('ANTHROPIC_API_KEY', key.trim());
          Alert.alert('Saved', 'API key saved securely.');
        }
      },
      'secure-text'
    );
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.displayName ?? 'E').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'Explorer'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard emoji="🌿" label="Land" count={land.length} color={COLORS.land} />
        <StatCard emoji="🌊" label="Sea" count={sea.length} color={COLORS.sea} />
        <StatCard emoji="💨" label="Air" count={air.length} color={COLORS.air} />
      </View>
      <View style={styles.totalCard}>
        <Text style={styles.totalEmoji}>🐾</Text>
        <View>
          <Text style={styles.totalCount}>{total}</Text>
          <Text style={styles.totalLabel}>Total Animals Discovered</Text>
        </View>
      </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS.map((ach: typeof ACHIEVEMENTS[0]) => {
          const unlocked = (ach.id === 'first_animal' && total >= 1)
            || (ach.id === 'land_10' && land.length >= 10)
            || (ach.id === 'sea_10' && sea.length >= 10)
            || (ach.id === 'air_10' && air.length >= 10)
            || (ach.id === 'total_25' && total >= 25)
            || (ach.id === 'total_50' && total >= 50);

          return (
            <View key={ach.id} style={[styles.achCard, !unlocked && styles.achLocked]}>
              <Text style={[styles.achIcon, !unlocked && styles.achIconLocked]}>{ach.icon}</Text>
              <Text style={[styles.achTitle, !unlocked && styles.achTextLocked]}>{ach.title}</Text>
              <Text style={styles.achDesc}>{ach.description}</Text>
            </View>
          );
        })}
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsCard}>
        <SettingsRow icon="key-outline" label="Set API Key" onPress={handleSetApiKey} />
        <View style={styles.divider} />
        <SettingsRow icon="log-out-outline" label="Sign Out" onPress={handleLogout} color={COLORS.error} />
      </View>
    </ScrollView>
  );
}

function StatCard({ emoji, label, count, color }: any) {
  return (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statCount, { color }]}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, onPress, color = COLORS.text }: any) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.settingsLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36, color: COLORS.white, fontWeight: '900' },
  name: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginTop: 10 },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1.5, padding: 12, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 20 },
  statCount: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  totalCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  totalEmoji: { fontSize: 36 },
  totalCount: { fontSize: 32, fontWeight: '900', color: COLORS.white },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  achCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: 14, padding: 12, gap: 4, borderWidth: 1.5, borderColor: '#FFD54F' },
  achLocked: { borderColor: COLORS.border, opacity: 0.5 },
  achIcon: { fontSize: 28 },
  achIconLocked: { filter: 'grayscale(1)' } as any,
  achTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  achTextLocked: { color: COLORS.textSecondary },
  achDesc: { fontSize: 11, color: COLORS.textSecondary, lineHeight: 15 },
  settingsCard: { backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  settingsRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
});
