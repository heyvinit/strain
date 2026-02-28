'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import type { DbUserRace } from '@/lib/supabase'

const DISTANCE_OPTIONS = [
  'Marathon (42.2km)',
  'Half Marathon (21.1km)',
  '10K',
  '5K',
  'Other',
]

interface Props {
  race: DbUserRace
}

export default function RaceActions({ race }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'view' | 'edit' | 'confirmDelete'>('view')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Edit form state — seeded from race
  const [form, setForm] = useState({
    raceName: race.race_name,
    raceDate: race.race_date ?? '',
    distance: race.distance,
    netTime: race.net_time ?? '',
    gunTime: race.gun_time ?? '',
    pace: race.pace ?? '',
    bibNumber: race.bib_number ?? '',
    overallPosition: race.overall_position ?? '',
    category: race.category ?? '',
    status: race.status,
  })

  const field = (label: string, key: keyof typeof form, placeholder = '') => (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: '#aaa' }}>
        {label}
      </label>
      {key === 'status' ? (
        <select
          value={form.status}
          onChange={e => setForm(f => ({ ...f, status: e.target.value as 'upcoming' | 'completed' }))}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: '#F8F8F7', color: '#111', border: '1px solid #E8E8E6' }}
        >
          <option value="completed">Completed</option>
          <option value="upcoming">Upcoming</option>
        </select>
      ) : (
        <input
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: '#F8F8F7', color: '#111', border: '1px solid #E8E8E6' }}
        />
      )}
    </div>
  )

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/races/${race.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!json.success) { setError(json.error ?? 'Failed to save'); setSaving(false); return }
      router.refresh()
      setMode('view')
    } catch {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await fetch(`/api/races/${race.id}`, { method: 'DELETE' })
      router.push('/dashboard')
    } catch {
      setError('Failed to delete')
      setDeleting(false)
    }
  }

  // ── Edit form ──────────────────────────────────────────────────────────────
  if (mode === 'edit') {
    return (
      <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-bold text-base" style={{ color: '#111' }}>Edit race</p>
          <button onClick={() => setMode('view')} className="p-1.5 rounded-full" style={{ background: '#F8F8F7' }}>
            <X size={14} color="#888" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {field('Race name', 'raceName')}
          {field('Date', 'raceDate', 'YYYY-MM-DD')}
          {field('Distance', 'distance', 'e.g. 10K')}
          {field('Finish time', 'netTime', 'HH:MM:SS')}
          {field('Pace', 'pace', 'MM:SS /km')}
          {field('Overall position', 'overallPosition')}
          {field('BIB', 'bibNumber')}
          {field('Category', 'category')}
          {field('Status', 'status')}
        </div>

        {error && <p className="text-sm mt-3" style={{ color: '#EF4444' }}>{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#FC4C02' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save changes
          </button>
          <button
            onClick={() => setMode('view')}
            className="px-4 py-3 rounded-2xl text-sm font-medium"
            style={{ color: '#888', background: '#F8F8F7' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Delete confirmation ────────────────────────────────────────────────────
  if (mode === 'confirmDelete') {
    return (
      <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #FFE0D6' }}>
        <p className="font-semibold text-sm mb-1" style={{ color: '#111' }}>Delete this race?</p>
        <p className="text-xs mb-5" style={{ color: '#888' }}>This can't be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#EF4444' }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
          <button
            onClick={() => setMode('view')}
            className="px-4 py-3 rounded-2xl text-sm font-medium"
            style={{ color: '#888', background: '#F8F8F7' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Action buttons ─────────────────────────────────────────────────────────
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setMode('edit')}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold"
        style={{ background: '#F0F0EE', color: '#111' }}
      >
        <Pencil size={14} />
        Edit race
      </button>
      <button
        onClick={() => setMode('confirmDelete')}
        className="w-12 flex items-center justify-center rounded-2xl"
        style={{ background: '#FFF0F0', color: '#EF4444' }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  )
}
