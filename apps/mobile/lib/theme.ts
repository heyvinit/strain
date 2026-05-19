import { Platform } from 'react-native';

export const colors = {
  bg: '#000000',
  bgElevated: '#0B0B0B',
  surface: '#141414',
  surfaceAlt: '#0F0F0F',
  surfaceSunken: '#070707',
  surfaceBorder: '#1F1F1F',
  surfaceBorderSoft: 'rgba(255,255,255,0.10)',
  searchBg: 'rgba(26,26,26,0.6)',
  searchBorder: '#262626',
  pillBg: '#141414',
  pillBorder: '#222222',
  pillSelectedBg: '#FFFFFF',
  pillSelectedInk: '#000000',
  toggleTrack: 'rgba(255,255,255,0.08)',
  ink: '#FFFFFF',
  body: '#A1A1A1',
  muted: 'rgba(255,255,255,0.55)',
  mutedSoft: 'rgba(255,255,255,0.35)',
  hairline: '#1C1C1C',
  divider: '#161616',
  accent: '#FC4C02',
  accentSoft: 'rgba(252,76,2,0.16)',
  success: '#2AC57F',
  warning: '#F2A23A',
  empty: '#1C1C1C',
  imageBg: '#0E0E0E',
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const fonts = {
  title: Platform.select({
    ios: 'Futura',
    android: 'Jost_700Bold',
    default: 'Inter_700Bold',
  }) as string,
  titleMedium: Platform.select({
    ios: 'Futura-Medium',
    android: 'Jost_500Medium',
    default: 'Inter_500Medium',
  }) as string,
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const type = {
  display: { fontFamily: fonts.title, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.title, fontSize: 24, lineHeight: 28, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.titleMedium, fontSize: 18, lineHeight: 22, letterSpacing: -0.2 },
  h3: { fontFamily: fonts.titleMedium, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  bodySmall: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16, letterSpacing: -0.1 },
  caption: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, letterSpacing: 0 },
  micro: { fontFamily: fonts.bodyMedium, fontSize: 10, lineHeight: 12, letterSpacing: 0.4 },
} as const;

export const layout = {
  screenPadding: 20,
  screenPaddingTight: 16,
  bottomNavClearance: 110,
  cardGap: 12,
  sectionGap: 28,
} as const;

export const motion = {
  pressScale: 0.97,
  duration: { fast: 120, normal: 220, slow: 320 },
} as const;
