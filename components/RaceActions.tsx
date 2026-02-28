'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function RaceActions({ raceId }: { raceId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/races/${raceId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  if (confirming) {
    return (
      <div className="rounded-3xl p-4 flex flex-col gap-3" style={{ background: 'white', border: '1px solid #FFE0D6' }}>
        <p className="text-sm font-semibold" style={{ color: '#111' }}>Delete this race?</p>
        <p className="text-xs" style={{ color: '#888' }}>This can't be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#EF4444' }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Delete
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-5 py-3 rounded-2xl text-sm font-medium"
            style={{ color: '#888', background: '#F8F8F7' }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
      style={{ color: '#aaa', background: 'transparent' }}
    >
      <Trash2 size={13} />
      Remove race
    </button>
  )
}
