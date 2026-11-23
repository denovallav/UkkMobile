import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import ConcertCard from '../../components/ConcertCard';
import EmptyState from '../../components/EmptyState';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';

export default function WishlistScreen({ navigation }) {
  const { bookmarks, clearBookmarks, user } = useApp();

  const confirmClear = () => {
    Alert.alert('Hapus Semua Wishlist?', 'Semua konser tersimpan akan dihapus dari daftar.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: clearBookmarks },
    ]);
  };

  return (
    <View style={styles.container}>

      <ScreenHeader
        title="Wishlist"
        subtitle={`${bookmarks.length} konser tersimpan`}
        large
        right={
          bookmarks.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={confirmClear} activeOpacity={0.8}>
              <Ionicons name="trash-outline" size={17} color={COLORS.error} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={bookmarks}
        renderItem={({ item }) => (
          <ConcertCard
            concert={item}
            onPress={() => navigation.navigate('ConcertDetail', { concert: item })}
            style={{ marginHorizontal: SPACING.xl }}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Wishlist masih kosong"
            message={user
              ? 'Simpan event yang ingin kamu ikuti dan temukan kembali dengan cepat di sini.'
              : 'Login dulu, lalu tekan ikon hati pada konser favoritmu untuk menyimpannya di sini.'}
            actionLabel={user ? 'Jelajahi Konser' : 'Masuk Sekarang'}
            onAction={() => (user ? navigation.navigate('Home') : navigation.getParent()?.navigate('Login'))}
            secondaryLabel={user ? undefined : 'Belum punya akun? Daftar gratis'}
            onSecondary={() => navigation.getParent()?.navigate('Register')}
          />
        }
        ListHeaderComponent={
          bookmarks.length > 0 ? (
            <View style={styles.infoBar}>
              <Ionicons name="information-circle-outline" size={14} color={COLORS.info} />
              <Text style={styles.infoText}>Tersimpan di perangkat kamu</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  clearBtn: {
    width: 42, height: 42, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(229,107,99,0.1)',
    borderWidth: 1, borderColor: 'rgba(229,107,99,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingTop: SPACING.md, paddingBottom: 28 },
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: SPACING.xl, marginBottom: SPACING.md,
    backgroundColor: 'rgba(85,168,194,0.1)',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(85,168,194,0.2)',
    padding: SPACING.sm,
  },
  infoText: { color: COLORS.info, fontSize: 11, flex: 1, fontWeight: '600' },
});
