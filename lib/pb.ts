import { supabaseAdmin } from './supabase'

function distanceCategory(d: string): string {
  const lower = d.toLowerCase()
  if (lower.includes('42') || (lower.includes('marathon') && !lower.includes('half'))) return 'fm'
  if (lower.includes('21') || lower.includes('half')) return 'hm'
  if (lower.includes('10')) return '10k'
  if (lower.includes('5')) return '5k'
  return `other:${lower.trim()}`
}

function timeToSecs(t: string | null): number {
  if (!t) return Infinity
  const parts = t.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return Infinity
}

/** Recalculates is_pb for all completed races for a user. */
export async function recalcPBs(userId: string): Promise<void> {
  const { data: races } = await supabaseAdmin
    .from('user_races')
    .select('id, distance, net_time, status')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (!races?.length) return

  // Find fastest per category
  const best: Record<string, number> = {}
  const bestId: Record<string, string> = {}

  for (const r of races) {
    if (!r.net_time) continue
    const cat = distanceCategory(r.distance)
    const secs = timeToSecs(r.net_time)
    if (best[cat] === undefined || secs < best[cat]) {
      best[cat] = secs
      bestId[cat] = r.id
    }
  }

  const pbIds = new Set(Object.values(bestId))

  // Batch update all to is_pb = false first, then flip the winners
  await supabaseAdmin
    .from('user_races')
    .update({ is_pb: false })
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (pbIds.size > 0) {
    await supabaseAdmin
      .from('user_races')
      .update({ is_pb: true })
      .in('id', [...pbIds])
  }
}
