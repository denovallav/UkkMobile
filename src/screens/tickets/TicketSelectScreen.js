import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import { formatPrice, formatDate } from '../../utils/helpers';

const { width } = Dimensions.get('window');

// Stage Area definitions: each class maps to stage zones
const STAGE_ZONES = {
  'VIP Festival': { zone: 'front', label: 'VIP ZONE', top: 185, left: width / 2 - 70, w: 140, h: 36 },
  'CAT 1':        { zone: 'mid',   label: 'CAT 1',    top: 230, left: width / 2 - 100, w: 200, h: 32 },
  'CAT 2':        { zone: 'mid2',  label: 'CAT 2',    top: 270, left: width / 2 - 125, w: 250, h: 32 },
  'CAT 3':        { zone: 'back',  label: 'CAT 3',    top: 310, left: width / 2 - 155, w: 310, h: 32 },
  'VIP':          { zone: 'front', label: 'VIP',      top: 185, left: width / 2 - 70, w: 140, h: 36 },
  'GOLD':         { zone: 'mid',   label: 'GOLD',     top: 230, left: width / 2 - 100, w: 200, h: 32 },
  'SILVER':       { zone: 'back',  label: 'SILVER',   top: 270, left: width / 2 - 130, w: 260, h: 32 },
  'REGULER':      { zone: 'back',  label: 'REGULER',  top: 310, left: width / 2 - 150, w: 300, h: 32 },
};

