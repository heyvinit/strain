'use client'

import { useState, useRef } from 'react'
import { Camera, X, Star, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import NextImage from 'next/image'
import type { DbRacePhoto } from '@/lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compress + resize before upload — major speed improvement */
async function compressImage(file: File): Promise<Blob> {
  const MAX_WIDTH = 1600
  const QUALITY = 0.82
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.naturalWidth)
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/jpeg',
        QUALITY
      )
      URL.revokeObjectURL(url)
    }
    img.onerror = reject
    img.src = url
  })
}

/** Return a cropped thumbnail URL via Supabase image transform API.
 *  Width AND height are required so Supabase actually crops to that exact box.
 *  Without height it only resizes proportionally → portrait photos look zoomed. */
function thumbSrc(url: string, width = 300, height = 300): string {
  const base = url.split('?')[0]
  if (base.includes('/storage/v1/object/public/')) {
    return (
      base.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
      `?width=${width}&height=${height}&resize=cover&quality=75`
    )
  }
  return url
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RacePhotoGallery({
  raceId,
  initialPhotos,
  readOnly = false,
}: {
  raceId: string
  initialPhotos: DbRacePhoto[]
  readOnly?: boolean
}) {
  const [photos, setPhotos] = useState<DbRacePhoto[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState('')
  const [error, setError] = useState('')
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const touchStartX = useRef(0)
  const MAX = 9

  async function handleFiles(files: FileList) {
    const remaining = MAX - photos.length
    const list = Array.from(files).slice(0, remaining)
    if (!list.length) return

    setUploading(true)
    setError('')
    const added: DbRacePhoto[] = []

    for (let i = 0; i < list.length; i++) {
      setUploadLabel(`${i + 1} / ${list.length}`)
      try {
        const blob = await compressImage(list[i])
        const fd = new FormData()
        fd.append('file', blob, 'photo.jpg')
        const res = await fetch(`/api/races/${raceId}/photos`, { method: 'POST', body: fd })
        const data = await res.json()
        if (data.success && data.photo) added.push(data.photo)
        else if (data.error) setError(data.error)
      } catch {
        setError('One or more photos failed to upload.')
      }
    }

    setPhotos(prev => [...prev, ...added])
    setUploading(false)
    setUploadLabel('')
  }

  async function handleDelete(photoId: string) {
    const res = await fetch(`/api/races/${raceId}/photos/${photoId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!data.success) return

    setPhotos(prev => {
      const next = prev.filter(p => p.id !== photoId)
      if (data.newThumbnailId) {
        return next.map(p => ({ ...p, is_thumbnail: p.id === data.newThumbnailId }))
      }
      return next
    })

    // Move viewer to previous photo or close if none left
    setPhotos(prev => {
      if (prev.length === 0) setViewerOpen(false)
      else setViewerIndex(i => Math.min(i, prev.length - 1))
      return prev
    })
  }

  async function handleSetThumbnail(photoId: string) {
    const res = await fetch(`/api/races/${raceId}/photos/${photoId}/thumbnail`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      setPhotos(prev => prev.map(p => ({ ...p, is_thumbnail: p.id === photoId })))
    }
  }

  function navigate(dir: -1 | 1) {
    setViewerIndex(i => (i + dir + photos.length) % photos.length)
  }

  const current = photos[viewerIndex]

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={e => {
          if (e.target.files?.length) handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* 3 × 3 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => { setViewerIndex(i); setViewerOpen(true) }}
            style={{
              position: 'relative',
              aspectRatio: '1/1',
              borderRadius: 12,
              overflow: 'hidden',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <NextImage
              src={thumbSrc(photo.photo_url, 300, 300)}
              alt=""
              fill
              sizes="(max-width: 640px) 30vw, 120px"
              style={{ objectFit: 'cover' }}
            />
            {photo.is_thumbnail && !readOnly && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  background: '#FC4C02',
                  borderRadius: 20,
                  padding: '2px 6px',
                }}
              >
                <span style={{ color: 'white', fontSize: 8, fontWeight: 800 }}>COVER</span>
              </div>
            )}
          </button>
        ))}

        {/* Add more cell */}
        {!readOnly && photos.length < MAX && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              aspectRatio: '1/1',
              borderRadius: 12,
              border: '1.5px dashed #E0E0E0',
              background: '#fafafa',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            {uploading ? (
              <span style={{ color: '#aaa', fontSize: 10, padding: '0 6px', textAlign: 'center' }}>
                {uploadLabel}
              </span>
            ) : (
              <>
                <Camera size={16} color="#ccc" />
                <span style={{ color: '#ccc', fontSize: 10 }}>
                  {photos.length === 0 ? 'Add photos' : 'Add more'}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: '#e53e3e', fontSize: 12, marginTop: 6 }}>{error}</p>
      )}

      {/* ── Fullscreen viewer ── */}
      {viewerOpen && current && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setViewerOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} color="white" />
            </button>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {viewerIndex + 1} / {photos.length}
            </span>
            <div style={{ width: 34 }} />
          </div>

          {/* Photo area — swipeable */}
          <div
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
            onTouchEnd={e => {
              const delta = touchStartX.current - e.changedTouches[0].clientX
              if (Math.abs(delta) > 50) navigate(delta > 0 ? 1 : -1)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.photo_url.split('?')[0]}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />

            {/* Nav arrows — desktop / tablet */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigate(-1)}
                  style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={20} color="white" />
                </button>
                <button
                  onClick={() => navigate(1)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={20} color="white" />
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {photos.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 4, flexShrink: 0 }}>
              {photos.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setViewerIndex(i)}
                  style={{
                    width: i === viewerIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === viewerIndex ? 'white' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}

          {readOnly && <div style={{ paddingBottom: 32 }} />}

          {/* Bottom actions — owner only */}
          {!readOnly && (
            <div style={{ padding: '12px 20px 32px', display: 'flex', gap: 10, flexShrink: 0 }}>
              <button
                onClick={() => handleSetThumbnail(current.id)}
                disabled={current.is_thumbnail}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 0', borderRadius: 16, border: 'none', cursor: current.is_thumbnail ? 'default' : 'pointer',
                  background: current.is_thumbnail ? 'rgba(252,76,2,0.15)' : 'rgba(255,255,255,0.08)',
                  color: current.is_thumbnail ? '#FC4C02' : 'white',
                  fontSize: 13, fontWeight: 600,
                }}
              >
                <Star size={14} fill={current.is_thumbnail ? '#FC4C02' : 'none'} color={current.is_thumbnail ? '#FC4C02' : 'white'} />
                {current.is_thumbnail ? 'Cover photo' : 'Set as cover'}
              </button>
              <button
                onClick={() => handleDelete(current.id)}
                style={{
                  width: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                }}
              >
                <Trash2 size={16} color="#888" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
