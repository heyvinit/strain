import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight, Share2 } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function distanceLabel(d: string): string {
  const lower = d.toLowerCase()
  if (lower.includes('42') || lower === 'fm') return 'Marathon'
  if (lower.includes('21') || lower === 'hm') return 'Half Marathon'
  if (lower.includes('10')) return '10K'
  if (lower.includes('5k') || lower === '5') return '5K'
  return d
}

function distanceCategory(d: string): 'fm' | 'hm' | '10k' | '5k' | 'other' {
  const lower = d.toLowerCase()
  if (lower.includes('42')) return 'fm'
  if (lower.includes('21')) return 'hm'
  if (lower.includes('10')) return '10k'
  if (lower.includes('5')) return '5k'
  return 'other'
}

function distanceToKm(d: string): number {
  const m = d.match(/(\d+\.?\d*)\s*(k|km)/i)
  if (m) return parseFloat(m[1])
  if (distanceCategory(d) === 'fm') return 42.2
  if (distanceCategory(d) === 'hm') return 21.1
  if (distanceCategory(d) === '10k') return 10
  if (distanceCategory(d) === '5k') return 5
  return 0
}

function timeToSecs(t: string | null): number {
  if (!t) return Infinity
  const parts = t.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return Infinity
}

function formatTime(t: string | null): string {
  if (!t) return '—'
  return t.replace(/^0(\d):/, '$1:')
}

function formatDate(d: string | null): { month: string; day: string } {
  if (!d) return { month: '—', day: '—' }
  const date = new Date(d + 'T00:00:00')
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(date.getDate()),
  }
}

function firstName(name: string | null | undefined): string {
  if (!name) return 'Runner'
  return name.split(' ')[0]
}

function issuedDate(): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}

// ─── Passport stats ───────────────────────────────────────────────────────────

interface PassportStats {
  totalRaces: number
  totalKm: number
  pbs: { fm?: string; hm?: string; '10k'?: string; '5k'?: string }
}

function computeStats(races: DbUserRace[]): PassportStats {
  const completed = races.filter(r => r.status === 'completed')

  const totalKm = completed.reduce((sum, r) => sum + distanceToKm(r.distance), 0)

  // Best time per category
  const best: Record<string, number> = {}
  const bestTime: Record<string, string> = {}
  for (const r of completed) {
    if (!r.net_time) continue
    const cat = distanceCategory(r.distance)
    const secs = timeToSecs(r.net_time)
    if (!best[cat] || secs < best[cat]) {
      best[cat] = secs
      bestTime[cat] = r.net_time
    }
  }

  return {
    totalRaces: completed.length,
    totalKm: Math.round(totalKm * 10) / 10,
    pbs: {
      fm: bestTime['fm'],
      hm: bestTime['hm'],
      '10k': bestTime['10k'],
      '5k': bestTime['5k'],
    },
  }
}

// ─── Passport Card ────────────────────────────────────────────────────────────

