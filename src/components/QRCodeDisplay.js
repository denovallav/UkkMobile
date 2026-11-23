import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

// react-native-qrcode-svg tidak support web, gunakan fallback
let QRCode = null;
if (Platform.OS !== 'web') {
  try {
    QRCode = require('react-native-qrcode-svg').default;
  } catch {}
}

export default function QRCodeDisplay({ value, size = 140 }) {
  if (Platform.OS === 'web' || !QRCode) {
    // Web fallback: tampilkan box dengan order ID
    return (
      <View style={[styles.webFallback, { width: size, height: size }]}>
        <Text style={styles.qrIcon}>▪▪▪{'\n'}▪  ▪{'\n'}▪▪▪</Text>
        <Text style={styles.webLabel}>QR Code</Text>
        <Text style={styles.webSub} numberOfLines={2}>{value?.slice(0, 20)}...</Text>
      </View>
    );
  }

  return (
    <QRCode
      value={value}
      size={size}
      backgroundColor="white"
      color="#0A0A1A"
    />
  );
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 4,
  },
  qrIcon: {
    color: '#0A0A1A',
    fontSize: 20,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 22,
  },
  webLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  webSub: {
    color: COLORS.textMuted,
    fontSize: 8,
    textAlign: 'center',
  },
});
