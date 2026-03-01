import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const { emailPreRace, emailPostRace } = await req.json()

  const update: Record<string, boolean> = {}
  if (typeof emailPreRace === 'boolean') update.email_pre_race = emailPreRace
  if (typeof emailPostRace === 'boolean') update.email_post_race = emailPostRace

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update(update)
    .eq('strava_id', session.user.stravaId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
