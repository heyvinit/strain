'use client'

import { useState } from 'react'
import { X, QrCode } from 'lucide-react'

export default function QrButton({ qrSvg }: { qrSvg: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* QR icon trigger — clean, doesn't disrupt passport design */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 flex items-center justify-center"
        style={{ width: 28, height: 28, opacity: 0.35 }}
        title="View QR code"
      >
        <QrCode size={18} color="#ffffff" />
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative rounded-3xl p-6 flex flex-col items-center"
            style={{ background: '#1a1a1a', maxWidth: 280, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <X size={14} color="#888" />
            </button>

            <p className="text-[10px] font-bold tracking-widest uppercase mb-4" style={{ color: '#555' }}>
              Athlete Passport
            </p>

            {/* Large QR — white bg, sharp corners for clean look */}
            <div style={{ width: 200, height: 200, background: 'white', padding: 12 }}>
              <div
                style={{ width: '100%', height: '100%' }}
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <p className="text-xs mt-4 text-center" style={{ color: '#444' }}>
              Scan to view passport
            </p>
          </div>
        </div>
      )}
    </>
  )
}
