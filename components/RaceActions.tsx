'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2, Pencil, ArrowLeft } from 'lucide-react'

// ─── Shared sport/distance config ─────────────────────────────────────────────

const SPORTS = [
  { key: 'running',   label: 'Running',   icon: '🏃' },
  { key: 'hyrox',     label: 'Hyrox',     icon: '🏋️' },
  { key: 'triathlon', label: 'Triathlon', icon: '🏊' },
  { key: 'ocr',       label: 'OCR',       icon: '💪' },
  { key: 'cycling',   label: 'Cycling',   icon: '🚴' },
  { key: 'other',     label: 'Other',     icon: '🏅' },
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
  ocr:       [
    { label: '3K', value: '3K' }, { label: '5K', value: '5K' },
    { label: '8-10K', value: '8-10K' }, { label: '12-15K', value: '12-15K' },
    { label: '20K+', value: '20K+' }, { label: 'Other', value: 'Other' },
  ],
  cycling:   [
    { label: '50K', value: '50K' }, { label: '100K', value: '100K' },
    { label: 'Gran Fondo', value: 'Gran Fondo' }, { label: 'Century', value: 'Century (160km)' },
    { label: 'Other', value: 'Other' },
  ],
  other:     [{ label: 'Other', value: 'Other' }],
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder = '', type = 'text', optional = false }: {
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

// ─── Main component ────────────────────────────────────────────────────────────

export interface RaceActionsProps {
  raceId: string
  status: 'upcoming' | 'completed'
  race?: {
    raceName: string
    raceDate: string | null
    distance: string
    bibNumber: string | null
    country: string | null
    sport: string
  }
}

export default function RaceActions({ raceId, status, race }: RaceActionsProps) {
  const router = useRouter()

  // ── Delete state ─────────────────────────────────────────────────────────────
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ── Edit state (upcoming only) ────────────────────────────────────────────────
  const [editing, setEditing] = useState(false)
  const [editSport, setEditSport] = useState<SportKey>((race?.sport as SportKey) ?? 'running')
  const [form, setForm] = useState({
    raceName: race?.raceName ?? '',
    raceDate: race?.raceDate ?? '',
    distance: race?.distance ?? '10K',
    distanceCustom: '',
    bibNumber: race?.bibNumber ?? '',
    country: race?.country ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Handlers ──────────────────────────────────────────────────────────────────

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/races/${raceId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.raceName.trim()) { setSaveError('Race name is required.'); return }
    const distance = form.distance === 'Other' ? form.distanceCustom : form.distance
    if (!distance) { setSaveError('Please select a distance.'); return }

    setSaving(true)
    setSaveError('')
    const res = await fetch(`/api/races/${raceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        raceName: form.raceName,
        raceDate: form.raceDate,
        sport: editSport,
        distance,
        bibNumber: form.bibNumber,
        country: form.country,
      }),
    })
    const json = await res.json()
    if (!json.success) { setSaveError(json.error ?? 'Failed to save.'); setSaving(false); return }
    router.refresh()
    setEditing(false)
    setSaving(false)
  }

  // ── Delete confirmation ────────────────────────────────────────────────────────

  if (confirming) {
    return (
      <div className="rounded-3xl p-4 flex flex-col gap-3" style={{ background: 'white', border: '1px solid #FFE0D6' }}>
        <p className="text-sm font-semibold" style={{ color: '#111' }}>Remove this race?</p>
        <p className="text-xs" style={{ color: '#888' }}>This can't be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#EF4444' }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Remove
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-5 py-3 rounded-2xl text-sm font-medium"
            style={{ color: '#888', background: '#F8F8F7' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Edit form (upcoming only) ──────────────────────────────────────────────────

  if (editing && status === 'upcoming') {
    const distanceOptions = SPORT_DISTANCES[editSport]
    return (
      <form onSubmit={handleSave}>
        <div className="rounded-3xl p-5 mb-3 flex flex-col gap-4" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
          <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#888' }}>Edit race</p>

          {/* Sport picker */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#aaa' }}>Sport / Event type</label>
            <div className="grid grid-cols-3 gap-2">
              {SPORTS.map(s => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => { setEditSport(s.key); setForm(f => ({ ...f, distance: SPORT_DISTANCES[s.key][0].value, distanceCustom: '' })) }}
                  className="flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-semibold transition-all active:scale-[0.97]"
                  style={{
                    background: editSport === s.key ? '#111' : '#F8F8F7',
                    color: editSport === s.key ? 'white' : '#666',
                    border: `1px solid ${editSport === s.key ? '#111' : '#ECECEA'}`,
                  }}
                >
                  <span className="text-base leading-none">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Race name" value={form.raceName} onChange={v => setForm(f => ({ ...f, raceName: v }))} placeholder="e.g. Mumbai Marathon 2025" />
          <Field label="Race date" value={form.raceDate ?? ''} onChange={v => setForm(f => ({ ...f, raceDate: v }))} type="date" optional />

          {/* Distance picker */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#aaa' }}>
              {editSport === 'hyrox' ? 'Format' : editSport === 'triathlon' ? 'Distance / Format' : 'Distance'}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {distanceOptions.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, distance: d.value }))}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.97]"
                  style={{
                    background: form.distance === d.value ? '#111' : '#F8F8F7',
                    color: form.distance === d.value ? 'white' : '#666',
                    border: `1px solid ${form.distance === d.value ? '#111' : '#ECECEA'}`,
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {form.distance === 'Other' && (
              <input
                value={form.distanceCustom}
                onChange={e => setForm(f => ({ ...f, distanceCustom: e.target.value }))}
                placeholder="e.g. 8K, 15K, 50K"
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ background: '#F8F8F7', color: '#111', border: '1px solid #ECECEA' }}
              />
            )}
          </div>

          <Field label="BIB number" value={form.bibNumber ?? ''} onChange={v => setForm(f => ({ ...f, bibNumber: v }))} placeholder="e.g. 4521" optional />
          <Field label="Country" value={form.country ?? ''} onChange={v => setForm(f => ({ ...f, country: v }))} placeholder="e.g. India, UAE, USA" optional />
        </div>

        {saveError && <p className="text-sm mb-3 px-1" style={{ color: '#EF4444' }}>{saveError}</p>}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="w-12 flex items-center justify-center rounded-2xl active:scale-[0.97] transition-transform"
            style={{ background: 'white', border: '1px solid #F0F0EE' }}
          >
            <ArrowLeft size={15} color="#888" />
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-white text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-transform"
            style={{ background: '#FC4C02' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            Save changes
          </button>
        </div>
      </form>
    )
  }

  // ── Default actions ────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-2">
      {status === 'upcoming' && (
        <button
          onClick={() => setEditing(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium active:scale-[0.98] transition-transform"
          style={{ color: '#111', background: 'white', border: '1px solid #F0F0EE' }}
        >
          <Pencil size={13} />
          Edit race
        </button>
      )}
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium active:scale-[0.98] transition-transform"
        style={{
          color: '#aaa',
          background: 'transparent',
          flex: status === 'upcoming' ? '0 0 auto' : '1 1 auto',
          paddingLeft: status === 'upcoming' ? 16 : undefined,
          paddingRight: status === 'upcoming' ? 16 : undefined,
        }}
      >
        <Trash2 size={13} />
        {status !== 'upcoming' && 'Remove race'}
      </button>
    </div>
  )
}
