'use client'

import { useState, useRef, useCallback } from 'react'
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
}

type AppState = 'idle' | 'loading' | 'success' | 'error'

export default function Home() {
  const [url, setUrl] = useState('')
  const [state, setState] = useState<AppState>('idle')
  const [raceData, setRaceData] = useState<RaceData | null>(null)
  const [error, setError] = useState<{ message: string; hint?: string; isLeaderboard?: boolean } | null>(null)
  const [cardStyle, setCardStyle] = useState<CardStyle>(DEFAULT_STYLE)
  const [downloading, setDownloading] = useState(false)
  const [previewBg, setPreviewBg] = useState<'dark' | 'light' | 'check'>('dark')
  const cardRef = useRef<HTMLDivElement>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setState('loading')
    setError(null)
    setRaceData(null)

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const result: ScrapeResult = await res.json()

      if (result.success && result.data) {
        setRaceData(result.data)
        setState('success')
      } else {
        setError({
          message: result.error || 'Could not extract race data.',
          hint: result.hint,
          isLeaderboard: result.isLeaderboardPage,
        })
        setState('error')
      }
    } catch {
      setError({ message: 'Network error. Please check your connection and try again.' })
      setState('error')
    }
  }, [url])

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !raceData) return
    setDownloading(true)

    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      })

      const link = document.createElement('a')
      const raceName = raceData.raceName.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30)
      link.download = `strain-${raceName}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (err) {
      console.error('Download failed:', err)
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

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="px-5 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-2xl">🏃</span>
          <h1 className="text-xl font-bold tracking-tight">Strain</h1>
        </div>
        <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed">
          Turn your official race results into a beautiful shareable card — with transparent background.
        </p>
      </header>

      <div className="px-4 pb-24 max-w-lg mx-auto">
        {/* URL Input */}
        {state !== 'success' && (
          <form onSubmit={handleSubmit} className="mt-2">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Your race result link
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://results.example.com/race/123/runner/456"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-400 transition-colors"
                  disabled={state === 'loading'}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Paste the link to{' '}
                  <span className="text-zinc-400">your specific result</span> — not the full race leaderboard.
                </p>
              </div>
              <button
                type="submit"
                disabled={state === 'loading' || !url.trim()}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
              >
                {state === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Fetching your result...
                  </span>
                ) : (
                  'Get My Race Stats'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Error State */}
        {state === 'error' && error && (
          <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-lg mt-0.5">
                {error.isLeaderboard ? '🏁' : '⚠️'}
              </span>
              <div className="flex-1">
                <p className="text-sm text-red-300 leading-relaxed font-medium">
                  {error.isLeaderboard
                    ? 'This is a full race leaderboard, not your individual result.'
                    : error.message}
                </p>
                {error.isLeaderboard && (
                  <p className="text-xs text-red-400/80 mt-2 leading-relaxed">
                    Please find your specific result on the race website — search for your name or BIB number — then copy that individual result link and paste it here.
                  </p>
                )}
                {error.hint && !error.isLeaderboard && (
                  <p className="text-xs text-zinc-400 mt-2">{error.hint}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setState('idle')}
              className="mt-3 text-xs text-zinc-400 underline underline-offset-2"
            >
              Try a different link
            </button>
          </div>
        )}

        {/* Success: Card + Controls */}
        {state === 'success' && raceData && (
          <div className="mt-2 flex flex-col gap-6">
            <button
              onClick={handleReset}
              className="self-start flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Try another result
            </button>

            {/* Card preview */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Preview</p>
                {/* Background toggle */}
                <div className="flex gap-1 bg-zinc-900 rounded-lg p-1">
                  {([
                    { key: 'dark',  label: 'Dark'  },
                    { key: 'light', label: 'Light' },
                    { key: 'check', label: '⊞'    },
                  ] as const).map(b => (
                    <button
                      key={b.key}
                      onClick={() => setPreviewBg(b.key)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${
                        previewBg === b.key ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center"
                style={{
                  background:
                    previewBg === 'check'
                      ? 'repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0 0 / 20px 20px'
                      : previewBg === 'dark'
                      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                      : 'linear-gradient(135deg, #e8e0d8 0%, #d4c5b5 50%, #c8b89a 100%)',
                  minHeight: cardStyle.layout === 'wide' ? '200px' : '320px',
                  padding: '16px',
                }}
              >
                <RaceCard data={raceData} style={cardStyle} cardRef={cardRef} />
              </div>

              <p className="text-[10px] text-zinc-600 mt-1.5 text-center">
                {previewBg === 'check' ? 'Checkerboard = fully transparent' : 'Preview on simulated background'}
              </p>
            </div>

            {/* Customization */}
            <div className="bg-zinc-900 rounded-2xl p-4">
              <Controls style={cardStyle} onChange={setCardStyle} />
            </div>

            {raceData.platform && (
              <p className="text-xs text-zinc-600 text-center">
                Data sourced via <span className="text-zinc-400">{raceData.platform}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sticky Download Button */}
      {state === 'success' && raceData && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-2xl"
            >
              {downloading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner dark />
                  Exporting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <DownloadIcon />
                  Download Transparent PNG
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

function LoadingSpinner({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      className={`animate-spin h-4 w-4 ${dark ? 'text-black' : 'text-zinc-600'}`}
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
