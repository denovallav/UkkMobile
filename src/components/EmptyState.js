import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS } from '../constants/theme';

export default function EmptyState({ icon = 'information-circle-outline', title, message, actionLabel, onAction, secondaryLabel, onSecondary }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!actionLabel && (
        <TouchableOpacity style={styles.action} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
      {!!secondaryLabel && (
        <TouchableOpacity style={styles.secondary} onPress={onSecondary} activeOpacity={0.7}>
          <Text style={styles.secondaryText}>{secondaryLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(91,95,239,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: COLORS.text,
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  action: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  actionText: { color: '#fff', fontSize: FONTS.sizes.md, fontWeight: '700' },
  secondary: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  secondaryText: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
});
