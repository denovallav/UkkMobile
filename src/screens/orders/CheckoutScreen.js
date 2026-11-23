import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import { formatPrice, formatDate, generateOrderId } from '../../utils/helpers';
import { PAYMENT_GROUPS, findChannel } from '../../data/paymentChannels';

const HOLD_MINUTES = 10;

function HoldTimer({ onExpire }) {
  const [seconds, setSeconds] = useState(HOLD_MINUTES * 60);
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const isUrgent = seconds <= 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onExpire]);

  useEffect(() => {
    if (!isUrgent) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isUrgent, pulseAnim]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  const pct = seconds / (HOLD_MINUTES * 60);

  return (
    <Animated.View style={[ht.container, isUrgent && ht.containerUrgent, { transform: [{ scale: isUrgent ? pulseAnim : 1 }] }]}>
      <View style={ht.row}>
        <View style={[ht.iconWrap, isUrgent && { backgroundColor: 'rgba(209,71,63,0.12)' }]}>
          <Ionicons name="hourglass" size={19} color={isUrgent ? COLORS.error : COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ht.title}>Batas Waktu Checkout</Text>
          <Text style={ht.sub}>Selesaikan pesanan sebelum waktu habis</Text>
        </View>
        <View style={[ht.timerBox, isUrgent && ht.timerBoxUrgent]}>
          <Text style={[ht.timerText, isUrgent && ht.timerTextUrgent]}>{pad(mins)}:{pad(secs)}</Text>
        </View>
      </View>
      <View style={ht.barTrack}>
        <View style={[ht.barFill, {
          width: `${pct * 100}%`,
          backgroundColor: isUrgent ? COLORS.error : pct < 0.3 ? COLORS.warning : COLORS.primary,
        }]} />
      </View>
    </Animated.View>
  );
}

