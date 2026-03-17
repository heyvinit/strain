'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import PassportCard from './PassportCard'
import type { PassportStats } from './PassportCard'
import type { DbUser } from '@/lib/supabase'

export default function TappablePassport({
  user,
  stats,
  username,
  qrSvg,
}: {
  user: DbUser
  stats: PassportStats
  username: string
  qrSvg?: string
}) {
  const [tapped, setTapped] = useState(false)
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Dismiss on outside tap
  useEffect(() => {
    if (!tapped) return
    function onOutside(e: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setTapped(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    document.addEventListener('touchstart', onOutside)
    return () => {
      document.removeEventListener('mousedown', onOutside)
      document.removeEventListener('touchstart', onOutside)
    }
  }, [tapped])

  return (
    <div ref={wrapperRef} style={{ paddingBottom: 52 }}>
      {/* Tappable card */}
      <div
        onClick={() => setTapped(t => !t)}
        style={{
          cursor: 'pointer',
          transform: tapped ? 'scale(0.975)' : 'scale(1)',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <PassportCard user={user} stats={stats} username={username} isOwner qrSvg={qrSvg} />
      </div>

      {/* Customize pill — slides up from below */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: -8,
          opacity: tapped ? 1 : 0,
          transform: tapped ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.22s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
          pointerEvents: tapped ? 'auto' : 'none',
        }}
      >
        <button
          onClick={e => { e.stopPropagation(); router.push('/dashboard/passport/style') }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '10px 20px',
            borderRadius: 99,
            background: '#111',
            color: 'white',
            border: '1px solid #333',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Sparkles size={13} />
          Customize style
        </button>
      </div>
    </div>
  )
}
