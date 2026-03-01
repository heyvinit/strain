'use client'

import { useState } from 'react'
import { Mail, X, Loader2 } from 'lucide-react'

export default function EmailPrompt({ userId }: { userId: string }) {
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState('')

  if (dismissed) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) { setError('Enter a valid email.'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/user/email', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()
    if (!json.success) { setError(json.error ?? 'Failed to save.'); setSaving(false); return }
    setDismissed(true)
  }

  return (
    <div className="rounded-2xl px-4 py-3.5 mb-4 flex items-center gap-3" style={{ background: '#FFF5F2', border: '1px solid #FFE0D6' }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#FC4C02' }}>
        <Mail size={14} color="white" />
      </div>
      <form onSubmit={handleSave} className="flex-1 min-w-0">
        <p className="text-xs font-semibold mb-1.5" style={{ color: '#111' }}>Add email for race reminders</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 min-w-0 text-xs rounded-xl px-3 py-2 outline-none"
            style={{ background: 'white', border: '1px solid #FFE0D6', color: '#111' }}
          />
          <button
            type="submit"
            disabled={saving}
            className="text-xs font-semibold px-3 py-2 rounded-xl text-white disabled:opacity-50 shrink-0"
            style={{ background: '#FC4C02' }}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
          </button>
        </div>
        {error && <p className="text-[10px] mt-1" style={{ color: '#EF4444' }}>{error}</p>}
      </form>
      <button onClick={() => setDismissed(true)} className="shrink-0" style={{ color: '#FC4C02' }}>
        <X size={14} />
      </button>
    </div>
  )
}
