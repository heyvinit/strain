import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: raceId } = await params
  const { data } = await supabaseAdmin
    .from('race_photos')
    .select('*')
    .eq('race_id', raceId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  return NextResponse.json({ success: true, photos: data ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { id: raceId } = await params

  // Verify ownership
  const { data: race } = await supabaseAdmin
    .from('user_races')
    .select('user_id')
    .eq('id', raceId)
    .single()

  if (!race || race.user_id !== session.user.userId) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  // Max 9 photos
  const { count } = await supabaseAdmin
    .from('race_photos')
    .select('*', { count: 'exact', head: true })
    .eq('race_id', raceId)

  if ((count ?? 0) >= 9) {
    return NextResponse.json({ success: false, error: 'Max 9 photos per race' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ success: false, error: 'No file' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Max 5MB per photo' }, { status: 400 })
  }

  const photoId = crypto.randomUUID()
  const path = `${session.user.userId}/${raceId}/${photoId}.jpg`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('race-photos')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: false })

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('race-photos')
    .getPublicUrl(path)

  // First photo for this race → becomes thumbnail automatically
  const isFirst = (count ?? 0) === 0

  const { data: photo, error: insertError } = await supabaseAdmin
    .from('race_photos')
    .insert({
      id: photoId,
      race_id: raceId,
      user_id: session.user.userId,
      photo_url: publicUrl,
      is_thumbnail: isFirst,
      sort_order: count ?? 0,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
  }

  // Keep user_races.photo_url in sync with thumbnail
  if (isFirst) {
    await supabaseAdmin
      .from('user_races')
      .update({ photo_url: publicUrl })
      .eq('id', raceId)
  }

  return NextResponse.json({ success: true, photo })
}
