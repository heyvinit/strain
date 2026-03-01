import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProfileSettings from '@/components/ProfileSettings'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('name, username, avatar_url, email, email_pre_race, email_post_race')
    .eq('strava_id', session.user.stravaId)
    .single()

  if (!user) redirect('/dashboard')

  return (
    <div className="min-h-screen px-5 pt-14 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={16} color="#111" />
        </Link>
        <h1 className="text-xl font-bold" style={{ color: '#111' }}>Profile</h1>
      </div>

      <ProfileSettings
        name={user.name}
        username={user.username}
        avatarUrl={user.avatar_url}
        email={user.email}
        emailPreRace={user.email_pre_race ?? true}
        emailPostRace={user.email_post_race ?? true}
      />
    </div>
  )
}
