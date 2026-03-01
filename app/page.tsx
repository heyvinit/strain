'use server'

import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'
import { Lora } from 'next/font/google'

const lora = Lora({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'] })

export default async function LandingPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #111 0%, #1c1008 50%, #0e0e0e 100%)',
        backgroundImage: "url('/bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
      }}
    >
      {/* Dark overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.52)' }}
      />

      {/* Editorial letter card */}
      <article
        className="relative z-10 w-full max-w-[340px] rounded-[28px] px-7 pt-8 pb-7"
        style={{
          background: 'rgba(255,252,248,0.93)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        {/* Strain logo */}
        <img src="/strain-logo.svg" alt="Strain" className="h-5 w-auto mb-7 opacity-35" />

        {/* Letter body */}
        <div
          className={`${lora.className} text-[15px] leading-[1.8] mb-7`}
          style={{ color: '#333' }}
        >
          <p className="mb-4 font-bold" style={{ color: '#111', fontSize: 16 }}>
            Every finish line has a story.
          </p>

          <p className="mb-4">
            You train for months. Wake up at 4am. Pin on a bib.
            Cross the line. Feel everything.
          </p>

          <p className="mb-4">
            Then the moment disappears — buried in a camera roll,
            lost in the Strava feed, a time you&apos;ll struggle
            to recall next year.
          </p>

          <p className="mb-4">
            <span style={{ color: '#FC4C02', fontStyle: 'italic' }}>Your races deserve more than that.</span>
          </p>

          <p className="mb-5" style={{ color: '#555' }}>
            Strain is your athlete passport. One place where every
            race lives on — marathons, Hyrox, 5Ks at dawn. Your times,
            your personal bests, your countries. All of it, in a card
            you&apos;re proud to share.
          </p>

          <p style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>
            Built by a runner, for runners.
          </p>
        </div>

        {/* CTA + Wax seal */}
        <div className="flex items-center gap-3">
          <form
            action={async () => {
              'use server'
              await signIn('strava', { redirectTo: '/dashboard' })
            }}
            className="flex-1"
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 font-semibold text-white text-sm transition-opacity active:opacity-80"
              style={{ background: '#FC4C02', fontFamily: 'var(--font-grotesk)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden>
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Start your passport
            </button>
          </form>

          {/* Wax seal */}
          <div
            className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white text-xl font-bold select-none"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #d63a20, #8b1a0a)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.15)',
              fontFamily: 'Georgia, serif',
              letterSpacing: '-0.02em',
            }}
            aria-hidden
          >
            S
          </div>
        </div>
      </article>

      {/* Already signed in link */}
      <p className="relative z-10 mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Already have an account?{' '}
        <a href="/login" className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Sign in
        </a>
      </p>
    </main>
  )
}
