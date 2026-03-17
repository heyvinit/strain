import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import type { DbUser, DbUserRace } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { computePassportStats } from '@/components/PassportCard'
import PassportStylePicker from '@/components/PassportStylePicker'
import { qrToSvg } from '@/lib/qr'

export default async function PassportStylePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.userId
  const username = session.user.username

  const [{ data: user }, { data: races }, qrSvg] = await Promise.all([
    supabaseAdmin.from('users').select('*').eq('id', userId).single<DbUser>(),
    supabaseAdmin.from('user_races').select('*').eq('user_id', userId).order('race_date', { ascending: false }),
    qrToSvg(`https://getstrain.app/${username}`),
  ])

  if (!user) redirect('/dashboard')

  const allRaces: DbUserRace[] = races ?? []
  const stats = computePassportStats(allRaces)

  return (
    <PassportStylePicker
      user={user}
      stats={stats}
      username={username}
      qrSvg={qrSvg}
    />
  )
}
