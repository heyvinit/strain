'use client'

import { CardStyle } from '@/lib/types'

interface ControlsProps {
  style: CardStyle
  onChange: (style: CardStyle) => void
}

const COLOR_PRESETS = [
  { label: 'White',  value: '#ffffff' },
  { label: 'Black',  value: '#000000' },
  { label: 'Orange', value: '#FF4500' },
  { label: 'Cyan',   value: '#00D4FF' },
  { label: 'Gold',   value: '#FFD060' },
]

const FONTS: { label: string; value: CardStyle['fontFamily']; preview: string }[] = [
  { label: 'Grotesk', value: 'grotesk', preview: '01:45' },
  { label: 'Inter',   value: 'inter',   preview: '01:45' },
  { label: 'Mono',    value: 'mono',    preview: '01:45' },
]

const TEMPLATES: { label: string; value: CardStyle['template']; desc: string; thumb: React.ReactNode }[] = [
  {
    label: 'Classic',
    value: 'classic',
    desc: 'Name first, time hero',
    thumb: (
      <svg viewBox="0 0 52 64" fill="currentColor" className="w-full h-full">
        <rect x="4" y="6"  width="24" height="3" rx="1.5" opacity="0.35"/>
        <rect x="4" y="13" width="34" height="5" rx="2" opacity="0.85"/>
        <rect x="4" y="21" width="16" height="2" rx="1" opacity="0.25"/>
        <rect x="4" y="27" width="8"  height="1.5" rx="0.75" opacity="0.3"/>
        <rect x="4" y="33" width="40" height="10" rx="2" opacity="0.9"/>
        <rect x="4" y="48" width="16" height="3" rx="1.5" opacity="0.6"/>
        <rect x="22" y="48" width="14" height="3" rx="1.5" opacity="0.6"/>
      </svg>
    ),
  },
  {
    label: 'Bold',
    value: 'bold',
    desc: 'Time first, dramatic',
    thumb: (
      <svg viewBox="0 0 52 64" fill="currentColor" className="w-full h-full">
        <rect x="4" y="4"  width="18" height="2" rx="1" opacity="0.3"/>
        <rect x="4" y="10" width="44" height="13" rx="2" opacity="0.9"/>
        <rect x="4" y="27" width="44" height="1" rx="0.5" opacity="0.2"/>
        <rect x="4" y="33" width="16" height="3" rx="1.5" opacity="0.6"/>
        <rect x="24" y="33" width="16" height="3" rx="1.5" opacity="0.6"/>
        <rect x="4" y="52" width="28" height="4" rx="2" opacity="0.8"/>
        <rect x="4" y="59" width="36" height="2" rx="1" opacity="0.3"/>
      </svg>
    ),
  },
  {
    label: 'Minimal',
    value: 'minimal',
    desc: 'Stats only, clean',
    thumb: (
      <svg viewBox="0 0 52 64" fill="currentColor" className="w-full h-full">
        <rect x="4" y="6"  width="18" height="2" rx="1" opacity="0.35"/>
        <rect x="4" y="11" width="44" height="11" rx="2" opacity="0.9"/>
        <rect x="4" y="28" width="18" height="2" rx="1" opacity="0.35"/>
        <rect x="4" y="33" width="30" height="6" rx="2" opacity="0.75"/>
        <rect x="4" y="45" width="18" height="2" rx="1" opacity="0.35"/>
        <rect x="4" y="50" width="22" height="6" rx="2" opacity="0.75"/>
      </svg>
    ),
  },
]

const LAYOUTS: { label: string; value: CardStyle['layout']; ratio: string }[] = [
  { label: 'Story',  value: 'story',  ratio: '9:16' },
  { label: 'Square', value: 'square', ratio: '1:1'  },
  { label: 'Wide',   value: 'wide',   ratio: '16:9' },
]

const TOGGLES: { label: string; key: keyof Pick<CardStyle, 'showBib' | 'showPosition' | 'showPace' | 'showCategory' | 'textShadow'> }[] = [
  { label: 'BIB',      key: 'showBib'      },
  { label: 'Position', key: 'showPosition' },
  { label: 'Pace',     key: 'showPace'     },
  { label: 'Category', key: 'showCategory' },
  { label: 'Shadow',   key: 'textShadow'   },
]

