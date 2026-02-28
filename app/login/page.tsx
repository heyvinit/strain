'use server'

import { signIn } from '@/auth'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: '#F8F8F7' }}>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo */}
        <img src="/strain-logo.svg" alt="Strain" className="h-7 w-auto mb-3" />

        {/* Tagline */}
        <p className="text-sm mb-16" style={{ color: '#888' }}>
          Your running passport
        </p>

        {/* Sign in card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm" style={{ border: '1px solid #F0F0EE' }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#111' }}>
            Welcome to Strain
          </h1>
          <p className="text-sm mb-6" style={{ color: '#888' }}>
            Sign in to build your runner passport and track every race.
          </p>

          <form
            action={async () => {
              'use server'
              await signIn('strava', { redirectTo: '/dashboard' })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-semibold text-white text-sm transition-opacity active:opacity-80"
              style={{ background: '#FC4C02' }}
            >
              {/* Strava flame icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
              </svg>
              Continue with Strava
            </button>
          </form>
        </div>

        <p className="text-xs mt-6 text-center" style={{ color: '#bbb' }}>
          By signing in you agree to our terms of service.
        </p>
      </div>
    </main>
  )
}
