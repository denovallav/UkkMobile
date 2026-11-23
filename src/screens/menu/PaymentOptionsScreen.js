import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import ScreenHeader from '../../components/ScreenHeader';

const METHODS = [
  { name: 'GoPay', detail: 'Bayar cepat dengan GoPay', icon: 'G', color: '#00A86B' },
  { name: 'OVO', detail: 'Pembayaran praktis melalui OVO', icon: 'O', color: '#4C2A86' },
  { name: 'DANA', detail: 'Gunakan saldo DANA kamu', icon: 'D', color: '#1687E8' },
  { name: 'QRIS', detail: 'Scan dari aplikasi bank atau e-wallet', icon: 'QR', color: '#14213D' },
  { name: 'Transfer Bank', detail: 'BCA, BNI, BRI, dan Mandiri', icon: '↗', color: COLORS.primary },
];

export default function PaymentOptionsScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <ScreenHeader title="Metode Pembayaran" subtitle="Pilih yang paling nyaman" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.intro}>
            Semua pembayaran diproses dengan aman. Tiket hanya diterbitkan setelah pembayaran terverifikasi.
          </Text>
        </View>

        {METHODS.map((method) => (
          <View key={method.name} style={styles.method}>
            <View style={[styles.methodLogo, { backgroundColor: method.color }]}>
              <Text style={styles.methodLogoText}>{method.icon}</Text>
            </View>
            <View style={styles.methodCopy}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodDetail}>{method.detail}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Aktif</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, paddingBottom: 40, gap: SPACING.sm },
  introCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    overflow: 'hidden', marginBottom: SPACING.md,
  },
  introIcon: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  intro: { flex: 1, color: COLORS.textSecondary, fontSize: 11.5, lineHeight: 17, fontWeight: '500' },
  method: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.glassStrong,
    borderWidth: 1, borderColor: COLORS.hairline,
    borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  methodLogo: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  methodLogoText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  methodCopy: { flex: 1 },
  methodName: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  methodDetail: { color: COLORS.textSecondary, fontSize: 10.5, marginTop: 3 },
  badge: {
    backgroundColor: 'rgba(19,198,177,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(19,198,177,0.25)',
  },
  badgeText: { color: COLORS.accent, fontSize: 9, fontWeight: '800' },
});
