'use client'

import { useState } from 'react'

export default function ClubNameInput({ initialClubName }: { initialClubName: string | null }) {
  const [clubName, setClubName] = useState(initialClubName ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/user/club', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_name: clubName }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: '#F7F7F5', border: '1px solid #EBEBEB' }}>
      <p className="text-sm font-semibold mb-3" style={{ color: '#111' }}>Run Club</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={clubName}
          onChange={e => setClubName(e.target.value)}
          placeholder="Your club name"
          maxLength={60}
          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: '#fff', border: '1px solid #E0E0E0', color: '#111' }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl px-4 py-2 text-sm font-semibold"
          style={{ background: '#111', color: '#fff', opacity: saving ? 0.6 : 1 }}
        >
          {saved ? 'Saved' : saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
