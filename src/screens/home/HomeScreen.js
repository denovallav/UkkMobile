import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, FlatList, Animated, Dimensions, Image,
  Modal, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import ConcertCard from '../../components/ConcertCard';
import EmptyState from '../../components/EmptyState';
import { CONCERTS } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { formatDate, formatPrice } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const PAGE = width - 40;

const CATEGORIES = ['Semua', 'K-Pop', 'Pop Rock', 'Pop Indonesia', 'Pop', 'Rock Indonesia'];
const SORT_OPTIONS = ['Terbaru', 'Termurah', 'Termahal', 'Rating'];
const LOCATIONS = ['Semua lokasi', 'Jakarta', 'Tangerang', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta', 'Medan', 'Makassar'];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, language } = useApp();
  const isEnglish = language === 'en';
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('Semua');
  const [sortBy, setSortBy] = useState('Terbaru');
  const [showSort, setShowSort] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Semua lokasi');
  const [heroIndex, setHeroIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const heroRef = useRef(null);

  const featured = CONCERTS.slice(0, 3);
  const upcoming = CONCERTS.slice(3, 7);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const next = (heroIndex + 1) % featured.length;
      setHeroIndex(next);
      heroRef.current?.scrollToIndex({ index: next, animated: true });
    }, 6000);
    return () => clearInterval(timer);
  }, [heroIndex, featured.length]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filtered = useCallback(() => {
    let list = [...CONCERTS];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.artist.toLowerCase().includes(q) ||
        c.artists.some(a => a.name.toLowerCase().includes(q)) ||
        c.genre.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    if (selectedCat !== 'Semua') list = list.filter(c => c.genre === selectedCat);
    if (selectedLocation !== 'Semua lokasi') list = list.filter(c => c.city === selectedLocation);
    switch (sortBy) {
      case 'Termurah':
        list.sort((a, b) => Math.min(...a.ticketClasses.map(t => t.price)) - Math.min(...b.ticketClasses.map(t => t.price)));
        break;
      case 'Termahal':
        list.sort((a, b) => Math.max(...b.ticketClasses.map(t => t.price)) - Math.max(...a.ticketClasses.map(t => t.price)));
        break;
      case 'Rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return list;
  }, [search, selectedCat, selectedLocation, sortBy]);

  const concerts = filtered();
  const hasFilters = selectedLocation !== 'Semua lokasi' || sortBy !== 'Terbaru';
  const firstName = user?.name ? user.name.split(' ')[0] : null;

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      >
        {/* App bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
          <View style={styles.brandGroup}>
            <View style={styles.brandMark}><Ionicons name="play" size={16} color="#fff" /></View>
            <View>
              <Text style={styles.brandText}>FIX YOU</Text>
              <Text style={styles.greeting} numberOfLines={1}>
                {firstName ? `Hai, ${firstName}` : 'Temukan konser berikutnya'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowNotifications(true)} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={19} color={COLORS.text} />
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
                <Text style={styles.avatarText}>
                  {user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.authButtons}>
                <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Register')} activeOpacity={0.7} style={styles.registerMini}>
                  <Text style={styles.registerMiniText}>Daftar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.getParent()?.navigate('Login')} activeOpacity={0.85}>
                  <Text style={styles.loginBtnText}>Masuk</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={isEnglish ? 'Search concerts, artists, cities' : 'Cari konser, artis, atau kota'}
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={17} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={[styles.squareBtn, selectedLocation !== 'Semua lokasi' && styles.squareBtnActive]} onPress={() => setShowLocations(true)} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={18} color={selectedLocation !== 'Semua lokasi' ? '#fff' : COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.squareBtn, sortBy !== 'Terbaru' && styles.squareBtnActive]} onPress={() => setShowSort(true)} activeOpacity={0.8}>
            <Ionicons name="swap-vertical-outline" size={18} color={sortBy !== 'Terbaru' ? '#fff' : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {hasFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFilters}>
            {selectedLocation !== 'Semua lokasi' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setSelectedLocation('Semua lokasi')}>
                <Text style={styles.activeChipText}>{selectedLocation}</Text>
                <Ionicons name="close" size={12} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {sortBy !== 'Terbaru' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setSortBy('Terbaru')}>
                <Text style={styles.activeChipText}>{sortBy}</Text>
                <Ionicons name="close" size={12} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* Featured */}
        <View style={styles.heroWrap}>
          <FlatList
            ref={heroRef}
            data={featured}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            directionalLockEnabled
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onMomentumScrollEnd={(e) => setHeroIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => navigation.navigate('ConcertDetail', { concert: item })}
                style={styles.heroCard}
              >
                <Image source={{ uri: item.image }} style={styles.heroImage} />
                <LinearGradient colors={['rgba(15,23,42,0.02)', 'rgba(15,23,42,0.45)', 'rgba(15,23,42,0.9)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
                <View style={styles.heroContent}>
                  <Text style={styles.heroGenre}>{item.genre.toUpperCase()}</Text>
                  <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.heroMeta} numberOfLines={1}>{formatDate(item.date)} · {item.city}</Text>
                  <View style={styles.heroFooter}>
                    <Text style={styles.heroPrice}>Mulai {formatPrice(Math.min(...item.ticketClasses.map(t => t.price)))}</Text>
                    <View style={styles.heroCta}>
                      <Text style={styles.heroCtaText}>Lihat</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
          <View style={styles.heroDots}>
            {featured.map((_, i) => (
              <View key={i} style={[styles.heroDot, i === heroIndex && styles.heroDotActive]} />
            ))}
          </View>
        </View>

        <Text style={styles.trustLine}>Tiket resmi · Pembayaran aman · E-ticket instan</Text>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catList}>
          {CATEGORIES.map((cat) => {
            const active = selectedCat === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCat(cat)}
                activeOpacity={0.85}
                style={[styles.cat, active && styles.catActive]}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Upcoming */}
        {!search && selectedCat === 'Semua' && selectedLocation === 'Semua lokasi' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Segera Hadir</Text>
              <TouchableOpacity onPress={() => setSortBy('Terbaru')} style={styles.seeAll}>
                <Text style={styles.seeAllText}>Lihat semua</Text>
                <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {upcoming.map((concert) => (
                <ConcertCard
                  key={concert.id}
                  concert={concert}
                  horizontal
                  onPress={() => navigation.navigate('ConcertDetail', { concert })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {search ? 'Hasil pencarian' : selectedCat === 'Semua' ? 'Semua Konser' : selectedCat}
            </Text>
            <Text style={styles.countText}>{concerts.length} konser</Text>
          </View>
          <View style={styles.listWrap}>
            {concerts.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="Konser tidak ditemukan"
                message="Coba kata kunci lain atau ubah filter lokasi & kategori."
                actionLabel="Reset Filter"
                onAction={() => { setSearch(''); setSelectedCat('Semua'); setSelectedLocation('Semua lokasi'); }}
              />
            ) : (
              concerts.map((concert) => (
                <ConcertCard
                  key={concert.id}
                  concert={concert}
                  onPress={() => navigation.navigate('ConcertDetail', { concert })}
                />
              ))
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Notifications */}
      <Modal visible={showNotifications} transparent animationType="slide" onRequestClose={() => setShowNotifications(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowNotifications(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Notifikasi</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {[
              ['time-outline', COLORS.secondary, 'Tiket hampir habis', 'VIP BLACKPINK tersisa kurang dari 10%.', 'Baru saja'],
              ['pricetag-outline', COLORS.primary, 'Promo untukmu', 'Potongan hingga Rp100.000 untuk pembelian pertama.', '2 jam lalu'],
              ['checkmark-circle-outline', COLORS.success, 'Pembayaran terverifikasi', 'E-ticket kamu siap digunakan.', 'Kemarin'],
            ].map(([icon, color, title, text, time]) => (
              <View key={title} style={styles.notificationItem}>
                <View style={[styles.notificationIcon, { backgroundColor: `${color}14` }]}>
                  <Ionicons name={icon} size={17} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notificationTitle}>{title}</Text>
                  <Text style={styles.notificationText}>{text}</Text>
                  <Text style={styles.notificationTime}>{time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      {/* Location */}
      <Modal visible={showLocations} transparent animationType="slide" onRequestClose={() => setShowLocations(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowLocations(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pilih lokasi</Text>
              <TouchableOpacity onPress={() => setShowLocations(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {LOCATIONS.map((location) => {
              const active = selectedLocation === location;
              return (
                <TouchableOpacity key={location} style={styles.optionRow} onPress={() => { setSelectedLocation(location); setShowLocations(false); }}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{location}</Text>
                  {active && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* Sort */}
      <Modal visible={showSort} transparent animationType="slide" onRequestClose={() => setShowSort(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setShowSort(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Urutkan</Text>
              <TouchableOpacity onPress={() => setShowSort(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt;
              return (
                <TouchableOpacity key={opt} style={styles.optionRow} onPress={() => { setSortBy(opt); setShowSort(false); }}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
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

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.primary,
    transform: [{ rotate: '-12deg' }],
    alignItems: 'center', justifyContent: 'center',
  },
  brandText: { color: COLORS.text, fontSize: 16, fontWeight: '700', letterSpacing: 0.8 },
  greeting: { color: COLORS.textSecondary, fontSize: 11, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarBtn: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  loginBtn: {
    height: 38, paddingHorizontal: 16, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  loginBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  authButtons: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  registerMini: { paddingHorizontal: 8, paddingVertical: 8 },
  registerMiniText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.sm, paddingVertical: 0 },
  squareBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  squareBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },

  activeFilters: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md, gap: 8 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(91,95,239,0.08)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  activeChipText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },

  heroWrap: { marginTop: SPACING.lg },
  heroCard: {
    width: PAGE,
    height: 230,
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.text,
  },
  heroImage: { ...StyleSheet.absoluteFillObject, width: PAGE, height: 230, resizeMode: 'cover' },
  heroContent: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  heroGenre: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
  heroTitle: { color: '#fff', fontSize: 21, fontWeight: '800', lineHeight: 26, letterSpacing: -0.4 },
  heroMeta: { color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 6 },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  heroPrice: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroCta: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  heroCtaText: { color: COLORS.text, fontSize: 11, fontWeight: '700' },
  heroDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  heroDotActive: { width: 16, backgroundColor: COLORS.primary },

  trustLine: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 14,
    letterSpacing: 0.2,
  },

  catList: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, gap: SPACING.sm },
  cat: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  catText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },
  catActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catTextActive: { color: '#fff', fontWeight: '700' },

  section: { marginTop: SPACING.xxl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', letterSpacing: -0.2 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  countText: { color: COLORS.textMuted, fontSize: 11 },
  hList: { paddingHorizontal: SPACING.xl },
  listWrap: { paddingHorizontal: SPACING.xl },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.scrim },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: 30,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.lg },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sheetTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  notificationItem: { flexDirection: 'row', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  notificationIcon: { width: 38, height: 38, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notificationTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  notificationText: { color: COLORS.textSecondary, fontSize: 11.5, lineHeight: 17 },
  notificationTime: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
  optionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight,
  },
  optionText: { color: COLORS.textSecondary, fontSize: 14 },
  optionTextActive: { color: COLORS.primary, fontWeight: '700' },
});
