import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { pickImageFromLibrary, copyToClipboard } from '../../utils/platformUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import { formatDateTime, formatPrice, getStatusColor, getStatusLabel, getStatusIcon } from '../../utils/helpers';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params;
  const insets = useSafeAreaInsets();
  const { updateOrderPayment } = useApp();
  const [uploading, setUploading] = useState(false);
  const [localProof, setLocalProof] = useState(order.paymentProof);
  const [copied, setCopied] = useState(false);

  const statusColor = getStatusColor(order.paymentStatus);
  const statusLabel = getStatusLabel(order.paymentStatus);
  const statusIcon = getStatusIcon(order.paymentStatus);

  const uploadProof = async () => {
    const result = await pickImageFromLibrary();
    if (result && !result.canceled) {
      const uri = result.assets[0].uri;
      setUploading(true);
      setTimeout(async () => {
        setLocalProof(uri);
        await updateOrderPayment(order.id, uri);
        setUploading(false);
        Alert.alert('Berhasil', 'Bukti pembayaran berhasil diperbarui!');
      }, 1200);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(order.id);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  };

  const qrValue = JSON.stringify({ orderId: order.id, concertId: order.concertId, class: order.ticketClass });

  return (
    <View style={styles.container}>

      <ScreenHeader title="Detail Pesanan" subtitle={order.concertTitle} onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        <View style={[styles.statusCard, { borderColor: `${statusColor}44`, backgroundColor: `${statusColor}10` }]}>
          <LinearGradient colors={[`${statusColor}18`, 'transparent']} style={StyleSheet.absoluteFill} />
          <View style={[styles.statusIconCircle, { backgroundColor: `${statusColor}22` }]}>
            <Ionicons name={statusIcon} size={26} color={statusColor} />
          </View>
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
          <Text style={styles.statusSubtext}>
            {order.paymentStatus === 'verified'
              ? 'Pembayaran telah dikonfirmasi. Tiketmu siap!'
              : order.paymentStatus === 'rejected'
              ? 'Pembayaran ditolak. Hubungi admin untuk bantuan.'
              : order.paymentStatus === 'waiting'
              ? 'Admin sedang memverifikasi pembayaranmu. Tunggu sebentar ya!'
              : 'Pesanan belum dibayar. Selesaikan pembayaran agar tiketmu diproses.'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.orderIdRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardLabel}>Order ID</Text>
              <Text style={styles.orderIdText}>{order.id}</Text>
            </View>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.75}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={15} color={COLORS.primary} />
              <Text style={styles.copyText}>{copied ? 'Tersalin' : 'Salin'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.orderDate}>{formatDateTime(order.orderDate)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Info Konser</Text>
          {[
            { icon: 'musical-notes-outline', label: 'Konser', value: order.concertTitle },
            { icon: 'calendar-outline', label: 'Tanggal', value: order.concertDate },
            { icon: 'location-outline', label: 'Venue', value: order.venue },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={item.icon} size={14} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue} numberOfLines={2}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detail Tiket</Text>
          {[
            { icon: 'ticket-outline', label: 'Kelas', value: order.ticketClass },
            { icon: 'people-outline', label: 'Jumlah', value: `${order.quantity} Tiket` },
            { icon: 'card-outline', label: 'Total', value: formatPrice(order.totalPrice) },
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={item.icon} size={14} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={[styles.infoValue, item.label === 'Total' && { color: COLORS.primary, fontWeight: '700' }]} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </View>

        {order.paymentStatus === 'verified' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>QR Code Tiket</Text>
            <View style={styles.qrContainer}>
              <View style={styles.qrWrap}>
                <QRCodeDisplay value={qrValue} size={120} />
              </View>
              <Text style={styles.qrSub}>Tunjukkan QR ini saat masuk venue</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {order.paymentChannelLabel ? 'Metode Pembayaran' : 'Bukti Pembayaran'}
          </Text>

          {order.paymentChannelLabel ? (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="wallet-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.infoLabel}>Kanal</Text>
                <Text style={styles.infoValue}>{order.paymentChannelLabel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-done-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: statusColor }]}>{statusLabel}</Text>
              </View>
              {order.paidAt && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.infoLabel}>Dibayar</Text>
                  <Text style={styles.infoValue}>{formatDateTime(order.paidAt)}</Text>
                </View>
              )}
              <Text style={styles.paidNote}>
                Pembayaran diproses melalui FIX YOU Pay. Tidak perlu mengunggah bukti transfer.
              </Text>
            </>
          ) : localProof ? (
            <View style={styles.proofContainer}>
              <Image source={{ uri: localProof }} style={styles.proofImage} />
              {order.paymentStatus !== 'verified' && (
                <TouchableOpacity style={styles.updateProofBtn} onPress={uploadProof} activeOpacity={0.85}>
                  <Ionicons name="refresh-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.updateProofText}>Ganti Bukti Bayar</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noProof}>
              <View style={styles.noProofIcon}>
                <Ionicons name="image-outline" size={26} color={COLORS.textMuted} />
              </View>
              <Text style={styles.noProofText}>Belum ada bukti pembayaran</Text>
              <GradientButton
                title={uploading ? 'Mengunggah...' : 'Upload Bukti Bayar'}
                onPress={uploadProof}
                loading={uploading}
                size="sm"
                style={{ marginTop: 12, alignSelf: 'stretch' }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, gap: SPACING.md },
  statusCard: {
    borderRadius: RADIUS.xl, borderWidth: 1,
    padding: SPACING.xl, alignItems: 'center', gap: 6, overflow: 'hidden',
  },
  statusIconCircle: { width: 56, height: 56, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statusLabel: { fontSize: FONTS.sizes.lg, fontWeight: '700' },
  statusSubtext: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  card: {
    backgroundColor: COLORS.glassStrong, borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.hairline, padding: SPACING.lg, gap: SPACING.sm,
    ...SHADOWS.small,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cardLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  orderIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderIdText: { color: COLORS.primary, fontSize: 13, fontWeight: '700', marginTop: 2 },
  orderDate: { color: COLORS.textMuted, fontSize: 11 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7,
    backgroundColor: 'rgba(91,95,239,0.08)', borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.hairline,
  },
  copyText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoLabel: { color: COLORS.textSecondary, fontSize: 12, width: 60 },
  infoValue: { flex: 1, color: COLORS.text, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  qrContainer: { alignItems: 'center', paddingVertical: SPACING.md, gap: 8 },
  qrWrap: { padding: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: COLORS.hairline },
  qrSub: { color: COLORS.textSecondary, fontSize: 11 },
  proofContainer: { gap: SPACING.sm },
  proofImage: { width: '100%', height: 180, borderRadius: RADIUS.lg, resizeMode: 'cover' },
  updateProofBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  updateProofText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  noProof: { alignItems: 'center', paddingVertical: SPACING.md, gap: 4 },
  noProofIcon: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  noProofText: { color: COLORS.textMuted, fontSize: 12 },
  paidNote: { color: COLORS.textMuted, fontSize: 10.5, lineHeight: 16, marginTop: 4 },
});
