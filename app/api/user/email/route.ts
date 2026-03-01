import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ email })
    .eq('strava_id', session.user.stravaId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
