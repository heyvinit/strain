import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const { data: races, error } = await supabaseAdmin
    .from('user_races')
    .select('id, race_name, race_date, distance, sport, net_time, status')
    .eq('user_id', session.user.userId)
    .eq('status', 'completed')
    .order('race_date', { ascending: false })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, races: races ?? [] })
}
