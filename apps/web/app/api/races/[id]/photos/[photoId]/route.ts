import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(
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
    .select('*')
    .eq('id', photoId)
    .eq('user_id', session.user.userId)
    .single()

  if (!photo) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  // Delete from storage
  const url = new URL(photo.photo_url)
  const storagePath = url.pathname.replace('/storage/v1/object/public/race-photos/', '')
  await supabaseAdmin.storage.from('race-photos').remove([storagePath])

  // Delete the row
  await supabaseAdmin.from('race_photos').delete().eq('id', photoId)

  // If it was the thumbnail, promote the next oldest photo
  let newThumbnailId: string | null = null
  if (photo.is_thumbnail) {
    const { data: remaining } = await supabaseAdmin
      .from('race_photos')
      .select('id, photo_url')
      .eq('race_id', raceId)
      .order('created_at', { ascending: true })
      .limit(1)

    if (remaining && remaining.length > 0) {
      newThumbnailId = remaining[0].id
      await supabaseAdmin
        .from('race_photos')
        .update({ is_thumbnail: true })
        .eq('id', newThumbnailId)

      await supabaseAdmin
        .from('user_races')
        .update({ photo_url: remaining[0].photo_url })
        .eq('id', raceId)
    } else {
      // No photos left — clear the thumbnail
      await supabaseAdmin
        .from('user_races')
        .update({ photo_url: null })
        .eq('id', raceId)
    }
  }

  return NextResponse.json({ success: true, newThumbnailId })
}
