// ─── Texture patterns (SVG data URIs, tiny + CSS-only, no external assets) ────

const T = {
  none: '',
  grid: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M 24 0 L 0 0 0 24' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/svg%3E")`,
  dots: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Ccircle cx='8' cy='8' r='1' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E")`,
  diagonal: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2' stroke='rgba(255,255,255,0.04)' stroke-width='0.8'/%3E%3C/svg%3E")`,
  linen: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='4' fill='rgba(255,255,255,0.035)'/%3E%3Crect x='2' width='1' height='4' fill='rgba(255,255,255,0.02)'/%3E%3C/svg%3E")`,
}

// ─── Theme type ────────────────────────────────────────────────────────────────

export type PassportThemeKey = 'midnight' | 'navy' | 'maroon' | 'obsidian' | 'slate' | 'forest'

export interface PassportTheme {
  key: PassportThemeKey
  name: string
  gradient: string
  texture: string   // CSS background-image value, '' for none
  accent: string    // header text + highlight color
  cellBg: string
  flagBorder: string
  mrzBg: string
  mrzBorder: string
}

// ─── Theme definitions ─────────────────────────────────────────────────────────

export const PASSPORT_THEMES: Record<PassportThemeKey, PassportTheme> = {
  midnight: {
    key: 'midnight',
    name: 'Midnight',
    gradient: 'radial-gradient(ellipse at 18% 0%, #232323 0%, #0e0e0e 55%, #161616 100%)',
    texture: T.none,
    accent: '#FC4C02',
    cellBg: 'rgba(255,255,255,0.04)',
    flagBorder: '#0e0e0e',
    mrzBg: 'rgba(0,0,0,0.4)',
    mrzBorder: '#1e1e1e',
  },
  navy: {
    key: 'navy',
    name: 'Navy',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1a2a4a 0%, #0a0f1e 55%, #0d1630 100%)',
    texture: T.grid,
    accent: '#5b8dee',
    cellBg: 'rgba(255,255,255,0.05)',
    flagBorder: '#0a0f1e',
    mrzBg: 'rgba(0,0,0,0.35)',
    mrzBorder: '#1a2a4a',
  },
  maroon: {
    key: 'maroon',
    name: 'Maroon',
    gradient: 'radial-gradient(ellipse at 18% 0%, #3d1212 0%, #1a0808 55%, #220d0d 100%)',
    texture: T.diagonal,
    accent: '#FC4C02',
    cellBg: 'rgba(255,255,255,0.05)',
    flagBorder: '#1a0808',
    mrzBg: 'rgba(0,0,0,0.4)',
    mrzBorder: '#2a1010',
  },
  obsidian: {
    key: 'obsidian',
    name: 'Obsidian',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1e1a2e 0%, #110f1a 55%, #16132a 100%)',
    texture: T.dots,
    accent: '#a78bfa',
    cellBg: 'rgba(255,255,255,0.05)',
    flagBorder: '#110f1a',
    mrzBg: 'rgba(0,0,0,0.4)',
    mrzBorder: '#1e1a2e',
  },
  slate: {
    key: 'slate',
    name: 'Slate',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1c2634 0%, #0f1318 55%, #141c26 100%)',
    texture: T.linen,
    accent: '#60a5fa',
    cellBg: 'rgba(255,255,255,0.05)',
    flagBorder: '#0f1318',
    mrzBg: 'rgba(0,0,0,0.35)',
    mrzBorder: '#1c2634',
  },
  forest: {
    key: 'forest',
    name: 'Forest',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1a3015 0%, #0a1208 55%, #0d1a0a 100%)',
    texture: T.grid,
    accent: '#4ade80',
    cellBg: 'rgba(255,255,255,0.05)',
    flagBorder: '#0a1208',
    mrzBg: 'rgba(0,0,0,0.4)',
    mrzBorder: '#1a3015',
  },
}

export const THEME_KEYS = Object.keys(PASSPORT_THEMES) as PassportThemeKey[]
export const DEFAULT_THEME = PASSPORT_THEMES.midnight

export function resolveTheme(key?: string | null): PassportTheme {
  return PASSPORT_THEMES[(key as PassportThemeKey) ?? 'midnight'] ?? DEFAULT_THEME
}
