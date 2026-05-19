'use client'

import { useRef, useState } from 'react'
import { Pencil, Camera, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/app/actions'

interface Props {
  name: string | null
  username: string
  avatarUrl: string | null
  email: string | null
  emailPreRace: boolean
  emailPostRace: boolean
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className="relative shrink-0 transition-all"
      style={{
        width: 44, height: 26,
        borderRadius: 999,
        background: checked ? '#111' : '#E0E0DE',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        className="absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: checked ? 21 : 3 }}
      />
    </button>
  )
}

export default function ProfileSettings({ name, username, avatarUrl, email, emailPreRace, emailPostRace }: Props) {
  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  // Email edit
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState(email ?? '')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')

  // Notification toggles
  const [preRace, setPreRace] = useState(emailPreRace)
  const [postRace, setPostRace] = useState(emailPostRace)
  const [prefSaving, setPrefSaving] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    setAvatarError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/user/avatar', { method: 'POST', body: form })
      const json = await res.json()
      if (!json.success) { setAvatarError(json.error ?? 'Upload failed'); setAvatarUploading(false); return }
      setCurrentAvatar(json.avatarUrl)
    } catch {
      setAvatarError('Something went wrong')
    }
    setAvatarUploading(false)
  }

  async function saveEmail() {
    if (!emailValue.includes('@')) { setEmailError('Enter a valid email'); return }
    setEmailSaving(true)
    setEmailError('')
    const res = await fetch('/api/user/email', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailValue }),
    })
    const json = await res.json()
    if (!json.success) { setEmailError(json.error ?? 'Failed to save'); setEmailSaving(false); return }
    setEditingEmail(false)
    setEmailSaving(false)
  }

  async function togglePref(key: 'pre' | 'post', value: boolean) {
    if (prefSaving) return
    if (key === 'pre') setPreRace(value)
    else setPostRace(value)
    setPrefSaving(true)
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailPreRace: key === 'pre' ? value : preRace, emailPostRace: key === 'post' ? value : postRace }),
    })
    setPrefSaving(false)
  }

  const hasEmail = !!email || !!emailValue

  return (
    <div className="flex flex-col gap-4">

      {/* Identity + photo upload */}
      <div className="rounded-3xl p-5 flex items-center gap-4" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        {/* Tappable avatar */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="relative shrink-0 group"
        >
          {currentAvatar ? (
            <img src={currentAvatar} alt={name ?? ''} className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
              style={{ background: '#FC4C02' }}
            >
              {(name ?? username)[0]?.toUpperCase()}
            </div>
          )}
          {/* Camera overlay */}
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center transition-opacity"
            style={{ background: 'rgba(0,0,0,0.45)', opacity: avatarUploading ? 1 : 0 }}
          >
            {avatarUploading
              ? <Loader2 size={16} color="white" className="animate-spin" />
              : <Camera size={16} color="white" />
            }
          </div>
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <Camera size={16} color="white" />
          </div>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />

        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg leading-tight truncate" style={{ color: '#111' }}>{name ?? username}</p>
          <p className="text-sm" style={{ color: '#aaa' }}>@{username}</p>
          {avatarError && <p className="text-xs mt-1" style={{ color: '#EF4444' }}>{avatarError}</p>}
          {!avatarUploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs mt-1 font-medium"
              style={{ color: '#FC4C02' }}
            >
              Change photo
            </button>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="rounded-3xl p-5" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#aaa' }}>Email</p>

        {editingEmail ? (
          <div className="flex flex-col gap-2">
            <input
              type="email"
              value={emailValue}
              onChange={e => setEmailValue(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none"
              style={{ background: '#F8F8F7', border: '1px solid #ECECEA', color: '#111' }}
            />
            {emailError && <p className="text-xs px-1" style={{ color: '#EF4444' }}>{emailError}</p>}
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => { setEditingEmail(false); setEmailValue(email ?? ''); setEmailError('') }}
                className="flex-1 py-3 rounded-2xl text-sm font-medium"
                style={{ background: '#F8F8F7', color: '#888' }}
              >
                Cancel
              </button>
              <button
                onClick={saveEmail}
                disabled={emailSaving}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#111' }}
              >
                {emailSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: hasEmail ? '#111' : '#bbb' }}>
              {email || 'No email added'}
            </p>
            <button
              onClick={() => setEditingEmail(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: '#F8F8F7' }}
            >
              <Pencil size={13} color="#888" />
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase px-5 pt-5 pb-3" style={{ color: '#aaa' }}>
          Notifications
        </p>

        {[
          { key: 'pre' as const, label: 'Pre-race reminder', sub: '2 days before your race', value: preRace },
          { key: 'post' as const, label: 'Post-race follow-up', sub: 'Day after your event', value: postRace },
        ].map((item, i) => (
          <div key={item.key}>
            {i > 0 && <div style={{ height: 1, background: '#F0F0EE', marginLeft: 20 }} />}
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#111' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>{item.sub}</p>
              </div>
              <Toggle checked={item.value} onChange={v => togglePref(item.key, v)} disabled={prefSaving || !hasEmail} />
            </div>
          </div>
        ))}

        {!hasEmail && (
          <p className="text-xs px-5 pb-4" style={{ color: '#bbb' }}>
            Add an email above to enable notifications.
          </p>
        )}
      </div>

      {/* Sign out */}
      <form action={logout}>
        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white"
          style={{ background: '#111' }}
        >
          Sign out
        </button>
      </form>

      {/* Blog link */}
      <div className="text-center pb-2">
        <Link
          href="/blog"
          className="text-xs"
          style={{ color: '#bbb' }}
        >
          Race tips &amp; guides →
        </Link>
      </div>

    </div>
  )
}
