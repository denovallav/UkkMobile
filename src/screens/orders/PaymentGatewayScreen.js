import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { useApp } from '../../context/AppContext';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { copyToClipboard } from '../../utils/platformUtils';
import {
  findChannel, buildVaNumber, buildQrisPayload, EWALLET_NUMBER,
} from '../../data/paymentChannels';

const WINDOW_SECONDS = 15 * 60;

const pad = (n) => String(n).padStart(2, '0');

const formatCardNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

function stepsFor(channel) {
  if (channel.id === 'qris') {
    return [
      'Buka aplikasi bank atau e-wallet yang mendukung QRIS.',
      'Pilih menu Scan QR, lalu arahkan kamera ke kode di atas.',
      'Periksa nominal, lalu konfirmasi pembayaran.',
    ];
  }
  if (channel.id === 'card') {
    return [
      'Masukkan data kartu kredit atau debit kamu.',
      'Kode OTP akan dikirim oleh bank penerbit (simulasi).',
      'Pembayaran diverifikasi otomatis dalam beberapa detik.',
    ];
  }
  if (channel.id.startsWith('va-')) {
    return [
      'Buka aplikasi mobile banking atau ATM.',
      'Pilih menu Transfer / Virtual Account.',
      `Masukkan nomor VA di atas, lalu bayar sesuai nominal.`,
    ];
  }
  return [
    `Buka aplikasi ${channel.name} di ponselmu.`,
    'Pilih menu Bayar / Transfer ke nomor tujuan di atas.',
    'Masukkan nominal sesuai total, lalu konfirmasi.',
  ];
}

