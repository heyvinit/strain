import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Strava workout_type 1 = Race (for all activity types)
const RACE_TYPE = 1

// Map Strava type → our sport key
function mapSport(type: string): string {
  const t = type.toLowerCase()
  if (t === 'run' || t === 'virtualrun') return 'running'
  if (t === 'ride' || t === 'virtualride' || t === 'ebikeride') return 'cycling'
  if (t === 'swim') return 'triathlon'
  return 'other'
}

// Format seconds → H:MM:SS
function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

// Map meters → nearest standard distance label
function formatDistance(meters: number, sport: string): string {
  if (sport === 'running') {
    if (meters >= 41000 && meters <= 43500) return 'Marathon (42.2km)'
    if (meters >= 20000 && meters <= 22500) return 'Half Marathon (21.1km)'
    if (meters >= 9500 && meters <= 10500) return '10K'
    if (meters >= 4500 && meters <= 5500) return '5K'
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const token = session.user.stravaAccessToken
  if (!token) return NextResponse.json({ error: 'No Strava token — please log out and log back in' }, { status: 401 })

  // Fetch up to 200 activities from Strava
  const res = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=200&page=1',
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (res.status === 401) {
    return NextResponse.json({ error: 'Strava token expired — please log out and log back in' }, { status: 401 })
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch Strava activities' }, { status: 500 })
  }

  const activities = await res.json()

  // Filter to races only
  const raceActivities = activities.filter((a: { workout_type: number }) => a.workout_type === RACE_TYPE)

  // Get already-imported Strava activity IDs for this user
  const { data: user } = await supabaseAdmin
    .from('users').select('id').eq('strava_id', session.user.stravaId).single()

  const { data: existing } = user
    ? await supabaseAdmin
        .from('user_races')
        .select('strava_activity_id')
        .eq('user_id', user.id)
        .not('strava_activity_id', 'is', null)
    : { data: [] }

  const importedIds = new Set((existing ?? []).map((r: { strava_activity_id: number }) => r.strava_activity_id))

  // Map to our format
  const races = raceActivities.map((a: {
    id: number; name: string; start_date_local: string
    distance: number; moving_time: number; type: string
  }) => {
    const sport = mapSport(a.type)
    return {
      stravaActivityId: a.id,
      name: a.name,
      date: a.start_date_local?.split('T')[0] ?? null,
      distance: formatDistance(a.distance, sport),
      time: formatTime(a.moving_time),
      sport,
      alreadyImported: importedIds.has(a.id),
    }
  })

  return NextResponse.json({ success: true, races })
}
