export const COLORS = {
  // Merek
  primary: '#5B5FEF',
  primaryDark: '#4145C9',
  primaryLight: '#8B9CFF',
  secondary: '#F05AA6',
  accent: '#0FA98F',
  accentOrange: '#D98324',

  // Permukaan
  background: '#F4F5FA',
  surface: '#FFFFFF',
  surfaceLight: '#F2F3F9',
  card: '#FFFFFF',
  cardLight: '#F6F7FB',

  // Teks
  text: '#0F172A',
  textSecondary: '#5B6472',
  textMuted: '#8A93A5',
  textDark: '#0F172A',

  // Status
  success: '#0F9D74',
  warning: '#C98A1B',
  error: '#D1473F',
  info: '#3D8AA8',

  gold: '#C98A1B',
  silver: '#A8AFBA',
  bronze: '#B06A2C',

  // Garis
  border: '#E4E7EF',
  borderLight: '#EEF0F6',
  overlay: 'rgba(15,23,42,0.55)',

  // Alias lama agar komponen lama tetap jalan — sekarang solid, bukan kaca
  glass: '#FFFFFF',
  glassStrong: '#FFFFFF',
  glassSoft: '#FFFFFF',
  hairline: '#E7E9F1',
  hairlineStrong: '#D9DDE8',
  scrim: 'rgba(15,23,42,0.42)',

  // Gradient dibuat nyaris solid: hanya untuk kedalaman, bukan pelangi
  gradientPrimary: ['#5B5FEF', '#5257E3'],
  gradientSecondary: ['#F05AA6', '#E2519A'],
  gradientAccent: ['#F5F6FB', '#F5F6FB'],
  gradientDark: ['#FFFFFF', '#FFFFFF'],
  gradientCard: ['#FFFFFF', '#FFFFFF'],
  gradientGold: ['#E8B04B', '#D99A2E'],
};

export const GRADIENTS = {
  screen: ['#F5F6FA', '#F2F3F9'],
  header: ['#FFFFFF', '#FFFFFF'],
  headerCool: ['#FFFFFF', '#FFFFFF'],
  card: ['#FFFFFF', '#FFFFFF'],
  tabBar: ['#FFFFFF', '#FFFFFF'],
  heroScrim: ['rgba(15,23,42,0.04)', 'rgba(15,23,42,0.42)', 'rgba(15,23,42,0.82)'],
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 36,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
};

// Sudut lebih tegas: tidak lagi super bulat
export const RADIUS = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

// Satu bahasa bayangan yang tenang: tipis, netral, tanpa glow ungu
export const SHADOWS = {
  small: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  large: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  soft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  float: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
};
