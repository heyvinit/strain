import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Race Tips & Guides — Strain',
  description: 'Training tips, race guides, and resources for endurance athletes.',
}

const POSTS = [
  {
    slug: 'how-to-negative-split',
    title: 'How to negative split a marathon',
    subtitle: 'Run the second half faster than the first — and actually enjoy it.',
    tag: 'Race strategy',
    coming: true,
  },
  {
    slug: 'hyrox-beginners-guide',
    title: 'Hyrox: a beginner\'s complete guide',
    subtitle: 'What to expect on race day, how to train, and which stations to target.',
    tag: 'Hyrox',
    coming: true,
  },
  {
    slug: 'taper-week-tips',
    title: 'The taper week playbook',
    subtitle: 'What to do (and not do) in the 7 days before your race.',
    tag: 'Training',
    coming: true,
  },
  {
    slug: 'half-marathon-pb',
    title: 'How to PR your next half marathon',
    subtitle: 'A 12-week approach backed by what actually works for age-groupers.',
    tag: 'Training',
    coming: true,
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen px-5 pt-14 pb-16" style={{ background: '#FAFAF9' }}>
      <div className="max-w-lg mx-auto">

        <div className="mb-8">
          <Link href="/dashboard" className="text-xs font-medium" style={{ color: '#FC4C02' }}>
            ← Back
          </Link>
          <h1 className="text-3xl font-bold mt-3 mb-1" style={{ color: '#111' }}>Race tips &amp; guides</h1>
          <p className="text-sm" style={{ color: '#888' }}>Resources for endurance athletes. Coming soon.</p>
        </div>

        <div className="flex flex-col gap-3">
          {POSTS.map(post => (
            <div
              key={post.slug}
              className="rounded-3xl p-5"
              style={{ background: 'white', border: '1px solid #F0F0EE' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{ background: '#FFF5F2', color: '#FC4C02' }}
                >
                  {post.tag}
                </span>
                {post.coming && (
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                    style={{ background: '#F5F5F5', color: '#bbb' }}
                  >
                    Soon
                  </span>
                )}
              </div>
              <p className="font-bold text-base leading-snug mb-1" style={{ color: '#111' }}>{post.title}</p>
              <p className="text-sm" style={{ color: '#888' }}>{post.subtitle}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: '#ccc' }}>
          More coming soon · <Link href="/dashboard" style={{ color: '#FC4C02' }}>Back to dashboard</Link>
        </p>
      </div>
    </div>
  )
}
