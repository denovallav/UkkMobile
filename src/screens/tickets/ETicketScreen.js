import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sharePdfFromHtml } from '../../utils/platformUtils';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import ScreenHeader from '../../components/ScreenHeader';
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from '../../utils/helpers';

export default function ETicketScreen({ route, navigation }) {
  const { order, concert } = route.params;
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const qrValue = JSON.stringify({ orderId: order.id, concertId: order.concertId, class: order.ticketClass });

  const ticketHtml = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #14213D; padding: 32px; }
          .brand { font-size: 13px; letter-spacing: 3px; color: #5B5FEF; font-weight: 800; }
          h1 { font-size: 24px; margin: 8px 0 24px; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E4E1F5; font-size: 13px; }
          .label { color: #65748B; }
          .value { font-weight: 700; text-align: right; max-width: 60%; }
          .footer { margin-top: 28px; font-size: 11px; color: #9AA9BE; }
          .badge { display: inline-block; margin-top: 16px; padding: 6px 14px; border-radius: 99px; background: #EFEBFF; color: #5B5FEF; font-weight: 700; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="brand">FIX YOU · E-TICKET</div>
        <h1>${order.concertTitle}</h1>
        <div class="row"><span class="label">Order ID</span><span class="value">${order.id}</span></div>
        <div class="row"><span class="label">Kelas</span><span class="value">${order.ticketClass}</span></div>
        <div class="row"><span class="label">Jumlah</span><span class="value">${order.quantity} tiket</span></div>
        <div class="row"><span class="label">Tanggal</span><span class="value">${formatDate(order.concertDate)}</span></div>
        <div class="row"><span class="label">Venue</span><span class="value">${order.venue}</span></div>
        <div class="row"><span class="label">Total</span><span class="value">${formatPrice(order.totalPrice)}</span></div>
        <div class="badge">${getStatusLabel(order.paymentStatus)}</div>
        <p class="footer">Tunjukkan e-ticket ini di pintu masuk. Berlaku untuk 1x masuk.</p>
      </body>
    </html>
  `;

  const handleSavePdf = async () => {
    setSaving(true);
    const ok = await sharePdfFromHtml(ticketHtml, 'Simpan atau bagikan e-ticket');
    setSaving(false);
    if (!ok) {
      Alert.alert(
        'Simpan E-Ticket',
        Platform.OS === 'web'
          ? 'Di web, gunakan tombol Bagikan lalu pilih "Simpan sebagai PDF".'
          : 'Fitur simpan PDF tidak tersedia di perangkat ini. Gunakan tombol Bagikan.'
      );
    }
  };

  const handleShare = async () => {
    await Share.share({
      title: `E-Ticket: ${order.concertTitle}`,
      message: `E-Ticket Saya\n\nKonser: ${order.concertTitle}\nKelas: ${order.ticketClass}\nJumlah: ${order.quantity} tiket\nTanggal: ${formatDate(order.concertDate)}\nVenue: ${order.venue}\nOrder ID: ${order.id}\n\nDipesan lewat aplikasi FIX YOU.`,
    });
  };

  const statusColor = getStatusColor(order.paymentStatus);
  const statusLabel = getStatusLabel(order.paymentStatus);
  const ticketColor = order.ticketColor || COLORS.primary;

  return (
    <View style={styles.container}>

      <ScreenHeader
        title="E-Ticket"
        subtitle={order.id}
        onBack={() => navigation.navigate('MainTabs')}
        right={
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={22} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Pemesanan berhasil</Text>
          <Text style={styles.successSub}>Tiketmu sedang diverifikasi oleh admin</Text>
        </View>

        <View style={styles.ticketWrap}>
          <View style={styles.ticket}>
            <View style={styles.ticketHeader}>
              <LinearGradient colors={[ticketColor, `${ticketColor}CC`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={['rgba(20,33,61,0.08)', 'rgba(20,33,61,0.5)']} style={StyleSheet.absoluteFill} />
              <View style={styles.ticketHeaderContent}>
                <View style={styles.ticketLogo}>
                  <Ionicons name="musical-notes" size={18} color="rgba(255,255,255,0.95)" />
                  <Text style={styles.ticketLogoText}>FIX YOU</Text>
                </View>
                <View style={styles.classBadge}>
                  <Text style={styles.classBadgeText}>{order.ticketClass}</Text>
                </View>
              </View>
              <Text style={styles.ticketConcert} numberOfLines={2}>{order.concertTitle}</Text>
            </View>

            <View style={styles.ticketBody}>
              <View style={styles.perfLine}>
                <View style={[styles.perfCircleLeft, { backgroundColor: COLORS.background }]} />
                <View style={styles.perfDashes}>
                  {Array.from({ length: 18 }).map((_, i) => <View key={i} style={styles.perfDash} />)}
                </View>
                <View style={[styles.perfCircleRight, { backgroundColor: COLORS.background }]} />
              </View>

              <View style={styles.infoGrid}>
                {[
                  { label: 'TANGGAL', value: formatDate(order.concertDate) },
                  { label: 'WAKTU', value: concert?.time ? `${concert.time} WIB` : '19:00 WIB' },
                  { label: 'VENUE', value: order.venue },
                  { label: 'JUMLAH TIKET', value: `${order.quantity} Tiket` },
                  { label: 'TOTAL BAYAR', value: formatPrice(order.totalPrice) },
                  { label: 'ORDER ID', value: order.id },
                ].map((item, i) => (
                  <View key={i} style={[styles.infoItem, i % 2 === 0 && i !== 4 && styles.infoItemBorder]}>
                    <Text style={styles.infoLabel}>{item.label}</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.statusRow, { borderColor: `${statusColor}44`, backgroundColor: `${statusColor}14` }]}>
                <Ionicons
                  name={order.paymentStatus === 'verified' ? 'checkmark-circle' : order.paymentStatus === 'rejected' ? 'close-circle' : 'time'}
                  size={15}
                  color={statusColor}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
              </View>

              <View style={styles.qrSection}>
                <View style={styles.qrWrap}>
                  <QRCodeDisplay value={qrValue} size={140} />
                </View>
                <Text style={styles.qrLabel}>Scan QR Code ini di pintu masuk</Text>
                <Text style={styles.qrSub}>{order.id}</Text>
              </View>

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketFooterText}>Tiket ini hanya berlaku untuk 1x masuk.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <GradientButton
            title={saving ? 'Menyiapkan...' : 'Simpan / Bagikan PDF'}
            onPress={handleSavePdf}
            loading={saving}
            icon={<Ionicons name="download-outline" size={16} color="#fff" />}
          />
          <TouchableOpacity style={styles.outlineBtn} onPress={handleShare} activeOpacity={0.85}>
            <Ionicons name="share-social-outline" size={17} color={COLORS.primary} />
            <Text style={styles.outlineBtnText}>Bagikan Tiket</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('MainTabs')} activeOpacity={0.85}>
            <Ionicons name="home-outline" size={17} color={COLORS.textSecondary} />
            <Text style={[styles.outlineBtnText, { color: COLORS.textSecondary }]}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  shareBtn: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(91,95,239,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.hairline,
  },
  successBanner: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.lg, gap: 6 },
  successIcon: {
    width: 44, height: 44, borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(15,157,116,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  successSub: { color: COLORS.textSecondary, fontSize: 12 },

  ticketWrap: { paddingHorizontal: SPACING.xl, position: 'relative' },
  ticket: {
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.hairline,
    zIndex: 2,
    ...SHADOWS.large,
  },
  ticketHeader: { padding: SPACING.xl, overflow: 'hidden' },
  ticketHeaderContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ticketLogo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ticketLogoText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  classBadge: {
    borderWidth: 1, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.45)',
  },
  classBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  ticketConcert: { color: '#fff', fontSize: FONTS.sizes.xl, fontWeight: '700', lineHeight: 24 },
  ticketBody: { padding: SPACING.xl, backgroundColor: COLORS.glassStrong },
  perfLine: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: -SPACING.xl, marginBottom: SPACING.xl,
  },
  perfCircleLeft: { width: 20, height: 20, borderRadius: 10, marginLeft: -10 },
  perfCircleRight: { width: 20, height: 20, borderRadius: 10, marginRight: -10 },
  perfDashes: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', paddingHorizontal: 4 },
  perfDash: { width: 4, height: 2, backgroundColor: COLORS.border, borderRadius: 1 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.lg },
  infoItem: { width: '50%', paddingVertical: 8, paddingRight: 8 },
  infoItemBorder: { borderRightWidth: 1, borderRightColor: COLORS.hairline },
  infoLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 3 },
  infoValue: { color: COLORS.text, fontSize: 12, fontWeight: '800' },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: RADIUS.lg, borderWidth: 1,
    padding: SPACING.md, marginBottom: SPACING.lg,
  },
  statusText: { fontSize: 12, fontWeight: '800' },
  qrSection: { alignItems: 'center', marginBottom: SPACING.lg },
  qrWrap: {
    padding: 12, backgroundColor: '#fff', borderRadius: 18, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.hairline,
  },
  qrLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  qrSub: { color: COLORS.textMuted, fontSize: 9, marginTop: 4, letterSpacing: 0.5 },
  ticketFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderTopWidth: 1, borderTopColor: COLORS.hairline,
    paddingTop: SPACING.md,
  },
  ticketFooterText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },

  actions: { paddingHorizontal: SPACING.xl, marginTop: SPACING.xl, gap: SPACING.md },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.hairline,
    paddingVertical: 14,
  },
  outlineBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});
