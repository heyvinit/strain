'use client'

import { useRef, useState } from 'react'

const MRZ = 'STRAIN<<MARCEL<HUG<<<<ISSUEDMAR2026<<GETSTRAIN.APP'

const PBS = [
  { label: 'Marathon',      time: '3:12:44' },
  { label: 'Half Marathon', time: '1:28:31' },
  { label: 'Hyrox Mumbai',  time: '1:36:12' },
  { label: '5K',            time: '19:45' },
]

const FLAGS = [
  { country: 'USA',     flag: '🇺🇸' },
  { country: 'Germany', flag: '🇩🇪' },
  { country: 'Japan',   flag: '🇯🇵' },
]
const EXTRA_FLAGS = 2

export default function MockPassport() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0, active: false })

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x, y, active: true })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0, active: false })
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!ref.current) return
    const touch = e.touches[0]
    const rect = ref.current.getBoundingClientRect()
    const x = (touch.clientX - rect.left) / rect.width - 0.5
    const y = (touch.clientY - rect.top) / rect.height - 0.5
    setTilt({ x, y, active: true })
  }

  const transform = tilt.active
    ? `perspective(700px) rotateY(${tilt.x * 10}deg) rotateX(${-tilt.y * 7}deg) scale(1.025)`
    : 'perspective(700px) rotateY(0deg) rotateX(0deg) scale(1)'

  const boxShadow = tilt.active
    ? `${-tilt.x * 20}px ${-tilt.y * 20}px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.2)`
    : '0 12px 40px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)'

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      style={{
        transform,
        boxShadow,
        transition: tilt.active
          ? 'box-shadow 0.1s ease'
          : 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s cubic-bezier(0.23,1,0.32,1)',
        borderRadius: 24,
        overflow: 'hidden',
        cursor: 'default',
        userSelect: 'none',
        background: 'radial-gradient(ellipse at 18% 0%, #232323 0%, #0e0e0e 55%, #161616 100%)',
        willChange: 'transform',
      }}
    >
      <div className="px-5 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-0.5" style={{ color: '#FC4C02' }}>
              Athlete Passport
            </p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: '#444' }}>
              STRAIN · GETSTRAIN.APP
            </p>
          </div>
          <img src="/strain-logo.svg" alt="Strain" className="h-5 w-auto opacity-20" style={{ filter: 'invert(1)' }} />
        </div>

        {/* Identity */}
        <div className="flex items-center gap-3 mb-5">
          <img
            src="/avatar-marcel.jpg"
            alt="Marcel Hug"
            className="w-12 h-12 rounded-2xl object-cover shrink-0"
            style={{ border: '2px solid #222' }}
          />
          <div>
            <p className="font-bold text-white text-lg leading-tight">Marcel Hug</p>
            <p className="text-xs" style={{ color: '#555' }}>@marcelhug</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[
            { label: 'COMPLETED', value: '24' },
            { label: 'UPCOMING',  value: '3' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[9px] font-bold tracking-widest mb-1" style={{ color: '#555' }}>{label}</p>
              <p className="text-sm font-bold text-white">{value}</p>
            </div>
          ))}

          {/* Countries */}
          <div className="rounded-2xl p-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-[9px] font-bold tracking-widest mb-1.5" style={{ color: '#555' }}>COUNTRIES</p>
            <div className="flex items-center flex-nowrap">
              {FLAGS.map((f, i) => (
                <div
                  key={f.country}
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{
                    width: 18, height: 18,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid #0e0e0e',
                    marginLeft: i > 0 ? -4 : 0,
                    fontSize: 11, lineHeight: 1,
                    zIndex: FLAGS.length - i,
                    position: 'relative',
                  }}
                >
                  {f.flag}
                </div>
              ))}
              <div
                className="flex items-center justify-center rounded-full text-[7px] font-bold shrink-0"
                style={{
                  width: 18, height: 18,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid #0e0e0e',
                  marginLeft: -4,
                  color: '#888',
                  position: 'relative',
                  zIndex: 0,
                }}
              >
                +{EXTRA_FLAGS}
              </div>
            </div>
          </div>
        </div>

        {/* PBs */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-[9px] font-bold tracking-widest px-3 pt-3 pb-2" style={{ color: '#555' }}>PERSONAL BESTS</p>
          {PBS.map((pb, i) => (
            <div key={pb.label}>
              {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs" style={{ color: '#666' }}>{pb.label}</span>
                <span className="text-xs font-bold text-white">{pb.time}</span>
              </div>
            </div>
          ))}
          <div className="pb-1" />
        </div>
      </div>

      {/* MRZ */}
      <div className="px-5 py-3 overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid #1e1e1e' }}>
        <p className="font-mono text-[9px] tracking-[0.12em] whitespace-nowrap overflow-hidden" style={{ color: '#2d2d2d' }}>
          {MRZ}
        </p>
      </div>
    </div>
  )
}
