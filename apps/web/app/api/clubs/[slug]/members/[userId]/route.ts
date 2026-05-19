import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH — approve or decline a member (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; userId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const adminId = session.user.userId
  const { slug, userId } = await params

  const { action } = await req.json() // 'approve' | 'decline'
  if (!['approve', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  // Verify caller is admin of this club
  const { data: club } = await supabaseAdmin
    .from('run_clubs')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

  const { data: adminMembership } = await supabaseAdmin
    .from('run_club_members')
    .select('role')
    .eq('club_id', club.id)
    .eq('user_id', adminId)
    .eq('status', 'approved')
    .single()

  if (adminMembership?.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }

  if (action === 'approve') {
    await supabaseAdmin
      .from('run_club_members')
      .update({ status: 'approved' })
      .eq('club_id', club.id)
      .eq('user_id', userId)
  } else {
    await supabaseAdmin
      .from('run_club_members')
      .delete()
      .eq('club_id', club.id)
      .eq('user_id', userId)
  }

  return NextResponse.json({ success: true })
}
