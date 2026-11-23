# 🎵 TiketKonser - Aplikasi Pemesanan Tiket Konser

![React Native](https://img.shields.io/badge/React_Native-58-blue.svg)
![Expo](https://img.shields.io/badge/Expo-58-000020.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

Aplikasi mobile modern untuk memesan tiket konser dengan fitur-fitur lengkap dan UI/UX yang menarik.

## ✨ Fitur Utama

### 🎭 Fitur Core
- ✅ **Autentikasi** - Login & Register dengan validasi lengkap
- 🎫 **Daftar Konser** - Browse konser dengan search & filter real-time
- 🔍 **Pencarian & Filter** - Cari berdasarkan artis, genre, kota dengan sorting
- 💖 **Wishlist/Bookmark** - Simpan konser favorit di local storage (AsyncStorage)
- 📋 **Riwayat Pesanan** - Lihat semua pesanan dengan status badge

### 🚀 Fitur Premium

#### 🗺️ Denah Panggung Interaktif
- Visualisasi stage layout konser
- Highlight otomatis area menonton sesuai kelas tiket yang dipilih
- Animasi smooth saat memilih tiket
- Warning untuk tiket yang hampir habis

#### 📊 Progress Bar & Indikator Kuota
- Progress bar animasi untuk setiap kelas tiket
- Warna dinamis (hijau → kuning → merah) berdasarkan sisa kuota
- Persentase real-time
- Alert untuk tiket yang tinggal <10%

#### ⏱️ Countdown Timer (Hold Timer)
- Timer 10 menit untuk selesaikan checkout
- Progress bar animasi
- Pulse animation saat <1 menit
- Auto-expire dengan alert

#### 🎟️ E-Ticket Digital (Boarding Pass Style)
- Design modern mirip boarding pass
- QR Code untuk verifikasi
- Info lengkap (nama, tanggal, venue, order ID)
- Badge status pembayaran (Menunggu/Terverifikasi/Ditolak)
- Tombol simpan ke galeri
- Tombol share

#### 📸 Upload Bukti Pembayaran
- Upload dari galeri atau ambil foto langsung
- Preview image
- Update/ganti bukti bayar
- Status verifikasi real-time

#### 🎵 Preview Lagu Artis
- Tombol play untuk setiap artis
- Link ke Spotify preview
- Info role artis (Vocalist, Rapper, dll)

#### 🎯 Filter & Sorting
- **Filter**: Semua genre konser
- **Sort**: Terbaru, Termurah, Termahal, Rating
- **Search**: Real-time search artis, konser, genre, kota

## 📱 Screenshots Fitur

```
├── Login & Register (Modern gradient design)
├── Home (Featured concerts, search, filter, stats)
├── Concert Detail (Banner, countdown, tabs: info/artis/tiket)
├── Ticket Selection (Stage map, quota bars, quantity selector)
├── Checkout (Hold timer, payment methods, upload proof)
├── E-Ticket (QR code, boarding pass design)
├── Order History (Filter by status, payment badges)
├── Order Detail (Full info, QR code if verified)
├── Wishlist (Saved concerts with AsyncStorage)
└── Profile (Stats, settings, avatar upload)
```

## 🛠️ Tech Stack

### Core
- **React Native** - Framework mobile
- **Expo** (SDK 58) - Development platform
- **React Navigation** - Stack & Bottom Tab navigation

### UI/UX
- **expo-linear-gradient** - Beautiful gradients
- **@expo/vector-icons** - Ionicons icons
- **react-native-safe-area-context** - Safe area handling
- **Animated API** - Smooth animations

### Features
- **@react-native-async-storage/async-storage** - Local storage untuk wishlist & auth
- **expo-image-picker** - Upload foto dari galeri/kamera
- **expo-file-system** - File management
- **expo-media-library** - Save to gallery
- **react-native-qrcode-svg** - Generate QR codes
- **react-native-svg** - SVG rendering
- **moment** - Date formatting (Indonesian locale)

### Additional
- **expo-av** - Audio/video (untuk preview)
- **expo-sharing** - Share functionality
- **expo-print** - Print tickets (future)
- **expo-blur** - Blur effects
- **expo-haptics** - Haptic feedback

## 📦 Instalasi & Setup

### Prerequisites
```bash
node >= 14
npm >= 6
```

### Clone & Install
```bash
cd c:\mobileUKK\TiketKonser
npm install
```

### Jalankan Aplikasi

#### Development Mode
```bash
# Start Expo
npx expo start

# Atau langsung ke platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

#### Di Device Fisik
1. Install **Expo Go** dari Play Store/App Store
2. Scan QR code dari terminal
3. Aplikasi akan load otomatis

#### Di Emulator
- **Android**: Buka Android Studio emulator, tekan `a` di terminal
- **iOS**: Buka Simulator, tekan `i` di terminal (Mac only)

## 🎨 Design System

### Color Palette
```javascript
Primary: #6C63FF (Purple)
Secondary: #FF6584 (Pink)
Accent: #43E97B (Green)
Background: #0A0A1A (Dark Navy)
Surface: #13132A (Card background)
```

### Typography
- Display: 36px (Hero titles)
- XXL: 28px (Page titles)
- XL: 22px (Section titles)
- LG: 16px (Body large)
- MD: 14px (Body)
- SM: 12px (Meta info)

### Spacing System
```
xs: 4px   sm: 8px   md: 12px
lg: 16px  xl: 20px  xxl: 24px  xxxl: 32px
```

## 📂 Struktur Folder

```
TiketKonser/
├── src/
│   ├── components/         # Reusable components
│   │   ├── GradientButton.js
│   │   └── ConcertCard.js
│   ├── constants/          # Theme & constants
│   │   └── theme.js
│   ├── context/            # Global state
│   │   └── AppContext.js
│   ├── data/               # Mock data
│   │   └── mockData.js
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.js
│   ├── screens/            # All screens
│   │   ├── auth/           # Login, Register
│   │   ├── home/           # Home screen
│   │   ├── concerts/       # Concert detail
│   │   ├── tickets/        # Ticket selection, E-ticket
│   │   ├── orders/         # Checkout, History, Detail
│   │   ├── wishlist/       # Wishlist screen
│   │   └── profile/        # Profile screen
│   └── utils/              # Helper functions
│       └── helpers.js
├── assets/                 # Images, icons
├── App.js                  # Entry point
├── app.json               # Expo config
└── package.json           # Dependencies
```

## 🔌 API Integration (Future)

Aplikasi ini frontend-only. Untuk integrasi backend:

### Endpoints yang Dibutuhkan:
```
POST   /auth/login
POST   /auth/register
GET    /concerts
GET    /concerts/:id
POST   /orders
PUT    /orders/:id/payment-proof
GET    /orders
GET    /orders/:id
```

### Update Context:
Edit `src/context/AppContext.js` dan ganti mock data dengan API calls menggunakan `fetch` atau `axios`.

## 🎯 Demo Credentials

```
Email: demo@tiketkonser.id
Password: demo123
```

Atau gunakan email apapun dengan password min 6 karakter untuk auto-login.

## 📱 Fitur Responsif

- ✅ Responsive untuk berbagai ukuran layar
- ✅ Support portrait orientation
- ✅ Safe area handling (notch & navigation bar)
- ✅ Dynamic dimensions untuk landscape
- ✅ Keyboard-aware input forms

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login & Register flow
- [ ] Search & filter concerts
- [ ] Bookmark/unbookmark concerts
- [ ] Select ticket class & quantity
- [ ] Countdown timer di checkout
- [ ] Upload payment proof
- [ ] View order history
- [ ] Filter orders by status
- [ ] View e-ticket dengan QR code
- [ ] Save e-ticket to gallery
- [ ] Profile management

## 🚀 Build Production

### Android APK
```bash
npx expo build:android
# atau dengan EAS
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## 📝 Catatan Penting

### Local Storage (AsyncStorage)
Data yang disimpan:
- User authentication state
- Wishlist/bookmark concerts
- Order history

### Mock Data
File `src/data/mockData.js` berisi 6 konser mock dengan data lengkap:
- BLACKPINK, BTS, Coldplay, Raisa, Ed Sheeran, Dewa 19

### Backend Integration
Untuk menghubungkan dengan backend:
1. Update base URL di `src/utils/api.js` (create file baru)
2. Replace mock data di Context dengan API calls
3. Handle authentication tokens
4. Implement refresh token logic

## 🎨 Customization

### Ganti Warna Tema
Edit `src/constants/theme.js`:
```javascript
export const COLORS = {
  primary: '#6C63FF',  // Ganti dengan warna pilihanmu
  secondary: '#FF6584',
  // ...
};
```

### Tambah Konser Baru
Edit `src/data/mockData.js` dan tambahkan objek konser baru ke array `CONCERTS`.

## 🤝 Kontribusi

Ini adalah tugas UKK mobile programming. Feel free to use sebagai referensi!

## 📄 License

MIT License - Feel free to use for learning purposes.

## 👨‍💻 Author

Dibuat dengan ❤️ untuk tugas Mobile Programming UKK 2026

---

## 🎉 Selamat Mencoba!

Jika ada pertanyaan atau error, pastikan semua dependencies sudah terinstall dengan benar:
```bash
npm install
npx expo start --clear
```

**Happy Coding!** 🚀
