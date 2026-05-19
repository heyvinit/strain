import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendClubJoinRequestEmail } from '@/lib/emails'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const userId = session.user.userId
  const { slug } = await params

  // Block if already in a club
  const { data: existingMembership } = await supabaseAdmin
    .from('run_club_members')
    .select('id, status, run_clubs(name)')
    .eq('user_id', userId)
    .single()

  if (existingMembership) {
    return NextResponse.json({ error: 'You are already in a run club' }, { status: 400 })
  }

  const { data: club } = await supabaseAdmin
    .from('run_clubs')
    .select('id, name, created_by')
    .eq('slug', slug)
    .single()

  if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

  // Create pending membership
  const { error } = await supabaseAdmin.from('run_club_members').insert({
    club_id: club.id,
    user_id: userId,
    role: 'member',
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Email the admin
  try {
    if (club.created_by) {
      const { data: admin } = await supabaseAdmin
        .from('users')
        .select('name, email')
        .eq('id', club.created_by)
        .single()

      const { data: requester } = await supabaseAdmin
        .from('users')
        .select('name, username')
        .eq('id', userId)
        .single()

      if (admin?.email && requester) {
        await sendClubJoinRequestEmail({
          to: admin.email,
          adminName: admin.name ?? 'there',
          requesterName: requester.name ?? requester.username,
          requesterUsername: requester.username,
          clubName: club.name,
          clubSlug: slug,
        })
      }
    }
  } catch {
    // Non-fatal — don't fail the join if email fails
  }

  return NextResponse.json({ success: true, status: 'pending' })
}
