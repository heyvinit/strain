import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { THEME_KEYS } from '@/lib/passport-themes'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 })

  const { theme } = await req.json()
  if (!THEME_KEYS.includes(theme)) {
    return NextResponse.json({ success: false, error: 'Invalid theme' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ passport_theme: theme })
    .eq('id', session.user.userId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
