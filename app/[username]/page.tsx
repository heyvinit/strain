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

// ─── Race row ──────────────────────────────────────────────────────────────────

function RaceRow({ race }: { race: DbUserRace }) {
  const { month, day } = formatDate(race.race_date)
  const Inner = (
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
      {race.result_url && <ChevronRight size={14} color="#ccc" />}
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

// ─── Page ──────────────────────────────────────────────────────────────────────

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
  }
}

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
  const past = allRaces.filter(r => r.status === 'completed')
  const stats = computePassportStats(allRaces)

  return (
    <div className="min-h-screen" style={{ background: '#F8F8F7' }}>
      <div className="px-5 pt-14 pb-10 lg:px-12 lg:pt-12">
        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* ── Left col: passport (sticky on desktop) ── */}
          <div className="lg:w-[360px] lg:shrink-0 lg:sticky lg:top-10">
            <PassportCard
              user={user}
              stats={stats}
              username={username}
            />

            {/* CTA */}
            <div className="pb-8 lg:pb-0 text-center">
              <p className="text-xs mb-3" style={{ color: '#aaa' }}>Powered by Strain</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white"
                style={{ background: '#FC4C02' }}
              >
                Create your own passport
              </Link>
            </div>
          </div>

          {/* ── Right col: race history ── */}
          {past.length > 0 && (
            <div className="lg:flex-1 lg:min-w-0">
              <section>
                <h2 className="text-xs font-semibold mb-3 tracking-wider uppercase" style={{ color: '#888' }}>
                  Race History
                </h2>
                <div className="flex flex-col gap-2">
                  {past.map(race => <RaceRow key={race.id} race={race} />)}
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
