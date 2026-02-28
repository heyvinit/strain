import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, ChevronRight, MapPin } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function distanceLabel(d: string): string {
  const lower = d.toLowerCase()
  if (lower.includes('42') || lower === 'fm') return 'Marathon'
  if (lower.includes('21') || lower === 'hm') return 'Half Marathon'
  if (lower.includes('10')) return '10K'
  if (lower.includes('5')) return '5K'
  return d
}

function formatTime(t: string | null): string {
  if (!t) return '—'
  // Strip leading zero from hours: 01:45:22 → 1:45:22
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

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Link href="/dashboard/add" className="block">
      <div
        className="rounded-3xl p-6 flex flex-col items-center text-center"
        style={{ background: '#111', minHeight: 140 }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
          style={{ background: '#FC4C02' }}
        >
          <Plus size={20} color="white" />
        </div>
        <p className="font-semibold text-white text-sm">Add your first race</p>
        <p className="text-xs mt-1" style={{ color: '#666' }}>
          Paste a result link to add it to your passport
        </p>
      </div>
    </Link>
  )
}

// ─── Upcoming race card ───────────────────────────────────────────────────────

function UpcomingCard({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <div className="rounded-3xl p-5" style={{ background: '#111' }}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#FC4C02', color: 'white' }}>
            Upcoming · {month} {day}
          </span>
        </div>
      </div>
      <p className="font-bold text-white text-lg leading-tight">{race.race_name}</p>
      <div className="flex items-center gap-1.5 mt-2">
        {race.city && (
          <div className="flex items-center gap-1">
            <MapPin size={11} color="#666" />
            <span className="text-xs" style={{ color: '#666' }}>{race.city}</span>
          </div>
        )}
        {race.city && <span style={{ color: '#444' }}>·</span>}
        <span className="text-xs" style={{ color: '#666' }}>{distanceLabel(race.distance)}</span>
      </div>
    </div>
  )
}

// ─── Past race row ────────────────────────────────────────────────────────────

function RaceRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5" style={{ border: '1px solid #F0F0EE' }}>
      {/* Date */}
      <div className="flex flex-col items-center w-9 shrink-0">
        <span className="text-[10px] font-semibold" style={{ color: '#aaa' }}>{month}</span>
        <span className="text-xl font-bold leading-tight" style={{ color: '#111' }}>{day}</span>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch" style={{ background: '#F0F0EE' }} />

      {/* Race info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: '#111' }}>{race.race_name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#888' }}>{distanceLabel(race.distance)}</p>
      </div>

      {/* Time + PB badge */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth()
  const username = session!.user.username

  // Get user record
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('strava_id', session!.user.stravaId)
    .single<DbUser>()

  // Get all races
  const { data: races } = await supabaseAdmin
    .from('user_races')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .order('race_date', { ascending: false })

  const allRaces: DbUserRace[] = races ?? []
  const today = new Date().toISOString().split('T')[0]

  const upcoming = allRaces
    .filter(r => r.status === 'upcoming' && r.race_date && r.race_date >= today)
    .sort((a, b) => (a.race_date ?? '').localeCompare(b.race_date ?? ''))

  const past = allRaces.filter(r => r.status === 'completed')

  return (
    <div className="px-5 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm" style={{ color: '#888' }}>Hello,</p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: '#111' }}>
            {firstName(user?.name)}
          </h1>
        </div>
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.name ?? ''}
            className="w-11 h-11 rounded-full object-cover"
            style={{ border: '2px solid #F0F0EE' }}
          />
        )}
      </div>

      {/* Upcoming */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: '#888' }}>
          Next Race
        </h2>
        {upcoming.length > 0 ? (
          <UpcomingCard race={upcoming[0]} />
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Past races */}
      {past.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#888' }}>
              Race History
            </h2>
            <span className="text-xs font-semibold" style={{ color: '#FC4C02' }}>
              {past.length} races
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {past.map(race => (
              <RaceRow key={race.id} race={race} />
            ))}
          </div>
        </section>
      )}

      {past.length === 0 && upcoming.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: '#888' }}>
            Race History
          </h2>
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'white', border: '1px solid #F0F0EE' }}
          >
            <p className="text-sm" style={{ color: '#888' }}>No completed races yet.</p>
            <Link
              href="/dashboard/add"
              className="text-sm font-semibold mt-1 inline-block"
              style={{ color: '#FC4C02' }}
            >
              Add a past race →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
