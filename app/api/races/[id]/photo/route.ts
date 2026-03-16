import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

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

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ success: false, error: 'JPG, PNG or WebP only' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Max file size is 5MB' }, { status: 400 })
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${session.user.userId}/${raceId}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('race-photos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('race-photos')
    .getPublicUrl(path)

  const photoUrl = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabaseAdmin
    .from('user_races')
    .update({ photo_url: photoUrl })
    .eq('id', raceId)

  if (updateError) {
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, photoUrl })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }

  const { id: raceId } = await params

  const { data: race } = await supabaseAdmin
    .from('user_races')
    .select('user_id')
    .eq('id', raceId)
    .single()

  if (!race || race.user_id !== session.user.userId) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  await supabaseAdmin
    .from('user_races')
    .update({ photo_url: null })
    .eq('id', raceId)

  return NextResponse.json({ success: true })
}
