'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Loader2, ChevronRight } from 'lucide-react'
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

interface RaceSummary {
  id: string
  race_name: string
  race_date: string | null
  distance: string
  sport: string | null
  net_time: string | null
}

function formatDate(d: string | null): { month: string; day: string } {
  if (!d) return { month: '—', day: '—' }
  const date = new Date(d + 'T00:00:00')
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(date.getDate()),
  }
}

function formatTime(t: string | null): string {
  if (!t) return '—'
  return t.replace(/^0(\d):/, '$1:')
}

function RacePicker() {
  const router = useRouter()
  const [races, setRaces] = useState<RaceSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/races')
      .then(r => r.json())
      .then(json => { if (json.success) setRaces(json.races) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-5 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </button>
        <h1 className="text-lg font-bold" style={{ color: '#111' }}>Choose a race</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
        </div>
      ) : races.length === 0 ? (
        <div className="rounded-2xl p-5 text-center" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
          <p className="text-sm font-semibold mb-1" style={{ color: '#111' }}>No completed races yet</p>
          <p className="text-xs" style={{ color: '#aaa' }}>Add a race result first, then come back to make a stat card.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {races.map(race => {
            const { month, day } = formatDate(race.race_date)
            return (
              <button
                key={race.id}
                onClick={() => router.push(`/dashboard/card?raceId=${race.id}`)}
                className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 active:scale-[0.98] transition-transform duration-75 text-left"
                style={{ border: '1px solid #F0F0EE' }}
              >
                <div className="flex flex-col items-center w-9 shrink-0">
                  <span className="text-[10px] font-semibold" style={{ color: '#aaa' }}>{month}</span>
                  <span className="text-xl font-bold leading-tight" style={{ color: '#111' }}>{day}</span>
                </div>
                <div className="w-px self-stretch" style={{ background: '#F0F0EE' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: '#111' }}>{race.race_name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#888' }}>{race.distance}</p>
                </div>
                <span className="text-sm font-bold shrink-0" style={{ color: '#111' }}>{formatTime(race.net_time)}</span>
                <ChevronRight size={14} color="#ccc" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
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
    if (!raceId) { setLoading(false); return }

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

  // No raceId — show race picker (after all hooks)
  if (!raceId && !loading) {
    return <RacePicker />
  }

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
