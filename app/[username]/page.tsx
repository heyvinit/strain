import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PassportCard, { computePassportStats } from '@/components/PassportCard'
import RaceGrid from '@/components/RaceGrid'
import { qrToSvg } from '@/lib/qr'

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
  const stats = computePassportStats(allRaces)

  const profileUrl = `https://getstrain.app/${username}`
  const qrSvg = await qrToSvg(profileUrl)

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
              <PassportCard user={user} stats={stats} username={username} qrSvg={qrSvg} />
            </div>

            {/* ── Race grid + CTA ── */}
            <div className="lg:flex-1 lg:min-w-0 flex flex-col gap-6">

              {allRaces.length > 0 && (
                <RaceGrid races={allRaces} />
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
