import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { recalcPBs } from '@/lib/pb'

async function getOwner(raceId: string, stravaId: number) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('strava_id', stravaId)
    .single()
  if (!user) return null

  const { data: race } = await supabaseAdmin
    .from('user_races')
    .select('id, user_id')
    .eq('id', raceId)
    .single()
  if (!race || race.user_id !== user.id) return null

  return { userId: user.id }
}

function parseDate(raw: string): string | null {
  if (!raw) return null
  try {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  } catch { /* */ }
  return null
}

function toMeters(distance: string): number {
  const lower = distance.toLowerCase()
  if (lower.includes('42') || (lower.includes('marathon') && !lower.includes('half'))) return 42200
  if (lower.includes('21') || lower.includes('half')) return 21100
  if (lower.includes('10')) return 10000
  if (lower.includes('5')) return 5000
  return 0
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const owner = await getOwner(id, session.user.stravaId)
  if (!owner) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { raceName, raceDate, distance, netTime, gunTime, pace, bibNumber, overallPosition, categoryPosition, category, status } = body

  const { data, error } = await supabaseAdmin
    .from('user_races')
    .update({
      race_name: raceName,
      race_date: raceDate ? parseDate(raceDate) : undefined,
      distance: distance || undefined,
      distance_meters: distance ? toMeters(distance) : undefined,
      net_time: netTime ?? null,
      gun_time: gunTime ?? null,
      pace: pace ?? null,
      bib_number: bibNumber ?? null,
      overall_position: overallPosition ?? null,
      category_position: categoryPosition ?? null,
      category: category ?? null,
      status: status || undefined,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update' }, { status: 500 })

  await recalcPBs(owner.userId)
  return NextResponse.json({ success: true, race: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { id } = await params
  const owner = await getOwner(id, session.user.stravaId)
  if (!owner) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin
    .from('user_races')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })

  await recalcPBs(owner.userId)
  return NextResponse.json({ success: true })
}