export default function Controls({ style, onChange }: ControlsProps) {
  const set = (patch: Partial<CardStyle>) => onChange({ ...style, ...patch })

  return (
    <div className="flex flex-col gap-5">

      {/* Template */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Template</p>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.value}
              onClick={() => set({ template: t.value })}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                style.template === t.value
                  ? 'border-white bg-white/10'
                  : 'border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className={`w-10 h-12 ${style.template === t.value ? 'text-white' : 'text-zinc-500'}`}>
                {t.thumb}
              </div>
              <span className={`text-[10px] font-semibold ${style.template === t.value ? 'text-white' : 'text-zinc-500'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Text Color</p>
        <div className="flex gap-2 flex-wrap items-center">
          {COLOR_PRESETS.map(c => (
            <button
              key={c.value}
              onClick={() => set({ textColor: c.value })}
              title={c.label}
              style={{ backgroundColor: c.value }}
              className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-95 ${
                style.textColor === c.value
                  ? 'border-blue-400 scale-110'
                  : 'border-zinc-600 hover:scale-105'
              }`}
            />
          ))}
          {/* Custom color swatch */}
          <div className="relative w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 border-zinc-600 hover:scale-105 transition-transform"
            style={{ background: 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)' }}>
            <input
              type="color"
              value={style.textColor}
              onChange={e => set({ textColor: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Font */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Font</p>
        <div className="flex gap-2">
          {FONTS.map(f => (
            <button
              key={f.value}
              onClick={() => set({ fontFamily: f.value })}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                style.fontFamily === f.value
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
              }`}
              style={{
                fontFamily: f.value === 'grotesk' ? "'Space Grotesk'" : f.value === 'mono' ? "'Space Mono'" : 'Inter',
              }}
            >
              {f.preview}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-1">
          {FONTS.map(f => (
            <span key={f.value} className="flex-1 text-center text-[9px] text-zinc-600">{f.label}</span>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Layout</p>
        <div className="flex gap-2">
          {LAYOUTS.map(l => (
            <button
              key={l.value}
              onClick={() => set({ layout: l.value })}
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                style.layout === l.value
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="text-xs font-semibold">{l.label}</div>
              <div className="text-[9px] opacity-50 mt-0.5">{l.ratio}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Show / Hide toggles */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Show Fields</p>
        <div className="flex flex-wrap gap-1.5">
          {TOGGLES.map(t => (
            <button
              key={t.key}
              onClick={() => set({ [t.key]: !style[t.key] })}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                style[t.key]
                  ? 'bg-white/10 text-white border-white/30'
                  : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Background */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Background</p>
        <div className="flex gap-2">
          {([
            { value: 'transparent', label: 'None', desc: 'Transparent' },
            { value: 'blur',        label: 'Blur',  desc: 'Dark frosted' },
            { value: 'glass',       label: 'Glass', desc: 'Glass effect' },
          ] as const).map(b => (
            <button
              key={b.value}
              onClick={() => set({ cardBg: b.value })}
              className={`flex-1 py-2 rounded-lg border transition-colors ${
                style.cardBg === b.value
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'
              }`}
            >
              <div className="text-xs font-semibold">{b.label}</div>
              <div className="text-[9px] opacity-50 mt-0.5">{b.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Race experience notes */}
      <NoteEditor style={style} set={set} />

    </div>
  )
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|[\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 1)
}

function NoteEditor({ style, set }: { style: CardStyle; set: (patch: Partial<CardStyle>) => void }) {
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value
    const sentences = splitIntoSentences(raw)
    set({ noteRaw: raw, notes: sentences })
  }

  const toggleNote = (sentence: string) => {
    const active = new Set(style.notes)
    if (active.has(sentence)) {
      active.delete(sentence)
    } else {
      active.add(sentence)
    }
    set({ notes: Array.from(active) })
  }

  const sentences = splitIntoSentences(style.noteRaw)

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 mb-2.5">Race Note</p>
      <textarea
        value={style.noteRaw}
        onChange={handleNoteChange}
        placeholder="Describe your race... (e.g. First half marathon! Ran through the rain. Finished strong.)"
        rows={3}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none leading-relaxed"
      />
      {sentences.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {sentences.map(s => {
            const active = style.notes.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleNote(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors leading-snug text-left ${
                  active
                    ? 'bg-white/10 text-white border-white/25'
                    : 'bg-transparent text-zinc-600 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
