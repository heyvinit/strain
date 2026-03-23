import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  const { data, error } = await supabaseAdmin
    .from('run_clubs')
    .select('id, name, city, slug')
    .ilike('name', `%${q}%`)
    .limit(8)

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data ?? [])
}
