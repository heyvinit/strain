import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import ShareButton from '@/components/ShareButton'
import PassportCard, { computePassportStats } from '@/components/PassportCard'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SPORT_LABELS: Record<string, string> = {
  running: '', hyrox: 'Hyrox', triathlon: 'Triathlon',
  ocr: 'OCR', cycling: 'Cycling', other: '',
}

function distanceLabel(d: string): string {
  const lower = d.toLowerCase()
  if (lower.includes('42') || lower === 'fm') return 'Marathon'
  if (lower.includes('21') || lower === 'hm') return 'Half Marathon'
  if (lower.includes('10')) return '10K'
  if (lower.includes('5k') || lower === '5') return '5K'
  return d
}

function sportDistanceLabel(sport: string | null | undefined, distance: string): string {
  const label = distanceLabel(distance)
  const sportName = SPORT_LABELS[sport ?? 'running']
  if (!sportName) return label
  return `${sportName} · ${label}`
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
  if (!name) return 'Athlete'
  return name.split(' ')[0]
}

// ─── Race rows ─────────────────────────────────────────────────────────────────

function RaceRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <Link href={`/dashboard/races/${race.id}`}>
      <div className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5" style={{ border: '1px solid #F0F0EE' }}>
        <div className="flex flex-col items-center w-9 shrink-0">
          <span className="text-[10px] font-semibold" style={{ color: '#aaa' }}>{month}</span>
          <span className="text-xl font-bold leading-tight" style={{ color: '#111' }}>{day}</span>
        </div>
        <div className="w-px self-stretch" style={{ background: '#F0F0EE' }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: '#111' }}>{race.race_name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#888' }}>{sportDistanceLabel(race.sport, race.distance)}</p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-sm font-bold" style={{ color: '#111' }}>{formatTime(race.net_time)}</span>
          {race.is_pb && (
            <span className="text-[10px] font-bold mt-0.5" style={{ color: '#FC4C02' }}>PB</span>
          )}
        </div>
        <ChevronRight size={14} color="#ccc" />
      </div>
    </Link>
  )
}

function UpcomingRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <Link href={`/dashboard/races/${race.id}`}>
      <div className="flex items-center gap-4 rounded-2xl px-4 py-3.5" style={{ background: '#FFF5F2', border: '1px solid #FFE0D6' }}>
        <div className="flex flex-col items-center w-9 shrink-0">
          <span className="text-[10px] font-semibold" style={{ color: '#FC4C02' }}>{month}</span>
          <span className="text-xl font-bold leading-tight" style={{ color: '#FC4C02' }}>{day}</span>
        </div>
        <div className="w-px self-stretch" style={{ background: '#FFE0D6' }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: '#111' }}>{race.race_name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#FC4C02' }}>Upcoming · {sportDistanceLabel(race.sport, race.distance)}</p>
        </div>
        <ChevronRight size={14} color="#FC4C02" />
      </div>
    </Link>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth()

  const { data: user } = await supabaseAdmin
    .from('users').select('*')
    .eq('strava_id', session!.user.stravaId)
    .single<DbUser>()

  const { data: races } = await supabaseAdmin
    .from('user_races').select('*')
    .eq('user_id', user?.id ?? '')
    .order('race_date', { ascending: false })

  const allRaces: DbUserRace[] = races ?? []
  const today = new Date().toISOString().split('T')[0]
  const upcoming = allRaces.filter(r => r.status === 'upcoming' && r.race_date && r.race_date >= today)
  const past = allRaces.filter(r => r.status === 'completed')
  const stats = computePassportStats(allRaces)

  return (
    <div className="px-5 pt-14 pb-10 lg:px-12 lg:pt-12">
      <div className="lg:flex lg:gap-10 lg:items-start">

        {/* ── Left col: header + passport (sticky on desktop) ── */}
        <div className="lg:w-[360px] lg:shrink-0 lg:sticky lg:top-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm" style={{ color: '#888' }}>Hello,</p>
              <h1 className="text-3xl font-bold leading-tight" style={{ color: '#111' }}>
                {firstName(user?.name)}
              </h1>
            </div>
            <ShareButton username={session!.user.username} />
          </div>

          {user && (
            <PassportCard
              user={user}
              stats={stats}
              username={session!.user.username}
            />
          )}
        </div>

        {/* ── Right col: upcoming + race history ── */}
        <div className="lg:flex-1 lg:min-w-0">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="mb-5">
              <h2 className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: '#888' }}>Upcoming</h2>
              <div className="flex flex-col gap-2">
                {upcoming.map(r => <UpcomingRow key={r.id} race={r} />)}
              </div>
            </section>
          )}

          {/* Race history */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#888' }}>Race History</h2>
              {past.length > 0 && (
                <Link href="/dashboard/add" className="text-xs font-semibold" style={{ color: '#FC4C02' }}>+ Add race</Link>
              )}
            </div>

            {past.length > 0 ? (
              <div className="flex flex-col gap-2">
                {past.map(race => <RaceRow key={race.id} race={race} />)}
              </div>
            ) : (
              <Link href="/dashboard/add" className="block">
                <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px dashed #E0E0E0' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FFF5F2' }}>
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

      </div>
    </div>
  )
}