export default function PaymentGatewayScreen({ route, navigation }) {
  const { order, concert } = route.params;
  const insets = useSafeAreaInsets();
  const { markOrderPaid } = useApp();

  const channel = findChannel(order.paymentChannel);
  const [seconds, setSeconds] = useState(WINDOW_SECONDS);
  const expired = seconds === 0;
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paidAt, setPaidAt] = useState(null);
  const [toast, setToast] = useState(null);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardError, setCardError] = useState(null);
  const [vaNumber] = useState(() => buildVaNumber(channel.id, order.id));
  const [qrisPayload] = useState(() => buildQrisPayload(order));

  useEffect(() => {
    if (paid) return undefined;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paid]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleCopy = async (value, label) => {
    const ok = await copyToClipboard(value);
    setToast(ok ? `${label} tersalin` : 'Gagal menyalin');
  };

  const handleOpenWallet = () => {
    setToast(`Membuka aplikasi ${channel.name} (demo)`);
  };

  const handlePay = () => {
    if (expired || processing) return;

    if (channel.id === 'card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length !== 16) return setCardError('Nomor kartu harus terdiri dari 16 digit.');
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return setCardError('Masa berlaku harus berformat MM/YY.');
      if (card.cvv.length !== 3) return setCardError('CVV harus terdiri dari 3 digit.');
      if (!card.name.trim()) return setCardError('Nama pada kartu wajib diisi.');
      setCardError(null);
    }

    setProcessing(true);
    setTimeout(async () => {
      const stamp = new Date().toISOString();
      await markOrderPaid(order.id);
      setPaidAt(stamp);
      setProcessing(false);
      setPaid(true);
    }, 2200);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isUrgent = seconds <= 120;
  const timePct = seconds / WINDOW_SECONDS;

  if (paid) {
    return (
      <View style={[s.container, { paddingTop: insets.top + SPACING.xxxl }]}>
        <ScrollView contentContainerStyle={s.successScroll} showsVerticalScrollIndicator={false}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark" size={34} color="#FFFFFF" />
          </View>
          <Text style={s.successTitle}>Pembayaran Berhasil</Text>
          <Text style={s.successSub}>
            Pembayaranmu sudah kami terima. E-ticket aktif setelah pesanan diverifikasi.
          </Text>

          <View style={s.receiptCard}>
            <View style={s.receiptRow}>
              <Text style={s.receiptLabel}>Total dibayar</Text>
              <Text style={s.receiptValue}>{formatPrice(order.totalPrice)}</Text>
            </View>
            <View style={s.receiptRow}>
              <Text style={s.receiptLabel}>Metode</Text>
              <Text style={s.receiptValue}>{channel.name}</Text>
            </View>
            <View style={s.receiptRow}>
              <Text style={s.receiptLabel}>No. pesanan</Text>
              <Text style={s.receiptValue}>{order.id}</Text>
            </View>
            <View style={[s.receiptRow, s.receiptRowLast]}>
              <Text style={s.receiptLabel}>Waktu</Text>
              <Text style={s.receiptValue}>{formatDateTime(paidAt || new Date().toISOString())}</Text>
            </View>
          </View>

          <GradientButton
            title="Lihat E-Ticket"
            onPress={() => navigation.replace('ETicket', {
              order: { ...order, paymentStatus: 'waiting', paymentChannel: channel.id },
              concert,
            })}
            icon={<Ionicons name="ticket-outline" size={16} color="#fff" />}
            style={s.successCta}
          />
          <TouchableOpacity
            style={s.successLink}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            activeOpacity={0.7}
          >
            <Text style={s.successLinkText}>Kembali ke beranda</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={[s.topBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={s.brandCol}>
          <View style={s.brandRow}>
            <Text style={s.brandText}>FIX YOU Pay</Text>
            <Ionicons name="lock-closed" size={11} color={COLORS.accent} />
          </View>
          <Text style={s.brandSub}>Pembayaran aman & terenkripsi</Text>
        </View>
        <View style={[s.timerChip, isUrgent && s.timerChipUrgent]}>
          <Ionicons name="time-outline" size={13} color={isUrgent ? COLORS.error : COLORS.textSecondary} />
          <Text style={[s.timerText, isUrgent && s.timerTextUrgent]}>{pad(mins)}:{pad(secs)}</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.content}>
          <View style={s.amountCard}>
            <Text style={s.amountLabel}>Total Pembayaran</Text>
            <Text style={s.amountValue}>{formatPrice(order.totalPrice)}</Text>
            <View style={s.amountMeta}>
              <Text style={s.amountMetaText}>{order.id}</Text>
              <View style={s.dot} />
              <Text style={s.amountMetaText} numberOfLines={1}>{order.ticketClass} · {order.quantity} tiket</Text>
            </View>
            <View style={s.timeTrack}>
              <View
                style={[
                  s.timeFill,
                  { width: `${Math.max(timePct, 0) * 100}%` },
                  isUrgent && { backgroundColor: COLORS.error },
                ]}
              />
            </View>
            <Text style={s.timeHint}>
              {expired
                ? 'Waktu pembayaran habis. Silakan buat pesanan baru.'
                : 'Selesaikan pembayaran sebelum waktu habis, atau pesanan dibatalkan otomatis.'}
            </Text>
          </View>

          {channel.id === 'qris' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Scan kode QRIS</Text>
              <View style={s.qrBox}>
                <QRCodeDisplay value={qrisPayload} size={196} />
              </View>
              <Text style={s.cardNote}>
                Buka aplikasi bank atau e-wallet apa pun yang mendukung QRIS, lalu pindai kode di atas.
              </Text>
              <View style={s.qrisFooter}>
                <Text style={s.qrisFooterText}>QRIS</Text>
                <Text style={s.qrisFooterSub}>Satu kode untuk semua</Text>
              </View>
            </View>
          )}

          {channel.id.startsWith('va-') && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Nomor Virtual Account</Text>
              <View style={s.vaBox}>
                <View style={{ flex: 1 }}>
                  <Text style={s.vaBank}>{channel.name}</Text>
                  <Text style={s.vaNumber}>{vaNumber}</Text>
                  <Text style={s.vaHolder}>a.n. FIX YOU TIKET INDONESIA</Text>
                </View>
                <TouchableOpacity
                  style={s.copyBtn}
                  onPress={() => handleCopy(vaNumber, 'Nomor VA')}
                  activeOpacity={0.75}
                >
                  <Ionicons name="copy-outline" size={15} color={COLORS.primary} />
                  <Text style={s.copyText}>Salin</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.cardNote}>
                Nomor ini khusus untuk pesanan {order.id}. Nominal harus sama persis agar terverifikasi otomatis.
              </Text>
            </View>
          )}

          {!channel.id.startsWith('va-') && channel.id !== 'qris' && channel.id !== 'card' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Nomor Tujuan {channel.name}</Text>
              <View style={s.vaBox}>
                <View style={{ flex: 1 }}>
                  <Text style={s.vaBank}>{channel.name}</Text>
                  <Text style={s.vaNumber}>{EWALLET_NUMBER}</Text>
                  <Text style={s.vaHolder}>a.n. FIX YOU</Text>
                </View>
                <TouchableOpacity
                  style={s.copyBtn}
                  onPress={() => handleCopy(EWALLET_NUMBER, 'Nomor tujuan')}
                  activeOpacity={0.75}
                >
                  <Ionicons name="copy-outline" size={15} color={COLORS.primary} />
                  <Text style={s.copyText}>Salin</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={s.walletBtn} onPress={handleOpenWallet} activeOpacity={0.85}>
                <Ionicons name="open-outline" size={16} color={COLORS.primary} />
                <Text style={s.walletBtnText}>Buka aplikasi {channel.name}</Text>
              </TouchableOpacity>
            </View>
          )}

          {channel.id === 'card' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Detail Kartu</Text>

              <Text style={s.fieldLabel}>Nomor Kartu</Text>
              <TextInput
                style={s.input}
                value={card.number}
                onChangeText={(v) => { setCardError(null); setCard({ ...card, number: formatCardNumber(v) }); }}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                maxLength={19}
              />

              <View style={s.fieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Masa Berlaku</Text>
                  <TextInput
                    style={s.input}
                    value={card.expiry}
                    onChangeText={(v) => { setCardError(null); setCard({ ...card, expiry: formatExpiry(v) }); }}
                    placeholder="MM/YY"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                </View>
                <View style={{ width: 110 }}>
                  <Text style={s.fieldLabel}>CVV</Text>
                  <TextInput
                    style={s.input}
                    value={card.cvv}
                    onChangeText={(v) => { setCardError(null); setCard({ ...card, cvv: v.replace(/\D/g, '').slice(0, 3) }); }}
                    placeholder="123"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>

              <Text style={s.fieldLabel}>Nama pada Kartu</Text>
              <TextInput
                style={s.input}
                value={card.name}
                onChangeText={(v) => { setCardError(null); setCard({ ...card, name: v }); }}
                placeholder="Nama sesuai kartu"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />

              {cardError && (
                <View style={s.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                  <Text style={s.errorText}>{cardError}</Text>
                </View>
              )}

              <View style={s.secureRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
                <Text style={s.secureText}>Data kartu dienkripsi dan tidak disimpan di perangkat.</Text>
              </View>
            </View>
          )}

          <View style={s.card}>
            <Text style={s.cardTitle}>Cara Pembayaran</Text>
            {stepsFor(channel).map((step, index) => (
              <View key={step} style={s.stepRow}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{index + 1}</Text>
                </View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={s.demoNote}>
            <Ionicons name="information-circle-outline" size={15} color={COLORS.info} />
            <Text style={s.demoNoteText}>
              Lingkungan demo: pembayaran disimulasikan dan tidak ada dana yang benar-benar ditarik.
            </Text>
          </View>
        </View>
      </ScrollView>

      {toast && (
        <View style={[s.toast, { bottom: 110 + insets.bottom }]}>
          <Ionicons name="checkmark-circle" size={15} color={COLORS.accent} />
          <Text style={s.toastText}>{toast}</Text>
        </View>
      )}

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <GradientButton
          title={
            expired
              ? 'Waktu Pembayaran Habis'
              : channel.id === 'card'
                ? `Bayar ${formatPrice(order.totalPrice)}`
                : 'Saya Sudah Bayar'
          }
          onPress={handlePay}
          disabled={expired}
          icon={
            <Ionicons
              name={channel.id === 'card' ? 'card-outline' : 'checkmark-circle-outline'}
              size={16}
              color="#fff"
            />
          }
        />
      </View>

      <Modal visible={processing} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={s.modalBackdrop}>
          <View style={s.processingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={s.processingTitle}>Memverifikasi pembayaran</Text>
            <Text style={s.processingText}>Mohon tunggu, jangan tutup halaman ini.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  brandCol: { flex: 1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  brandText: { color: COLORS.text, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  brandSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  timerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.cardLight,
  },
  timerChipUrgent: { borderColor: 'rgba(209,71,63,0.4)', backgroundColor: '#FDF3F2' },
  timerText: { color: COLORS.text, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  timerTextUrgent: { color: COLORS.error },

  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, gap: SPACING.lg },

  amountCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  amountLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  amountValue: {
    color: COLORS.text, fontSize: FONTS.sizes.xxxl, fontWeight: '700',
    letterSpacing: -0.8, marginTop: 4,
  },
  amountMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  amountMetaText: { color: COLORS.textMuted, fontSize: 10.5 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: COLORS.border },
  timeTrack: {
    height: 3, borderRadius: 2, backgroundColor: COLORS.borderLight,
    marginTop: SPACING.md, overflow: 'hidden',
  },
  timeFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.primary },
  timeHint: { color: COLORS.textMuted, fontSize: 10.5, lineHeight: 16, marginTop: 8 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: SPACING.md },
  cardNote: { color: COLORS.textSecondary, fontSize: 11, lineHeight: 17, marginTop: SPACING.md },

  qrBox: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  qrisFooter: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: SPACING.md },
  qrisFooterText: { color: COLORS.text, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  qrisFooterSub: { color: COLORS.textMuted, fontSize: 10 },

  vaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  vaBank: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  vaNumber: { color: COLORS.text, fontSize: 19, fontWeight: '700', letterSpacing: 1.4, marginTop: 2 },
  vaHolder: { color: COLORS.textMuted, fontSize: 10, marginTop: 3 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  copyText: { color: COLORS.primary, fontSize: 10.5, fontWeight: '700' },

  walletBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    marginTop: SPACING.md, paddingVertical: 11,
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
  },
  walletBtnText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  fieldLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600', marginBottom: 5 },
  input: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 13, color: COLORS.text,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  fieldRow: { flexDirection: 'row', gap: SPACING.md },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.md },
  errorText: { color: COLORS.error, fontSize: 11, flex: 1 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  secureText: { color: COLORS.textMuted, fontSize: 10, flex: 1 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepNum: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },
  stepText: { flex: 1, color: COLORS.textSecondary, fontSize: 11.5, lineHeight: 18 },

  demoNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(61,138,168,0.08)',
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(61,138,168,0.2)',
    padding: SPACING.md,
  },
  demoNoteText: { flex: 1, color: COLORS.info, fontSize: 10.5, lineHeight: 16 },

  toast: {
    position: 'absolute', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: COLORS.text, borderRadius: RADIUS.full,
    paddingHorizontal: 16, paddingVertical: 10,
    ...SHADOWS.medium,
  },
  toastText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  modalBackdrop: {
    flex: 1, backgroundColor: COLORS.scrim,
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  processingCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  processingTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginTop: 4 },
  processingText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },

  successScroll: { paddingHorizontal: SPACING.xl, alignItems: 'center' },
  successIcon: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '700', marginTop: SPACING.lg, letterSpacing: -0.4 },
  successSub: {
    color: COLORS.textSecondary, fontSize: 12, lineHeight: 18,
    textAlign: 'center', marginTop: 6, paddingHorizontal: 8,
  },
  receiptCard: {
    alignSelf: 'stretch',
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
  },
  receiptRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, gap: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  receiptRowLast: { borderBottomWidth: 0 },
  receiptLabel: { color: COLORS.textSecondary, fontSize: 11.5 },
  receiptValue: { color: COLORS.text, fontSize: 12, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  successCta: { alignSelf: 'stretch', marginTop: SPACING.xxl },
  successLink: { paddingVertical: 14, marginTop: 2 },
  successLinkText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
});
