import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { generateSlug } from '@/lib/clubs'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const userId = session.user.userId

  // Block if user is already in a club
  const { data: existing } = await supabaseAdmin
    .from('run_club_members')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .single()

  if (existing) return NextResponse.json({ error: 'You are already in a run club' }, { status: 400 })

  const { name, city, link } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Club name is required' }, { status: 400 })

  // Generate unique slug
  const base = generateSlug(name)
  let slug = base
  let attempt = 0
  while (true) {
    const { data: taken } = await supabaseAdmin.from('run_clubs').select('id').eq('slug', slug).single()
    if (!taken) break
    attempt++
    slug = `${base}-${attempt}`
  }

  const { data: club, error } = await supabaseAdmin
    .from('run_clubs')
    .insert({ name: name.trim(), city: city?.trim() || null, link: link?.trim() || null, slug, created_by: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-add creator as approved admin
  await supabaseAdmin.from('run_club_members').insert({
    club_id: club.id,
    user_id: userId,
    role: 'admin',
    status: 'approved',
  })

  return NextResponse.json({ success: true, club })
}
