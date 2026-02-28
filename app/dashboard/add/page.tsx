'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Link2, Loader2, CheckCircle2, PenLine } from 'lucide-react'
import Link from 'next/link'

type Step = 'input' | 'loading' | 'preview' | 'saving' | 'done' | 'error'
type Mode = 'url' | 'manual'

interface RacePreview {
  raceName: string
  raceDate: string
  runnerName: string
  bibNumber: string
  distance: string
  netTime: string
  pace?: string
  overallPosition?: string
  category?: string
  platform: string
}

const DISTANCE_OPTIONS = [
  { label: 'Marathon (42.2km)', value: 'Marathon (42.2km)' },
  { label: 'Half Marathon (21.1km)', value: 'Half Marathon (21.1km)' },
  { label: '10K', value: '10K' },
  { label: '5K', value: '5K' },
  { label: 'Other', value: '' },
]

export default function AddRacePage() {
  const router = useRouter()

  // URL flow
  const [step, setStep] = useState<Step>('input')
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<RacePreview | null>(null)
  const [error, setError] = useState('')

  // Mode toggle
  const [mode, setMode] = useState<Mode>('url')

  // Manual form
  const [manual, setManual] = useState({
    raceName: '',
    raceDate: '',
    distance: '10K',
    distanceCustom: '',
    netTime: '',
    pace: '',
    overallPosition: '',
    bibNumber: '',
    category: '',
  })
  const [manualSaving, setManualSaving] = useState(false)
  const [manualError, setManualError] = useState('')

  // ── URL flow ──────────────────────────────────────────────────────────────

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setStep('loading')
    setError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error ?? 'Could not extract race data. Please check the link.')
        setStep('error')
        return
      }
      setPreview(json.data)
      setStep('preview')
    } catch {
      setError('Something went wrong. Please try again.')
      setStep('error')
    }
  }

  async function handleSave() {
    if (!preview) return
    setStep('saving')
    try {
      const res = await fetch('/api/passport/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preview, result_url: url }),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error ?? 'Failed to save race.'); setStep('error'); return }
      setStep('done')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Failed to save race.')
      setStep('error')
    }
  }

  // ── Manual flow ───────────────────────────────────────────────────────────

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault()
    if (!manual.raceName || !manual.netTime) {
      setManualError('Race name and finish time are required.')
      return
    }
    const distance = manual.distance === 'Other' ? manual.distanceCustom : manual.distance
    if (!distance) { setManualError('Please enter a distance.'); return }

    setManualSaving(true)
    setManualError('')
    try {
      const res = await fetch('/api/passport/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceName: manual.raceName,
          raceDate: manual.raceDate,
          distance,
          netTime: manual.netTime,
          pace: manual.pace,
          overallPosition: manual.overallPosition,
          bibNumber: manual.bibNumber,
          category: manual.category,
          platform: 'Manual',
          runnerName: '',
        }),
      })
      const json = await res.json()
      if (!json.success) { setManualError(json.error ?? 'Failed to save.'); setManualSaving(false); return }
      setStep('done')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setManualError('Something went wrong.')
      setManualSaving(false)
    }
  }

  const mf = (label: string, key: keyof typeof manual, placeholder = '', type = 'text') => (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#aaa' }}>
        {label}
      </label>
      <input
        type={type}
        value={manual[key]}
        onChange={e => setManual(m => ({ ...m, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
        style={{ background: 'white', color: '#111', border: '1px solid #F0F0EE' }}
      />
    </div>
  )

  // ── Done state (shared) ───────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen px-5 pt-14 flex flex-col items-center justify-center gap-4" style={{ background: '#F8F8F7' }}>
        <CheckCircle2 size={40} style={{ color: '#FC4C02' }} />
        <p className="font-bold text-lg" style={{ color: '#111' }}>Added to your passport!</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-5 pt-14" style={{ background: '#F8F8F7' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#111' }}>Add a race</h1>
      </div>

      {/* Mode toggle */}
      {(step === 'input' || step === 'error' || mode === 'manual') && (
        <div
          className="flex rounded-2xl p-1 mb-5"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          {(['url', 'manual'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setStep('input'); setError('') }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: mode === m ? '#111' : 'transparent',
                color: mode === m ? 'white' : '#888',
              }}
            >
              {m === 'url' ? <Link2 size={12} /> : <PenLine size={12} />}
              {m === 'url' ? 'Paste link' : 'Enter manually'}
            </button>
          ))}
        </div>
      )}

      {/* ── URL flow ── */}
      {mode === 'url' && (
        <>
          {(step === 'input' || step === 'error') && (
            <form onSubmit={handleScrape}>
              <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1px solid #F0F0EE' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={15} color="#FC4C02" />
                  <p className="text-sm font-semibold" style={{ color: '#111' }}>Paste your result link</p>
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://results.example.com/..."
                  className="w-full text-sm outline-none py-2"
                  style={{ color: '#111', caretColor: '#FC4C02' }}
                  autoFocus
                />
                <div className="h-px mt-2" style={{ background: '#F0F0EE' }} />
                <p className="text-xs mt-2" style={{ color: '#aaa' }}>
                  Works with Webscorer, NYRR, Athlinks, mysamay.in, Sports Timing and more
                </p>
              </div>
              {step === 'error' && (
                <p className="text-sm mb-4 px-1" style={{ color: '#EF4444' }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={!url.trim()}
                className="w-full py-4 rounded-2xl font-semibold text-white text-sm transition-opacity disabled:opacity-40"
                style={{ background: '#FC4C02' }}
              >
                Extract result
              </button>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
              <p className="text-sm" style={{ color: '#888' }}>Reading your result...</p>
            </div>
          )}

          {step === 'preview' && preview && (
            <div>
              <div className="bg-white rounded-3xl p-5 mb-4" style={{ border: '1px solid #F0F0EE' }}>
                <p className="text-xs font-semibold mb-4 tracking-wider uppercase" style={{ color: '#888' }}>
                  Confirm your result
                </p>
                <p className="text-xl font-bold mb-1" style={{ color: '#111' }}>{preview.raceName}</p>
                <p className="text-sm mb-5" style={{ color: '#888' }}>{preview.raceDate}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name', value: preview.runnerName },
                    { label: 'Distance', value: preview.distance },
                    { label: 'Finish time', value: preview.netTime },
                    { label: 'Pace', value: preview.pace ?? '—' },
                    { label: 'Overall', value: preview.overallPosition ?? '—' },
                    { label: 'BIB', value: preview.bibNumber || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl p-3" style={{ background: '#F8F8F7' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>{label}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: '#111' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSave}
                className="w-full py-4 rounded-2xl font-semibold text-white text-sm mb-3"
                style={{ background: '#FC4C02' }}
              >
                Add to passport
              </button>
              <button
                onClick={() => { setStep('input'); setPreview(null) }}
                className="w-full py-3 rounded-2xl text-sm font-medium"
                style={{ color: '#888' }}
              >
                Try a different link
              </button>
            </div>
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
              <p className="text-sm" style={{ color: '#888' }}>Adding to your passport...</p>
            </div>
          )}
        </>
      )}

      {/* ── Manual flow ── */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSave}>
          <div className="bg-white rounded-3xl p-5 mb-4 flex flex-col gap-4" style={{ border: '1px solid #F0F0EE' }}>
            {mf('Race name *', 'raceName', 'e.g. Mumbai Marathon 2025')}
            {mf('Date', 'raceDate', 'YYYY-MM-DD', 'date')}

            {/* Distance selector */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#aaa' }}>
                Distance *
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {DISTANCE_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setManual(m => ({ ...m, distance: opt.value || 'Other' }))}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: manual.distance === (opt.value || 'Other') ? '#111' : '#F8F8F7',
                      color: manual.distance === (opt.value || 'Other') ? 'white' : '#555',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {manual.distance === 'Other' && (
                <input
                  value={manual.distanceCustom}
                  onChange={e => setManual(m => ({ ...m, distanceCustom: e.target.value }))}
                  placeholder="e.g. 8K, 15K, 50K"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ background: '#F8F8F7', color: '#111', border: '1px solid #F0F0EE' }}
                />
              )}
            </div>

            {mf('Finish time *', 'netTime', 'HH:MM:SS or MM:SS')}
            {mf('Pace', 'pace', 'MM:SS /km')}
            {mf('Overall position', 'overallPosition', 'e.g. 42')}
            {mf('BIB number', 'bibNumber')}
            {mf('Category', 'category', 'e.g. M40-44')}
          </div>

          {manualError && (
            <p className="text-sm mb-4 px-1" style={{ color: '#EF4444' }}>{manualError}</p>
          )}

          <button
            type="submit"
            disabled={manualSaving}
            className="w-full py-4 rounded-2xl font-semibold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: '#FC4C02' }}
          >
            {manualSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            Add to passport
          </button>
        </form>
      )}
    </div>
  )
}
