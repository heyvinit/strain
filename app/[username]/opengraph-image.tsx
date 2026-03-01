import { ImageResponse } from 'next/og'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUser, DbUserRace } from '@/lib/supabase'
import { computePassportStats } from '@/components/PassportCard'

export const runtime = 'edge'
export const alt = 'Athlete Passport'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatTime(t: string | null | undefined): string {
  if (!t) return '—'
  return t.replace(/^0(\d):/, '$1:')
}

function issuedDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    .toUpperCase().replace(' ', '')
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const { data: user } = await supabaseAdmin
    .from('users').select('*').eq('username', username).single<DbUser>()

  const { data: races } = user
    ? await supabaseAdmin.from('user_races').select('*').eq('user_id', user.id)
    : { data: null }

  const allRaces: DbUserRace[] = races ?? []
  const stats = computePassportStats(allRaces)

  const pbRows = [
    { label: 'Marathon', value: stats.pbs.fm },
    { label: 'Half Marathon', value: stats.pbs.hm },
    { label: '10K', value: stats.pbs['10k'] },
    { label: '5K', value: stats.pbs['5k'] },
  ].filter(pb => pb.value)

  // MRZ line
  const user42 = username.toUpperCase().replace(/_/g, '<')
  const prefix = `STRAIN<<${user42}`
  const suffix = `ISSUED${issuedDate()}<<GETSTRAIN.APP`
  const padLen = Math.max(0, 60 - prefix.length - suffix.length)
  const mrz = `${prefix}${'<'.repeat(padLen)}${suffix}`

  const displayName = user?.name ?? username

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at 18% 0%, #232323 0%, #0e0e0e 55%, #161616 100%)',
        }}
      >
        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '52px 64px 40px' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 44 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#FC4C02', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                Athlete Passport
              </span>
              <span style={{ color: '#3a3a3a', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                STRAIN · GETSTRAIN.APP
              </span>
            </div>
            <span style={{ color: '#1e1e1e', fontSize: 22, fontWeight: 700, letterSpacing: '0.06em' }}>STRAIN</span>
          </div>

          {/* Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 44 }}>
            {user?.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                width={88}
                height={88}
                style={{ borderRadius: 20, objectFit: 'cover', border: '2px solid #222' }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: 'white', fontSize: 36, fontWeight: 700, lineHeight: 1.1 }}>{displayName}</span>
              <span style={{ color: '#444', fontSize: 16, marginTop: 6 }}>@{username}</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 36 }}>
            {[
              { label: 'COMPLETED', value: String(stats.completed) },
              { label: 'UPCOMING',  value: String(stats.upcoming)  },
              { label: 'COUNTRIES', value: String(stats.countries.length) },
            ].map(s => (
              <div
                key={s.label}
                style={{
                  display: 'flex', flexDirection: 'column',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 16, padding: '18px 28px',
                }}
              >
                <span style={{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 10 }}>
                  {s.label}
                </span>
                <span style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* PBs */}
          {pbRows.length > 0 && (
            <div
              style={{
                display: 'flex', flexDirection: 'column',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 16, overflow: 'hidden',
                maxWidth: 480,
              }}
            >
              <span style={{ color: '#444', fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '16px 20px 10px' }}>
                PERSONAL BESTS
              </span>
              {pbRows.map((pb, i) => (
                <div
                  key={pb.label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '11px 20px',
                    borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  <span style={{ color: '#555', fontSize: 14 }}>{pb.label}</span>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>{formatTime(pb.value)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', height: 8 }} />
            </div>
          )}
        </div>

        {/* MRZ strip */}
        <div
          style={{
            display: 'flex',
            padding: '14px 64px',
            background: 'rgba(0,0,0,0.5)',
            borderTop: '1px solid #1e1e1e',
          }}
        >
          <span style={{ color: '#222', fontSize: 11, letterSpacing: '0.14em', fontFamily: 'monospace' }}>
            {mrz}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
