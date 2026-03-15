'use server'

import { signIn } from '@/auth'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#F8F8F7' }}>

      <div className="w-full max-w-sm">
        {/* Sign in card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #F0F0EE' }}>
          {/* Logo */}
          <div className="flex justify-center pb-5 mb-5" style={{ borderBottom: '1px solid #F0F0EE' }}>
            <img src="/strain-logo.svg" alt="Strain" className="h-6 w-auto" />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-2" style={{ color: '#111' }}>
              Welcome to Strain
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
              Sign in to build your athlete passport and track every event.
            </p>
          </div>

          {/* Google (primary) */}
          <form
            action={async () => {
              'use server'
              await signIn('google', { redirectTo: '/dashboard' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-sm mb-3 transition-opacity active:opacity-80"
              style={{ background: '#111', color: 'white' }}
            >
              {/* Google G icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Strava (coming soon) */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-white text-sm opacity-40 cursor-not-allowed"
            style={{ background: '#FC4C02' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Continue with Strava
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.25)', color: 'white' }}
            >
              Soon
            </span>
          </button>
        </div>

        <p className="text-xs mt-6 text-center" style={{ color: '#bbb' }}>
          By signing in you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2">terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline underline-offset-2">privacy policy</Link>.
        </p>
      </div>
    </main>
  )
}
