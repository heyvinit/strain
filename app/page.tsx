'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import RaceCard from '@/components/RaceCard'
import Controls from '@/components/Controls'
import { RaceData, CardStyle, ScrapeResult } from '@/lib/types'

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

type AppState = 'idle' | 'loading' | 'success' | 'error'

export default function Home() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<AppState>('idle')
  const [raceData, setRaceData] = useState<RaceData | null>(null)
  const [error, setError] = useState<{ message: string; hint?: string; isLeaderboard?: boolean } | null>(null)
  const [cardStyle, setCardStyle] = useState<CardStyle>(DEFAULT_STYLE)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const scrape = useCallback(async (targetUrl: string) => {
    if (!targetUrl.trim()) return
    setState('loading')
    setError(null)
    setRaceData(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() }),
      })
      const result: ScrapeResult = await res.json()
      if (result.success && result.data) {
        setRaceData(result.data)
        setState('success')
      } else {
        setError({ message: result.error || 'Could not extract race data.', hint: result.hint, isLeaderboard: result.isLeaderboardPage })
        setState('error')
      }
    } catch {
      setError({ message: 'Network error. Please check your connection and try again.' })
      setState('error')
    }
  }, [])

  // Pre-fill and auto-run from ?url= (e.g. "Create stat card" from race detail)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const prefill = params.get('url')
    if (prefill) {
      setUrl(prefill)
      scrape(prefill)
    }
  }, [scrape])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    scrape(url)
  }, [url, scrape])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !raceData) return
    setDownloading(true)
    setDownloadError(null)
    try {
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: 'transparent',
        skipFonts: false,
      })
      const link = document.createElement('a')
      const raceName = raceData.raceName.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30)
      link.download = `strain-${raceName}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Download failed:', err)
      setDownloadError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setDownloading(false)
    }
  }, [raceData])

  const handleReset = () => {
    setState('idle')
    setRaceData(null)
    setError(null)
    setUrl('')
  }

  const downloadLabel =
    cardStyle.cardBg === 'transparent' ? 'Download Transparent PNG'
    : cardStyle.cardBg === 'blur' ? 'Download with Blur Background'
    : 'Download with Glass Background'

  return (
    <main className="min-h-screen bg-white text-zinc-900">

      {/* ── Idle / Error state: full-screen hero ── */}
      {state !== 'success' && (
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">

          {/* Logo */}
          <img src="/strain-logo.svg" alt="Strain" className="h-8 w-auto mb-12" />

          {/* Headline */}
          <div className="text-center mb-8 max-w-xs">
            <h1 className="text-[1.85rem] font-bold leading-tight tracking-tight text-zinc-900 mb-3">
              Turn your race finish time into a shareable moment.
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Paste your official result link. Get a stunning shareable card in seconds.
            </p>
          </div>

          {/* Form */}
          <div className="w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="relative mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="Paste your race result link..."
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all shadow-sm pr-32"
                  disabled={state === 'loading'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <button
                  type="submit"
                  disabled={state === 'loading' || !url.trim()}
                  className="absolute right-2 top-2 bottom-2 px-4 bg-zinc-900 text-white font-semibold rounded-xl text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors whitespace-nowrap"
                >
                  {state === 'loading' ? (
                    <span className="flex items-center gap-1.5">
                      <LoadingSpinner light />
                      Loading
                    </span>
                  ) : (
                    'Generate →'
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400 text-center leading-relaxed">
                Paste your <span className="text-zinc-600">individual result</span> — not the full leaderboard
              </p>
            </form>

            {/* Error */}
            {state === 'error' && error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-lg mt-0.5">
                    {error.isLeaderboard ? '🏁' : '⚠️'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-red-700 leading-relaxed font-medium">
                      {error.isLeaderboard
                        ? 'This is a full race leaderboard, not your individual result.'
                        : error.message}
                    </p>
                    {error.isLeaderboard && (
                      <p className="text-xs text-red-500 mt-2 leading-relaxed">
                        Find your specific result — search by name or BIB — then paste that link here.
                      </p>
                    )}
                    {error.hint && !error.isLeaderboard && (
                      <p className="text-xs text-zinc-500 mt-2">{error.hint}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setState('idle')}
                  className="mt-3 text-xs text-zinc-500 underline underline-offset-2"
                >
                  Try a different link
                </button>
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="grid grid-cols-3 gap-6 mt-14 max-w-sm w-full">
            {([
              { num: '01', text: 'Paste your race result link' },
              { num: '02', text: 'Customize template & colors' },
              { num: '03', text: 'Download & share anywhere' },
            ]).map(step => (
              <div key={step.num} className="text-center">
                <div className="text-[10px] font-bold text-zinc-300 mb-1.5 tabular-nums">{step.num}</div>
                <div className="text-[11px] text-zinc-400 leading-snug">{step.text}</div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── Success state: desktop two-column, mobile stacked ── */}
      {state === 'success' && raceData && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-5">
            <img src="/strain-logo.svg" alt="Strain" className="h-6 w-auto" />
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              ← New result
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

            {/* ── Left: Editor / Controls ── */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <Controls style={cardStyle} onChange={setCardStyle} />
            </div>

            {/* ── Right: Preview + Download ── */}
            <div className="flex flex-col gap-3 lg:w-auto">
              {/* Background selector */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">Preview</p>
                <div className="flex gap-1 bg-zinc-100 rounded-lg p-1">
                  {([
                    { value: 'transparent', label: '⊞' },
                    { value: 'blur',        label: 'Blur' },
                    { value: 'glass',       label: 'Glass' },
                  ] as const).map(b => (
                    <button
                      key={b.value}
                      onClick={() => setCardStyle(s => ({
                        ...s,
                        cardBg: b.value,
                        textColor: b.value === 'blur' ? '#111111' : s.textColor === '#111111' ? '#ffffff' : s.textColor,
                      }))}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                        cardStyle.cardBg === b.value
                          ? 'bg-white text-zinc-900 shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card preview */}
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background: 'repeating-conic-gradient(#d4d4d4 0% 25%, #e8e8e8 0% 50%) 0 0 / 20px 20px',
                  minHeight: cardStyle.layout === 'wide' ? '200px' : '320px',
                  padding: '16px',
                }}
              >
                <RaceCard data={raceData} style={cardStyle} cardRef={cardRef} />
              </div>

              <p className="text-[10px] text-zinc-400 text-center">
                {cardStyle.cardBg === 'transparent'
                  ? 'No background — transparent PNG'
                  : cardStyle.cardBg === 'blur'
                  ? 'Frosted background included in export'
                  : 'Glass background included in export'}
              </p>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-sm mt-1"
              >
                {downloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner light />
                    Exporting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <DownloadIcon />
                    {downloadLabel}
                  </span>
                )}
              </button>

              {downloadError && (
                <p className="text-[11px] text-red-500 text-center">
                  Export failed: {downloadError}
                </p>
              )}

              {raceData.platform && (
                <p className="text-[10px] text-zinc-400 text-center">
                  Data via <span className="text-zinc-500">{raceData.platform}</span>
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </main>
  )
}

function LoadingSpinner({ light = false }: { light?: boolean }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${light ? 'text-white' : 'text-zinc-400'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}
