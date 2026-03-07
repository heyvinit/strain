import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'
import PassportCard, { computePassportStats } from '@/components/PassportCard'

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── Race rows — dark theme ────────────────────────────────────────────────────

function UpcomingRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  return (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3.5" style={{ background: 'rgba(18,6,2,0.75)', border: '1px solid rgba(252,76,2,0.35)', backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col items-center w-9 shrink-0">
        <span className="text-[10px] font-semibold" style={{ color: '#FC4C02' }}>{month}</span>
        <span className="text-xl font-bold leading-tight" style={{ color: '#FC4C02' }}>{day}</span>
      </div>
      <div className="w-px self-stretch" style={{ background: 'rgba(252,76,2,0.25)' }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-white">{race.race_name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#FC4C02' }}>Upcoming · {sportDistanceLabel(race.sport, race.distance)}</p>
      </div>
    </div>
  )
}

function RaceRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  const Inner = (
    <div className="flex items-center gap-4 rounded-2xl px-4 py-3.5" style={{ background: 'rgba(12,12,12,0.75)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col items-center w-9 shrink-0">
        <span className="text-[10px] font-semibold" style={{ color: '#666' }}>{month}</span>
        <span className="text-xl font-bold leading-tight text-white">{day}</span>
      </div>
      <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.1)' }} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-white">{race.race_name}</p>
        <p className="text-xs mt-0.5" style={{ color: '#666' }}>{sportDistanceLabel(race.sport, race.distance)}</p>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-sm font-bold text-white">{formatTime(race.net_time)}</span>
        {race.is_pb && (
          <span className="text-[10px] font-bold mt-0.5" style={{ color: '#FC4C02' }}>PB</span>
        )}
      </div>
      {race.result_url && <ChevronRight size={14} color="#555" />}
    </div>
  )

  if (race.result_url) {
    return (
      <a href={race.result_url} target="_blank" rel="noopener noreferrer" className="block active:scale-[0.98] transition-transform duration-75">
        {Inner}
      </a>
    )
  }
  return Inner
}

// ─── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name')
    .eq('username', username)
    .single<DbUser>()

  if (!user) return { title: 'Athlete Passport — Strain' }
  return {
    title: `${user.name} — Athlete Passport`,
    description: `${user.name}'s athlete passport on Strain. Race history, personal bests, and stats.`,
    twitter: {
      card: 'summary_large_image',
      title: `${user.name} — Athlete Passport`,
      description: `${user.name}'s athlete passport on Strain.`,
    },
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function PublicPassportPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('username', username)
    .single<DbUser>()

  if (!user) notFound()

  const { data: races } = await supabaseAdmin
    .from('user_races')
    .select('*')
    .eq('user_id', user.id)
    .order('race_date', { ascending: false })

  const allRaces: DbUserRace[] = races ?? []
  const today = new Date().toISOString().split('T')[0]
  const upcoming = allRaces.filter(r => r.status === 'upcoming' && r.race_date && r.race_date >= today)
  const past = allRaces.filter(r => r.status === 'completed')
  const stats = computePassportStats(allRaces)

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.55)' }} />

      {/* Content */}
      <div className="relative z-10 px-5 pt-10 pb-16 flex flex-col items-center lg:pt-14">
        <div className="w-full max-w-[420px] lg:max-w-5xl">
          <div className="lg:flex lg:gap-10 lg:items-start">

            {/* ── Passport card ── */}
            <div className="lg:w-[360px] lg:shrink-0 lg:sticky lg:top-10 mb-6 lg:mb-0">
              <PassportCard user={user} stats={stats} username={username} />
            </div>

            {/* ── Race list + CTA ── */}
            <div className="lg:flex-1 lg:min-w-0 flex flex-col gap-5">

              {upcoming.length > 0 && (
                <section>
                  <h2 className="text-[11px] font-semibold mb-3 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Upcoming
                  </h2>
                  <div className="flex flex-col gap-2">
                    {upcoming.map(r => <UpcomingRow key={r.id} race={r} />)}
                  </div>
                </section>
              )}

              {past.length > 0 && (
                <section>
                  <h2 className="text-[11px] font-semibold mb-3 tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Race History
                  </h2>
                  <div className="flex flex-col gap-2">
                    {past.map(race => <RaceRow key={race.id} race={race} />)}
                  </div>
                </section>
              )}

              {/* CTA */}
              <div className="pt-2 text-center">
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.2)' }}>Powered by Strain</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-[0.98] transition-transform duration-75"
                  style={{ background: '#FC4C02' }}
                >
                  Create your own passport
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
