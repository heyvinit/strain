'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { toPng } from 'html-to-image'

export default function PassportDownload() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    const card = document.getElementById('passport-card')
    if (!card) return

    setLoading(true)
    try {
      const dataUrl = await toPng(card, {
        pixelRatio: 3,
        cacheBust: true,
        style: { margin: '0' },
      })
      const link = document.createElement('a')
      link.download = 'athlete-passport.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Passport download failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ background: 'rgba(0,0,0,0.06)', color: loading ? '#bbb' : '#888', border: '1px solid #E8E8E6' }}
    >
      <Download size={12} />
      {loading ? 'Saving…' : 'Save'}
    </button>
  )
}
