import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';

WebBrowser.maybeCompleteAuthSession();

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Login'> };

// Paste your Google Web Client ID here (from Google Cloud Console →
// APIs & Services → Credentials → OAuth 2.0 Client IDs → Web client)
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

export default function LoginScreen({ navigation }: Props) {
  const { signIn, googleSignIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.authentication?.idToken;
      if (idToken) {
        setGoogleLoading(true);
        googleSignIn(idToken)
          .catch((e: any) => Alert.alert('Google Sign-In Failed', e.message))
          .finally(() => setGoogleLoading(false));
      }
    }
  }, [googleResponse]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }
    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (error: any) {
      const code = error.code ?? '';
      const msg = code === 'auth/configuration-not-found'
        ? 'Email/Password sign-in is not enabled.\n\nGo to Firebase Console → Authentication → Sign-in method → Email/Password → Enable.'
        : code === 'auth/api-key-not-valid'
        ? 'Firebase credentials are not configured. Open src/config/firebase.ts and paste your Firebase config.'
        : error.message ?? 'An error occurred.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(
        'Google Sign-In Not Configured',
        'Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env file to enable Google Sign-In.\n\nGet it from Google Cloud Console → APIs & Services → Credentials.'
      );
      return;
    }
    await googlePromptAsync();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.appName}>AnimalDex</Text>
          <Text style={styles.tagline}>Discover & Collect the Animal Kingdom</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryBtnText}>Log In</Text>}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {GOOGLE_CLIENT_ID ? (
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn} disabled={googleLoading}>
              {googleLoading
                ? <ActivityIndicator color={COLORS.text} />
                : <Text style={styles.googleBtnText}>🔵  Continue with Google</Text>}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              Don't have an account?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 72 },
  appName: { fontSize: 36, fontWeight: '900', color: COLORS.text, marginTop: 8 },
  tagline: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 14, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  primaryBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textSecondary, fontSize: 13 },
  googleBtn: { backgroundColor: COLORS.card, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  googleBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  registerLink: { alignItems: 'center', marginTop: 24 },
  registerLinkText: { fontSize: 14, color: COLORS.textSecondary },
});
