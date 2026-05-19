import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { id: raceId, photoId } = await params

  const { data: photo } = await supabaseAdmin
    .from('race_photos')
    .select('photo_url, user_id')
    .eq('id', photoId)
    .single()

  if (!photo || photo.user_id !== session.user.userId) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  // Clear existing thumbnail for this race, set new one
  await supabaseAdmin
    .from('race_photos')
    .update({ is_thumbnail: false })
    .eq('race_id', raceId)

  await supabaseAdmin
    .from('race_photos')
    .update({ is_thumbnail: true })
    .eq('id', photoId)

  // Keep user_races.photo_url in sync
  await supabaseAdmin
    .from('user_races')
    .update({ photo_url: photo.photo_url })
    .eq('id', raceId)

  return NextResponse.json({ success: true })
}
