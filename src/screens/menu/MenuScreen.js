import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const SUPPORT_PHONE = '0821-1205-891';
const SUPPORT_TEL = 'tel:+628211205891';
const SUPPORT_WA = 'https://wa.me/628211205891';
const SUPPORT_EMAIL = 'support@fixyou.id';

const SECTIONS = [
  {
    label: 'Informasi',
    items: [
      { icon: 'card-outline', title: 'Metode Pembayaran', text: 'QRIS, virtual account, e-wallet, kartu' },
      { icon: 'shield-checkmark-outline', title: 'Keamanan Transaksi', text: 'Tiket resmi dan pembayaran terlindungi' },
    ],
  },
  {
    label: 'Bantuan',
    items: [
      { icon: 'help-circle-outline', title: 'Pusat Bantuan', text: 'Butuh bantuan? Kami siap membantu' },
      { icon: 'logo-whatsapp', title: 'Hubungi Kami', text: SUPPORT_PHONE },
    ],
  },
  {
    label: 'Aplikasi',
    items: [
      { icon: 'language-outline', title: 'Bahasa', text: 'Indonesia' },
      { icon: 'information-circle-outline', title: 'Tentang FIX YOU', text: 'Platform tiket konser pilihanmu' },
    ],
  },
];

export default function MenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useApp();
  const [intro] = useState(() => new Animated.Value(0));
  const [languageOpen, setLanguageOpen] = useState(false);

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 420, useNativeDriver: false }).start();
  }, [intro]);

  const openSupport = async () => {
    try {
      if (await Linking.canOpenURL(SUPPORT_WA)) {
        await Linking.openURL(SUPPORT_WA);
        return;
      }
    } catch {
      // lanjut ke panggilan telepon
    }
    Linking.openURL(SUPPORT_TEL);
  };

  const handleItem = (title) => {
    if (title === 'Hubungi Kami') openSupport();
    else if (title === 'Bahasa') setLanguageOpen(true);
    else if (title === 'Pusat Bantuan') {
      Alert.alert(
        'Pusat Bantuan',
        `Hubungi kami di WhatsApp ${SUPPORT_PHONE} atau email ${SUPPORT_EMAIL}. Balasan maksimal 1×24 jam.`,
        [
          { text: 'Tutup', style: 'cancel' },
          { text: 'Chat WhatsApp', onPress: openSupport },
        ]
      );
    }
    else if (title === 'Metode Pembayaran') navigation.getParent()?.navigate('PaymentOptions');
    else if (title === 'Tentang FIX YOU') Alert.alert('FIX YOU', 'Platform tiket konser resmi untuk menemukan pengalaman live terbaik di Indonesia.');
    else Alert.alert('Keamanan Transaksi', 'Semua transaksi di FIX YOU dilindungi. Tiket yang kamu beli 100% resmi dari promotor.');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="play" size={15} color="#fff" />
            </View>
            <Text style={styles.brandText}>FIX YOU</Text>
            <View style={styles.versionChip}>
              <Text style={styles.versionChipText}>v1.0.0</Text>
            </View>
          </View>
          <Text style={styles.title}>Semua momen live favoritmu, di satu tempat.</Text>
          <Text style={styles.subtitle}>
            Temukan konser, pesan tiket resmi, dan simpan e-ticket dengan mudah.
          </Text>
        </View>

        <View style={styles.body}>
          {/* Panel bantuan */}
          <View style={styles.helpPanel}>
            <Text style={styles.helpKicker}>DUKUNGAN PELANGGAN</Text>
            <Text style={styles.helpTitle}>Ada kendala saat memesan?</Text>
            <Text style={styles.helpText}>
              Hubungi kami di {SUPPORT_PHONE} setiap hari, 08.00–22.00 WIB.
            </Text>
            <View style={styles.helpActions}>
              <TouchableOpacity
                style={styles.helpBtn}
                activeOpacity={0.85}
                onPress={openSupport}
              >
                <Text style={styles.helpBtnText}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.helpBtn}
                activeOpacity={0.85}
                onPress={() => Linking.openURL(SUPPORT_TEL)}
              >
                <Text style={styles.helpBtnText}>Telepon</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Kartu akun */}
          <Animated.View style={[styles.accountCard, { opacity: intro }]}>
            <View style={styles.accountHead}>
              <View style={styles.accountIcon}>
                <Ionicons name="person-outline" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountTitle}>Belum punya akun?</Text>
                <Text style={styles.accountText}>
                  Daftar gratis untuk memesan tiket dan menyimpan e-ticket.
                </Text>
              </View>
            </View>
            <View style={styles.accountActions}>
              <TouchableOpacity
                style={styles.accountPrimary}
                onPress={() => navigation.getParent()?.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.accountPrimaryText}>Masuk</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.accountSecondary}
                onPress={() => navigation.getParent()?.navigate('Register')}
                activeOpacity={0.85}
              >
                <Text style={styles.accountSecondaryText}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Grup menu */}
          {SECTIONS.map((section) => (
            <View key={section.label}>
              <View style={styles.sectionHead}>
                <View style={styles.sectionBar} />
                <Text style={styles.sectionLabel}>{section.label}</Text>
              </View>

              <View style={styles.group}>
                {section.items.map((item, index) => (
                  <View key={item.title}>
                    <TouchableOpacity
                      style={styles.row}
                      onPress={() => handleItem(item.title)}
                      activeOpacity={0.65}
                    >
                      <View style={styles.rowIcon}>
                        <Ionicons name={item.icon} size={17} color={COLORS.primary} />
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={styles.rowTitle}>{item.title}</Text>
                        <Text style={styles.rowText} numberOfLines={1}>
                          {item.title === 'Bahasa'
                            ? (language === 'en' ? 'English' : 'Indonesia')
                            : item.text}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
                    </TouchableOpacity>
                    {index < section.items.length - 1 && <View style={styles.rowDivider} />}
                  </View>
                ))}
              </View>
            </View>
          ))}

          <Text style={styles.footer}>FIX YOU · Platform tiket konser Indonesia</Text>
        </View>
      </ScrollView>

      <Modal visible={languageOpen} transparent animationType="fade" onRequestClose={() => setLanguageOpen(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setLanguageOpen(false)} />
          <View style={styles.languageCard}>
            <Text style={styles.languageTitle}>Pilih bahasa</Text>
            {['Indonesia', 'English'].map((lang) => {
              const active = (language === 'en' && lang === 'English') || (language === 'id' && lang === 'Indonesia');
              return (
                <TouchableOpacity
                  key={lang}
                  style={styles.languageOption}
                  onPress={() => { setLanguageOpen(false); setLanguage(lang === 'English' ? 'en' : 'id'); }}
                >
                  <Text style={[styles.languageText, active && { color: COLORS.primary, fontWeight: '700' }]}>{lang}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 28 },

  header: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 16 },
  brandMark: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-12deg' }],
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { color: COLORS.text, fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  versionChip: {
    marginLeft: 'auto',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  versionChipText: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  title: {
    color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '700',
    lineHeight: 28, letterSpacing: -0.5,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8 },

  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, gap: SPACING.lg },

  helpPanel: {
    backgroundColor: '#FDF4F3',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(209,71,63,0.18)',
    padding: SPACING.lg,
    ...SHADOWS.soft,
  },
  helpKicker: { color: COLORS.error, fontSize: 9, fontWeight: '700', letterSpacing: 1.1 },
  helpTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', marginTop: 6, letterSpacing: -0.2 },
  helpText: { color: COLORS.textSecondary, fontSize: 11.5, lineHeight: 17, marginTop: 5 },
  helpActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  helpBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: 'rgba(209,71,63,0.24)',
  },
  helpBtnText: { color: COLORS.error, fontSize: 12, fontWeight: '600' },

  accountCard: {
    backgroundColor: 'rgba(91,95,239,0.05)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(91,95,239,0.16)',
    padding: SPACING.lg,
  },
  accountHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  accountIcon: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(91,95,239,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  accountTitle: { color: COLORS.text, fontSize: 13.5, fontWeight: '700' },
  accountText: { color: COLORS.textSecondary, fontSize: 11.5, lineHeight: 17, marginTop: 3 },
  accountActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  accountPrimary: {
    flex: 1, paddingVertical: 11, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center',
  },
  accountPrimaryText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
  accountSecondary: {
    flex: 1, paddingVertical: 11, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  accountSecondaryText: { color: COLORS.text, fontSize: 12.5, fontWeight: '600' },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: SPACING.sm },
  sectionBar: { width: 3, height: 11, borderRadius: 2, backgroundColor: COLORS.primary },
  sectionLabel: {
    color: COLORS.textSecondary, fontSize: 10, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.9,
  },

  group: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: SPACING.lg, paddingVertical: 13 },
  rowIcon: {
    width: 34, height: 34, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center',
  },
  rowCopy: { flex: 1 },
  rowTitle: { color: COLORS.text, fontSize: 12.5, fontWeight: '600' },
  rowText: { color: COLORS.textMuted, fontSize: 10.5, marginTop: 2 },
  rowDivider: { height: 1, backgroundColor: COLORS.borderLight, marginLeft: 62 },

  footer: {
    color: COLORS.textMuted, fontSize: 10, textAlign: 'center',
    marginTop: SPACING.md, letterSpacing: 0.2,
  },

  modalBackdrop: { flex: 1, backgroundColor: COLORS.scrim, alignItems: 'center', justifyContent: 'center', padding: 24 },
  languageCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: 20, width: '100%', borderWidth: 1, borderColor: COLORS.border,
  },
  languageTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  languageOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  languageText: { color: COLORS.text, fontSize: 14 },
});
