import { Platform, Alert } from 'react-native';

/**
 * Safe image picker — works on native, falls back gracefully on web
 */
export const pickImageFromLibrary = async (options = {}) => {
  if (Platform.OS === 'web') {
    // Web: pakai input file HTML5
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return resolve(null);
        const uri = URL.createObjectURL(file);
        resolve({ canceled: false, assets: [{ uri, type: 'image', fileName: file.name }] });
      };
      input.oncancel = () => resolve({ canceled: true });
      input.click();
    });
  }

  try {
    const ImagePicker = require('expo-image-picker');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Mohon izinkan akses galeri.');
      return { canceled: true };
    }
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });
  } catch {
    return { canceled: true };
  }
};

export const pickImageFromCamera = async (options = {}) => {
  if (Platform.OS === 'web') {
    // Web: gunakan input file dengan capture
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return resolve(null);
        const uri = URL.createObjectURL(file);
        resolve({ canceled: false, assets: [{ uri, type: 'image', fileName: file.name }] });
      };
      input.oncancel = () => resolve({ canceled: true });
      input.click();
    });
  }

  try {
    const ImagePicker = require('expo-image-picker');
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Mohon izinkan akses kamera.');
      return { canceled: true };
    }
    return await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      ...options,
    });
  } catch {
    return { canceled: true };
  }
};

export const saveToGallery = async (uri) => {
  if (Platform.OS === 'web') {
    // Web: trigger download
    const a = document.createElement('a');
    a.href = uri;
    a.download = 'fixyou-eticket.png';
    a.click();
    return true;
  }

  try {
    const MediaLibrary = require('expo-media-library');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Mohon izinkan akses galeri.');
      return false;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch {
    return false;
  }
};

/**
 * Salin teks ke clipboard. Mengembalikan true jika berhasil.
 */
export const copyToClipboard = async (text) => {
  try {
    const Clipboard = require('expo-clipboard');
    await Clipboard.setStringAsync(String(text));
    return true;
  } catch {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(String(text));
        return true;
      }
    } catch {}
    return false;
  }
};

/**
 * Buat PDF dari HTML lalu buka dialog bagikan/simpan. Khusus native.
 */
export const sharePdfFromHtml = async (html, dialogTitle = 'Simpan atau bagikan') => {
  if (Platform.OS === 'web') return false;
  try {
    const Print = require('expo-print');
    const Sharing = require('expo-sharing');
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle,
        UTI: 'com.adobe.pdf',
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
