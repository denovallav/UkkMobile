import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS } from '../constants/theme';

export default function GradientButton({
  title,
  onPress,
  colors,
  style,
  textStyle,
  loading,
  disabled,
  icon,
  variant = 'primary',
  size = 'md',
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const fills = {
    primary: COLORS.gradientPrimary,
    secondary: COLORS.gradientSecondary,
    success: [COLORS.success, COLORS.success],
    gold: COLORS.gradientGold,
    danger: [COLORS.error, COLORS.error],
  };
  const fillColors = colors || fills[variant] || fills.primary;
  const isInactive = disabled || loading;

  const sizing = {
    sm: { padV: 10, padH: 16, font: FONTS.sizes.sm },
    md: { padV: 14, padH: 20, font: FONTS.sizes.md },
    lg: { padV: 16, padH: 24, font: FONTS.sizes.lg },
  }[size] || { padV: 14, padH: 20, font: FONTS.sizes.md };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.985, useNativeDriver: Platform.OS !== 'web' }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }).start()}
      disabled={isInactive}
      activeOpacity={0.9}
      style={[style, isInactive && styles.inactive]}
    >
      <Animated.View style={{ transform: [{ scale }], borderRadius: RADIUS.lg, alignSelf: 'stretch' }}>
        <LinearGradient
          colors={isInactive ? ['#C3C6D4', '#B7BAC9'] : fillColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            { paddingVertical: sizing.padV, paddingHorizontal: sizing.padH },
            style && style.height ? { height: style.height } : {},
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.inner}>
              {icon && <View style={styles.iconWrap}>{icon}</View>}
              <Text style={[styles.text, { fontSize: sizing.font }, textStyle]}>{title}</Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function IconButton({ icon, onPress, color = COLORS.primary, size = 20, style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.iconButton, style]} activeOpacity={0.7}>
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactive: { opacity: 0.6 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrap: { marginRight: 8 },
  text: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
