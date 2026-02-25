'use client'

import { RaceData, CardStyle } from '@/lib/types'

interface RaceCardProps {
  data: RaceData
  style: CardStyle
  cardRef: React.RefObject<HTMLDivElement | null>
}

const FONTS: Record<CardStyle['fontFamily'], string> = {
  inter: "'Inter', 'Helvetica Neue', sans-serif",
  mono: "'Space Mono', 'Courier New', monospace",
  grotesk: "'Space Grotesk', 'Inter', sans-serif",
}

const DIMS = {
  story:  { width: 380, minHeight: 480 },
  square: { width: 380, minHeight: 380 },
  wide:   { width: 560, minHeight: 260 },
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function makeStyle(color: string, shadow: boolean) {
  return {
    color,
    textShadow: shadow ? '0 1px 8px rgba(0,0,0,0.45)' : 'none',
  }
}

interface StatProps {
  label: string
  value: string
  suffix?: string
  color: string
  shadow: boolean
  valueSz?: number
  labelSz?: number
  labelOpacity?: number
}

function Stat({ label, value, suffix, color, shadow, valueSz = 22, labelSz = 9, labelOpacity = 0.5 }: StatProps) {
  if (!value) return null
  const base = makeStyle(color, shadow)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <span style={{
        ...base,
        fontSize: `${labelSz}px`,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        opacity: labelOpacity,
        lineHeight: 1,
      }}>
        {label}
      </span>
      <span style={{
        ...base,
        fontSize: `${valueSz}px`,
        fontWeight: 700,
        letterSpacing: '-0.01em',
        lineHeight: 1,
      }}>
        {value}
        {suffix && (
          <span style={{ fontSize: `${valueSz * 0.52}px`, opacity: 0.55, marginLeft: '2px', fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </span>
    </div>
  )
}

function Dot({ color, shadow }: { color: string; shadow: boolean }) {
  return (
    <span style={{
      ...makeStyle(color, shadow),
      fontSize: '10px',
      opacity: 0.25,
      alignSelf: 'center',
      lineHeight: 1,
    }}>
      ●
    </span>
  )
}

function Line({ color }: { color: string }) {
  return (
    <div style={{
      width: '28px',
      height: '2px',
      backgroundColor: color,
      opacity: 0.35,
      flexShrink: 0,
    }} />
  )
}

function NotePills({ notes, color, shadow }: { notes: string[]; color: string; shadow: boolean }) {
  if (!notes || notes.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '18px' }}>
      {notes.map((note, i) => (
        <span
          key={i}
          style={{
            color,
            textShadow: shadow ? '0 1px 8px rgba(0,0,0,0.45)' : 'none',
            fontSize: '9px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            lineHeight: 1.3,
            padding: '4px 9px',
            borderRadius: '999px',
            border: `1px solid ${color}`,
            opacity: 0.65,
            display: 'inline-block',
          }}
        >
          {note}
        </span>
      ))}
    </div>
  )
}

// ─── Template: Classic ─────────────────────────────────────────────────────────
// Race name → Runner → divider line → HUGE time → stats row

function ClassicTemplate({ data, style, dim }: { data: RaceData; style: CardStyle; dim: typeof DIMS.story }) {
  const { textColor: c, textShadow: sh, showBib, showPace, showPosition, showCategory, layout } = style
  const base = makeStyle(c, sh)
  const isWide = layout === 'wide'

  const secondaryStats: { label: string; value: string; suffix?: string }[] = [
    { label: 'Distance', value: data.distance },
    ...(showPace && data.pace ? [{ label: 'Avg Pace', value: data.pace, suffix: '/km' }] : []),
    ...(showPosition && data.overallPosition ? [{ label: 'Overall', value: data.overallPosition }] : []),
    ...(showCategory && (data.category || data.categoryPosition)
      ? [{ label: 'Category', value: data.categoryPosition || data.category || '' }]
      : []),
  ].filter(s => s.value)

  if (isWide) {
    return (
      <div style={{
        ...base,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '48px',
        width: `${dim.width}px`,
        minHeight: `${dim.minHeight}px`,
        padding: '32px 36px',
        boxSizing: 'border-box',
      }}>
        {/* Left: identity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '0 0 auto', maxWidth: '200px' }}>
          <span style={{ ...base, fontSize: '9px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45 }}>
            {data.raceName}
          </span>
          {data.raceDate && (
            <span style={{ ...base, fontSize: '10px', opacity: 0.35 }}>{data.raceDate}</span>
          )}
          {data.runnerName && (
            <span style={{ ...base, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: '4px' }}>
              {data.runnerName}
            </span>
          )}
          {showBib && data.bibNumber && (
            <span style={{ ...base, fontSize: '10px', opacity: 0.4, letterSpacing: '0.06em' }}>BIB #{data.bibNumber}</span>
          )}
        </div>

        {/* Right: stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          <div>
            <span style={{ ...base, fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45 }}>Net Time</span>
            <div style={{ ...base, fontSize: '52px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{data.netTime}</div>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {secondaryStats.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {i > 0 && <Dot color={c} shadow={sh} />}
                <Stat label={s.label} value={s.value} suffix={s.suffix} color={c} shadow={sh} valueSz={18} />
              </div>
            ))}
          </div>
          <NotePills notes={style.notes} color={c} shadow={sh} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      ...base,
      display: 'flex',
      flexDirection: 'column',
      width: `${dim.width}px`,
      minHeight: `${dim.minHeight}px`,
      padding: '36px 32px',
      boxSizing: 'border-box',
    }}>
      {/* Race name + date */}
      <span style={{ ...base, fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.45, lineHeight: 1.4 }}>
        {data.raceName}
      </span>
      {data.raceDate && (
        <span style={{ ...base, fontSize: '10px', opacity: 0.3, marginTop: '2px' }}>{data.raceDate}</span>
      )}

      {/* Runner + BIB */}
      {data.runnerName && (
        <span style={{ ...base, fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: '16px' }}>
          {data.runnerName}
        </span>
      )}
      {showBib && data.bibNumber && (
        <span style={{ ...base, fontSize: '10px', opacity: 0.38, letterSpacing: '0.08em', marginTop: '4px' }}>
          BIB #{data.bibNumber}
        </span>
      )}

      {/* Divider line */}
      <Line color={c} />

      {/* Time hero */}
      <div style={{ marginTop: '20px' }}>
        <span style={{ ...base, fontSize: '9px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.45 }}>
          Net Time
        </span>
        <div style={{ ...base, fontSize: '64px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginTop: '4px' }}>
          {data.netTime}
        </div>
      </div>

      {/* Secondary stats */}
      {secondaryStats.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          {secondaryStats.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {i > 0 && <Dot color={c} shadow={sh} />}
              <Stat label={s.label} value={s.value} suffix={s.suffix} color={c} shadow={sh} valueSz={20} />
            </div>
          ))}
        </div>
      )}

      {/* Category pill */}
      {showCategory && data.category && (
        <span style={{
          ...base,
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.4,
          marginTop: '20px',
        }}>
          {data.category}
        </span>
      )}

      <NotePills notes={style.notes} color={c} shadow={sh} />
    </div>
  )
}

// ─── Template: Bold ────────────────────────────────────────────────────────────
// Giant time front-and-center, rule beneath, identity + stats below

function BoldTemplate({ data, style, dim }: { data: RaceData; style: CardStyle; dim: typeof DIMS.story }) {
  const { textColor: c, textShadow: sh, showBib, showPace, showPosition, showCategory } = style
  const base = makeStyle(c, sh)

  const stats: { label: string; value: string; suffix?: string }[] = [
    { label: 'Distance', value: data.distance },
    ...(showPace && data.pace ? [{ label: 'Avg Pace', value: data.pace, suffix: '/km' }] : []),
    ...(showPosition && data.overallPosition ? [{ label: 'Overall', value: data.overallPosition }] : []),
    ...(showCategory && (data.category || data.categoryPosition)
      ? [{ label: 'Category', value: data.categoryPosition || data.category || '' }]
      : []),
  ].filter(s => s.value)

  return (
    <div style={{
      ...base,
      display: 'flex',
      flexDirection: 'column',
      width: `${dim.width}px`,
      minHeight: `${dim.minHeight}px`,
      padding: '36px 32px',
      boxSizing: 'border-box',
    }}>
      {/* Label */}
      <span style={{ ...base, fontSize: '9px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', opacity: 0.4 }}>
        Net Time
      </span>

      {/* Massive time */}
      <div style={{ ...base, fontSize: '76px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginTop: '6px' }}>
        {data.netTime}
      </div>

      {/* Full-width rule */}
      <div style={{ width: '100%', height: '1px', backgroundColor: c, opacity: 0.18, margin: '20px 0' }} />

      {/* Stats grid */}
      {stats.length > 0 && (
        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
          {stats.map(s => (
            <Stat key={s.label} label={s.label} value={s.value} suffix={s.suffix} color={c} shadow={sh} valueSz={22} />
          ))}
        </div>
      )}

      <NotePills notes={style.notes} color={c} shadow={sh} />

      {/* Identity row at bottom */}
      <div style={{ marginTop: 'auto', paddingTop: '28px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {data.runnerName && (
          <span style={{ ...base, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            {data.runnerName}
            {showBib && data.bibNumber && (
              <span style={{ fontSize: '11px', opacity: 0.38, fontWeight: 400, marginLeft: '8px', letterSpacing: '0.06em' }}>
                #{data.bibNumber}
              </span>
            )}
          </span>
        )}
        <span style={{ ...base, fontSize: '10px', opacity: 0.38, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {data.raceName}{data.raceDate ? ` · ${data.raceDate}` : ''}
        </span>
      </div>
    </div>
  )
}

// ─── Template: Minimal ─────────────────────────────────────────────────────────
// Three stats in a Strava-style vertical column, nothing else

function MinimalTemplate({ data, style, dim }: { data: RaceData; style: CardStyle; dim: typeof DIMS.story }) {
  const { textColor: c, textShadow: sh, showPace, showPosition } = style
  const base = makeStyle(c, sh)

  const rows: { label: string; value: string; suffix?: string; hero?: boolean }[] = [
    { label: 'Net Time', value: data.netTime, hero: true },
    ...(data.distance ? [{ label: 'Distance', value: data.distance }] : []),
    ...(showPace && data.pace ? [{ label: 'Avg Pace', value: data.pace, suffix: '/km' }] : []),
    ...(showPosition && data.overallPosition ? [{ label: 'Overall Rank', value: data.overallPosition }] : []),
  ].filter(s => s.value)

  return (
    <div style={{
      ...base,
      display: 'flex',
      flexDirection: 'column',
      gap: '22px',
      width: `${dim.width}px`,
      minHeight: `${dim.minHeight}px`,
      padding: '36px 32px',
      boxSizing: 'border-box',
      justifyContent: 'center',
    }}>
      {rows.map(row => (
        <Stat
          key={row.label}
          label={row.label}
          value={row.value}
          suffix={row.suffix}
          color={c}
          shadow={sh}
          valueSz={row.hero ? 58 : 30}
          labelSz={10}
          labelOpacity={0.45}
        />
      ))}

      {/* Subtle footer: runner + race */}
      {(data.runnerName || data.raceName) && (
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {data.runnerName && (
            <span style={{ ...base, fontSize: '12px', fontWeight: 600, opacity: 0.55 }}>{data.runnerName}</span>
          )}
          {data.runnerName && data.raceName && (
            <Dot color={c} shadow={sh} />
          )}
          {data.raceName && (
            <span style={{ ...base, fontSize: '11px', opacity: 0.35, fontWeight: 400 }}>{data.raceName}</span>
          )}
        </div>
      )}

      <NotePills notes={style.notes} color={c} shadow={sh} />
    </div>
  )
}

// ─── Background styles ─────────────────────────────────────────────────────────

const BG_STYLES: Record<string, React.CSSProperties> = {
  transparent: {
    background: 'transparent',
  },
  // Frosted white — light semi-opaque background that looks like sandblasted glass
  // backdrop-filter works in browser preview; exported PNG gets the flat tint
  blur: {
    background: 'rgba(255, 255, 255, 0.20)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.40)',
    borderRadius: '20px',
    boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
  },
  // Clear glass — nearly invisible, defined by its sharp bright edge
  glass: {
    background: 'rgba(255, 255, 255, 0.07)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1.5px solid rgba(255, 255, 255, 0.55)',
    borderRadius: '20px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 24px rgba(0,0,0,0.08)',
  },
}

// ─── Main export ───────────────────────────────────────────────────────────────

export default function RaceCard({ data, style, cardRef }: RaceCardProps) {
  const font = FONTS[style.fontFamily]
  const dim = DIMS[style.layout]
  const bgStyle = BG_STYLES[style.cardBg ?? 'transparent']

  const templateProps = { data, style, dim }

  return (
    <div
      ref={cardRef}
      id="race-card"
      style={{
        fontFamily: font,
        display: 'inline-block',
        WebkitFontSmoothing: 'antialiased',
        ...bgStyle,
      }}
    >
      {style.template === 'classic' && <ClassicTemplate {...templateProps} />}
      {style.template === 'bold'    && <BoldTemplate    {...templateProps} />}
      {style.template === 'minimal' && <MinimalTemplate {...templateProps} />}
    </div>
  )
}
