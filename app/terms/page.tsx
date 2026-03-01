import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Strain',
  description: 'Terms and conditions for using Strain.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F8F8F7' }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-6 max-w-2xl mx-auto">
        <Link href="/" className="inline-block mb-8">
          <img src="/strain-logo.svg" alt="Strain" className="h-6 w-auto" />
        </Link>
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#111' }}>Terms of Service</h1>
        <p className="text-sm" style={{ color: '#aaa' }}>Last updated: March 2026</p>
      </div>

      {/* Content */}
      <div className="px-5 pb-20 max-w-2xl mx-auto">
        <div
          className="rounded-3xl p-6 flex flex-col gap-8"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <Section title="What Strain is">
            <p>
              Strain (getstrain.app) is an athlete passport app built for runners and multi-sport
              athletes. It lets you log races, track personal bests, and share your race history
              publicly. By using Strain, you agree to these terms.
            </p>
          </Section>

          <Section title="Using the app">
            <ul className="flex flex-col gap-2">
              {[
                'You must have a valid Strava account to sign in.',
                'You are responsible for the accuracy of race data you add manually.',
                'Your public profile (getstrain.app/username) is visible to anyone with the link.',
                'You must not use Strain for any unlawful purpose.',
                'You must not attempt to access other users\' private data.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm" style={{ color: '#444' }}>
                  <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: '#FC4C02' }} />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Your content">
            <p>
              Race data you add to Strain remains yours. By adding it, you give us permission
              to display it on your public profile and use it to calculate your statistics.
              You can delete your races or your entire account at any time.
            </p>
          </Section>

          <Section title="Public profiles">
            <p>
              Your athlete passport at getstrain.app/username is publicly accessible by default.
              Anyone with the link can view your race history, personal bests, and countries.
              There is currently no option to make your profile private — if this is a concern,
              do not use Strain.
            </p>
          </Section>

          <Section title="Strava integration">
            <p>
              Strain connects to Strava to authenticate you and optionally import your race
              activities. By using Strain, you also agree to{' '}
              <a
                href="https://www.strava.com/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 font-medium"
                style={{ color: '#FC4C02' }}
              >
                Strava&apos;s Terms of Service
              </a>
              . We only read data from Strava — we never write to or modify your Strava account.
            </p>
          </Section>

          <Section title="Availability">
            <p>
              Strain is provided as-is. We aim to keep it running reliably but do not guarantee
              uptime or availability. We may update, modify, or discontinue features at any time.
              We are not liable for any loss of data or interruption of service.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              We may update these terms occasionally. If we make significant changes we will
              note the updated date at the top of this page. Continued use of Strain after
              changes means you accept the updated terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms? Email us at{' '}
              <a href="mailto:hello@getstrain.app" className="font-medium underline underline-offset-2" style={{ color: '#FC4C02' }}>
                hello@getstrain.app
              </a>
            </p>
          </Section>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/privacy" className="text-sm" style={{ color: '#aaa' }}>Privacy Policy</Link>
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
