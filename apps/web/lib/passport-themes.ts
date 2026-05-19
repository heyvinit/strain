// ─── Colors ───────────────────────────────────────────────────────────────────

export type PassportColorKey = 'midnight' | 'navy' | 'maroon' | 'obsidian' | 'slate' | 'forest'

export interface PassportColor {
  key: PassportColorKey
  name: string
  gradient: string
  accent: string
  cellBg: string
  flagBorder: string
  mrzBg: string
  mrzBorder: string
}

export const PASSPORT_COLORS: Record<PassportColorKey, PassportColor> = {
  midnight: {
    key: 'midnight', name: 'Midnight',
    gradient: 'radial-gradient(ellipse at 18% 0%, #232323 0%, #0e0e0e 55%, #161616 100%)',
    accent: '#FC4C02', cellBg: 'rgba(255,255,255,0.04)', flagBorder: '#0e0e0e',
    mrzBg: 'rgba(0,0,0,0.4)', mrzBorder: '#1e1e1e',
  },
  navy: {
    key: 'navy', name: 'Navy',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1a2a4a 0%, #0a0f1e 55%, #0d1630 100%)',
    accent: '#5b8dee', cellBg: 'rgba(255,255,255,0.05)', flagBorder: '#0a0f1e',
    mrzBg: 'rgba(0,0,0,0.35)', mrzBorder: '#1a2a4a',
  },
  maroon: {
    key: 'maroon', name: 'Maroon',
    gradient: 'radial-gradient(ellipse at 18% 0%, #3d1212 0%, #1a0808 55%, #220d0d 100%)',
    accent: '#FC4C02', cellBg: 'rgba(255,255,255,0.05)', flagBorder: '#1a0808',
    mrzBg: 'rgba(0,0,0,0.4)', mrzBorder: '#2a1010',
  },
  obsidian: {
    key: 'obsidian', name: 'Obsidian',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1e1a2e 0%, #110f1a 55%, #16132a 100%)',
    accent: '#a78bfa', cellBg: 'rgba(255,255,255,0.05)', flagBorder: '#110f1a',
    mrzBg: 'rgba(0,0,0,0.4)', mrzBorder: '#1e1a2e',
  },
  slate: {
    key: 'slate', name: 'Slate',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1c2634 0%, #0f1318 55%, #141c26 100%)',
    accent: '#60a5fa', cellBg: 'rgba(255,255,255,0.05)', flagBorder: '#0f1318',
    mrzBg: 'rgba(0,0,0,0.35)', mrzBorder: '#1c2634',
  },
  forest: {
    key: 'forest', name: 'Forest',
    gradient: 'radial-gradient(ellipse at 18% 0%, #1a3015 0%, #0a1208 55%, #0d1a0a 100%)',
    accent: '#4ade80', cellBg: 'rgba(255,255,255,0.05)', flagBorder: '#0a1208',
    mrzBg: 'rgba(0,0,0,0.4)', mrzBorder: '#1a3015',
  },
}

export const COLOR_KEYS: PassportColorKey[] = ['midnight', 'navy', 'maroon', 'obsidian', 'slate', 'forest']

// ─── Textures (SVG data URIs — no network requests) ───────────────────────────

export type PassportTextureKey = 'none' | 'grid' | 'diagonal' | 'linen'

export interface PassportTexture {
  key: PassportTextureKey
  name: string
  pattern: string  // CSS background-image value, '' for none
}

export const PASSPORT_TEXTURES: Record<PassportTextureKey, PassportTexture> = {
  none: { key: 'none', name: 'Clean', pattern: '' },
  grid: {
    key: 'grid', name: 'Grid',
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M 24 0 L 0 0 0 24' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='0.5'/%3E%3C/svg%3E")`,
  },
  diagonal: {
    key: 'diagonal', name: 'Diagonal',
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3Cpath d='M-1,1 l2,-2 M0,10 l10,-10 M9,11 l2,-2' stroke='rgba(255,255,255,0.04)' stroke-width='0.8'/%3E%3C/svg%3E")`,
  },
  linen: {
    key: 'linen', name: 'Linen',
    pattern: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='4' fill='rgba(255,255,255,0.035)'/%3E%3Crect x='2' width='1' height='4' fill='rgba(255,255,255,0.02)'/%3E%3C/svg%3E")`,
  },
}

export const TEXTURE_KEYS: PassportTextureKey[] = ['none', 'grid', 'diagonal', 'linen']

// ─── Combined theme (what PassportCard consumes) ──────────────────────────────

export interface PassportTheme {
  texture: string   // CSS background-image pattern, '' for none
  gradient: string
  accent: string
  cellBg: string
  flagBorder: string
  mrzBg: string
  mrzBorder: string
}

export function resolveTheme(colorKey: PassportColorKey, textureKey: PassportTextureKey): PassportTheme {
  const c = PASSPORT_COLORS[colorKey]
  const t = PASSPORT_TEXTURES[textureKey]
  return { gradient: c.gradient, texture: t.pattern, accent: c.accent, cellBg: c.cellBg, flagBorder: c.flagBorder, mrzBg: c.mrzBg, mrzBorder: c.mrzBorder }
}

/** Parse stored string: "navy:grid", "midnight:none", or legacy "midnight" */
export function parseThemeString(str: string | null): { colorKey: PassportColorKey; textureKey: PassportTextureKey } {
  if (!str) return { colorKey: 'midnight', textureKey: 'none' }
  const [c, t] = str.split(':')
  const colorKey: PassportColorKey = (c in PASSPORT_COLORS) ? c as PassportColorKey : 'midnight'
  const textureKey: PassportTextureKey = t && (t in PASSPORT_TEXTURES) ? t as PassportTextureKey : 'none'
  return { colorKey, textureKey }
}

export function buildThemeString(colorKey: PassportColorKey, textureKey: PassportTextureKey): string {
  return `${colorKey}:${textureKey}`
}

/** Resolve from user.passport_theme string directly */
export function resolveUserTheme(passport_theme: string | null): PassportTheme {
  const { colorKey, textureKey } = parseThemeString(passport_theme)
  return resolveTheme(colorKey, textureKey)
}
