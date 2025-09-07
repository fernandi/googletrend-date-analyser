import { useMemo } from 'react'

type Props = {
  start: number // negative, >= -30
  end: number // <= 0
  onChange: (start: number, end: number) => void
}

export default function RelativePeriodSlider({ start, end, onChange }: Props) {
  const min = -30
  const max = 0

  const startClamped = useMemo(() => Math.max(min, Math.min(start, end)), [start, end])
  const endClamped = useMemo(() => Math.min(max, Math.max(end, start)), [start, end])

  const pct = (v: number) => ((v - min) / (max - min)) * 100
  const startPct = pct(startClamped)
  const endPct = pct(endClamped)

  return (
    <div style={{ display: 'grid', gap: 0, margin:'30px 0' }}>
      <label style={{ fontSize: 12, fontWeight: 600, textAlign: 'left' }}>
        Période d'observation : de J{startClamped} à J{endClamped}
      </label>

      <div style={{ position: 'relative', height: 24 }}>
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 4,
            background: `linear-gradient(90deg, #555 ${startPct}%, #8ab4f8 ${startPct}%, #8ab4f8 ${endPct}%, #555 ${endPct}%)`,
            pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={startClamped}
          onChange={(e) => {
            const next = parseInt(e.target.value, 10)
            onChange(Math.min(next, endClamped), endClamped)
          }}
          style={{ position: 'absolute', inset: 0, background: 'none', WebkitAppearance: 'none' as any, pointerEvents: 'none' }}
          className="double-slider-thumb"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={endClamped}
          onChange={(e) => {
            const next = parseInt(e.target.value, 10)
            onChange(startClamped, Math.max(next, startClamped))
          }}
          style={{ position: 'absolute', inset: 0, background: 'none', WebkitAppearance: 'none' as any, pointerEvents: 'none' }}
          className="double-slider-thumb"
        />
      </div>
      <div style={{ fontSize: 12, color: '#888', textAlign: 'left' }}>
        Fenêtre maximale : de J-30 au jour J.
      </div>
    </div>
  )
}


