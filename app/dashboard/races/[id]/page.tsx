import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import RaceActions from '@/components/RaceActions'

function formatTime(t: string | null): string {
  if (!t) return '—'
  return t.replace(/^0(\d):/, '$1:')
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function distanceLabel(d: string): string {
  const lower = d.toLowerCase()
  if (lower.includes('42')) return 'Marathon'
  if (lower.includes('21')) return 'Half Marathon'
  if (lower.includes('10')) return '10K'
  if (lower.includes('5k') || lower === '5') return '5K'
  return d
}

export default async function RaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const { data: race } = await supabaseAdmin
    .from('user_races')
    .select('*')
    .eq('id', id)
    .single<DbUserRace>()

  if (!race) notFound()

  const { data: owner } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('strava_id', session!.user.stravaId)
    .single()

  const isOwner = owner?.id === race.user_id

  const statRows = [
    { label: 'Distance', value: distanceLabel(race.distance) },
    { label: 'Pace', value: formatTime(race.pace) },
    { label: 'Overall', value: race.overall_position ?? '—' },
    { label: 'Category', value: race.category || '—' },
    { label: 'BIB', value: race.bib_number ?? '—' },
    { label: 'Gun time', value: formatTime(race.gun_time) },
  ].filter(s => s.value !== '—')

  return (
    <div className="px-5 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </Link>
        <h1 className="text-lg font-bold leading-tight truncate" style={{ color: '#111' }}>
          Race Details
        </h1>
      </div>

      {/* Dark race ticket */}
      <div className="rounded-3xl overflow-hidden mb-4" style={{ background: '#111' }}>
        <div className="px-5 pt-5 pb-5">
          {/* Badges */}
          {(() => {
            const SPORT_LABELS: Record<string, string> = {
              hyrox: 'Hyrox', triathlon: 'Triathlon', ocr: 'OCR', cycling: 'Cycling', other: 'Other',
            }
            const sportLabel = SPORT_LABELS[race.sport]
            return (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {sportLabel && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: '#1a1a2a', color: '#818cf8' }}>
                    {sportLabel}
                  </span>
                )}
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  style={{
                    background: race.status === 'completed' ? '#1a2a1a' : '#2a1a0a',
                    color: race.status === 'completed' ? '#4ade80' : '#FC4C02',
                  }}
                >
                  {race.status === 'completed' ? 'Completed' : 'Upcoming'}
                </span>
                {race.is_pb && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: '#2a1a0a', color: '#FC4C02' }}>
                    Personal Best
                  </span>
                )}
              </div>
            )
          })()}

          <p className="text-white font-bold text-xl leading-snug mb-1">{race.race_name}</p>
          <p className="text-sm mb-5" style={{ color: '#666' }}>{formatDate(race.race_date)}</p>

          {race.net_time && (
            <div className="mb-5">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#555' }}>Finish Time</p>
              <p className="text-4xl font-bold text-white tabular-nums">{formatTime(race.net_time)}</p>
            </div>
          )}

          {statRows.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {statRows.map(s => (
                <div key={s.label} className="rounded-2xl p-2.5" style={{ background: '#1a1a1a' }}>
                  <p className="text-[9px] font-bold tracking-widest mb-1 uppercase" style={{ color: '#555' }}>{s.label}</p>
                  <p className="text-xs font-bold text-white truncate">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {race.timing_platform && (
          <div className="px-5 py-2.5" style={{ borderTop: '1px solid #1a1a1a', background: '#0a0a0a' }}>
            <p className="text-[9px] font-mono tracking-wider" style={{ color: '#333' }}>
              PLATFORM · {race.timing_platform.toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="flex flex-col gap-2">
          {/* Stat card — only for completed races with a time */}
          {race.status === 'completed' && race.net_time && (
            <Link
              href={`/dashboard/card?raceId=${race.id}`}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white"
              style={{ background: '#FC4C02' }}
            >
              <Sparkles size={15} />
              Create stat card
            </Link>
          )}

          {/* External result */}
          {race.result_url && (
            <a
              href={race.result_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
              style={{ color: '#888', background: 'white', border: '1px solid #F0F0EE' }}
            >
              <ExternalLink size={13} />
              View original result
            </a>
          )}

          <RaceActions
            raceId={race.id}
            status={race.status}
            race={{
              raceName: race.race_name,
              raceDate: race.race_date,
              distance: race.distance,
              bibNumber: race.bib_number,
              country: race.country,
              sport: race.sport,
            }}
          />
        </div>
      )}

      {/* Public view: just the external link */}
      {!isOwner && race.result_url && (
        <a
          href={race.result_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
          style={{ color: '#888' }}
        >
          <ExternalLink size={13} />
          View original result
        </a>
      )}
    </div>
  )
}
