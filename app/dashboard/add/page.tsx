'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Link2, PenLine, Loader2, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// ─── Types ─────────────────────────────────────────────────────────────────────

type TopTab = 'upcoming' | 'past'
type PastMethod = null | 'url' | 'manual'
type UrlStep = 'input' | 'loading' | 'preview' | 'saving' | 'error'

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

const SPORTS = [
  { key: 'running',   label: 'Running',    icon: '🏃' },
  { key: 'hyrox',     label: 'Hyrox',      icon: '🏋️' },
  { key: 'triathlon', label: 'Triathlon',  icon: '🏊' },
  { key: 'ocr',       label: 'OCR',        icon: '💪' },
  { key: 'cycling',   label: 'Cycling',    icon: '🚴' },
  { key: 'other',     label: 'Other',      icon: '🏅' },
] as const

type SportKey = typeof SPORTS[number]['key']

const SPORT_DISTANCES: Record<SportKey, { label: string; value: string }[]> = {
  running:   [
    { label: 'Marathon', value: 'Marathon (42.2km)' },
    { label: 'Half', value: 'Half Marathon (21.1km)' },
    { label: '10K', value: '10K' },
    { label: '5K', value: '5K' },
    { label: 'Other', value: 'Other' },
  ],
  hyrox:     [
    { label: 'Singles', value: 'Singles' },
    { label: 'Doubles', value: 'Doubles' },
    { label: 'Pro', value: 'Pro' },
    { label: 'Relay', value: 'Relay' },
    { label: 'Other', value: 'Other' },
  ],
  triathlon: [
    { label: 'Full / Ironman', value: 'Full Ironman (140.6mi)' },
    { label: '70.3 / Half', value: 'Ironman 70.3' },
    { label: 'Olympic', value: 'Olympic Distance' },
    { label: 'Sprint', value: 'Sprint' },
    { label: 'Other', value: 'Other' },
  ],
  ocr: [
    { label: '3K', value: '3K' },
    { label: '5K', value: '5K' },
    { label: '8-10K', value: '8-10K' },
    { label: '12-15K', value: '12-15K' },
    { label: '20K+', value: '20K+' },
    { label: 'Other', value: 'Other' },
  ],
  cycling: [
    { label: '50K', value: '50K' },
    { label: '100K', value: '100K' },
    { label: 'Gran Fondo', value: 'Gran Fondo' },
    { label: 'Century', value: 'Century (160km)' },
    { label: 'Other', value: 'Other' },
  ],
  other: [
    { label: 'Other', value: 'Other' },
  ],
}

// ─── Shared input helpers ──────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder = '', type = 'text', optional = false,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; optional?: boolean
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#aaa' }}>
        {label}
        {optional && <span className="normal-case font-normal tracking-normal" style={{ color: '#ccc' }}>optional</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
        style={{ background: '#F8F8F7', color: '#111', border: '1px solid #ECECEA' }}
      />
    </div>
  )
}

