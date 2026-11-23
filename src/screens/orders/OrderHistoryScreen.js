import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import { formatDateShort, formatPrice, getStatusColor, getStatusLabel, getStatusIcon } from '../../utils/helpers';

const FILTERS = ['Semua', 'Menunggu', 'Terverifikasi', 'Ditolak'];

export default function OrderHistoryScreen({ navigation }) {
  const { orders, user } = useApp();
  const [filter, setFilter] = useState('Semua');

  const filtered = orders.filter((o) => {
    if (filter === 'Semua') return true;
    if (filter === 'Menunggu') return o.paymentStatus === 'waiting' || !o.paymentStatus || o.paymentStatus === 'pending';
    if (filter === 'Terverifikasi') return o.paymentStatus === 'verified';
    if (filter === 'Ditolak') return o.paymentStatus === 'rejected';
    return true;
  });

  if (!user) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Riwayat Pesanan" subtitle="Belum masuk" large />
        <EmptyState
          icon="lock-closed-outline"
          title="Booking setelah login"
          message="Login untuk melihat riwayat pesanan, status pembayaran, dan e-ticket kamu."
          actionLabel="Masuk Sekarang"
          onAction={() => navigation.getParent()?.navigate('Login')}
          secondaryLabel="Belum punya akun? Daftar gratis"
          onSecondary={() => navigation.getParent()?.navigate('Register')}
        />
      </View>
    );
  }

  const renderOrder = ({ item }) => {
    const statusColor = getStatusColor(item.paymentStatus);
    const statusLabel = getStatusLabel(item.paymentStatus);
    const statusIcon = getStatusIcon(item.paymentStatus);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { order: item })}
        activeOpacity={0.9}
      >
        <View style={styles.cardTop}>
          <View style={styles.concertIcon}>
            <Ionicons name="musical-notes" size={17} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.concertTitle} numberOfLines={1}>{item.concertTitle}</Text>
            <Text style={styles.orderId}>{item.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}45` }]}>
            <Ionicons name={statusIcon} size={11} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{formatDateShort(item.concertDate)}</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.classDot, { backgroundColor: item.ticketColor || COLORS.primary }]} />
            <Text style={styles.infoText}>{item.ticketClass}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="ticket-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{item.quantity} tiket</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>Total Pembayaran</Text>
            <Text style={styles.footerPrice}>{formatPrice(item.totalPrice)}</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.orderDate}>{formatDateShort(item.orderDate)}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </View>
        </View>

        {item.paymentChannelLabel && (
          <View style={styles.proofBadge}>
            <Ionicons name="wallet-outline" size={11} color={COLORS.accent} />
            <Text style={styles.proofText}>Dibayar via {item.paymentChannelLabel}</Text>
          </View>
        )}

        {!item.paymentChannelLabel && item.paymentProof && (
          <View style={styles.proofBadge}>
            <Ionicons name="image" size={11} color={COLORS.accent} />
            <Text style={styles.proofText}>Bukti bayar terupload</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <ScreenHeader title="Riwayat Pesanan" subtitle={`${orders.length} total pesanan`} large />

      <View style={styles.filterWrap}>
        <FlatList
          horizontal
          data={FILTERS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const isActive = filter === item;
            const count = item === 'Semua' ? orders.length :
              item === 'Menunggu' ? orders.filter(o => !o.paymentStatus || o.paymentStatus === 'waiting' || o.paymentStatus === 'pending').length :
              item === 'Terverifikasi' ? orders.filter(o => o.paymentStatus === 'verified').length :
              orders.filter(o => o.paymentStatus === 'rejected').length;

            return (
              <TouchableOpacity onPress={() => setFilter(item)} activeOpacity={0.85}>
                {isActive ? (
                  <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.filterActive}>
                    <Text style={styles.filterActiveText}>{item}</Text>
                    {count > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{count}</Text></View>}
                  </LinearGradient>
                ) : (
                  <View style={styles.filterItem}>
                    <Text style={styles.filterText}>{item}</Text>
                    {count > 0 && <View style={styles.countBadgeInactive}><Text style={styles.countTextInactive}>{count}</Text></View>}
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title="Belum ada pesanan"
            message={filter === 'Semua' ? 'Yuk beli tiket konser pertamamu dan mulai koleksi momennya!' : `Tidak ada pesanan ${filter.toLowerCase()}.`}
            actionLabel="Cari Konser"
            onAction={() => navigation.navigate('Home')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  filterWrap: { paddingVertical: SPACING.xs },
  filterList: { paddingHorizontal: SPACING.xl, gap: SPACING.sm },
  filterItem: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.hairline,
    backgroundColor: COLORS.glassSoft,
  },
  filterText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  filterActive: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.full,
    ...SHADOWS.medium,
  },
  filterActiveText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1,
  },
  countText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  countBadgeInactive: {
    backgroundColor: 'rgba(91,95,239,0.14)',
    borderRadius: RADIUS.full, paddingHorizontal: 6, paddingVertical: 1,
  },
  countTextInactive: { color: COLORS.primary, fontSize: 9, fontWeight: '800' },

  list: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, gap: SPACING.md, paddingBottom: 28 },
  orderCard: {
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: SPACING.lg, gap: SPACING.md,
    ...SHADOWS.small,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  concertIcon: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(91,95,239,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  concertTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  orderId: { color: COLORS.textMuted, fontSize: 10, marginTop: 2, letterSpacing: 0.3 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  statusText: { fontSize: 9, fontWeight: '800' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  classDot: { width: 7, height: 7, borderRadius: 4 },
  infoText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '500' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: COLORS.hairline, paddingTop: SPACING.md,
  },
  footerLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  footerPrice: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderDate: { color: COLORS.textMuted, fontSize: 10 },
  proofBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(19,198,177,0.1)',
    borderRadius: RADIUS.full, borderWidth: 1, borderColor: 'rgba(19,198,177,0.22)',
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  proofText: { color: COLORS.accent, fontSize: 10, fontWeight: '700' },
});
