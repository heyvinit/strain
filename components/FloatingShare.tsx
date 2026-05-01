'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function FloatingShare({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `https://myrace.fyi/${username}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Athlete Passport',
          text: 'Check out my athlete passport on Strain',
          url,
        })
      } catch {
        // dismissed
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy your passport link:', url)
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 20,
          zIndex: 50,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#FC4C02',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(252,76,2,0.45)',
        }}
        aria-label="Share passport"
      >
        {copied
          ? <Check size={20} color="white" />
          : <Share2 size={20} color="white" />
        }
      </button>

      {copied && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white shadow-lg z-50 animate-fade-in"
          style={{ background: '#111' }}
        >
          Link copied to clipboard
        </div>
      )}
    </>
  )
}
