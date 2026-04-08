import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { FriendsStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { subscribeToChat, sendMessage } from '../../services/firestoreService';
import { COLORS, SIZES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

type Route = RouteProp<FriendsStackParamList, 'Chat'>;

interface Message { id: string; senderId: string; text: string; sentAt: any }

export default function ChatScreen() {
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToChat(user.uid, params.friendId, (msgs) => {
      setMessages(msgs);
    });
    return unsub;
  }, [user, params.friendId]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const msg = text.trim();
    setText('');
    await sendMessage(user.uid, params.friendId, msg);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.uid;
          return (
            <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.bubbleText, isMe && styles.myBubbleText]}>{item.text}</Text>
            </View>
          );
        }}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!text.trim()}>
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.padding, gap: 8 },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  myBubble: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: COLORS.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  bubbleText: { fontSize: 15, color: COLORS.text },
  myBubbleText: { color: COLORS.white },
  inputBar: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: COLORS.text, maxHeight: 100, borderWidth: 1, borderColor: COLORS.border },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
