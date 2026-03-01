import type { DbUser, DbUserRace } from '@/lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(t: string | null): string {
  if (!t) return '—'
  return t.replace(/^0(\d):/, '$1:')
}

function issuedDate(): string {
  const now = new Date()
  return now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase().replace(' ', '')   // "MAR2026"
}

// Country name → flag emoji via ISO 3166-1 alpha-2
const COUNTRY_MAP: Record<string, string> = {
  // South Asia
  'india': 'IN', 'in': 'IN',
  'nepal': 'NP', 'np': 'NP',
  'sri lanka': 'LK', 'lk': 'LK',
  'pakistan': 'PK', 'pk': 'PK',
  'bangladesh': 'BD', 'bd': 'BD',
  // GCC / Middle East
  'uae': 'AE', 'ae': 'AE', 'united arab emirates': 'AE', 'dubai': 'AE', 'abu dhabi': 'AE',
  'saudi arabia': 'SA', 'sa': 'SA', 'ksa': 'SA',
  'qatar': 'QA', 'qa': 'QA',
  'bahrain': 'BH', 'bh': 'BH',
  'oman': 'OM', 'om': 'OM',
  'kuwait': 'KW', 'kw': 'KW',
  // Asia-Pacific
  'australia': 'AU', 'au': 'AU',
  'new zealand': 'NZ', 'nz': 'NZ',
  'singapore': 'SG', 'sg': 'SG',
  'malaysia': 'MY', 'my': 'MY',
  'thailand': 'TH', 'th': 'TH',
  'indonesia': 'ID', 'id': 'ID',
  'philippines': 'PH', 'ph': 'PH',
  'vietnam': 'VN', 'vn': 'VN',
  'hong kong': 'HK', 'hk': 'HK',
  'china': 'CN', 'cn': 'CN',
  'japan': 'JP', 'jp': 'JP',
  'south korea': 'KR', 'kr': 'KR', 'korea': 'KR',
  'taiwan': 'TW', 'tw': 'TW',
  // Europe
  'uk': 'GB', 'gb': 'GB', 'united kingdom': 'GB', 'england': 'GB', 'britain': 'GB',
  'germany': 'DE', 'de': 'DE',
  'france': 'FR', 'fr': 'FR',
  'spain': 'ES', 'es': 'ES',
  'italy': 'IT', 'it': 'IT',
  'switzerland': 'CH', 'ch': 'CH',
  'austria': 'AT', 'at': 'AT',
  'netherlands': 'NL', 'nl': 'NL', 'holland': 'NL',
  'belgium': 'BE', 'be': 'BE',
  'sweden': 'SE', 'se': 'SE',
  'norway': 'NO', 'no': 'NO',
  'denmark': 'DK', 'dk': 'DK',
  'finland': 'FI', 'fi': 'FI',
  'portugal': 'PT', 'pt': 'PT',
  'greece': 'GR', 'gr': 'GR',
  'ireland': 'IE', 'ie': 'IE',
  'czech republic': 'CZ', 'cz': 'CZ', 'czechia': 'CZ',
  'poland': 'PL', 'pl': 'PL',
  // Americas
  'usa': 'US', 'us': 'US', 'united states': 'US', 'america': 'US',
  'canada': 'CA', 'ca': 'CA',
  'brazil': 'BR', 'br': 'BR',
  'mexico': 'MX', 'mx': 'MX',
  'argentina': 'AR', 'ar': 'AR',
  // Africa
  'south africa': 'ZA', 'za': 'ZA',
  'kenya': 'KE', 'ke': 'KE',
  'ethiopia': 'ET', 'et': 'ET',
  'egypt': 'EG', 'eg': 'EG',
}

