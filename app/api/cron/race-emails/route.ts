import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendPreRaceEmail, sendPostRaceEmail } from '@/lib/emails'

export const runtime = 'nodejs'
export const maxDuration = 60

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const inTwoDays = dateOffset(2)   // pre-race trigger
  const yesterday = dateOffset(-1)  // post-race trigger

  let preCount = 0
  let postCount = 0
  const errors: string[] = []

  // ── Pre-race: upcoming races in exactly 2 days ──────────────────────────────
  const { data: preRaces } = await supabaseAdmin
    .from('user_races')
    .select('id, race_name, race_date, distance, sport, user_id')
    .eq('status', 'upcoming')
    .eq('race_date', inTwoDays)
    .eq('pre_race_email_sent', false)

  for (const race of preRaces ?? []) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('name, email, email_pre_race')
      .eq('id', race.user_id)
      .single()

    if (!user?.email) continue
    if (user.email_pre_race === false) continue

    try {
      await sendPreRaceEmail({
        to: user.email,
        name: user.name ?? 'Athlete',
        raceName: race.race_name,
        raceDate: race.race_date,
        distance: race.distance,
        sport: race.sport,
        raceId: race.id,
      })

      await supabaseAdmin
        .from('user_races')
        .update({ pre_race_email_sent: true })
        .eq('id', race.id)

      preCount++
    } catch (e) {
      errors.push(`pre:${race.id}: ${e}`)
    }
  }

  // ── Post-race: upcoming races that passed yesterday ──────────────────────────
  const { data: postRaces } = await supabaseAdmin
    .from('user_races')
    .select('id, race_name, race_date, distance, sport, user_id')
    .eq('status', 'upcoming')
    .eq('race_date', yesterday)
    .eq('post_race_email_sent', false)

  for (const race of postRaces ?? []) {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('name, email, email_post_race')
      .eq('id', race.user_id)
      .single()

    if (!user?.email) continue
    if (user.email_post_race === false) continue

    try {
      await sendPostRaceEmail({
        to: user.email,
        name: user.name ?? 'Athlete',
        raceName: race.race_name,
        raceDate: race.race_date,
        distance: race.distance,
        sport: race.sport,
      })

      await supabaseAdmin
        .from('user_races')
        .update({ post_race_email_sent: true })
        .eq('id', race.id)

      postCount++
    } catch (e) {
      errors.push(`post:${race.id}: ${e}`)
    }
  }

  return NextResponse.json({
    ok: true,
    pre_sent: preCount,
    post_sent: postCount,
    errors,
  })
}