export default function CheckoutScreen({ route, navigation }) {
  const { concert, ticketClass, quantity, total } = route.params;
  const insets = useSafeAreaInsets();
  const { user, addOrder } = useApp();
  const [channel, setChannel] = useState('qris');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  const selectedChannel = findChannel(channel);

  const handleExpire = useCallback(() => {
    setExpired(true);
    Alert.alert('Waktu Habis', 'Batas waktu checkout telah berakhir. Silakan ulangi pemesanan.', [
      { text: 'Kembali', onPress: () => navigation.goBack() },
    ]);
  }, [navigation]);

  const handleSubmit = async () => {
    if (loading || expired) return;
    setLoading(true);

    const order = {
      id: generateOrderId(),
      concertId: concert.id,
      concertTitle: concert.title,
      ticketClass: ticketClass.name,
      quantity,
      totalPrice: total,
      status: 'pending',
      paymentStatus: 'pending',
      paymentChannel: selectedChannel.id,
      paymentChannelLabel: selectedChannel.name,
      orderDate: new Date().toISOString(),
      concertDate: concert.date,
      venue: concert.venue,
      paymentProof: null,
      ticketColor: ticketClass.color,
      artist: concert.artist,
    };

    await addOrder(order);
    setLoading(false);
    navigation.replace('PaymentGateway', { order, concert });
  };

  const steps = ['Tiket', 'Bayar', 'Selesai'];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Checkout" subtitle="Selesaikan pembayaranmu" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Stepper */}
          <View style={styles.stepper}>
            {steps.map((label, i) => {
              const done = i < 1;
              const active = i === 1;
              return (
                <React.Fragment key={label}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                      {done ? (
                        <Ionicons name="checkmark" size={11} color="#fff" />
                      ) : (
                        <Text style={[styles.stepNum, active && { color: '#fff' }]}>{i + 1}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>{label}</Text>
                  </View>
                  {i < steps.length - 1 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
                </React.Fragment>
              );
            })}
          </View>

          <HoldTimer onExpire={handleExpire} />

          {/* Order summary */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ringkasan Pesanan</Text>
            {[
              { icon: 'musical-notes-outline', label: 'Konser', value: concert.title },
              { icon: 'calendar-outline', label: 'Tanggal', value: `${formatDate(concert.date)} • ${concert.time}` },
              { icon: 'location-outline', label: 'Venue', value: concert.venue },
              { icon: 'ticket-outline', label: 'Kelas', value: ticketClass.name },
              { icon: 'people-outline', label: 'Jumlah', value: `${quantity} Tiket × ${formatPrice(ticketClass.price)}` },
            ].map((item) => (
              <View key={item.label} style={styles.summaryRow}>
                <Ionicons name={item.icon} size={15} color={COLORS.textMuted} />
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text style={styles.summaryVal} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
            <View style={styles.totalBand}>
              <Text style={styles.totalLabel}>Total Pembayaran</Text>
              <Text style={styles.totalVal}>{formatPrice(total)}</Text>
            </View>
          </View>

          {/* Buyer */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Data Pemesan</Text>
            <View style={styles.summaryRow}>
              <Ionicons name="person-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.summaryLabel}>Nama</Text>
              <Text style={styles.summaryVal}>{user?.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Ionicons name="mail-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.summaryLabel}>Email</Text>
              <Text style={styles.summaryVal}>{user?.email}</Text>
            </View>
          </View>

          {/* Payment channel */}
          <View>
            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            <Text style={styles.sectionSub}>Pilih kanal pembayaran yang paling nyaman untukmu.</Text>
          </View>

          <View style={styles.channelCard}>
            {PAYMENT_GROUPS.map((group) => (
              <View key={group.group}>
                <Text style={styles.groupLabel}>{group.group}</Text>
                {group.items.map((item) => {
                  const active = channel === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setChannel(item.id)}
                      style={[styles.channelRow, active && styles.channelRowActive]}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.mark, { backgroundColor: item.color }]}>
                        <Text style={styles.markText}>{item.mark}</Text>
                      </View>
                      <View style={styles.channelCopy}>
                        <Text style={[styles.channelName, active && { color: COLORS.primary }]}>{item.name}</Text>
                        <Text style={styles.channelDesc}>{item.desc}</Text>
                      </View>
                      <View style={[styles.radio, active && styles.radioActive]}>
                        {active && <View style={styles.radioDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <View style={styles.notice}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.info} />
            <Text style={styles.noticeText}>
              Kamu akan diarahkan ke halaman pembayaran FIX YOU Pay. Pesanan diproses setelah pembayaran terverifikasi.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerMeta}>
          <Text style={styles.footerMetaLabel}>Total Pembayaran</Text>
          <Text style={styles.footerMetaValue}>{formatPrice(total)}</Text>
        </View>
        <GradientButton
          title={loading ? 'Menyiapkan...' : 'Lanjut ke Pembayaran'}
          onPress={handleSubmit}
          loading={loading}
          disabled={expired}
          icon={<Ionicons name="lock-closed-outline" size={15} color="#fff" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, gap: SPACING.lg },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone: { backgroundColor: COLORS.accent },
  stepDotActive: { backgroundColor: COLORS.primary },
  stepNum: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700' },
  stepLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  stepLabelActive: { color: COLORS.text },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 8, borderRadius: 1 },
  stepLineDone: { backgroundColor: COLORS.accent },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  cardTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: SPACING.md },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 12, width: 76 },
  summaryVal: { flex: 1, color: COLORS.text, fontSize: 12, fontWeight: '600', textAlign: 'right' },
  totalBand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(91,95,239,0.06)',
    borderWidth: 1, borderColor: 'rgba(91,95,239,0.12)',
  },
  totalLabel: { color: COLORS.text, fontSize: 12.5, fontWeight: '600' },
  totalVal: { color: COLORS.primary, fontSize: FONTS.sizes.xxl, fontWeight: '700', letterSpacing: -0.4 },

  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', letterSpacing: -0.3 },
  sectionSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },

  channelCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 6,
  },
  groupLabel: {
    color: COLORS.textMuted, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.7,
    marginTop: SPACING.md, marginBottom: 2,
  },
  channelRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11,
    paddingHorizontal: SPACING.lg,
    marginHorizontal: -SPACING.lg,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  channelRowActive: { backgroundColor: 'rgba(91,95,239,0.05)' },
  mark: {
    width: 38, height: 26, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  markText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  channelCopy: { flex: 1 },
  channelName: { color: COLORS.text, fontSize: 12.5, fontWeight: '600' },
  channelDesc: { color: COLORS.textMuted, fontSize: 10.5, marginTop: 1 },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: COLORS.hairlineStrong,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.primary },

  notice: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: 'rgba(61,138,168,0.08)',
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(61,138,168,0.2)',
    padding: SPACING.md,
  },
  noticeText: { flex: 1, color: COLORS.info, fontSize: 11, lineHeight: 17 },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerMeta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 9,
  },
  footerMetaLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  footerMetaValue: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
});

const ht = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  containerUrgent: { borderColor: 'rgba(209,71,63,0.35)', backgroundColor: '#FDF3F2' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(91,95,239,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  sub: { color: COLORS.textSecondary, fontSize: 10, marginTop: 2 },
  timerBox: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: COLORS.border,
  },
  timerBoxUrgent: { borderColor: COLORS.error, backgroundColor: 'rgba(209,71,63,0.08)' },
  timerText: { color: COLORS.text, fontSize: 17, fontWeight: '700', letterSpacing: 1 },
  timerTextUrgent: { color: COLORS.error },
  barTrack: {
    height: 3, borderRadius: 2,
    backgroundColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
});
