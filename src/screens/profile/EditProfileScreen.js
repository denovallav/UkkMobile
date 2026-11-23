import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';
import ScreenHeader from '../../components/ScreenHeader';
import GradientButton from '../../components/GradientButton';
import { useApp } from '../../context/AppContext';

const FIELDS = [
  { key: 'name', label: 'Nama Lengkap', icon: 'person-outline', keyboard: 'default', capitalize: 'words', placeholder: 'Nama kamu' },
  { key: 'email', label: 'Email', icon: 'mail-outline', keyboard: 'email-address', capitalize: 'none', placeholder: 'nama@email.com' },
  { key: 'phone', label: 'Nomor HP', icon: 'call-outline', keyboard: 'phone-pad', capitalize: 'none', placeholder: '08xxxxxxxxxx' },
];

export default function EditProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      return Alert.alert('Data belum lengkap', 'Nama dan email wajib diisi.');
    }
    if (!/\S+@\S+\.\S+/.test(form.email.trim())) {
      return Alert.alert('Email tidak valid', 'Periksa kembali format email kamu.');
    }
    setSaving(true);
    await updateUser({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
    setSaving(false);
    Alert.alert('Berhasil', 'Profil kamu sudah diperbarui.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <View style={styles.container}>

      <ScreenHeader title="Edit Profil" subtitle="Perbarui informasi akunmu" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarBlock}>
            <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
              <Text style={styles.initials}>
                {(form.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </Text>
            </LinearGradient>
            <Text style={styles.avatarHint}>Inisial otomatis dari namamu</Text>
          </View>

          <View style={styles.card}>
            {FIELDS.map((field) => (
              <View key={field.key} style={styles.group}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name={field.icon} size={18} color={COLORS.primary} />
                  <TextInput
                    value={form[field.key]}
                    onChangeText={(t) => setField(field.key, t)}
                    style={styles.input}
                    keyboardType={field.keyboard}
                    autoCapitalize={field.capitalize}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>
            ))}
          </View>

          <GradientButton
            title={saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            onPress={save}
            loading={saving}
            icon={<Ionicons name="checkmark-circle-outline" size={17} color="#fff" />}
            style={{ marginTop: SPACING.md }}
          />

          <Text style={styles.note}>Data kamu hanya disimpan di perangkat ini.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl },
  avatarBlock: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: {
    width: 78, height: 78, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.medium,
  },
  initials: { color: '#fff', fontSize: 26, fontWeight: '700' },
  avatarHint: { color: COLORS.textMuted, fontSize: 10, marginTop: 8 },
  card: {
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  group: { marginBottom: SPACING.lg },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1, borderColor: COLORS.hairline,
    borderRadius: RADIUS.lg, paddingHorizontal: 14,
  },
  input: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md, paddingVertical: 14, fontWeight: '600' },
  note: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: SPACING.lg },
});
