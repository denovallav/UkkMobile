import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Image, Share, Linking, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pickImageFromLibrary } from '../../utils/platformUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const MENU_ITEMS = [
  {
    section: 'Akun',
    items: [
      { icon: 'person-outline', label: 'Edit Profil', action: 'editProfile' },
      { icon: 'mail-outline', label: 'Notifikasi Email', action: 'emailNotif', toggle: true },
    ],
  },
  {
    section: 'Pesanan',
    items: [
      { icon: 'receipt-outline', label: 'Riwayat Pesanan', action: 'orders' },
      { icon: 'heart-outline', label: 'Wishlist', action: 'wishlist' },
    ],
  },
  {
    section: 'Lainnya',
    items: [
      { icon: 'help-circle-outline', label: 'Bantuan & FAQ', action: 'help' },
      { icon: 'star-outline', label: 'Beri Rating Aplikasi', action: 'rate' },
      { icon: 'share-social-outline', label: 'Bagikan Aplikasi', action: 'share' },
      { icon: 'information-circle-outline', label: 'Tentang Aplikasi', action: 'about' },
    ],
  },
];

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout, orders, bookmarks, updateUser } = useApp();
  const [emailNotif, setEmailNotif] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigation.navigate('Home');
  };

  const pickAvatar = async () => {
    const result = await pickImageFromLibrary({ aspect: [1, 1] });
    if (result && !result.canceled) {
      await updateUser({ avatar: result.assets[0].uri });
    }
  };

  const handleMenuAction = (action) => {
    if (action === 'editProfile') navigation.navigate('EditProfile');
    else if (action === 'orders') navigation.navigate('Orders');
    else if (action === 'wishlist') navigation.navigate('Wishlist');
    else if (action === 'help') {
      Alert.alert(
        'Bantuan & FAQ',
        'Cara membeli tiket:\nPilih konser, pilih kelas tiket, lalu selesaikan pembayaran.\n\nDi mana tiket saya?\nTiket yang sudah dibayar ada di Riwayat Pesanan.\n\nButuh bantuan lain?\nWhatsApp 0821-1205-891.',
        [
          { text: 'Tutup', style: 'cancel' },
          { text: 'Chat WhatsApp', onPress: () => Linking.openURL('https://wa.me/628211205891') },
        ]
      );
    }
    else if (action === 'rate') {
      const storeUrl = Platform.OS === 'ios' ? 'https://apps.apple.com/' : 'https://play.google.com/store';
      Alert.alert('Beri Rating', 'Pilih rating untuk membuka halaman toko aplikasi.', [
        { text: 'Nanti', style: 'cancel' },
        ...[5, 4, 3, 2, 1].map((stars) => ({
          text: `${stars} Bintang`,
          onPress: async () => {
            try {
              if (await Linking.canOpenURL(storeUrl)) await Linking.openURL(storeUrl);
              else Alert.alert('Toko aplikasi tidak tersedia', 'Silakan buka Play Store atau App Store secara manual.');
            } catch { Alert.alert('Gagal membuka toko', 'Silakan coba lagi.'); }
          },
        })),
      ]);
    } else if (action === 'share') {
      Share.share({ message: 'Yuk cari dan beli tiket konser favoritmu di FIX YOU! Download sekarang.' });
    } else if (action === 'about') {
      Alert.alert('FIX YOU v1.0.0', 'Aplikasi tiket konser untuk menemukan pengalaman live terbaik di Indonesia.');
    } else {
      Alert.alert('Segera Hadir', 'Fitur ini akan segera tersedia.');
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const verifiedOrders = orders.filter(o => o.paymentStatus === 'verified').length;

  return (
    <View style={styles.container}>
      <Modal visible={showLogoutConfirm} transparent animationType="fade" onRequestClose={() => setShowLogoutConfirm(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Keluar akun?</Text>
            <Text style={styles.confirmText}>Kamu bisa masuk kembali kapan saja.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowLogoutConfirm(false)} activeOpacity={0.8}>
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmLogout} activeOpacity={0.85}>
                <Text style={styles.confirmButtonText}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickAvatar} activeOpacity={0.85}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={11} color={COLORS.textSecondary} />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{user?.name || 'User'}</Text>
            <Text style={styles.email} numberOfLines={1}>{user?.email || 'email@example.com'}</Text>
            <View style={styles.memberBadge}>
              <Text style={styles.memberText}>Member</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Tiket dibeli', value: orders.length },
            { label: 'Wishlist', value: bookmarks.length },
            { label: 'Terverifikasi', value: verifiedOrders },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Menu */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((section) => (
            <View key={section.section} style={styles.section}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionBar} />
                <Text style={styles.sectionTitle}>{section.section}</Text>
              </View>
              <View style={styles.sectionCard}>
                {section.items.map((item, i) => (
                  <React.Fragment key={item.action}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => item.toggle ? null : handleMenuAction(item.action)}
                      activeOpacity={item.toggle ? 1 : 0.7}
                    >
                      <View style={styles.menuIcon}>
                        <Ionicons name={item.icon} size={16} color={COLORS.primary} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.toggle ? (
                        <Switch
                          value={emailNotif}
                          onValueChange={setEmailNotif}
                          trackColor={{ false: COLORS.border, true: COLORS.primary }}
                          thumbColor="#fff"
                        />
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                      )}
                    </TouchableOpacity>
                    {i < section.items.length - 1 && <View style={styles.menuDivider} />}
                  </React.Fragment>
                ))}
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogoutConfirm(true)} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>Keluar Akun</Text>
          </TouchableOpacity>

          <Text style={styles.version}>FIX YOU v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  modalBackdrop: { flex: 1, backgroundColor: COLORS.scrim, alignItems: 'center', justifyContent: 'center', padding: 24 },
  confirmCard: {
    width: '100%', maxWidth: 340,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: 22, borderWidth: 1, borderColor: COLORS.border,
  },
  confirmTitle: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginBottom: 6 },
  confirmText: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 20, lineHeight: 19 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelButtonText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  confirmButton: { flex: 1, paddingVertical: 12, borderRadius: RADIUS.md, alignItems: 'center', backgroundColor: COLORS.error },
  confirmButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: RADIUS.lg, resizeMode: 'cover' },
  avatarFallback: {
    width: 64, height: 64, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { color: '#fff', fontSize: 22, fontWeight: '700' },
  cameraBtn: {
    position: 'absolute', bottom: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '700', letterSpacing: -0.3 },
  email: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  memberBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(91,95,239,0.08)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8, paddingVertical: 2,
    marginTop: 8,
  },
  memberText: { color: COLORS.primary, fontSize: 10, fontWeight: '700' },
  editBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    ...SHADOWS.soft,
  },
  statDivider: { width: 1, backgroundColor: COLORS.borderLight },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '700' },
  statLabel: { color: COLORS.textSecondary, fontSize: 10, marginTop: 3 },

  menuContainer: { padding: SPACING.xl, gap: SPACING.lg },
  section: { gap: SPACING.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionBar: { width: 3, height: 11, borderRadius: 2, backgroundColor: COLORS.primary },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9 },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: 12 },
  menuIcon: {
    width: 32, height: 32, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: COLORS.borderLight, marginLeft: 60 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 14,
  },
  logoutText: { color: COLORS.error, fontSize: 13, fontWeight: '600' },
  version: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },
});
