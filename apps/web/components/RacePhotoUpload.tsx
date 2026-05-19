'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, X } from 'lucide-react'

export default function RacePhotoUpload({
  raceId,
  currentPhotoUrl,
}: {
  raceId: string
  currentPhotoUrl: string | null
}) {
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFile(file: File) {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/races/${raceId}/photo`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setError('')
    try {
      await fetch(`/api/races/${raceId}/photo`, { method: 'DELETE' })
      router.refresh()
    } catch {
      setError('Failed to remove photo.')
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="mb-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          // Reset so same file can be re-selected
          e.target.value = ''
        }}
      />

      {currentPhotoUrl ? (
        <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
          {/* Photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentPhotoUrl} alt="Race photo" className="w-full h-full object-cover" />

          {/* Bottom scrim */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
            }}
          />

          {/* Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading || removing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(8px)' }}
            >
              <Camera size={12} />
              {uploading ? 'Uploading…' : 'Change'}
            </button>
            <button
              onClick={handleRemove}
              disabled={uploading || removing}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <X size={13} color="white" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 rounded-3xl"
          style={{ border: '1.5px dashed #E0E0E0', aspectRatio: '4/3', background: '#fafafa' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: '#F0F0EE' }}
          >
            <Camera size={18} color="#aaa" />
          </div>
          <span className="text-sm font-medium" style={{ color: '#bbb' }}>
            {uploading ? 'Uploading…' : 'Add race photo'}
          </span>
          <span className="text-xs" style={{ color: '#ddd' }}>
            JPG, PNG or WebP · max 5MB
          </span>
        </button>
      )}

      {error && (
        <p className="text-xs mt-2" style={{ color: '#e53e3e' }}>{error}</p>
      )}
    </div>
  )
}
