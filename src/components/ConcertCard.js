import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOWS, FONTS, SPACING } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatPrice, formatDate } from '../utils/helpers';

const { width } = Dimensions.get('window');

export default function ConcertCard({ concert, onPress, style, horizontal }) {
  const { user, isBookmarked, toggleBookmark } = useApp();
  const bookmarked = isBookmarked(concert.id);
  const handleBookmark = () => {
    if (!user) {
      Alert.alert('Login diperlukan', 'Silakan login atau daftar untuk menyimpan konser ke wishlist.');
      return;
    }
    toggleBookmark(concert);
  };

  const minPrice = Math.min(...concert.ticketClasses.map((t) => t.price));
  const isHot = concert.ticketClasses.some((t) => (t.remainingQuota / t.totalQuota) < 0.1);
  const isSoldOut = concert.ticketClasses.every((t) => t.remainingQuota === 0);

  const [entrance] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(entrance, {
      toValue: 1,
      speed: 16,
      bounciness: 4,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [entrance]);

  const animatedStyle = {
    opacity: entrance,
    transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  };

  if (horizontal) {
    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.hCard, style]}>
          <Image source={{ uri: concert.image }} style={styles.hImage} />
          <LinearGradient colors={['rgba(15,23,42,0.05)', 'rgba(15,23,42,0.35)', 'rgba(15,23,42,0.88)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
          <View style={styles.hTop}>
            {isHot ? (
              <View style={styles.hotBadge}><Text style={styles.hotText}>HAMPIR HABIS</Text></View>
            ) : <View />}
            <TouchableOpacity onPress={handleBookmark} style={styles.glassCircle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={bookmarked ? 'heart' : 'heart-outline'} size={17} color={bookmarked ? COLORS.secondary : '#fff'} />
            </TouchableOpacity>
          </View>
          <View style={styles.hBottom}>
            <Text style={styles.hGenre}>{concert.genre.toUpperCase()}</Text>
            <Text style={styles.hTitle} numberOfLines={2}>{concert.title}</Text>
            <Text style={styles.hMeta}>{formatDate(concert.date)} · {concert.city}</Text>
            <Text style={styles.hPrice}>Mulai {formatPrice(minPrice)}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.card, style]}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: concert.image }} style={styles.image} />
          {isHot && !isSoldOut && (
            <View style={styles.hotBadge}><Text style={styles.hotText}>HAMPIR HABIS</Text></View>
          )}
          <TouchableOpacity
            onPress={handleBookmark}
            style={styles.bookmarkBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={bookmarked ? 'heart' : 'heart-outline'} size={17} color={bookmarked ? COLORS.secondary : '#fff'} />
          </TouchableOpacity>
          {isSoldOut && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.genre}>{concert.genre.toUpperCase()}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={COLORS.gold} />
              <Text style={styles.ratingText}>{concert.rating}</Text>
            </View>
          </View>

          <Text style={styles.title} numberOfLines={2}>{concert.title}</Text>

          <Text style={styles.meta} numberOfLines={1}>{formatDate(concert.date)} · {concert.time} WIB</Text>
          <Text style={styles.meta} numberOfLines={1}>{concert.venue}</Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>Mulai dari</Text>
              <Text style={styles.price}>{formatPrice(minPrice)}</Text>
            </View>
            <TouchableOpacity style={styles.buyBtn} onPress={onPress} activeOpacity={0.85}>
              <Text style={styles.buyText}>Beli Tiket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 172, resizeMode: 'cover' },
  hotBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(209,71,63,0.95)',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hotText: { color: '#fff', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 },
  bookmarkBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 4 },
  content: { padding: SPACING.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  genre: { color: COLORS.primary, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  title: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  meta: { color: COLORS.textSecondary, fontSize: 12, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  priceLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '500' },
  price: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '800', letterSpacing: -0.3 },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  buyText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Horizontal
  hCard: {
    width: width * 0.68,
    height: 200,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginRight: SPACING.md,
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  hTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hBottom: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  hGenre: { color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  hTitle: { color: '#fff', fontSize: 15, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  hMeta: { color: 'rgba(255,255,255,0.78)', fontSize: 10, marginBottom: 6 },
  hPrice: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
