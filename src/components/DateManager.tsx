import { useMemo, useState } from 'react'
import { observedLabel } from '../utils/dateUtils'
import type { ObservedDate } from '../utils/dateUtils'
import { DEFAULT_DATES } from '../constants/defaultDates'

type Props = {
  value?: ObservedDate[]
  onChange?: (dates: ObservedDate[]) => void
}

export default function DateManager({ value, onChange }: Props) {
  const [dates, setDates] = useState<ObservedDate[]>(value ?? DEFAULT_DATES)
  const [newDateStr, setNewDateStr] = useState<string>('')

  const list = useMemo(() => dates, [dates])

  const update = (next: ObservedDate[]) => {
    setDates(next)
    onChange?.(next)
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {list.map((d) => (
          <span
            key={d.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              background: '#e5e7eb',
              color: '#111827',
              borderRadius: 8,
              fontWeight: 600,
            }}
            title={observedLabel(d)}
          >
            {observedLabel(d)}
            <a
              aria-label="Supprimer"
              onClick={() => update(list.filter((x) => x.id !== d.id))}
              style={{
                marginLeft: 4,
                color: 'black'
              }}
            >
              ×
            </a>
          </span>
        ))}
 
      <div style={{ display: 'flex', gap: 0, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="JJ/MM/AAAA"
          value={newDateStr}
          onChange={(e) => setNewDateStr(e.target.value)}
          style={{
            background: '#dbeafe1a',
            color: '#111827',
            border: 'none',
            borderRadius: '8px 0px 0px 8px',
            padding: '6px 12px',
            width: 110,
            fontWeight: 700,
            textAlign: 'left',
            letterSpacing: 1,
            fontSize: 'inherit',
            lineHeight: 'inherit',
          }}
        />
        <a
          onClick={() => {
            const m = newDateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
            if (!m) return
            const day = parseInt(m[1], 10)
            const month = parseInt(m[2], 10)
            const year = parseInt(m[3], 10)
            if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900) return
            const id = `d-${day}-${month}-${year}-${Math.random().toString(36).slice(2, 8)}`
            update([...list, { id, day, month, year }])
            setNewDateStr('')
          }}
          style={{
            background: '#37383a',
            color: '#757575',
            border: 'none',
            borderRadius: "0px 8px 8px 0px",
            padding: '6px 14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          +
        </a>
      </div>
    </div>
    </div>
  )
}



