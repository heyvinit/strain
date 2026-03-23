import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import PassportCard, { computePassportStats } from '@/components/PassportCard'
import RaceGrid from '@/components/RaceGrid'
import FloatingShare from '@/components/FloatingShare'
import { qrToSvg } from '@/lib/qr'
import { ArrowLeft } from 'lucide-react'

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

export default async function PublicPassportPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { username } = await params
  const { from } = await searchParams
  const fromDashboard = from === 'dashboard'

  const { data: user } = await supabaseAdmin
    .from('users').select('*').eq('username', username).single<DbUser>()

  if (!user) notFound()

  const [{ data: races }, qrSvg, { data: clubMember }] = await Promise.all([
    supabaseAdmin.from('user_races').select('*').eq('user_id', user.id).order('race_date', { ascending: false }),
    qrToSvg(`https://getstrain.app/${username}`),
    supabaseAdmin.from('run_club_members').select('run_clubs(name, slug)').eq('user_id', user.id).eq('status', 'approved').single(),
  ])

  const allRaces: DbUserRace[] = races ?? []
  const stats = computePassportStats(allRaces)
  const runClub = clubMember ? (clubMember.run_clubs as any) : null

  return (
    <main
      className="min-h-screen flex flex-col items-center px-5 py-10 relative overflow-x-hidden"
      style={{
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Lighter overlay — same as landing page */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.32)' }} />

      <FloatingShare username={username} />

      {/* Back to dashboard — only shown when navigating from dashboard */}
      {fromDashboard && (
        <div className="fixed top-5 left-5 z-50">
          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <ArrowLeft size={18} color="white" />
          </Link>
        </div>
      )}

      {/* Cream card — same as landing page */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-[28px] px-5 pt-7 pb-8 flex flex-col gap-6 lg:max-w-5xl lg:px-10 lg:pt-10 lg:pb-10"
        style={{
          background: 'rgba(253,251,244,0.95)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div className="lg:flex lg:gap-10 lg:items-start">

          {/* ── Passport card ── */}
          <div className="lg:w-[360px] lg:shrink-0 lg:sticky lg:top-10">
            <PassportCard user={user} stats={stats} username={username} qrSvg={qrSvg} runClub={runClub} />
          </div>

          {/* ── Race grid + CTA ── */}
          <div className="lg:flex-1 lg:min-w-0 flex flex-col gap-6">

            {allRaces.length > 0 && (
              <RaceGrid races={allRaces} publicUsername={username} labelColor="#888" />
            )}

            {/* CTA */}
            <div className="pt-2 text-center">
              <p className="text-xs mb-3" style={{ color: 'rgba(0,0,0,0.2)' }}>Powered by Strain</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white active:scale-[0.98] transition-transform duration-75"
                style={{ background: '#111' }}
              >
                Create your own passport
              </Link>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
