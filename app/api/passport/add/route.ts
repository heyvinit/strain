import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { recalcPBs } from '@/lib/pb'

// Maps distance string to meters for sorting
function toMeters(distance: string): number {
  const lower = distance.toLowerCase()
  if (lower.includes('42') || lower.includes('marathon') && !lower.includes('half')) return 42200
  if (lower.includes('21') || lower.includes('half')) return 21100
  if (lower.includes('10')) return 10000
  if (lower.includes('5')) return 5000
  return 0
}

// Parse "January 15, 2025" or "2025-01-15" into ISO date string
function parseDate(raw: string): string | null {
  if (!raw) return null
  try {
    const d = new Date(raw)
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  } catch { /* */ }
  return null
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const {
    raceName, raceDate, runnerName, bibNumber, distance,
    netTime, gunTime, pace, overallPosition, categoryPosition,
    category, platform, result_url,
  } = body

  if (!raceName || !distance) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }

  // Get user from DB
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('strava_id', session.user.stravaId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  const { data: race, error: insertError } = await supabaseAdmin
    .from('user_races')
    .insert({
      user_id: user.id,
      race_name: raceName,
      race_date: parseDate(raceDate),
      distance,
      distance_meters: toMeters(distance),
      net_time: netTime || null,
      gun_time: gunTime || null,
      pace: pace || null,
      bib_number: bibNumber || null,
      overall_position: overallPosition || null,
      category_position: categoryPosition || null,
      category: category || null,
      timing_platform: platform || null,
      result_url: result_url || null,
      status: 'completed',
    })
    .select()
    .single()

  if (insertError) {
    console.error('[passport/add error]', insertError)
    return NextResponse.json({ success: false, error: 'Failed to save race' }, { status: 500 })
  }

  await recalcPBs(user.id)

  return NextResponse.json({ success: true, race })
}