function SportPicker({ value, onChange }: { value: SportKey; onChange: (s: SportKey) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#aaa' }}>
        Sport / Event type
      </label>
      <div className="grid grid-cols-3 gap-2">
        {SPORTS.map(s => (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key)}
            className="flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-semibold transition-all"
            style={{
              background: value === s.key ? '#111' : '#F8F8F7',
              color: value === s.key ? 'white' : '#666',
              border: '1px solid',
              borderColor: value === s.key ? '#111' : '#ECECEA',
            }}
          >
            <span className="text-base leading-none">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function DistancePicker({ sport, value, customValue, onSelect, onCustom }: {
  sport: SportKey; value: string; customValue: string
  onSelect: (v: string) => void; onCustom: (v: string) => void
}) {
  const options = SPORT_DISTANCES[sport]
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#aaa' }}>
        {sport === 'hyrox' ? 'Format' : sport === 'triathlon' ? 'Distance / Format' : 'Distance'}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {options.map(d => (
          <button
            key={d.value}
            type="button"
            onClick={() => onSelect(d.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: value === d.value ? '#111' : '#F8F8F7',
              color: value === d.value ? 'white' : '#666',
              border: '1px solid',
              borderColor: value === d.value ? '#111' : '#ECECEA',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>
      {value === 'Other' && (
        <input
          value={customValue}
          onChange={e => onCustom(e.target.value)}
          placeholder="e.g. 8K, 15K, 50K"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
          style={{ background: '#F8F8F7', color: '#111', border: '1px solid #ECECEA' }}
        />
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AddRacePage() {
  const router = useRouter()
  const [tab, setTab] = useState<TopTab>('upcoming')
  const [done, setDone] = useState(false)

  // ── Upcoming form state ──────────────────────────────────────────────────────
  const [upcomingSport, setUpcomingSport] = useState<SportKey>('running')
  const [upcoming, setUpcoming] = useState({
    raceName: '', raceDate: '', distance: '10K', distanceCustom: '', bibNumber: '', country: '',
  })
  const [upcomingSaving, setUpcomingSaving] = useState(false)
  const [upcomingError, setUpcomingError] = useState('')

  // ── Past: method selection ───────────────────────────────────────────────────
  const [pastMethod, setPastMethod] = useState<PastMethod>(null)

  // ── Past: URL flow ───────────────────────────────────────────────────────────
  const [urlStep, setUrlStep] = useState<UrlStep>('input')
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<RacePreview | null>(null)
  const [urlError, setUrlError] = useState('')

  // ── Past: Manual form ────────────────────────────────────────────────────────
  const [manualSport, setManualSport] = useState<SportKey>('running')
  const [manual, setManual] = useState({
    raceName: '', raceDate: '', distance: '10K', distanceCustom: '',
    netTime: '', pace: '', overallPosition: '', bibNumber: '', category: '', country: '',
  })
  const [manualSaving, setManualSaving] = useState(false)
  const [manualError, setManualError] = useState('')

  // ── Helpers ──────────────────────────────────────────────────────────────────

  async function saveToPassport(payload: Record<string, unknown>) {
    const res = await fetch('/api/passport/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.json()
  }

  // ── Upcoming save ────────────────────────────────────────────────────────────

  async function handleUpcomingSave(e: React.FormEvent) {
    e.preventDefault()
    if (!upcoming.raceName.trim()) { setUpcomingError('Race name is required.'); return }
    const distance = upcoming.distance === 'Other' ? upcoming.distanceCustom : upcoming.distance
    if (!distance) { setUpcomingError('Please select a distance.'); return }

    setUpcomingSaving(true)
    setUpcomingError('')
    try {
      const json = await saveToPassport({
        raceName: upcoming.raceName,
        raceDate: upcoming.raceDate,
        sport: upcomingSport,
        distance,
        bibNumber: upcoming.bibNumber,
        country: upcoming.country,
        status: 'upcoming',
        runnerName: '',
      })
      if (!json.success) { setUpcomingError(json.error ?? 'Failed to save.'); setUpcomingSaving(false); return }
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setUpcomingError('Something went wrong.')
      setUpcomingSaving(false)
    }
  }

  // ── Past: URL flow ────────────────────────────────────────────────────────────

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setUrlStep('loading')
    setUrlError('')
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!json.success) { setUrlError(json.error ?? 'Could not extract race data.'); setUrlStep('error'); return }
      setPreview(json.data)
      setUrlStep('preview')
    } catch {
      setUrlError('Something went wrong. Please try again.')
      setUrlStep('error')
    }
  }

  async function handleUrlSave() {
    if (!preview) return
    setUrlStep('saving')
    try {
      const json = await saveToPassport({ ...preview, result_url: url })
      if (!json.success) { setUrlError(json.error ?? 'Failed to save.'); setUrlStep('error'); return }
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setUrlError('Failed to save.')
      setUrlStep('error')
    }
  }

  // ── Past: Manual save ─────────────────────────────────────────────────────────

  async function handleManualSave(e: React.FormEvent) {
    e.preventDefault()
    if (!manual.raceName.trim()) { setManualError('Race name is required.'); return }
    if (!manual.netTime.trim()) { setManualError('Finish time is required.'); return }
    const distance = manual.distance === 'Other' ? manual.distanceCustom : manual.distance
    if (!distance) { setManualError('Please select a distance.'); return }

    setManualSaving(true)
    setManualError('')
    try {
      const json = await saveToPassport({
        raceName: manual.raceName, raceDate: manual.raceDate,
        sport: manualSport, distance,
        netTime: manual.netTime, pace: manual.pace,
        overallPosition: manual.overallPosition, bibNumber: manual.bibNumber,
        category: manual.category, country: manual.country,
        platform: 'Manual', runnerName: '', status: 'completed',
      })
      if (!json.success) { setManualError(json.error ?? 'Failed to save.'); setManualSaving(false); return }
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setManualError('Something went wrong.')
      setManualSaving(false)
    }
  }

  // ── Done ──────────────────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5">
        <CheckCircle2 size={44} style={{ color: '#FC4C02' }} />
        <p className="font-bold text-xl" style={{ color: '#111' }}>
          {tab === 'upcoming' ? 'Race added!' : 'Added to your passport!'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#111' }}>Add a race</h1>
      </div>

      {/* Top toggle */}
      <div
        className="flex rounded-2xl p-1 mb-6"
        style={{ background: 'white', border: '1px solid #F0F0EE' }}
      >
        {(['upcoming', 'past'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setPastMethod(null) }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: tab === t ? (t === 'upcoming' ? '#FC4C02' : '#111') : 'transparent',
              color: tab === t ? 'white' : '#888',
            }}
          >
            {t === 'upcoming' ? 'Upcoming race' : 'Past race'}
          </button>
        ))}
      </div>

      {/* ── UPCOMING ──────────────────────────────────────────────────────────── */}
      {tab === 'upcoming' && (
        <form onSubmit={handleUpcomingSave}>
          <div
            className="rounded-3xl p-5 mb-4 flex flex-col gap-4"
            style={{ background: 'white', border: '1px solid #F0F0EE' }}
          >
            <SportPicker
              value={upcomingSport}
              onChange={s => { setUpcomingSport(s); setUpcoming(u => ({ ...u, distance: SPORT_DISTANCES[s][0].value, distanceCustom: '' })) }}
            />
            <Field
              label="Race name"
              value={upcoming.raceName}
              onChange={v => setUpcoming(s => ({ ...s, raceName: v }))}
              placeholder="e.g. Mumbai Marathon 2025"
            />
            <Field
              label="Race date"
              value={upcoming.raceDate}
              onChange={v => setUpcoming(s => ({ ...s, raceDate: v }))}
              type="date"
              optional
            />
            <DistancePicker
              sport={upcomingSport}
              value={upcoming.distance}
              customValue={upcoming.distanceCustom}
              onSelect={v => setUpcoming(s => ({ ...s, distance: v }))}
              onCustom={v => setUpcoming(s => ({ ...s, distanceCustom: v }))}
            />
            <Field
              label="BIB number"
              value={upcoming.bibNumber}
              onChange={v => setUpcoming(s => ({ ...s, bibNumber: v }))}
              placeholder="e.g. 4521"
              optional
            />
            <Field
              label="Country"
              value={upcoming.country}
              onChange={v => setUpcoming(s => ({ ...s, country: v }))}
              placeholder="e.g. India, UAE, USA"
              optional
            />
          </div>

          {upcomingError && (
            <p className="text-sm mb-4 px-1" style={{ color: '#EF4444' }}>{upcomingError}</p>
          )}

          <button
            type="submit"
            disabled={upcomingSaving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: '#FC4C02' }}
          >
            {upcomingSaving ? <Loader2 size={16} className="animate-spin" /> : null}
            Add to passport
          </button>
        </form>
      )}

      {/* ── PAST ──────────────────────────────────────────────────────────────── */}
      {tab === 'past' && (
        <div className="flex flex-col gap-3">
          {/* Method selector — shown when nothing picked yet */}
          {!pastMethod && (
            <>
              {[
                {
                  key: 'url' as const,
                  icon: <Link2 size={18} style={{ color: '#FC4C02' }} />,
                  title: 'Paste result link',
                  sub: 'Webscorer, NYRR, Athlinks, mysamay.in and more',
                },
                {
                  key: 'manual' as const,
                  icon: <PenLine size={18} style={{ color: '#FC4C02' }} />,
                  title: 'Enter manually',
                  sub: 'Type in your race name, time and details',
                },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setPastMethod(opt.key)}
                  className="flex items-center gap-4 rounded-3xl px-5 py-4 text-left"
                  style={{ background: 'white', border: '1px solid #F0F0EE' }}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: '#FFF5F2' }}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#111' }}>{opt.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#aaa' }}>{opt.sub}</p>
                  </div>
                  <ChevronRight size={16} color="#ccc" />
                </button>
              ))}
            </>
          )}

          {/* ── URL flow ── */}
          {pastMethod === 'url' && (
            <>
              {(urlStep === 'input' || urlStep === 'error') && (
                <form onSubmit={handleScrape}>
                  <div className="rounded-3xl p-5 mb-4" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Link2 size={14} style={{ color: '#FC4C02' }} />
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
                      Works with Webscorer, NYRR, Athlinks, mysamay.in and more
                    </p>
                  </div>
                  {urlStep === 'error' && (
                    <p className="text-sm mb-4 px-1" style={{ color: '#EF4444' }}>{urlError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPastMethod(null)}
                      className="w-12 flex items-center justify-center rounded-2xl"
                      style={{ background: 'white', border: '1px solid #F0F0EE' }}
                    >
                      <ArrowLeft size={15} color="#888" />
                    </button>
                    <button
                      type="submit"
                      disabled={!url.trim()}
                      className="flex-1 py-4 rounded-2xl font-semibold text-white text-sm disabled:opacity-40"
                      style={{ background: '#FC4C02' }}
                    >
                      Extract result
                    </button>
                  </div>
                </form>
              )}

              {urlStep === 'loading' && (
                <div className="flex flex-col items-center py-24 gap-4">
                  <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
                  <p className="text-sm" style={{ color: '#888' }}>Reading your result...</p>
                </div>
              )}

              {urlStep === 'preview' && preview && (
                <div>
                  <div className="rounded-3xl p-5 mb-4" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
                    <p className="text-xs font-semibold mb-4 tracking-wider uppercase" style={{ color: '#888' }}>
                      Confirm your result
                    </p>
                    <p className="text-xl font-bold mb-1" style={{ color: '#111' }}>{preview.raceName}</p>
                    <p className="text-sm mb-5" style={{ color: '#888' }}>{preview.raceDate}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Distance', value: preview.distance },
                        { label: 'Finish time', value: preview.netTime },
                        { label: 'Pace', value: preview.pace ?? '—' },
                        { label: 'Overall', value: preview.overallPosition ?? '—' },
                      ].map(({ label, value }) => (
                        <div key={label} className="rounded-2xl p-3" style={{ background: '#F8F8F7' }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#aaa' }}>{label}</p>
                          <p className="text-sm font-semibold truncate" style={{ color: '#111' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleUrlSave}
                    className="w-full py-4 rounded-2xl font-semibold text-white text-sm mb-3"
                    style={{ background: '#FC4C02' }}
                  >
                    Add to passport
                  </button>
                  <button
                    onClick={() => { setUrlStep('input'); setPreview(null) }}
                    className="w-full py-3 rounded-2xl text-sm font-medium"
                    style={{ color: '#888' }}
                  >
                    Try a different link
                  </button>
                </div>
              )}

              {urlStep === 'saving' && (
                <div className="flex flex-col items-center py-24 gap-4">
                  <Loader2 size={28} className="animate-spin" style={{ color: '#FC4C02' }} />
                  <p className="text-sm" style={{ color: '#888' }}>Adding to your passport...</p>
                </div>
              )}
            </>
          )}

          {/* ── Manual flow ── */}
          {pastMethod === 'manual' && (
            <form onSubmit={handleManualSave}>
              <div className="rounded-3xl p-5 mb-4 flex flex-col gap-4" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
                <SportPicker
                  value={manualSport}
                  onChange={s => { setManualSport(s); setManual(m => ({ ...m, distance: SPORT_DISTANCES[s][0].value, distanceCustom: '' })) }}
                />
                <Field
                  label="Race / Event name"
                  value={manual.raceName}
                  onChange={v => setManual(s => ({ ...s, raceName: v }))}
                  placeholder="e.g. Hyrox Dubai 2025"
                />
                <Field
                  label="Date"
                  value={manual.raceDate}
                  onChange={v => setManual(s => ({ ...s, raceDate: v }))}
                  type="date"
                  optional
                />
                <DistancePicker
                  sport={manualSport}
                  value={manual.distance}
                  customValue={manual.distanceCustom}
                  onSelect={v => setManual(s => ({ ...s, distance: v }))}
                  onCustom={v => setManual(s => ({ ...s, distanceCustom: v }))}
                />
                <Field
                  label="Finish time"
                  value={manual.netTime}
                  onChange={v => setManual(s => ({ ...s, netTime: v }))}
                  placeholder="HH:MM:SS"
                />
                <Field label="Pace" value={manual.pace} onChange={v => setManual(s => ({ ...s, pace: v }))} placeholder="MM:SS /km" optional />
                <Field label="Overall position" value={manual.overallPosition} onChange={v => setManual(s => ({ ...s, overallPosition: v }))} placeholder="e.g. 42" optional />
                <Field label="BIB" value={manual.bibNumber} onChange={v => setManual(s => ({ ...s, bibNumber: v }))} optional />
                <Field label="Category" value={manual.category} onChange={v => setManual(s => ({ ...s, category: v }))} placeholder="e.g. M40-44" optional />
                <Field label="Country" value={manual.country} onChange={v => setManual(s => ({ ...s, country: v }))} placeholder="e.g. India, UAE, USA" optional />
              </div>

              {manualError && (
                <p className="text-sm mb-4 px-1" style={{ color: '#EF4444' }}>{manualError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPastMethod(null)}
                  className="w-12 flex items-center justify-center rounded-2xl"
                  style={{ background: 'white', border: '1px solid #F0F0EE' }}
                >
                  <ArrowLeft size={15} color="#888" />
                </button>
                <button
                  type="submit"
                  disabled={manualSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-semibold disabled:opacity-50"
                  style={{ background: '#FC4C02' }}
                >
                  {manualSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                  Add to passport
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
