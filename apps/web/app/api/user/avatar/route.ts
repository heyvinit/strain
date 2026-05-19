import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ success: false, error: 'JPG, PNG or WebP only' }, { status: 400 })
  }
  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ success: false, error: 'Max file size is 2MB' }, { status: 400 })
  }

  const userId = session.user.userId
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/avatar.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabaseAdmin.storage
    .from('avatars')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)

  // Add cache-busting timestamp
  const avatarUrl = `${publicUrl}?t=${Date.now()}`

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)

  if (updateError) return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })

  return NextResponse.json({ success: true, avatarUrl })
}
