import { useEffect, useState } from 'react'
import './App.css'
import TrendsChart from './components/TrendsChart'
import RelativePeriodSlider from './components/RelativePeriodSlider'
import DateManager from './components/DateManager'
import { DEFAULT_DATES } from './constants/defaultDates'
import { computeTimeRangeISO, formatKeywordFromDate, serializeDates, deserializeDates, makeDateFromObserved } from './utils/dateUtils'
import type { ObservedDate } from './utils/dateUtils'
import { configureQueue } from './utils/loadQueue'

function App() {
  // Espacer les chargements d'iframes pour éviter les 429 côté Google Trends
  useEffect(() => {
    configureQueue({ spacingMs: 5000 })
  }, [])
  // Lecture initiale depuis l'URL (synchrone, avant le premier rendu)
  const initialParams = (() => {
    const p = new URLSearchParams(window.location.search)
    const sRaw = Number(p.get('start'))
    const eRaw = Number(p.get('end'))
    const parsed = deserializeDates(p.get('dates'))

    const datesInit = (parsed && parsed.length ? parsed : DEFAULT_DATES) as ObservedDate[]
    const { start: defStart, end: defEnd } = computeDefaultOffsets(datesInit[0])
    console.log('[init] url params', { sRaw, eRaw, parsed })
    console.log('[init] firstDateForDefaults', datesInit[0])
    console.log('[init] defaultOffsets', { defStart, defEnd })

    const sCand = Number.isFinite(sRaw) ? clampOffset(sRaw) : undefined
    const eCand = Number.isFinite(eRaw) ? clampOffset(eRaw) : undefined
    // Si l'URL force 0/0 (ancien défaut), on ignore et on applique le calcul dynamique
    const useDynamic = sCand === 0 && eCand === 0
    const s = useDynamic ? defStart : (sCand ?? defStart)
    const e = useDynamic ? defEnd : (eCand ?? defEnd)
    console.log('[init] selectedOffsets', { s, e, reason: useDynamic ? 'override-0-0-to-defaults' : 'url-or-defaults' })

    return { s, e, dates: parsed as ObservedDate[] | null }
  })()

  const [dates, setDates] = useState<ObservedDate[]>(initialParams.dates ?? DEFAULT_DATES)
  const [startOffset, setStartOffset] = useState<number>(initialParams.s ?? -30)
  const [endOffset, setEndOffset] = useState<number>(initialParams.e ?? 0)

  // Sync état -> URL (remplace l'historique)
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('start', String(startOffset))
    params.set('end', String(endOffset))
    params.set('dates', serializeDates(dates))
    const url = `${window.location.pathname}?${params.toString()}`
    console.log('[sync->url]', { startOffset, endOffset, datesSerialized: params.get('dates') })
    window.history.replaceState(null, '', url)
  }, [dates, startOffset, endOffset])

  function clampOffset(v: number): number {
    return Math.max(-30, Math.min(v, 0))
  }

  function computeDefaultOffsets(first: ObservedDate): { start: number; end: number } {
    const today = new Date()
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const event = makeDateFromObserved(first)
    const daysToEvent = Math.floor((event.getTime() - t.getTime()) / (24 * 60 * 60 * 1000))
    console.log('[defaults] today vs event', { today: t.toISOString().slice(0,10), event: event.toISOString().slice(0,10), daysToEvent })
    // Default window: one week before the reference point
    if (daysToEvent > 0) {
      // Event in the future: end at today's relative offset (negative), keep 7 days
      let end = clampOffset(-daysToEvent)
      let start = end - 6
      if (start < -30) {
        start = -30
        end = Math.min(start + 6, 0)
      }
      console.log('[defaults] future event ->', { start, end })
      return { start, end }
    }
    // Event today or past: J-6 → J
    console.log('[defaults] past/today -> { start: -6, end: 0 }')
    return { start: -6, end: 0 }
  }

  return (
    <div style={{ display: 'flex', gap:0, padding: 0, height: '100vh', overflow: 'hidden' }}>

        <div style={{ width: 250, minWidth: 250, maxWidth: 250, marginRight: 0, padding: 19, textAlign: 'left', background: '#2f2f2f', overflowY: 'scroll' }}>

        <h2 style={{ marginTop: 0 }}>Est-ce que le peuple se prépare à sortir&nbsp;?</h2>
        <div style={{ fontSize: 12, color: 'rgb(136, 136, 136)', textAlign: 'left' }}>
Comparez les recherches Google à la veille des manifestations. Date de références :<br></br>
- Succès : 17 novembre 2018 (Gilets Jaunes acte 1), 7 mars 2023 (grève retraites)<br></br>
- Échecs : 16 mars 2019 (Derniers grands acte de Gilets Jaunes), 21 septembre 2024 (destitution de Macron) <br></br>
- Témoin : 11 février 2024 (date random)        </div>
        <RelativePeriodSlider
          start={startOffset}
          end={endOffset}
          onChange={(s, e) => { setStartOffset(s); setEndOffset(e) }}
        />
        <DateManager value={dates} onChange={setDates} />
      </div>

      <div style={{ flex: '1 1 600px', display: 'flex', flexWrap: 'wrap', gap: 16, alignContent: 'flex-start', overflowY: 'scroll',margin:'0 10px' }}>
        {dates.map((d) => {
          const range = computeTimeRangeISO(d, { startOffsetDays: startOffset, endOffsetDays: endOffset })
          const keyword = formatKeywordFromDate(d.day, d.month)
          return (
            <div key={d.id} style={{ flex: '1 1 520px', minWidth: 360, maxWidth: 680, borderRadius: 8, padding: 8 }}>
              <h3 style={{ margin: '4px 0 8px' }}>{/* Titre avec année */}{`${keyword} ${d.year}`}</h3>
              <TrendsChart
                from={range.start}
                to={range.end}
                items={[
                  { keyword, geo: 'FR', time: `${range.start} ${range.end}` },
                  { keyword: '/m/0d07ph', geo: 'FR', time: `${range.start} ${range.end}` },
                ]}
              />
              <div style={{ marginTop: 6, display: 'flex', gap: 12, alignItems: 'center' }}>
                <a target="_blank" href={`https://trends.google.com/trends/explore?date=${range.start}%20${range.end}&geo=FR&q=${encodeURIComponent(keyword)},%2Fm%2F0d07ph`}>Ouvrir dans Google Trends</a>
                <a onClick={() => window.dispatchEvent(new CustomEvent('trends:reload', { detail: { id: d.id } }))} style={{ cursor: 'pointer', color: '#3b82f6' }}>Recharger</a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
