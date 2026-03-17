'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import PassportCard from './PassportCard'
import type { PassportStats } from './PassportCard'
import type { DbUser } from '@/lib/supabase'
import { PASSPORT_THEMES, THEME_KEYS, resolveTheme } from '@/lib/passport-themes'
import type { PassportThemeKey } from '@/lib/passport-themes'

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
  const [selectedKey, setSelectedKey] = useState<PassportThemeKey>(
    (user.passport_theme as PassportThemeKey) ?? 'midnight'
  )
  const [pulseKey, setPulseKey] = useState(0)  // triggers card pop animation
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isDirty = selectedKey !== (user.passport_theme ?? 'midnight')

  function pickTheme(key: PassportThemeKey) {
    if (key === selectedKey) return
    setSelectedKey(key)
    setPulseKey(k => k + 1)  // triggers re-mount for animation
  }

  async function handleApply() {
    setSaving(true)
    await fetch('/api/user/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: selectedKey }),
    })
    setSaved(true)
    setTimeout(() => router.push('/dashboard'), 800)
  }

  const selectedTheme = resolveTheme(selectedKey)

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
        style={{
          animation: 'passportPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <PassportCard
          user={user}
          stats={stats}
          username={username}
          isOwner
          qrSvg={qrSvg}
          theme={selectedTheme}
        />
      </div>

      {/* Theme selector */}
      <div className="mb-3">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: '#aaa' }}>
          Choose a style
        </p>

        {/* Horizontal scroll row */}
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {THEME_KEYS.map(key => {
            const t = PASSPORT_THEMES[key]
            const isSelected = key === selectedKey
            const bgImage = t.texture ? `${t.texture}, ${t.gradient}` : t.gradient

            return (
              <button
                key={key}
                onClick={() => pickTheme(key)}
                style={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  width: 76,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {/* Mini card swatch */}
                <div
                  style={{
                    width: 76,
                    height: 100,
                    borderRadius: 14,
                    backgroundImage: bgImage,
                    position: 'relative',
                    boxShadow: isSelected
                      ? `0 0 0 2.5px ${t.accent}, 0 4px 16px rgba(0,0,0,0.2)`
                      : '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'box-shadow 0.2s ease',
                    overflow: 'hidden',
                  }}
                >
                  {/* Accent stripe at top */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: t.accent, opacity: 0.9 }} />

                  {/* Checkmark if selected */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 7,
                        right: 7,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: t.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={10} color="white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                {/* Theme name */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#111' : '#888',
                    transition: 'color 0.15s',
                  }}
                >
                  {t.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Apply button */}
      <div className="mt-6">
        <button
          onClick={handleApply}
          disabled={saving || saved || !isDirty}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white disabled:opacity-40 transition-opacity"
          style={{ background: saved ? '#22c55e' : '#111' }}
        >
          {saving && !saved && <Loader2 size={15} className="animate-spin" />}
          {saved && <Check size={15} />}
          {saved ? 'Applied!' : saving ? 'Saving…' : isDirty ? 'Apply style' : 'No changes'}
        </button>
      </div>

      <style>{`
        @keyframes passportPop {
          0%   { transform: scale(0.96); opacity: 0.85; }
          100% { transform: scale(1);    opacity: 1; }
        }
        /* Hide scrollbar on the theme row */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
