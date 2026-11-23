import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SHADOWS } from '../constants/theme';

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  center = false,
  borderless = false,
  large = false,
  style,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.back} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
        ) : null}

        <View style={[styles.titleWrap, center && styles.titleWrapCenter]}>
          <Text style={[styles.title, large && styles.titleLarge, center && styles.titleCenter]} numberOfLines={1}>{title}</Text>
          {!!subtitle && (
            <Text style={[styles.subtitle, center && styles.subtitleCenter]} numberOfLines={1}>{subtitle}</Text>
          )}
        </View>

        {right || (onBack ? <View style={styles.backPlaceholder} /> : null)}
      </View>
      {!borderless && <View style={styles.hairline} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: { width: 40, height: 40 },
  titleWrap: { flex: 1 },
  titleWrapCenter: { alignItems: 'center' },
  title: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  titleLarge: { fontSize: FONTS.sizes.xxl, fontWeight: '700', letterSpacing: -0.5 },
  titleCenter: { textAlign: 'center' },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    marginTop: 2,
    fontWeight: '400',
  },
  subtitleCenter: { textAlign: 'center' },
  hairline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: COLORS.hairline,
  },
});
