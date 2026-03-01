import { createClient } from '@supabase/supabase-js'

// Browser / client components — respects Row Level Security
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server only — bypasses RLS, never expose to browser
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── DB Types ─────────────────────────────────────────────────────────────────

export interface DbUser {
  id: string
  strava_id: number
  username: string
  name: string | null
  avatar_url: string | null
  city: string | null
  country: string | null
  created_at: string
}

export type SportType = 'running' | 'hyrox' | 'triathlon' | 'ocr' | 'cycling' | 'other'

export interface DbUserRace {
  id: string
  user_id: string
  race_name: string
  race_date: string | null
  city: string | null
  country: string | null
  sport: SportType
  distance: string
  distance_meters: number | null
  net_time: string | null
  gun_time: string | null
  pace: string | null
  bib_number: string | null
  overall_position: string | null
  category_position: string | null
  category: string | null
  result_url: string | null
  timing_platform: string | null
  status: 'upcoming' | 'completed'
  is_pb: boolean
  created_at: string
}
