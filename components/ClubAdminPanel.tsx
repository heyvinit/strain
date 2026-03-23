'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PendingMember {
  user_id: string
  joined_at: string
  user: { id: string; name: string | null; username: string; avatar_url: string | null }
}

export default function ClubAdminPanel({ slug, pending }: { slug: string; pending: PendingMember[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  async function handleAction(userId: string, action: 'approve' | 'decline') {
    setLoading(userId)
    await fetch(`/api/clubs/${slug}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setDismissed(prev => new Set([...prev, userId]))
    setLoading(null)
    router.refresh()
  }

  const visible = pending.filter(p => !dismissed.has(p.user_id))
  if (visible.length === 0) return null

  return (
    <div className="rounded-3xl overflow-hidden mb-4" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
      <p className="text-[10px] font-bold tracking-widest uppercase px-5 pt-5 pb-3" style={{ color: '#aaa' }}>
        Join Requests · {visible.length}
      </p>

      {visible.map((p, i) => (
        <div key={p.user_id}>
          {i > 0 && <div style={{ height: 1, background: '#F0F0EE', marginLeft: 20 }} />}
          <div className="flex items-center gap-3 px-5 py-3.5">
            {p.user.avatar_url ? (
              <img src={p.user.avatar_url} alt={p.user.name ?? ''} className="w-9 h-9 rounded-2xl object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white text-sm font-bold" style={{ background: '#FC4C02' }}>
                {(p.user.name ?? p.user.username)[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#111' }}>{p.user.name ?? p.user.username}</p>
              <p className="text-xs" style={{ color: '#aaa' }}>@{p.user.username}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleAction(p.user_id, 'decline')}
                disabled={loading === p.user_id}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#F8F8F7' }}
              >
                {loading === p.user_id ? <Loader2 size={13} className="animate-spin" color="#aaa" /> : <X size={13} color="#888" />}
              </button>
              <button
                onClick={() => handleAction(p.user_id, 'approve')}
                disabled={loading === p.user_id}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#111' }}
              >
                {loading === p.user_id ? <Loader2 size={13} className="animate-spin" color="white" /> : <Check size={13} color="white" />}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
