import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET — current user's club membership
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const userId = session.user.userId

  const { data } = await supabaseAdmin
    .from('run_club_members')
    .select('role, status, run_clubs(id, name, city, slug)')
    .eq('user_id', userId)
    .single()

  if (!data) return NextResponse.json({ membership: null })
  return NextResponse.json({ membership: { role: data.role, status: data.status, club: data.run_clubs } })
}

// DELETE — leave club
export async function DELETE() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const userId = session.user.userId

  await supabaseAdmin
    .from('run_club_members')
    .delete()
    .eq('user_id', userId)

  return NextResponse.json({ success: true })
}
