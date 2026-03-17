'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import PassportCard from './PassportCard'
import type { PassportStats } from './PassportCard'
import type { DbUser } from '@/lib/supabase'
import {
  PASSPORT_COLORS, PASSPORT_TEXTURES,
  COLOR_KEYS, TEXTURE_KEYS,
  resolveTheme, parseThemeString, buildThemeString,
} from '@/lib/passport-themes'
import type { PassportColorKey, PassportTextureKey } from '@/lib/passport-themes'

// ─── Texture preview swatch ────────────────────────────────────────────────────

function TextureSwatch({ textureKey, selected, onSelect }: {
  textureKey: PassportTextureKey
  selected: boolean
  onSelect: () => void
}) {
  const t = PASSPORT_TEXTURES[textureKey]
  const bg = t.pattern ? `${t.pattern}, #1a1a1a` : '#1a1a1a'

  return (
    <button
      onClick={onSelect}
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 16,
          backgroundImage: bg,
          boxShadow: selected
            ? '0 0 0 2.5px #FC4C02, 0 4px 12px rgba(0,0,0,0.15)'
            : '0 2px 8px rgba(0,0,0,0.1)',
          border: selected ? 'none' : '1.5px solid #ECECEA',
          transition: 'box-shadow 0.18s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {selected && (
          <div style={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: '#FC4C02', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={9} color="white" strokeWidth={3} />
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: selected ? 700 : 500, color: selected ? '#111' : '#888', transition: 'color 0.15s' }}>
        {t.name}
      </span>
    </button>
  )
}

// ─── Color preview swatch ──────────────────────────────────────────────────────

function ColorSwatch({ colorKey, selected, onSelect }: {
  colorKey: PassportColorKey
  selected: boolean
  onSelect: () => void
}) {
  const c = PASSPORT_COLORS[colorKey]

  return (
    <button
      onClick={onSelect}
      style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: 68,
          height: 68,
          borderRadius: 16,
          backgroundImage: c.gradient,
          boxShadow: selected
            ? `0 0 0 2.5px ${c.accent}, 0 4px 12px rgba(0,0,0,0.2)`
            : '0 2px 8px rgba(0,0,0,0.12)',
          transition: 'box-shadow 0.18s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent dot */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.accent }} />
        {selected && (
          <div style={{ position: 'absolute', bottom: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={9} color="white" strokeWidth={3} />
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, fontWeight: selected ? 700 : 500, color: selected ? '#111' : '#888', transition: 'color 0.15s' }}>
        {c.name}
      </span>
    </button>
  )
}

// ─── Horizontal scroll row ─────────────────────────────────────────────────────

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingBottom: 4,
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
      }}
      className="hide-scrollbar"
    >
      {children}
    </div>
  )
}

// ─── Main picker ───────────────────────────────────────────────────────────────

export default function PassportStylePicker({
  user,
  stats,
  username,
  qrSvg,
}: {
  user: DbUser
  stats: PassportStats
  username: string
  qrSvg?: string
}) {
  const router = useRouter()
  const initial = parseThemeString(user.passport_theme)
  const [colorKey, setColorKey] = useState<PassportColorKey>(initial.colorKey)
  const [textureKey, setTextureKey] = useState<PassportTextureKey>(initial.textureKey)
  const [pulseKey, setPulseKey] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isDirty = buildThemeString(colorKey, textureKey) !== (user.passport_theme ?? 'midnight:none')
    && buildThemeString(colorKey, textureKey) !== user.passport_theme

  const currentTheme = resolveTheme(colorKey, textureKey)

  function pickColor(key: PassportColorKey) {
    if (key === colorKey) return
    setColorKey(key)
    setPulseKey(k => k + 1)
  }

  function pickTexture(key: PassportTextureKey) {
    if (key === textureKey) return
    setTextureKey(key)
    setPulseKey(k => k + 1)
  }

  async function handleApply() {
    setSaving(true)
    await fetch('/api/user/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: buildThemeString(colorKey, textureKey) }),
    })
    setSaved(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-10" style={{ background: '#FAFAF8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </button>
        <h1 className="text-xl font-bold" style={{ color: '#111' }}>Passport style</h1>
      </div>

      {/* Live passport preview */}
      <div
        key={pulseKey}
        className="mb-8"
        style={{ animation: 'passportPop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <PassportCard user={user} stats={stats} username={username} isOwner qrSvg={qrSvg} theme={currentTheme} />
      </div>

      {/* ── Texture picker ── */}
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: '#aaa' }}>
          Texture
        </p>
        <ScrollRow>
          {TEXTURE_KEYS.map(key => (
            <TextureSwatch
              key={key}
              textureKey={key}
              selected={key === textureKey}
              onSelect={() => pickTexture(key)}
            />
          ))}
        </ScrollRow>
      </div>

      {/* ── Color picker ── */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: '#aaa' }}>
          Color
        </p>
        <ScrollRow>
          {COLOR_KEYS.map(key => (
            <ColorSwatch
              key={key}
              colorKey={key}
              selected={key === colorKey}
              onSelect={() => pickColor(key)}
            />
          ))}
        </ScrollRow>
      </div>

      {/* Apply button */}
      <button
        onClick={handleApply}
        disabled={saving || saved || !isDirty}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 transition-all duration-200"
        style={{ background: saved ? '#22c55e' : '#111' }}
      >
        {saving && !saved && <Loader2 size={15} className="animate-spin" />}
        {saved && <Check size={15} />}
        {saved ? 'Applied!' : saving ? 'Saving…' : isDirty ? 'Apply style' : 'No changes'}
      </button>

      <style>{`
        @keyframes passportPop {
          0%   { transform: scale(0.96); opacity: 0.8; }
          100% { transform: scale(1);    opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { scrollbar-width: none; }
      `}</style>
    </div>
  )
}
