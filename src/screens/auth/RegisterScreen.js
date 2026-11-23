import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import { useApp } from '../../context/AppContext';

export default function RegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { login } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi';
    if (!form.email.trim()) errs.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid';
    if (!form.phone.trim()) errs.phone = 'Nomor HP wajib diisi';
    else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Nomor HP tidak valid';
    if (!form.password) errs.password = 'Password wajib diisi';
    else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirm) errs.confirm = 'Konfirmasi password tidak cocok';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(async () => {
      await login({ name: form.name, email: form.email, phone: form.phone });
      setLoading(false);
      navigation.goBack();
    }, 1200);
  };

  const fields = [
    { key: 'name', label: 'Nama Lengkap', placeholder: 'Nama kamu', type: 'default' },
    { key: 'email', label: 'Email', placeholder: 'nama@email.com', type: 'email-address' },
    { key: 'phone', label: 'Nomor HP', placeholder: '08xxxxxxxxxx', type: 'phone-pad' },
  ];

  const passwordFields = [
    { key: 'password', label: 'Password', placeholder: 'Minimal 6 karakter', show: showPass, toggle: () => setShowPass(!showPass) },
    { key: 'confirm', label: 'Konfirmasi Password', placeholder: 'Ulangi password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
  ];

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

          <Text style={styles.title}>Buat akun baru</Text>
          <Text style={styles.subtitle}>Daftar sekali untuk memesan tiket dan menyimpan e-ticket.</Text>

          <View style={styles.card}>
            {fields.map(({ key, label, placeholder, type }) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.inputGroup, errors[key] && styles.inputGroupError]}>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={form[key]}
                    onChangeText={(t) => setField(key, t)}
                    keyboardType={type}
                    autoCapitalize={key === 'name' ? 'words' : 'none'}
                  />
                </View>
                {errors[key] && <Text style={styles.errText}>{errors[key]}</Text>}
              </View>
            ))}

            {passwordFields.map(({ key, label, placeholder, show, toggle }) => (
              <View key={key}>
                <Text style={styles.label}>{label}</Text>
                <View style={[styles.inputGroup, errors[key] && styles.inputGroupError]}>
                  <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    value={form[key]}
                    onChangeText={(t) => setField(key, t)}
                    secureTextEntry={!show}
                  />
                  <TouchableOpacity onPress={toggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
                {errors[key] && <Text style={styles.errText}>{errors[key]}</Text>}
              </View>
            ))}

            <GradientButton
              title={loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: SPACING.md }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.footerLink}>Masuk</Text>
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
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  inputGroupError: { borderColor: COLORS.error },
  input: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, paddingVertical: 13 },
  errText: { color: COLORS.error, fontSize: 10.5, marginTop: 4, marginLeft: 2 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textSecondary, fontSize: 12 },
  footerLink: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
});
