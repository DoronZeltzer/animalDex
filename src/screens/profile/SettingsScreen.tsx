import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, ActivityIndicator, Image, KeyboardAvoidingView,
  Platform, Animated, Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import { isDisplayNameTaken } from '../../services/firestoreService';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from '../../services/authService';

type EditField = 'name' | 'email' | 'password' | null;

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { user, refreshUser } = useAuth();

  const [editField, setEditField] = useState<EditField>(null);
  const [value, setValue] = useState('');
  const [value2, setValue2] = useState(''); // for confirm/current password
  const [currentPass, setCurrentPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState(false);
  const toastY = useRef(new Animated.Value(-100)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastError(isError);
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

  const handleLogout = () => { signOut().catch(() => {}); };

  const openEdit = (field: EditField) => {
    setEditField(field);
    setValue('');
    setValue2('');
    setCurrentPass('');
    setError('');
  };

  const closeEdit = () => { setEditField(null); setError(''); };

  // ── Change profile picture ────────────────────────────────────────────────
  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { showToast('Gallery permission denied.', true); return; }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const uri = result.assets[0].uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profilePictures/${user!.uid}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser!, { photoURL: downloadURL });
      await setDoc(doc(db, 'users', user!.uid), { photoURL: downloadURL }, { merge: true });
      await refreshUser();
      showToast('Profile picture updated! 📸');
    } catch (e: any) {
      showToast(e.message ?? 'Failed to upload photo.', true);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Save changes ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !auth.currentUser) return;
    setError('');
    setSaving(true);

    try {
      if (editField === 'name') {
        if (!value.trim()) { setError('Name cannot be empty.'); return; }
        const taken = await isDisplayNameTaken(value.trim(), user.uid);
        if (taken) { setError('That name is already taken. Please choose another.'); return; }
        await updateProfile(auth.currentUser, { displayName: value.trim() });
        await setDoc(doc(db, 'users', user.uid), { displayName: value.trim() }, { merge: true });
        await refreshUser();
        showToast('Name updated! ✅');

      } else if (editField === 'email') {
        if (!value.trim()) { setError('Email cannot be empty.'); return; }
        if (!currentPass) { setError('Enter your current password.'); return; }
        const cred = EmailAuthProvider.credential(user.email!, currentPass);
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updateEmail(auth.currentUser, value.trim());
        await setDoc(doc(db, 'users', user.uid), { email: value.trim() }, { merge: true });
        await refreshUser();
        showToast('Email updated! ✅');

      } else if (editField === 'password') {
        if (!value || value.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (value !== value2) { setError('Passwords do not match.'); return; }
        if (!currentPass) { setError('Enter your current password.'); return; }
        const cred = EmailAuthProvider.credential(user.email!, currentPass);
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updatePassword(auth.currentUser, value);
        showToast('Password updated! ✅');
      }

      closeEdit();
    } catch (e: any) {
      const msg = e.code === 'auth/wrong-password' ? 'Incorrect current password.'
        : e.code === 'auth/email-already-in-use' ? 'That email is already in use.'
        : e.code === 'auth/invalid-email' ? 'Invalid email address.'
        : e.message ?? 'Something went wrong.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const modalTitle = editField === 'name' ? 'Change Name'
    : editField === 'email' ? 'Change Email'
    : editField === 'password' ? 'Change Password' : '';

  return (
    <View style={styles.container}>
      {/* Toast */}
      <Animated.View style={[styles.toast, toastError && styles.toastError, { transform: [{ translateY: toastY }], opacity: toastOpacity }]}>
        <Ionicons name={toastError ? 'close-circle' : 'checkmark-circle'} size={22} color={COLORS.white} />
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile picture */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handlePickPhoto} disabled={uploadingPhoto}>
            {user?.photoURL
              ? <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
              : <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{(user?.displayName ?? 'E').charAt(0).toUpperCase()}</Text>
                </View>
            }
            <View style={styles.cameraBtn}>
              {uploadingPhoto
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Ionicons name="camera" size={16} color={COLORS.white} />
              }
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Tap to change photo</Text>
        </View>

        {/* Account settings */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <SettingsRow icon="person-outline" label="Display Name" value={user?.displayName ?? '—'} onPress={() => openEdit('name')} />
          <View style={styles.divider} />
          <SettingsRow icon="mail-outline" label="Email" value={user?.email ?? '—'} onPress={() => openEdit('email')} />
          <View style={styles.divider} />
          <SettingsRow icon="lock-closed-outline" label="Password" value="••••••••" onPress={() => openEdit('password')} />
        </View>

        <View style={styles.card}>
          <SettingsRow icon="log-out-outline" label="Sign Out" value="" onPress={handleLogout} danger />
        </View>
      </ScrollView>

      {/* Edit modal */}
      <Modal visible={!!editField} transparent animationType="slide" onRequestClose={closeEdit}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeEdit} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{modalTitle}</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {editField === 'name' && (
              <TextInput
                style={styles.input}
                placeholder="New display name"
                placeholderTextColor={COLORS.textSecondary}
                value={value}
                onChangeText={setValue}
                autoFocus
              />
            )}

            {editField === 'email' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="New email address"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
                <TextInput
                  style={styles.input}
                  placeholder="Current password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={currentPass}
                  onChangeText={setCurrentPass}
                  secureTextEntry
                />
              </>
            )}

            {editField === 'password' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Current password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={currentPass}
                  onChangeText={setCurrentPass}
                  secureTextEntry
                  autoFocus
                />
                <TextInput
                  style={styles.input}
                  placeholder="New password (min. 6 characters)"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={setValue}
                  secureTextEntry
                />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value2}
                  onChangeText={setValue2}
                  secureTextEntry
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={styles.saveBtnText}>Save Changes</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={closeEdit}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function SettingsRow({ icon, label, value, onPress, danger }: { icon: string; label: string; value: string; onPress: () => void; danger?: boolean }) {
  const tint = danger ? COLORS.error : COLORS.primary;
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon as any} size={20} color={tint} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, danger && { color: COLORS.error }]}>{label}</Text>
          {!!value && <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>}
        </View>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SIZES.padding, paddingBottom: 48 },

  // Toast
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

  // Photo
  photoSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrap: { position: 'relative' },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 40, color: COLORS.white, fontWeight: '900' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.white,
  },
  photoHint: { fontSize: 13, color: COLORS.textSecondary, marginTop: 8 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Settings card
  card: { backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  rowValue: { fontSize: 13, color: COLORS.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SIZES.padding, paddingBottom: 36,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 16 },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.error + '18', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { flex: 1, fontSize: 13, color: COLORS.error, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
    marginBottom: 12,
  },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', padding: 14 },
  cancelBtnText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
});