function InteractiveStagemap({ ticketClasses, selectedClass, onSelect }) {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={sm.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={sm.map}>
        <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sm.stage}>
          <Ionicons name="musical-notes" size={16} color="rgba(255,255,255,0.95)" />
          <Text style={sm.stageLabel}>PANGGUNG UTAMA</Text>
        </LinearGradient>

        <View style={sm.spotlightLeft} />
        <View style={sm.spotlightRight} />

        {ticketClasses.map((tc) => {
          const zone = STAGE_ZONES[tc.name] || STAGE_ZONES['CAT 3'];
          const isSelected = selectedClass?.id === tc.id;
          const pct = (tc.remainingQuota / tc.totalQuota) * 100;
          const isLow = pct <= 10;
          const isSoldOut = tc.remainingQuota === 0;

          return (
            <TouchableOpacity
              key={tc.id}
              activeOpacity={isSoldOut ? 1 : 0.85}
              onPress={() => !isSoldOut && onSelect?.(tc)}
              style={{
                position: 'absolute',
                top: zone.top - 110,
                left: zone.left - 20,
                width: zone.w,
                height: zone.h,
                zIndex: isSelected ? 10 : 1,
              }}
            >
              <Animated.View
                style={[
                  sm.zone,
                  {
                    borderColor: isSelected ? tc.color : `${tc.color}66`,
                    backgroundColor: isSelected ? `${tc.color}55` : `${tc.color}22`,
                    transform: [{ scale: isSelected ? pulseAnim : 1 }],
                    opacity: isSoldOut ? 0.45 : 1,
                  },
                ]}
              >
                <Text style={[sm.zoneLabel, { color: isSelected ? '#fff' : `${tc.color}CC` }]}>
                  {tc.name}
                </Text>
                {isLow && !isSoldOut && <Text style={sm.lowText}>HAMPIR HABIS</Text>}
                {isSelected && <View style={[sm.selectedDot, { backgroundColor: tc.color }]} />}
              </Animated.View>
            </TouchableOpacity>
          );
        })}

        <View style={sm.grid}>
          {[0, 1, 2, 3].map(i => <View key={i} style={sm.gridLine} />)}
        </View>

        <View style={sm.audience}>
          <Ionicons name="people" size={12} color="rgba(255,255,255,0.35)" />
          <Text style={sm.audienceText}>Area Penonton</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function QuotaBar({ remaining, total, color }) {
  const pct = (remaining / total) * 100;
  const [barAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(barAnim, { toValue: pct, duration: 800, useNativeDriver: false }).start();
  }, [barAnim, pct]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
  const barColor = pct <= 10 ? COLORS.error : pct <= 30 ? COLORS.warning : color;

  return (
    <View style={qb.container}>
      <View style={qb.track}>
        <Animated.View style={[qb.fill, { width: barWidth, backgroundColor: barColor }]} />
      </View>
      <Text style={[qb.label, { color: barColor }]}>{Math.round(pct)}%</Text>
    </View>
  );
}

function CountdownTimer({ concertDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(concertDate) - new Date();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [concertDate]);

  const pads = (n) => String(n).padStart(2, '0');

  return (
    <View style={cd.container}>
      <View style={cd.headerRow}>
        <Ionicons name="alarm-outline" size={16} color={COLORS.primary} />
        <Text style={cd.label}>Penjualan ditutup dalam</Text>
      </View>
      <View style={cd.timerRow}>
        {[
          { val: pads(time.days), unit: 'Hari' },
          { val: pads(time.hours), unit: 'Jam' },
          { val: pads(time.minutes), unit: 'Menit' },
          { val: pads(time.seconds), unit: 'Detik' },
        ].map((item, i) => (
          <React.Fragment key={i}>
            <View style={cd.unit}>
              <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={cd.unitBg} />
              <Text style={cd.unitVal}>{item.val}</Text>
              <Text style={cd.unitLabel}>{item.unit}</Text>
            </View>
            {i < 3 && <Text style={cd.sep}>:</Text>}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function TicketSelectScreen({ route, navigation }) {
  const { user } = useApp();
  useEffect(() => {
    if (!user) navigation.navigate('Login');
  }, [user, navigation]);
  const { concert } = route.params;
  const insets = useSafeAreaInsets();
  const [selectedClass, setSelectedClass] = useState(null);
  const [qty, setQty] = useState(1);
  const MAX_QTY = 4;

  const total = selectedClass ? selectedClass.price * qty : 0;

  const handleSelect = (tc) => {
    setSelectedClass(tc);
    setQty(1);
  };

  return (
    <View style={styles.container}>

      <ScreenHeader
        title={concert.title}
        subtitle={`${formatDate(concert.date)} • ${concert.time} WIB`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <CountdownTimer concertDate={concert.date} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Denah Panggung</Text>
            <Text style={styles.sectionSub}>Ketuk area di denah atau kartu kelas di bawah</Text>
          </View>
          <InteractiveStagemap
            ticketClasses={concert.ticketClasses}
            selectedClass={selectedClass}
            onSelect={handleSelect}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Pilih Kelas Tiket</Text>
          </View>
          {concert.ticketClasses.map((tc) => {
            const isSelected = selectedClass?.id === tc.id;
            const pct = (tc.remainingQuota / tc.totalQuota) * 100;
            const isLow = pct <= 10;
            const isSoldOut = tc.remainingQuota === 0;

            return (
              <TouchableOpacity
                key={tc.id}
                onPress={() => !isSoldOut && handleSelect(tc)}
                activeOpacity={isSoldOut ? 1 : 0.88}
                style={[styles.tcCard, isSelected && styles.tcCardSelected, isSoldOut && styles.tcCardSoldOut]}
              >
                {isSelected && (
                  <LinearGradient colors={[`${tc.color}26`, `${tc.color}08`]} style={StyleSheet.absoluteFill} />
                )}
                {isSelected && <View style={[styles.tcAccent, { backgroundColor: tc.color }]} />}
                <View style={styles.tcTop}>
                  <View style={styles.tcLeft}>
                    <View style={[styles.tcDot, { backgroundColor: tc.color }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tcName, isSoldOut && { opacity: 0.5 }]}>{tc.name}</Text>
                      {isLow && !isSoldOut && (
                        <View style={styles.lowBadge}>
                          <Text style={styles.lowText}>Hampir habis!</Text>
                        </View>
                      )}
                      {isSoldOut && (
                        <View style={[styles.lowBadge, { backgroundColor: COLORS.textMuted }]}>
                          <Text style={styles.lowText}>Sold Out</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.tcRight}>
                    <Text style={[styles.tcPrice, { color: isSoldOut ? COLORS.textMuted : tc.color }]}>
                      {formatPrice(tc.price)}
                    </Text>
                    <Text style={styles.tcPriceLabel}>per tiket</Text>
                  </View>
                </View>

                <View style={styles.perksRow}>
                  {tc.perks.slice(0, 3).map((p) => (
                    <View key={p} style={styles.perk}>
                      <Ionicons name="checkmark-circle" size={11} color={tc.color} />
                      <Text style={styles.perkText} numberOfLines={1}>{p}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.quotaRow}>
                  <Text style={styles.quotaLabel}>
                    {tc.remainingQuota.toLocaleString('id-ID')} / {tc.totalQuota.toLocaleString('id-ID')} tersisa
                  </Text>
                  <QuotaBar remaining={tc.remainingQuota} total={tc.totalQuota} color={tc.color} />
                </View>

                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: tc.color }]}>
                    <Ionicons name="checkmark" size={13} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedClass && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Jumlah Tiket</Text>
            </View>
            <View style={styles.qtyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.qtyClass}>{selectedClass.name}</Text>
                <Text style={styles.qtyHint}>Maksimal {MAX_QTY} tiket per pesanan</Text>
              </View>
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  onPress={() => qty > 1 && setQty(qty - 1)}
                  style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="remove" size={18} color={qty <= 1 ? COLORS.textMuted : COLORS.text} />
                </TouchableOpacity>
                <View style={styles.qtyDisplay}>
                  <Text style={styles.qtyNum}>{qty}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => qty < MAX_QTY && setQty(qty + 1)}
                  style={[styles.qtyBtn, styles.qtyBtnAdd, qty >= MAX_QTY && styles.qtyBtnDisabled]}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={qty >= MAX_QTY ? ['#D9D7EE', '#C9C7E2'] : COLORS.gradientPrimary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Ionicons name="add" size={18} color={qty >= MAX_QTY ? COLORS.textMuted : '#fff'} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 8 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {selectedClass ? (
          <View style={styles.footerRow}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerLabel}>Total Pembayaran</Text>
              <Text style={styles.footerTotal}>{formatPrice(total)}</Text>
              <Text style={styles.footerSub}>{qty} tiket · {selectedClass.name}</Text>
            </View>
            <GradientButton
              title="Pesan Sekarang"
              onPress={() => navigation.navigate('Checkout', { concert, ticketClass: selectedClass, quantity: qty, total })}
              style={styles.footerBtn}
            />
          </View>
        ) : (
          <View style={styles.footerHint}>
            <Ionicons name="hand-left-outline" size={18} color={COLORS.primary} />
            <Text style={styles.footerHintText}>Pilih kelas tiket terlebih dahulu</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  section: { paddingHorizontal: SPACING.xl, marginTop: SPACING.lg },
  sectionHead: { marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', letterSpacing: -0.3 },
  sectionSub: { color: COLORS.textSecondary, fontSize: 11, marginTop: 3 },

  tcCard: {
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.hairline,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.small,
  },
  tcCardSelected: { borderColor: COLORS.primary, ...SHADOWS.medium },
  tcAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  tcCardSoldOut: { opacity: 0.65 },
  tcTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  tcLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  tcDot: { width: 12, height: 12, borderRadius: 6 },
  tcName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  lowBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: COLORS.error, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start',
  },
  lowText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  tcRight: { alignItems: 'flex-end' },
  tcPrice: { fontSize: FONTS.sizes.lg, fontWeight: '700' },
  tcPriceLabel: { color: COLORS.textMuted, fontSize: 9, marginTop: 1 },
  perksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  perkText: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '500' },
  quotaRow: { gap: 5 },
  quotaLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  checkmark: {
    position: 'absolute', top: 12, right: 12,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },

  qtyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.hairline,
    padding: SPACING.lg,
    ...SHADOWS.small,
  },
  qtyClass: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  qtyHint: { color: COLORS.textMuted, fontSize: 10, marginTop: 3 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: COLORS.hairline,
  },
  qtyBtnAdd: { borderWidth: 0 },
  qtyBtnDisabled: { opacity: 0.55 },
  qtyDisplay: { minWidth: 32, alignItems: 'center' },
  qtyNum: { color: COLORS.text, fontSize: 26, fontWeight: '700' },

  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  footerLeft: { flex: 1 },
  footerLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  footerTotal: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '700', letterSpacing: -0.4, marginTop: 1 },
  footerSub: { color: COLORS.textMuted, fontSize: 10, marginTop: 1 },
  footerBtn: { minWidth: 148 },
  footerHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16,
  },
  footerHintText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
});

const sm = StyleSheet.create({
  container: { borderRadius: RADIUS.xl, overflow: 'hidden', marginBottom: SPACING.sm, ...SHADOWS.medium },
  map: { height: 260, position: 'relative', overflow: 'hidden' },
  stage: {
    position: 'absolute', top: 20, left: width / 2 - 100,
    width: 200, height: 44, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  stageLabel: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  spotlightLeft: {
    position: 'absolute', top: 0, left: width / 2 - 160,
    width: 2, height: 80,
    backgroundColor: 'rgba(139,156,255,0.35)',
    transform: [{ rotate: '-30deg' }],
  },
  spotlightRight: {
    position: 'absolute', top: 0, right: width / 2 - 160,
    width: 2, height: 80,
    backgroundColor: 'rgba(139,156,255,0.35)',
    transform: [{ rotate: '30deg' }],
  },
  zone: {
    flex: 1,
    borderRadius: 9, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 6,
  },
  zoneLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  lowText: { color: '#FF9AA2', fontSize: 7, fontWeight: '700' },
  selectedDot: { width: 5, height: 5, borderRadius: 3 },
  grid: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'column', justifyContent: 'space-evenly',
  },
  gridLine: { height: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  audience: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  audienceText: { color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '600' },
});

const qb = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: COLORS.cardLight, overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  label: { fontSize: 10, fontWeight: '800', minWidth: 30, textAlign: 'right' },
});

const cd = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  label: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  timerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  unit: {
    alignItems: 'center', width: 62, height: 60,
    borderRadius: 14, overflow: 'hidden',
    justifyContent: 'center', position: 'relative',
  },
  unitBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unitVal: { color: '#fff', fontSize: 20, fontWeight: '700' },
  unitLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 8, fontWeight: '700', marginTop: 1 },
  sep: { color: COLORS.primary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
});
