import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Strain',
  description: 'How Strain collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F8F8F7' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-6 max-w-2xl mx-auto">
        <Link href="/" className="inline-block mb-8">
          <img src="/strain-logo.svg" alt="Strain" className="h-6 w-auto" />
        </Link>
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#111' }}>Privacy Policy</h1>
        <p className="text-sm" style={{ color: '#aaa' }}>Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="px-5 pb-20 max-w-2xl mx-auto">
        <div
          className="rounded-3xl p-6 flex flex-col gap-8"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <Section title="What Strain does">
            <p>
              Strain is an athlete passport app. It lets you log every race you&apos;ve competed
              in, track your personal bests, and share your race history through a public profile.
              We connect to Strava so you can import your race activities automatically.
            </p>
          </Section>

          <Section title="Data we collect">
            <p className="mb-3">When you sign in with Strava, we receive and store:</p>
            <ul className="flex flex-col gap-2">
              {[
                'Your name, profile photo, and Strava username',
                'Your city and country from your Strava profile',
                'Your email address (if available from Strava)',
                'A Strava access token to fetch your race activities on your behalf',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#444' }}>
                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#FC4C02' }} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We also store the race data you manually add or import — race name, date, distance,
              finish time, position, and any other details you choose to enter.
            </p>
          </Section>

          <Section title="How we use your data">
            <ul className="flex flex-col gap-2">
              {[
                'To display your athlete passport and public profile',
                'To calculate your personal bests across distances',
                'To send optional pre-race and post-race email reminders (you can opt out any time in Profile settings)',
                'To identify you when you sign in',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#444' }}>
                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#FC4C02' }} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">
              We do not sell your data. We do not use it for advertising. We do not share it with
              third parties except the services listed below that are necessary to run the app.
            </p>
          </Section>

          <Section title="Third-party services">
            <div className="flex flex-col gap-3">
              {[
                { name: 'Strava', desc: 'Authentication and activity import. Governed by the Strava API Agreement.' },
                { name: 'Supabase', desc: 'Database hosting. Your data is stored securely in their EU/US infrastructure.' },
                { name: 'Resend', desc: 'Transactional emails. Only used if you have an email address on file.' },
                { name: 'Vercel', desc: 'App hosting and serverless functions.' },
              ].map(s => (
                <div key={s.name} className="rounded-2xl p-3.5" style={{ background: '#F8F8F7' }}>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: '#111' }}>{s.name}</p>
                  <p className="text-sm" style={{ color: '#777' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Your Strava data">
            <p>
              We only request the Strava permissions we need: basic read access, your profile,
              and your activities. We read your activities to let you import races — we never
              modify, delete, or write anything to your Strava account.
            </p>
            <p className="mt-3">
              You can revoke Strain&apos;s access to your Strava account at any time from
              your Strava settings at strava.com/settings/apps.
            </p>
          </Section>

          <Section title="Your rights">
            <p className="mb-3">You can at any time:</p>
            <ul className="flex flex-col gap-2">
              {[
                'Opt out of email notifications in your Profile settings',
                'Delete individual races from your passport',
                'Request full deletion of your account and all associated data by emailing us',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#444' }}>
                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#FC4C02' }} />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Data retention">
            <p>
              We retain your data for as long as your account is active. If you request deletion,
              we will remove your account and all associated race data within 30 days.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy or want your data deleted? Email us at{' '}
              <a href="mailto:hello@getstrain.app" className="font-medium underline underline-offset-2" style={{ color: '#FC4C02' }}>
                hello@getstrain.app
              </a>
            </p>
          </Section>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/terms" className="text-sm" style={{ color: '#aaa' }}>Terms of Service</Link>
          <span style={{ color: '#ddd' }}>·</span>
          <Link href="/" className="text-sm" style={{ color: '#aaa' }}>Back to Strain</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold mb-3" style={{ color: '#111' }}>{title}</h2>
      <div className="text-sm leading-relaxed" style={{ color: '#555' }}>
        {children}
      </div>
    </div>
  )
}
