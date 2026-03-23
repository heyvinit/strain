import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: club, error } = await supabaseAdmin
    .from('run_clubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

  // Members with user info + race stats
  const { data: members } = await supabaseAdmin
    .from('run_club_members')
    .select('role, status, joined_at, users(id, name, username, avatar_url)')
    .eq('club_id', club.id)
    .eq('status', 'approved')
    .order('joined_at', { ascending: true })

  // Get race counts per member
  const memberIds = (members ?? []).map((m: any) => m.users?.id).filter(Boolean)
  const { data: raceCounts } = await supabaseAdmin
    .from('user_races')
    .select('user_id')
    .in('user_id', memberIds)
    .eq('status', 'completed')

  const countMap: Record<string, number> = {}
  for (const r of raceCounts ?? []) {
    countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1
  }

  // Get best marathon PB per member
  const { data: marathonPBs } = await supabaseAdmin
    .from('user_races')
    .select('user_id, net_time')
    .in('user_id', memberIds)
    .eq('status', 'completed')
    .eq('is_pb', true)
    .ilike('distance', '%42%')

  const pbMap: Record<string, string> = {}
  for (const r of marathonPBs ?? []) {
    if (r.net_time && (!pbMap[r.user_id] || r.net_time < pbMap[r.user_id])) {
      pbMap[r.user_id] = r.net_time
    }
  }

  const enriched = (members ?? []).map((m: any) => ({
    role: m.role,
    joined_at: m.joined_at,
    user: m.users,
    race_count: countMap[m.users?.id] ?? 0,
    marathon_pb: pbMap[m.users?.id] ?? null,
  }))

  return NextResponse.json({ club, members: enriched })
}
