import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUserRace, DbUser } from '@/lib/supabase'
import Link from 'next/link'
import ShareButton from '@/components/ShareButton'
import PassportCard, { computePassportStats } from '@/components/PassportCard'
import EmailPrompt from '@/components/EmailPrompt'
import PassportDownload from '@/components/PassportDownload'
import RaceGrid from '@/components/RaceGrid'
import { qrToSvg } from '@/lib/qr'

function firstName(name: string | null | undefined): string {
  if (!name) return 'Athlete'
  return name.split(' ')[0]
}

export default async function DashboardPage() {
  const session = await auth()

  const { data: user } = await supabaseAdmin
    .from('users').select('*')
    .eq('id', session!.user.userId)
    .single<DbUser>()

  const { data: races } = await supabaseAdmin
    .from('user_races').select('*')
    .eq('user_id', user?.id ?? '')
    .order('race_date', { ascending: false })

  const allRaces: DbUserRace[] = races ?? []
  const stats = computePassportStats(allRaces)

  const profileUrl = `https://getstrain.app/${session!.user.username}`
  const qrSvg = await qrToSvg(profileUrl)

  const isNewUser = allRaces.length === 0
  const hasPast = allRaces.some(r => r.status === 'completed')

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

          {user && !user.email && (
            <EmailPrompt userId={user.id} />
          )}

          {user && (
            <>
              <PassportCard
                user={user}
                stats={stats}
                username={session!.user.username}
                isOwner
                qrSvg={qrSvg}
              />
              <div className="flex justify-end -mt-4 mb-6">
                <PassportDownload />
              </div>
            </>
          )}
        </div>

        {/* ── Right col: race grid ── */}
        <div className="lg:flex-1 lg:min-w-0">

          {/* Onboarding — shown only when user has no races yet */}
          {isNewUser && (
            <div className="rounded-3xl p-5 mb-5" style={{ background: 'white', border: '1px solid #EBEBEA' }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: '#bbb' }}>
                Welcome to Strain
              </p>
              <p className="text-xl font-bold leading-snug mb-3" style={{ color: '#111' }}>
                Build your athlete passport
              </p>
              <p className="text-sm mb-4" style={{ color: '#888' }}>
                Add your race results and Strain automatically tracks your PBs, builds your passport, and creates shareable stat cards.
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { step: '1', text: 'Paste a race result link or enter manually' },
                  { step: '2', text: 'Your passport updates with PBs & stats' },
                  { step: '3', text: 'Share your passport or create a stat card' },
                ].map(({ step, text }) => (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: '#F0F0EE', color: '#555' }}
                    >
                      {step}
                    </div>
                    <p className="text-sm" style={{ color: '#555' }}>{text}</p>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/add"
                className="mt-4 block text-center py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: '#111' }}
              >
                Add your first race →
              </Link>
            </div>
          )}

          {/* Race grid */}
          {!isNewUser && (
            <RaceGrid
              races={allRaces}
              dashboardLinks
              labelColor="#888"
              addRaceHref="/dashboard/add"
            />
          )}

          {/* Has upcoming only — nudge to add a completed result */}
          {!isNewUser && !hasPast && (
            <Link href="/dashboard/add" className="block mt-4 active:scale-[0.98] transition-transform duration-75">
              <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px dashed #E0E0E0' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FFF5F2' }}>
                  <span style={{ color: '#FC4C02', fontSize: 18, fontWeight: 700 }}>+</span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111' }}>Add a completed race</p>
                  <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>Paste a result link to get started</p>
                </div>
              </div>
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}
