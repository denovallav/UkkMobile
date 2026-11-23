import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, Linking, Alert, Platform, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import GradientButton from '../../components/GradientButton';
import { useApp } from '../../context/AppContext';
import { formatDate, formatPrice, getDaysUntil } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function ConcertDetailScreen({ route, navigation }) {
  const { concert } = route.params;
  const insets = useSafeAreaInsets();
  const { user, isBookmarked, toggleBookmark } = useApp();
  const bookmarked = isBookmarked(concert.id);
  const [scrollY] = useState(() => new Animated.Value(0));
  const [playingArtist, setPlayingArtist] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const daysLeft = getDaysUntil(concert.date);
  const minPrice = Math.min(...concert.ticketClasses.map(t => t.price));
  const handleBuy = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('TicketSelect', { concert });
  };

  const handleShare = () => {
    Share.share({
      message: `Yuk nonton ${concert.title} di ${concert.venue}, ${formatDate(concert.date)}! Beli tiketnya di FIX YOU.`,
    });
  };

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.6, HEADER_HEIGHT],
    outputRange: [1, 0.55, 0.2],
    extrapolate: 'clamp',
  });
  const navBarOpacity = scrollY.interpolate({
    inputRange: [HEADER_HEIGHT - 100, HEADER_HEIGHT - 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleArtistPlay = (artist) => {
    if (playingArtist === artist.id) {
      setPlayingArtist(null);
    } else {
      setPlayingArtist(artist.id);
      Alert.alert(
        'Preview Lagu',
        `Membuka preview ${artist.name} di Spotify`,
        [
          { text: 'Batal', onPress: () => setPlayingArtist(null) },
          { text: 'Buka Spotify', onPress: () => { Linking.openURL(artist.spotifyPreview); setPlayingArtist(null); } },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner */}
      <Animated.View style={[styles.banner, { transform: [{ translateY: headerTranslate }] }]}>
        <Animated.Image source={{ uri: concert.banner }} style={[styles.bannerImg, { opacity: headerOpacity }]} />
        <LinearGradient
          colors={['rgba(20,33,61,0.25)', 'rgba(20,33,61,0.55)', COLORS.background]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Solid nav bar on scroll */}
      <Animated.View style={[styles.navBar, { paddingTop: insets.top, opacity: navBarOpacity }]}>
        <LinearGradient colors={['rgba(255,255,255,0.97)', 'rgba(255,255,255,0.92)']} style={StyleSheet.absoluteFill} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{concert.title}</Text>
        <TouchableOpacity onPress={() => toggleBookmark(concert)} style={styles.navBtn}>
          <Ionicons name={bookmarked ? 'heart' : 'heart-outline'} size={20} color={bookmarked ? COLORS.secondary : COLORS.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Transparent top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={handleShare} style={styles.topBtn}>
            <Ionicons name="share-social-outline" size={19} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleBookmark(concert)} style={styles.topBtn}>
            <Ionicons name={bookmarked ? 'heart' : 'heart-outline'} size={20} color={bookmarked ? COLORS.secondary : '#fff'} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        style={styles.scroll}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: Platform.OS !== 'web' })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View style={{ height: HEADER_HEIGHT - 56 }} />

        <View style={styles.sheet}>
          <View style={styles.badgeRow}>
            <View style={styles.genreBadge}>
              <Ionicons name="musical-note" size={11} color={COLORS.primary} />
              <Text style={styles.genreText}>{concert.genre}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={11} color={COLORS.gold} />
              <Text style={styles.ratingText}>{concert.rating} ({concert.totalReviews.toLocaleString('id-ID')})</Text>
            </View>
          </View>

          <Text style={styles.title}>{concert.title}</Text>

          {daysLeft > 0 && (
            <View style={styles.countdown}>
              <View style={styles.countdownIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.countdownLabel}>Hitung Mundur Konser</Text>
                <Text style={styles.countdownValue}>{daysLeft} Hari Lagi</Text>
              </View>
            </View>
          )}

          <View style={styles.infoGrid}>
            {[
              { icon: 'calendar', label: 'Tanggal', value: formatDate(concert.date) },
              { icon: 'time', label: 'Waktu', value: concert.time + ' WIB' },
              { icon: 'location', label: 'Kota', value: concert.city },
              { icon: 'people', label: 'Artis', value: concert.artists.length + ' Performer' },
            ].map((item, i) => (
              <View key={i} style={styles.infoCard}>
                <View style={styles.infoIcon}>
                  <Ionicons name={`${item.icon}-outline`} size={17} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue} numberOfLines={2}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.tabs}>
            {['info', 'artis', 'tiket'].map((tab) => (
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem} activeOpacity={0.85}>
                {activeTab === tab && <LinearGradient colors={COLORS.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />}
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'info' ? 'Info' : tab === 'artis' ? 'Artis' : 'Tiket'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'info' && (
            <View>
              <Text style={styles.sectionTitle}>Tentang Konser</Text>
              <Text style={styles.description}>{concert.description}</Text>

              <Text style={styles.sectionTitle}>Venue</Text>
              <View style={styles.venueCard}>
                <View style={styles.venueIcon}>
                  <Ionicons name="location" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.venueName}>{concert.venue}</Text>
                  <Text style={styles.venueCity}>{concert.city}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>

              <View style={styles.tagsRow}>
                {concert.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'artis' && (
            <View>
              <Text style={styles.sectionTitle}>Lineup Artis</Text>
              {concert.artists.map((artist) => (
                <View key={artist.id} style={styles.artistCard}>
                  <Animated.Image source={{ uri: artist.image }} style={styles.artistImg} />
                  <View style={styles.artistInfo}>
                    <Text style={styles.artistName}>{artist.name}</Text>
                    <Text style={styles.artistRole}>{artist.role}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.playBtn, playingArtist === artist.id && styles.playBtnActive]}
                    onPress={() => handleArtistPlay(artist)}
                    activeOpacity={0.85}
                  >
                    <LinearGradient
                      colors={playingArtist === artist.id ? ['#43E97B', '#38F9D7'] : ['#1DB954', '#1aa34a']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name={playingArtist === artist.id ? 'pause' : 'play'} size={14} color="#fff" />
                    <Text style={styles.playText}>Spotify</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'tiket' && (
            <View>
              <Text style={styles.sectionTitle}>Kelas Tiket</Text>
              {concert.ticketClasses.map((tc) => {
                const pct = (tc.remainingQuota / tc.totalQuota) * 100;
                const barColor = pct <= 10 ? COLORS.error : pct <= 30 ? COLORS.warning : tc.color;
                return (
                  <View key={tc.id} style={styles.tcCard}>
                    <View style={styles.tcHeader}>
                      <View style={[styles.tcColor, { backgroundColor: tc.color }]} />
                      <Text style={styles.tcName}>{tc.name}</Text>
                      <Text style={styles.tcPrice}>{formatPrice(tc.price)}</Text>
                    </View>
                    <View style={styles.tcTrack}>
                      <View style={[styles.tcFill, { width: `${Math.max(pct, 4)}%`, backgroundColor: barColor }]} />
                    </View>
                    <View style={styles.tcQuota}>
                      <Text style={styles.tcQuotaText}>Sisa {tc.remainingQuota.toLocaleString('id-ID')} tiket</Text>
                      <Text style={[styles.tcPct, { color: barColor }]}>{Math.round(pct)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerLabel}>Mulai dari</Text>
          <Text style={styles.footerPrice}>{formatPrice(minPrice)}</Text>
        </View>
        <GradientButton
          title="Pilih Tiket"
          icon={<Ionicons name="ticket-outline" size={16} color="#fff" />}
          onPress={handleBuy}
          style={styles.footerBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  banner: { position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT + 60 },
  bannerImg: { width: '100%', height: '100%', resizeMode: 'cover' },

  navBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingBottom: 12,
    zIndex: 100, overflow: 'hidden',
    borderBottomWidth: 1, borderBottomColor: COLORS.hairline,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: COLORS.cardLight,
    alignItems: 'center', justifyContent: 'center',
  },
  navTitle: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '800', marginHorizontal: 10 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingBottom: 12,
    zIndex: 90,
  },
  topRight: { flexDirection: 'row', gap: 8 },
  topBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(20,33,61,0.38)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
    paddingHorizontal: SPACING.xl,
    paddingTop: 12,
    paddingBottom: SPACING.xxl,
    marginTop: -26,
  },
  grabber: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 18,
  },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  genreBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(91,95,239,0.1)', borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: COLORS.hairline,
  },
  genreText: { color: COLORS.primary, fontSize: 10, fontWeight: '800' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(231,166,45,0.12)', borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  ratingText: { color: '#B37C10', fontSize: 10, fontWeight: '800' },

  title: {
    color: COLORS.text, fontSize: 26, fontWeight: '700',
    marginBottom: SPACING.lg, lineHeight: 32, letterSpacing: -0.6,
  },

  countdown: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: RADIUS.xl, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.hairline,
    marginBottom: SPACING.lg, overflow: 'hidden',
  },
  countdownIcon: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(91,95,239,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  countdownLabel: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  countdownValue: { color: COLORS.primary, fontSize: 19, fontWeight: '700', marginTop: 1 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  infoCard: {
    width: (width - SPACING.xl * 2 - SPACING.sm) / 2 - 1,
    flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: COLORS.glassStrong,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  infoIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(91,95,239,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { color: COLORS.text, fontSize: 12, fontWeight: '800', marginTop: 1 },

  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.glassSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: 4, marginBottom: SPACING.xl,
  },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md, overflow: 'hidden' },
  tabText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: '#fff', fontWeight: '800' },

  sectionTitle: {
    color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '700',
    marginBottom: SPACING.md, letterSpacing: -0.3,
  },
  description: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 21, marginBottom: SPACING.xl },

  venueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.glassStrong, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: SPACING.md, marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  venueIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: 'rgba(91,95,239,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  venueName: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  venueCity: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tag: {
    backgroundColor: COLORS.glassSoft, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.hairline,
  },
  tagText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },

  artistCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.glassStrong, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: SPACING.md, marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  artistImg: { width: 50, height: 50, borderRadius: 16, resizeMode: 'cover' },
  artistInfo: { flex: 1 },
  artistName: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  artistRole: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2 },
  playBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: RADIUS.full, overflow: 'hidden',
  },
  playBtnActive: { opacity: 0.85 },
  playText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  tcCard: {
    backgroundColor: COLORS.glassStrong, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.hairline,
    padding: SPACING.md, marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  tcHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tcColor: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  tcName: { flex: 1, color: COLORS.text, fontSize: 13, fontWeight: '800' },
  tcPrice: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  tcTrack: { height: 6, borderRadius: 3, backgroundColor: COLORS.cardLight, overflow: 'hidden' },
  tcFill: { height: '100%', borderRadius: 3 },
  tcQuota: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  tcQuotaText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  tcPct: { fontSize: 10, fontWeight: '800' },

  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: SPACING.lg, paddingTop: 10,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  footerLeft: { flex: 1 },
  footerLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  footerPrice: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', letterSpacing: -0.3 },
  footerBtn: { minWidth: 150 },
});
