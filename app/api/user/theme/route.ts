import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { PASSPORT_COLORS, PASSPORT_TEXTURES } from '@/lib/passport-themes'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false }, { status: 401 })

  const { theme } = await req.json()
  if (typeof theme !== 'string') return NextResponse.json({ success: false, error: 'Invalid theme' }, { status: 400 })

  // Accept both "colorKey:textureKey" and legacy "colorKey" formats
  const [colorKey, textureKey = 'none'] = theme.split(':')
  if (!(colorKey in PASSPORT_COLORS) || !(textureKey in PASSPORT_TEXTURES)) {
    return NextResponse.json({ success: false, error: 'Invalid theme' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ passport_theme: theme })
    .eq('id', session.user.userId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