function isoToFlag(iso: string): string {
  return iso.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

function countryToFlag(country: string): string | null {
  const iso = COUNTRY_MAP[country.toLowerCase().trim()]
  return iso ? isoToFlag(iso) : null
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

export interface PassportStats {
  completed: number
  upcoming: number
  countries: string[]   // unique country names with flag
  pbs: { fm?: string; hm?: string; '10k'?: string; '5k'?: string }
}

function distanceCategory(d: string): string {
  const lower = d.toLowerCase()
  if (lower.includes('42') || (lower.includes('marathon') && !lower.includes('half'))) return 'fm'
  if (lower.includes('21') || lower.includes('half')) return 'hm'
  if (lower.includes('10')) return '10k'
  if (lower.includes('5')) return '5k'
  return 'other'
}

function timeToSecs(t: string | null): number {
  if (!t) return Infinity
  const parts = t.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return Infinity
}

export function computePassportStats(races: DbUserRace[]): PassportStats {
  const completed = races.filter(r => r.status === 'completed')
  const upcoming = races.filter(r => r.status === 'upcoming')
  const running = completed.filter(r => !r.sport || r.sport === 'running')

  // Unique countries (from all races)
  const countrySet = new Set<string>()
  for (const r of races) {
    if (r.country?.trim()) countrySet.add(r.country.trim())
  }

  // PBs for running only
  const best: Record<string, number> = {}
  const bestTime: Record<string, string> = {}
  for (const r of running) {
    if (!r.net_time) continue
    const cat = distanceCategory(r.distance)
    const secs = timeToSecs(r.net_time)
    if (!best[cat] || secs < best[cat]) {
      best[cat] = secs
      bestTime[cat] = r.net_time
    }
  }

  return {
    completed: completed.length,
    upcoming: upcoming.length,
    countries: [...countrySet],
    pbs: {
      fm: bestTime['fm'],
      hm: bestTime['hm'],
      '10k': bestTime['10k'],
      '5k': bestTime['5k'],
    },
  }
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PassportCard({
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

  // Country flags
  const flags = stats.countries
    .map(c => ({ country: c, flag: countryToFlag(c) }))
    .filter(f => f.flag !== null) as { country: string; flag: string }[]
  const extraFlags = flags.length > 5 ? flags.length - 5 : 0
  const visibleFlags = flags.slice(0, 5)

  // MRZ — single full-width line
  const user42 = username.toUpperCase().replace(/_/g, '<')
  const date7 = issuedDate()                               // "MAR2026"
  const prefix = `STRAIN<<${user42}`
  const suffix = `ISSUED${date7}<<GETSTRAIN.APP`
  const padLen = Math.max(0, 50 - prefix.length - suffix.length)
  const mrz = `${prefix}${'<'.repeat(padLen)}${suffix}`

  return (
    <div
      className="rounded-3xl overflow-hidden mb-6 w-full mx-auto"
      style={{
        maxWidth: 360,
        background: 'radial-gradient(ellipse at 18% 0%, #232323 0%, #0e0e0e 55%, #161616 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)',
      }}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: '#FC4C02' }}>
              Athlete Passport
            </p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: '#444' }}>
              STRAIN · GETSTRAIN.APP
            </p>
          </div>
          <img src="/strain-logo.svg" alt="Strain" className="h-5 w-auto opacity-20" style={{ filter: 'invert(1)' }} />
        </div>

        {/* Identity */}
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

        {/* Stats: Completed | Upcoming | Countries */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: 'COMPLETED', value: String(stats.completed) },
            { label: 'UPCOMING', value: String(stats.upcoming) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: '#555' }}>{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}

          {/* Countries box with stacked flags */}
          <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-bold tracking-widest mb-1.5" style={{ color: '#555' }}>COUNTRIES</p>
            {visibleFlags.length > 0 ? (
              <div className="flex items-center" style={{ gap: 0 }}>
                {visibleFlags.map((f, i) => (
                  <div
                    key={f.country}
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 22, height: 22,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1.5px solid #0e0e0e',
                      marginLeft: i > 0 ? -5 : 0,
                      fontSize: 13,
                      lineHeight: 1,
                      zIndex: visibleFlags.length - i,
                      position: 'relative',
                    }}
                  >
                    {f.flag}
                  </div>
                ))}
                {extraFlags > 0 && (
                  <div
                    className="flex items-center justify-center rounded-full text-[8px] font-bold"
                    style={{
                      width: 22, height: 22,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1.5px solid #0e0e0e',
                      marginLeft: -5,
                      color: '#666',
                      position: 'relative',
                      zIndex: 0,
                    }}
                  >
                    +{extraFlags}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-bold text-white">0</p>
            )}
          </div>
        </div>

        {/* PBs */}
        {pbRows.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-bold tracking-widest px-3 pt-3 pb-2" style={{ color: '#555' }}>PERSONAL BESTS</p>
            {pbRows.map((pb, i) => (
              <div key={pb.label}>
                {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />}
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs" style={{ color: '#666' }}>{pb.label}</span>
                  <span className="text-xs font-bold text-white">{formatTime(pb.value ?? null)}</span>
                </div>
              </div>
            ))}
            <div className="pb-1" />
          </div>
        )}
      </div>

      {/* MRZ — single full-width line */}
      <div className="px-5 py-3 overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid #1e1e1e' }}>
        <p
          className="font-mono text-[9px] tracking-[0.12em] whitespace-nowrap overflow-hidden"
          style={{ color: '#2d2d2d' }}
        >
          {mrz}
        </p>
      </div>
    </div>
  )
}
