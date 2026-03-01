'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `https://getstrain.app/${username}`

    // Native share sheet on mobile
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Athlete Passport',
          text: 'Check out my running passport on Strain',
          url,
        })
      } catch {
        // User dismissed — do nothing
      }
      return
    }

    // Desktop fallback: copy to clipboard + toast
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Last resort: prompt
      window.prompt('Copy your passport link:', url)
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all"
        style={{ background: copied ? '#F0FAF0' : '#F0F0EE', color: copied ? '#16a34a' : '#555' }}
      >
        {copied ? <Check size={12} /> : <Share2 size={12} />}
        {copied ? 'Copied!' : 'Share'}
      </button>

      {/* Clipboard toast — desktop only (navigator.share not available) */}
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
