import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET — current user's club name
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('users')
    .select('club_name')
    .eq('id', session.user.userId)
    .single()

  return NextResponse.json({ club_name: data?.club_name ?? null })
}

// PATCH — save club name
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { club_name } = await req.json()

  const { error } = await supabaseAdmin
    .from('users')
    .update({ club_name: club_name?.trim() || null })
    .eq('id', session.user.userId)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
