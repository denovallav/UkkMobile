import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import { useApp } from '../../context/AppContext';

export default function LoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [loginMode, setLoginMode] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (loginMode === 'email') {
      if (!email.trim()) errs.email = 'Email wajib diisi';
      else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Format email tidak valid';
    } else if (!phone.trim()) {
      errs.phone = 'Nomor telepon wajib diisi';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Nomor telepon tidak valid';
    }
    if (!password) errs.password = 'Password wajib diisi';
    else if (password.length < 6) errs.password = 'Password minimal 6 karakter';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(async () => {
      await login({
        name: loginMode === 'email' ? email.split('@')[0] : 'User ' + phone.slice(-4),
        email: loginMode === 'email' ? email : `${phone.replace(/\D/g, '')}@phone.fixyou.id`,
        phone: loginMode === 'phone' ? phone : undefined,
      });
      setLoading(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Ionicons name="play" size={16} color="#fff" /></View>
            <Text style={styles.brandText}>FIX YOU</Text>
          </View>

          <Text style={styles.title}>Masuk ke akun</Text>
          <Text style={styles.subtitle}>Lanjutkan pembelian tiket dan kelola e-ticket kamu.</Text>

          <View style={styles.card}>
            <View style={styles.segment}>
              {[
                { id: 'email', label: 'Email' },
                { id: 'phone', label: 'Nomor HP' },
              ].map((tab) => {
                const active = loginMode === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                    onPress={() => { setLoginMode(tab.id); setErrors({}); }}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>{loginMode === 'email' ? 'Email' : 'Nomor HP'}</Text>
            <View style={[styles.inputGroup, (errors.email || errors.phone) && styles.inputGroupError]}>
              <TextInput
                style={styles.input}
                placeholder={loginMode === 'email' ? 'nama@email.com' : '08xxxxxxxxxx'}
                placeholderTextColor={COLORS.textMuted}
                value={loginMode === 'email' ? email : phone}
                onChangeText={(t) => loginMode === 'email'
                  ? (setEmail(t), setErrors((e) => ({ ...e, email: null })))
                  : (setPhone(t), setErrors((e) => ({ ...e, phone: null })))}
                keyboardType={loginMode === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
              />
            </View>
            {(errors.email || errors.phone) && <Text style={styles.errText}>{errors.email || errors.phone}</Text>}

            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputGroup, errors.password && styles.inputGroupError]}>
              <TextInput
                style={styles.input}
                placeholder="Masukkan password"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: null })); }}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errText}>{errors.password}</Text>}

            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => Alert.alert(
                'Lupa Password',
                'Hubungi WhatsApp 0821-1205-891 untuk mengatur ulang password akunmu.',
                [
                  { text: 'Tutup', style: 'cancel' },
                  { text: 'Chat WhatsApp', onPress: () => Linking.openURL('https://wa.me/628211205891') },
                ]
              )}
            >
              <Text style={styles.forgotText}>Lupa password?</Text>
            </TouchableOpacity>

            <GradientButton
              title={loading ? 'Memproses...' : 'Masuk'}
              onPress={handleLogin}
              loading={loading}
            />

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.replace('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.registerBtnText}>Buat akun baru</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => { setEmail('demo@fixyou.id'); setPassword('demo123'); }}
              activeOpacity={0.8}
            >
              <Text style={styles.demoText}>Gunakan akun demo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xl, paddingBottom: 40 },
  backBtn: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  brandMark: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-12deg' }],
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { color: COLORS.text, fontSize: 14, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 22 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  segmentItem: { flex: 1, paddingVertical: 9, borderRadius: RADIUS.sm, alignItems: 'center' },
  segmentItemActive: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  segmentText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  segmentTextActive: { color: COLORS.text, fontWeight: '700' },

  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 6 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  inputGroupError: { borderColor: COLORS.error },
  input: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, paddingVertical: 13 },
  errText: { color: COLORS.error, fontSize: 10.5, marginTop: -8, marginBottom: SPACING.md, marginLeft: 2 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  forgotText: { color: COLORS.primary, fontSize: 11.5, fontWeight: '600' },
  registerBtn: {
    marginTop: SPACING.sm,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  registerBtnText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderLight },
  dividerText: { color: COLORS.textMuted, marginHorizontal: SPACING.md, fontSize: 11 },
  demoBtn: { alignItems: 'center', paddingVertical: 8 },
  demoText: { color: COLORS.primary, fontSize: 11.5, fontWeight: '600' },
});
