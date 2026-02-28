'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import RaceCard from '@/components/RaceCard'
import Controls from '@/components/Controls'
import type { RaceData, CardStyle } from '@/lib/types'
import { Suspense } from 'react'

const DEFAULT_STYLE: CardStyle = {
  textColor: '#ffffff',
  fontFamily: 'grotesk',
  template: 'classic',
  showBib: true,
  showPosition: true,
  showPace: true,
  showCategory: true,
  textShadow: false,
  layout: 'story',
  noteRaw: '',
  notes: [],
  cardBg: 'transparent',
}

function CardPageInner() {
  const params = useSearchParams()
  const router = useRouter()
  const raceId = params.get('raceId')

  const [raceData, setRaceData] = useState<RaceData | null>(null)
  const [cardStyle, setCardStyle] = useState<CardStyle>(DEFAULT_STYLE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!raceId) { setError('No race selected.'); setLoading(false); return }

    fetch(`/api/races/${raceId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setRaceData(json.raceData)
        } else {
          setError(json.error ?? 'Could not load race data.')
        }
      })
      .catch(() => setError('Something went wrong.'))
      .finally(() => setLoading(false))
  }, [raceId])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !raceData) return
    setDownloading(true)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: 'transparent',
        skipFonts: false,
      })
      const link = document.createElement('a')
      link.download = `strain-${raceData.raceName.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30)}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download failed:', err)
    }
    setDownloading(false)
  }, [raceData])

  const bgLabel =
    cardStyle.cardBg === 'transparent' ? 'Transparent PNG'
    : cardStyle.cardBg === 'blur' ? 'Blur background'
    : 'Glass background'

  return (
    <div className="px-5 pt-14 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </button>
        <h1 className="text-lg font-bold truncate" style={{ color: '#111' }}>
          {raceData ? raceData.raceName : 'Stat Card'}
        </h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-4 text-sm" style={{ background: 'white', color: '#888', border: '1px solid #F0F0EE' }}>
          {error}
        </div>
      )}

      {raceData && (
        <div className="flex flex-col gap-4">
          {/* Card preview */}
          <div
            className="rounded-3xl overflow-hidden flex items-center justify-center p-5"
            style={{
              background: 'repeating-conic-gradient(#e0e0e0 0% 25%, #ebebeb 0% 50%) 0 0 / 16px 16px',
              minHeight: cardStyle.layout === 'wide' ? '160px' : '280px',
            }}
          >
            <RaceCard data={raceData} style={cardStyle} cardRef={cardRef} />
          </div>

          {/* Background toggle */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium" style={{ color: '#888' }}>{bgLabel}</p>
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: 'white', border: '1px solid #F0F0EE' }}
            >
              {(['transparent', 'blur', 'glass'] as const).map(bg => (
                <button
                  key={bg}
                  onClick={() => setCardStyle(s => ({
                    ...s,
                    cardBg: bg,
                    textColor: bg === 'blur' ? '#111111' : s.textColor === '#111111' ? '#ffffff' : s.textColor,
                  }))}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={{
                    background: cardStyle.cardBg === bg ? '#111' : 'transparent',
                    color: cardStyle.cardBg === bg ? 'white' : '#888',
                  }}
                >
                  {bg === 'transparent' ? '⊞' : bg.charAt(0).toUpperCase() + bg.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
            <div className="p-5">
              <Controls style={cardStyle} onChange={setCardStyle} />
            </div>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#FC4C02' }}
          >
            {downloading
              ? <><Loader2 size={16} className="animate-spin" /> Exporting...</>
              : <><Download size={15} /> Download PNG</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

export default function DashboardCardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center pt-32">
        <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
      </div>
    }>
      <CardPageInner />
    </Suspense>
  )
}
