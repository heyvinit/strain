import type { DbUserRace } from '@/lib/supabase'
import Link from 'next/link'

// ─── Image transform helper ───────────────────────────────────────────────────

/** Use Supabase image transform API to serve a resized thumbnail — much faster */
function cardThumbSrc(url: string): string {
  const base = url.split('?')[0]
  if (base.includes('/storage/v1/object/public/')) {
    return (
      base.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
      '?width=400&resize=cover&quality=80'
    )
  }
  return url
}

// ─── Category gradients ────────────────────────────────────────────────────────

const SPORT_GRADIENTS: Record<string, string> = {
  running:    'linear-gradient(160deg, #0f2027 0%, #203a43 45%, #2c5364 100%)',
  hyrox:      'linear-gradient(160deg, #1a0800 0%, #5c1f00 55%, #8b2e00 100%)',
  triathlon:  'linear-gradient(160deg, #03045e 0%, #0077b6 55%, #00b4d8 100%)',
  ocr:        'linear-gradient(160deg, #0a2010 0%, #1b4332 50%, #2d6a4f 100%)',
  cycling:    'linear-gradient(160deg, #10002b 0%, #3c096c 55%, #5a189a 100%)',
  other:      'linear-gradient(160deg, #1a1a1a 0%, #2a2a2a 100%)',
}

const SPORT_ICONS: Record<string, string> = {
  running:   '🏃',
  hyrox:     '💪',
  triathlon: '🏊',
  ocr:       '🏔',
  cycling:   '🚴',
  other:     '🏅',
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(t: string | null): string {
  if (!t) return ''
  return t.replace(/^0(\d):/, '$1:')
}

function formatDate(d: string | null): string {
  if (!d) return ''
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function RaceCard({ race, href }: { race: DbUserRace; href?: string }) {
  const gradient = SPORT_GRADIENTS[race.sport] ?? SPORT_GRADIENTS.other
  const icon = SPORT_ICONS[race.sport] ?? '🏅'
  const isUpcoming = race.status === 'upcoming'

  const inner = (
    <div
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        aspectRatio: '3/4',
        background: gradient,
      }}
    >
      {/* Race photo — shown when user has uploaded one */}
      {race.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cardThumbSrc(race.photo_url)}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          loading="lazy"
        />
      )}

      {/* Sport icon watermark — only shown when no photo */}
      {!race.photo_url && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            opacity: 0.1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </div>
      )}

      {/* Upcoming tint overlay */}
      {isUpcoming && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(252,76,2,0.12)',
          }}
        />
      )}

      {/* Bottom gradient scrim */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '70%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)',
        }}
      />

      {/* Top badges */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          right: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        {isUpcoming ? (
          <div style={{ background: '#FC4C02', borderRadius: 20, padding: '3px 8px' }}>
            <span style={{ color: 'white', fontSize: 9, fontWeight: 800, letterSpacing: '0.06em' }}>
              UPCOMING
            </span>
          </div>
        ) : (
          <div />
        )}
        {race.is_pb && (
          <div style={{ background: '#FC4C02', borderRadius: 20, padding: '3px 8px' }}>
            <span style={{ color: 'white', fontSize: 9, fontWeight: 800 }}>PB</span>
          </div>
        )}
      </div>

      {/* Bottom content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 13px' }}>
        <p
          style={{
            color: 'white',
            fontWeight: 700,
            fontSize: 13,
            lineHeight: 1.25,
            marginBottom: 5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {race.race_name}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
            {formatDate(race.race_date)}
          </span>
          {race.net_time ? (
            <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>
              {formatTime(race.net_time)}
            </span>
          ) : isUpcoming ? (
            <span style={{ color: 'rgba(252,76,2,0.8)', fontSize: 10, fontWeight: 600 }}>
              Registered
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block active:scale-[0.97] transition-transform duration-75">
        {inner}
      </Link>
    )
  }
  if (race.result_url) {
    return (
      <a href={race.result_url} target="_blank" rel="noopener noreferrer" className="block active:scale-[0.97] transition-transform duration-75">
        {inner}
      </a>
    )
  }
  return inner
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export default function RaceGrid({
  races,
  dashboardLinks = false,
  labelColor,
  addRaceHref,
}: {
  races: DbUserRace[]
  dashboardLinks?: boolean
  labelColor?: string
  addRaceHref?: string
}) {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = races.filter(r => r.status === 'upcoming' && r.race_date && r.race_date >= today)
  const past = races.filter(r => r.status === 'completed')

  const sectionLabel: React.CSSProperties = {
    color: labelColor ?? 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 12,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {upcoming.length > 0 && (
        <section>
          <p style={sectionLabel}>Upcoming</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}
          >
            {upcoming.map(r => (
              <RaceCard
                key={r.id}
                race={r}
                href={dashboardLinks ? `/dashboard/races/${r.id}` : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ ...sectionLabel, marginBottom: 0 }}>Race History</p>
            {addRaceHref && (
              <Link
                href={addRaceHref}
                style={{ color: '#FC4C02', fontSize: 12, fontWeight: 600 }}
              >
                + Add race
              </Link>
            )}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
            }}
          >
            {past.map(r => (
              <RaceCard
                key={r.id}
                race={r}
                href={dashboardLinks ? `/dashboard/races/${r.id}` : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
