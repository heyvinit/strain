'use server'

import { redirect } from 'next/navigation'
import { auth, signIn } from '@/auth'
import MockPassport from '@/components/MockPassport'

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
      {/* Lighter overlay so the image breathes */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.32)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[360px] rounded-[28px] px-6 pt-7 pb-7 flex flex-col gap-6"
        style={{
          background: 'rgba(253,251,244,0.95)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45), 0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        {/* Strain logo */}
        <img src="/strain-logo.svg" alt="Strain" className="h-5 w-auto opacity-30 self-center" />

        {/* Interactive passport preview */}
        <MockPassport />

        {/* One-liner description */}
        <p className="text-sm leading-relaxed text-center" style={{ color: '#666', fontFamily: 'var(--font-grotesk)' }}>
          Every race you&apos;ve ever run, in one passport. Track your times,
          personal bests, and countries. Then share it with the world.
        </p>

        {/* Single CTA */}
        <form
          action={async () => {
            'use server'
            await signIn('strava', { redirectTo: '/dashboard' })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center rounded-2xl py-4 font-semibold text-white text-sm transition-opacity active:opacity-80"
            style={{ background: '#111', fontFamily: 'var(--font-grotesk)' }}
          >
            Create your Athlete Passport
          </button>
        </form>
      </div>

      {/* Already have account */}
      <p className="relative z-10 mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        Already have an account?{' '}
        <a href="/login" className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Sign in
        </a>
      </p>

      {/* Legal links */}
      <div className="relative z-10 mt-3 flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
        <a href="/privacy" className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Privacy Policy</a>
        <span>·</span>
        <a href="/terms" className="underline underline-offset-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Terms of Service</a>
      </div>
    </main>
  )
}
