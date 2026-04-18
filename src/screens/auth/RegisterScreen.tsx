import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../config/constants';
import { Ionicons } from '@expo/vector-icons';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { isDisplayNameTaken } from '../../services/firestoreService';

type Props = { navigation: StackNavigationProp<AuthStackParamList, 'Register'> };

// ── Helpers ────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function checkEmailReal(email: string): Promise<{ valid: boolean; reason: string }> {
  try {
    const res = await fetch(`https://api.mailcheck.ai/email/${encodeURIComponent(email.trim())}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return { valid: true, reason: '' }; // if API down, don't block

    const data = await res.json();
    if (data.disposable) return { valid: false, reason: 'Disposable email addresses are not allowed.' };
    if (data.mx === false) return { valid: false, reason: "This email domain doesn't exist." };
    return { valid: true, reason: '' };
  } catch {
    return { valid: true, reason: '' }; // network error — don't block
  }
}

async function checkEmailTaken(email: string): Promise<boolean> {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email.trim());
    return methods.length > 0;
  } catch {
    return false;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Inline errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const emailCheckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Email validation: fires 800 ms after user stops typing ─────────────────
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError('');
    setEmailStatus('idle');

    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);
    if (!text.trim()) return;

    if (!EMAIL_REGEX.test(text.trim())) {
      setEmailError('Please enter a valid email address.');
      setEmailStatus('error');
      return;
    }

    emailCheckTimer.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const { valid, reason } = await checkEmailReal(text.trim());
        if (!valid) { setEmailError(reason); setEmailStatus('error'); return; }

        const taken = await checkEmailTaken(text.trim());
        if (taken) { setEmailError('This email is already registered. Try logging in.'); setEmailStatus('error'); return; }

        setEmailStatus('ok');
      } finally {
        setCheckingEmail(false);
      }
    }, 800);
  };

  // ── Register ───────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    // Reset all errors
    setNameError(''); setEmailError(''); setPasswordError(''); setGeneralError('');

    let hasError = false;

    if (!name.trim()) { setNameError('Display name is required.'); hasError = true; }

    if (!email.trim()) {
      setEmailError('Email is required.'); setEmailStatus('error'); hasError = true;
    } else if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Please enter a valid email address.'); setEmailStatus('error'); hasError = true;
    } else if (emailStatus === 'error') {
      hasError = true; // error already shown
    }

    if (!password) { setPasswordError('Password is required.'); hasError = true; }
    else if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); hasError = true; }

    if (hasError) return;

    setLoading(true);
    try {
      // Final email checks (in case debounce hasn't fired yet)
      if (emailStatus !== 'ok') {
        setCheckingEmail(true);
        const { valid, reason } = await checkEmailReal(email.trim());
        if (!valid) { setEmailError(reason); setEmailStatus('error'); return; }

        const taken = await checkEmailTaken(email.trim());
        if (taken) { setEmailError('This email is already registered. Try logging in.'); setEmailStatus('error'); return; }
        setCheckingEmail(false);
      }

      // Check display name uniqueness
      const nameTaken = await isDisplayNameTaken(name.trim(), '');
      if (nameTaken) { setNameError('That display name is already taken.'); return; }

      await signUp(email.trim(), password, name.trim());
    } catch (error: any) {
      const code = error.code ?? '';
      if (code === 'auth/email-already-in-use') {
        setEmailError('This email is already registered. Try logging in.');
        setEmailStatus('error');
      } else if (code === 'auth/invalid-email') {
        setEmailError('Invalid email address.');
        setEmailStatus('error');
      } else {
        setGeneralError(error.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
      setCheckingEmail(false);
    }
  };

  // ── Email field border color ───────────────────────────────────────────────
  const emailBorderColor =
    emailStatus === 'ok' ? COLORS.success :
    emailStatus === 'error' ? COLORS.error :
    COLORS.border;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <Text style={styles.subtitle}>Join the AnimalDex explorer community!</Text>

        {/* General error */}
        {!!generalError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={styles.errorText}>{generalError}</Text>
          </View>
        )}

        <View style={styles.form}>
          {/* Display Name */}
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={[styles.input, !!nameError && styles.inputError]}
            placeholder="Wildlife Explorer"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={(t) => { setName(t); setNameError(''); }}
            autoCapitalize="words"
          />
          {!!nameError && <FieldError message={nameError} />}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.emailRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }, { borderColor: emailBorderColor }]}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <View style={styles.emailStatus}>
              {checkingEmail
                ? <ActivityIndicator size="small" color={COLORS.primary} />
                : emailStatus === 'ok'
                  ? <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
                  : emailStatus === 'error'
                    ? <Ionicons name="close-circle" size={22} color={COLORS.error} />
                    : null
              }
            </View>
          </View>
          {!!emailError && <FieldError message={emailError} />}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }, !!passwordError && styles.inputError]}
              placeholder="Min. 6 characters"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          {!!passwordError && <FieldError message={passwordError} />}

          <TouchableOpacity
            style={[styles.primaryBtn, (loading || checkingEmail) && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading || checkingEmail}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.primaryBtnText}>Create Account 🐾</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Small inline error label ───────────────────────────────────────────────────
function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.fieldError}>
      <Ionicons name="alert-circle-outline" size={13} color={COLORS.error} />
      <Text style={styles.fieldErrorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  inner: { flexGrow: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 8 },
  backBtn: { marginRight: 12, padding: 4 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 24 },
  form: {},

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.error + '18', borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 13, color: COLORS.error, fontWeight: '600' },

  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  inputError: { borderColor: COLORS.error },

  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  emailStatus: { width: 28, alignItems: 'center' },

  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: { padding: 14, backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.border },

  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2, marginTop: 2, paddingHorizontal: 4 },
  fieldErrorText: { fontSize: 12, color: COLORS.error, fontWeight: '600', flex: 1 },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  primaryBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginLinkText: { fontSize: 14, color: COLORS.textSecondary },
});
