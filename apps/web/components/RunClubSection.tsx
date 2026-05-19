'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Plus, X, Loader2, Users, ExternalLink } from 'lucide-react'

interface ClubResult {
  id: string
  name: string
  city: string | null
  slug: string
}

interface Membership {
  role: 'admin' | 'member'
  status: 'pending' | 'approved'
  club: { id: string; name: string; city: string | null; slug: string }
}

interface Props {
  initialMembership: Membership | null
}

export default function RunClubSection({ initialMembership }: Props) {
  const [membership, setMembership] = useState<Membership | null>(initialMembership)
  const [mode, setMode] = useState<'idle' | 'search' | 'add'>('idle')

  // Search
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ClubResult[]>([])
  const [searching, setSearching] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  // Add new club
  const [clubName, setClubName] = useState('')
  const [clubCity, setClubCity] = useState('')
  const [clubLink, setClubLink] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/clubs/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setSearching(false)
    }, 300)
  }, [query])

  async function joinClub(slug: string) {
    setJoining(slug)
    setError('')
    const res = await fetch(`/api/clubs/${slug}/join`, { method: 'POST' })
    const json = await res.json()
    if (!json.success) { setError(json.error ?? 'Failed to join'); setJoining(null); return }
    // Refetch membership
    const me = await fetch('/api/user/club')
    const meJson = await me.json()
    setMembership(meJson.membership)
    setMode('idle')
    setJoining(null)
  }

  async function createClub() {
    if (!clubName.trim()) { setError('Club name is required'); return }
    setCreating(true)
    setError('')
    const res = await fetch('/api/clubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: clubName, city: clubCity, link: clubLink }),
    })
    const json = await res.json()
    if (!json.success) { setError(json.error ?? 'Failed to create club'); setCreating(false); return }
    const me = await fetch('/api/user/club')
    const meJson = await me.json()
    setMembership(meJson.membership)
    setMode('idle')
    setCreating(false)
  }

  async function leaveClub() {
    await fetch('/api/user/club', { method: 'DELETE' })
    setMembership(null)
  }

  // ── Current membership state ──
  if (membership) {
    const isPending = membership.status === 'pending'
    const isAdmin = membership.role === 'admin'

    return (
      <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#aaa' }}>Run Club</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: '#F8F8F7' }}
            >
              <Users size={15} color="#888" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm leading-tight truncate" style={{ color: '#111' }}>
                {membership.club.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>
                {isPending ? '⏳ Pending approval' : (
                  <>
                    {isAdmin ? 'Admin' : 'Member'}
                    {membership.club.city ? ` · ${membership.club.city}` : ''}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isPending && (
              <a
                href={`/club/${membership.club.slug}`}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#F8F8F7' }}
              >
                <ExternalLink size={13} color="#888" />
              </a>
            )}
            <button
              onClick={leaveClub}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#F8F8F7' }}
              title="Leave club"
            >
              <X size={13} color="#888" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Search mode ──
  if (mode === 'search') {
    return (
      <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#aaa' }}>Find Run Club</p>
          <button onClick={() => { setMode('idle'); setQuery(''); setResults([]) }}>
            <X size={15} color="#aaa" />
          </button>
        </div>

        <div className="relative">
          <Search size={14} color="#bbb" className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by club name…"
            className="w-full rounded-2xl pl-9 pr-4 py-3 text-sm outline-none"
            style={{ background: '#F8F8F7', border: '1px solid #ECECEA', color: '#111' }}
          />
          {searching && <Loader2 size={14} color="#bbb" className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />}
        </div>

        {results.length > 0 && (
          <div className="flex flex-col gap-1">
            {results.map(club => (
              <div key={club.id} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: '#F8F8F7' }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#111' }}>{club.name}</p>
                  {club.city && <p className="text-xs" style={{ color: '#aaa' }}>{club.city}</p>}
                </div>
                <button
                  onClick={() => joinClub(club.slug)}
                  disabled={joining === club.slug}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white disabled:opacity-50"
                  style={{ background: '#111' }}
                >
                  {joining === club.slug ? <Loader2 size={12} className="animate-spin" /> : 'Request'}
                </button>
              </div>
            ))}
          </div>
        )}

        {query.length >= 2 && !searching && results.length === 0 && (
          <p className="text-xs text-center py-2" style={{ color: '#bbb' }}>No clubs found</p>
        )}

        {error && <p className="text-xs px-1" style={{ color: '#EF4444' }}>{error}</p>}

        <button
          onClick={() => { setMode('add'); setError('') }}
          className="text-xs font-medium text-center py-2"
          style={{ color: '#FC4C02' }}
        >
          + Add your run club
        </button>
      </div>
    )
  }

  // ── Add new club mode ──
  if (mode === 'add') {
    return (
      <div className="rounded-3xl p-5 flex flex-col gap-3" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#aaa' }}>Add Run Club</p>
          <button onClick={() => { setMode('search'); setError('') }}>
            <X size={15} color="#aaa" />
          </button>
        </div>

        <input
          autoFocus
          type="text"
          value={clubName}
          onChange={e => setClubName(e.target.value)}
          placeholder="Club name *"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
          style={{ background: '#F8F8F7', border: '1px solid #ECECEA', color: '#111' }}
        />
        <input
          type="text"
          value={clubCity}
          onChange={e => setClubCity(e.target.value)}
          placeholder="City (optional)"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
          style={{ background: '#F8F8F7', border: '1px solid #ECECEA', color: '#111' }}
        />
        <input
          type="url"
          value={clubLink}
          onChange={e => setClubLink(e.target.value)}
          placeholder="Instagram or website link (optional)"
          className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
          style={{ background: '#F8F8F7', border: '1px solid #ECECEA', color: '#111' }}
        />

        {error && <p className="text-xs px-1" style={{ color: '#EF4444' }}>{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={() => { setMode('search'); setError('') }}
            className="flex-1 py-3 rounded-2xl text-sm font-medium"
            style={{ background: '#F8F8F7', color: '#888' }}
          >
            Back
          </button>
          <button
            onClick={createClub}
            disabled={creating}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#111' }}
          >
            {creating ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create Club'}
          </button>
        </div>
      </div>
    )
  }

  // ── Idle — no club ──
  return (
    <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
      <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#aaa' }}>Run Club</p>
      <div className="flex gap-2">
        <button
          onClick={() => setMode('search')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
          style={{ background: '#F8F8F7', color: '#555' }}
        >
          <Search size={13} />
          Find club
        </button>
        <button
          onClick={() => setMode('add')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
          style={{ background: '#F8F8F7', color: '#555' }}
        >
          <Plus size={13} />
          Add club
        </button>
      </div>
    </div>
  )
}
