import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../config/constants';

const CHARACTERS = [
  { emoji: '🤝', name: 'Teamwork' },
  { emoji: '🔭', name: 'Scout' },
  { emoji: '🎒', name: 'Explorer' },
];

interface Props {
  onPress: () => void;
}

export default function FriendStrip({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
      <View style={styles.characters}>
        {CHARACTERS.map((c, i) => (
          <View key={i} style={styles.character}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{c.emoji}</Text>
            </View>
            <Text style={styles.charName}>{c.name}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.cta}>See who's leading the pack →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9E6',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFD54F',
    padding: 16,
    marginTop: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  chevron: { fontSize: 20, color: COLORS.textSecondary },
  characters: { flexDirection: 'row', justifyContent: 'space-around' },
  character: { alignItems: 'center', gap: 6 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE082',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
  },
  avatarEmoji: { fontSize: 30 },
  charName: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  cta: { fontSize: 13, color: '#F59E0B', fontWeight: '700', marginTop: 12, textAlign: 'center' },
});