function PassportCard({
  user,
  stats,
  username,
}: {
  user: DbUser
  stats: PassportStats
  username: string
}) {
  const pbRows = [
    { label: 'Marathon', value: stats.pbs.fm },
    { label: 'Half Marathon', value: stats.pbs.hm },
    { label: '10K', value: stats.pbs['10k'] },
    { label: '5K', value: stats.pbs['5k'] },
  ].filter(pb => pb.value)

  const mrz = `STRAIN<<${username.toUpperCase().replace(/_/g, '<').padEnd(28, '<')}\nISSUED${issuedDate().replace(' ', '').padEnd(10, '<')}<<<<<GETSTRAIN.APP`

  return (
    <div className="rounded-3xl overflow-hidden mb-6" style={{ background: '#111' }}>
      {/* Top section */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: '#FC4C02' }}>
              Runner Passport
            </p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: '#444' }}>
              STRAIN · GETSTRAIN.APP
            </p>
          </div>
          <img src="/strain-logo.svg" alt="Strain" className="h-5 w-auto opacity-20" style={{ filter: 'invert(1)' }} />
        </div>

        {/* Runner identity */}
        <div className="flex items-center gap-3 mb-5">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.name ?? ''}
              className="w-12 h-12 rounded-2xl object-cover"
              style={{ border: '2px solid #222' }}
            />
          )}
          <div>
            <p className="font-bold text-white text-lg leading-tight">{user.name}</p>
            <p className="text-xs" style={{ color: '#555' }}>@{username}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'RACES', value: String(stats.totalRaces) },
            { label: 'DISTANCE', value: `${stats.totalKm} km` },
            { label: 'ACTIVE YRS', value: '2026' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3" style={{ background: '#1a1a1a' }}>
              <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: '#555' }}>{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* PBs */}
        {pbRows.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: '#1a1a1a' }}>
            <p className="text-[9px] font-bold tracking-widest mb-2.5" style={{ color: '#555' }}>PERSONAL BESTS</p>
            <div className="flex flex-col gap-1.5">
              {pbRows.map(pb => (
                <div key={pb.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#666' }}>{pb.label}</span>
                  <div className="flex-1 mx-3 border-b border-dashed" style={{ borderColor: '#2a2a2a' }} />
                  <span className="text-xs font-bold text-white">{formatTime(pb.value ?? null)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MRZ strip — passport machine-readable zone */}
      <div className="px-5 py-3" style={{ background: '#0a0a0a', borderTop: '1px solid #1a1a1a' }}>
        <p className="font-mono text-[9px] leading-relaxed tracking-wider" style={{ color: '#2a2a2a' }}>
          {mrz.split('\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>
      </div>
    </div>
  )
}

// ─── Race row ─────────────────────────────────────────────────────────────────

function RaceRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5" style={{ border: '1px solid #F0F0EE' }}>
      <div className="flex flex-col items-center w-9 shrink-0">
        <span className="text-[10px] font-semibold" style={{ color: '#aaa' }}>{month}</span>
        <span className="text-xl font-bold leading-tight" style={{ color: '#111' }}>{day}</span>
      </div>
      <div className="w-px self-stretch" style={{ background: '#F0F0EE' }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: '#111' }}>{race.race_name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#888' }}>{distanceLabel(race.distance)}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-bold" style={{ color: '#111' }}>{formatTime(race.net_time)}</span>
        {race.is_pb && (
          <span className="text-[10px] font-bold mt-0.5" style={{ color: '#FC4C02' }}>PB</span>
        )}
      </div>
      <ChevronRight size={14} color="#ccc" />
    </div>
  )
}

// ─── Upcoming race ────────────────────────────────────────────────────────────

function UpcomingRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3.5" style={{ background: '#FFF5F2', border: '1px solid #FFE0D6' }}>
      <div className="flex flex-col items-center w-9 shrink-0">
        <span className="text-[10px] font-semibold" style={{ color: '#FC4C02' }}>{month}</span>
        <span className="text-xl font-bold leading-tight" style={{ color: '#FC4C02' }}>{day}</span>
      </div>
      <div className="w-px self-stretch" style={{ background: '#FFE0D6' }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: '#111' }}>{race.race_name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#FC4C02' }}>Upcoming · {race.distance}</p>
      </div>
      <ChevronRight size={14} color="#FC4C02" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth()

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('strava_id', session!.user.stravaId)
    .single<DbUser>()

  const { data: races } = await supabaseAdmin
    .from('user_races')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .order('race_date', { ascending: false })

  const allRaces: DbUserRace[] = races ?? []
  const today = new Date().toISOString().split('T')[0]
  const upcoming = allRaces.filter(r => r.status === 'upcoming' && r.race_date && r.race_date >= today)
  const past = allRaces.filter(r => r.status === 'completed')
  const stats = computeStats(allRaces)

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm" style={{ color: '#888' }}>Hello,</p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: '#111' }}>
            {firstName(user?.name)}
          </h1>
        </div>
        <Link
          href={`/${session!.user.username}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold"
          style={{ background: '#F0F0EE', color: '#555' }}
        >
          <Share2 size={12} />
          Share
        </Link>
      </div>

      {/* Passport card — always visible */}
      {user && (
        <PassportCard
          user={user}
          stats={stats}
          username={session!.user.username}
        />
      )}

      {/* Upcoming races */}
      {upcoming.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: '#888' }}>
            Upcoming
          </h2>
          <div className="flex flex-col gap-2">
            {upcoming.map(r => <UpcomingRow key={r.id} race={r} />)}
          </div>
        </section>
      )}

      {/* Race history */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#888' }}>
            Race History
          </h2>
          {past.length > 0 && (
            <Link href="/dashboard/add" className="text-xs font-semibold" style={{ color: '#FC4C02' }}>
              + Add race
            </Link>
          )}
        </div>

        {past.length > 0 ? (
          <div className="flex flex-col gap-2">
            {past.map(race => <RaceRow key={race.id} race={race} />)}
          </div>
        ) : (
          <Link href="/dashboard/add" className="block">
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'white', border: '1px dashed #E0E0E0' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#FFF5F2' }}
              >
                <span style={{ color: '#FC4C02', fontSize: 18, fontWeight: 700 }}>+</span>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#111' }}>Add your first race</p>
                <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>Paste a result link to get started</p>
              </div>
            </div>
          </Link>
        )}
      </section>
    </div>
  )
}
