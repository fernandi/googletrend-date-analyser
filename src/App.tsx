import { useEffect, useState } from 'react'
import './App.css'
import TrendsChart from './components/TrendsChart'
import RelativePeriodSlider from './components/RelativePeriodSlider'
import DateManager from './components/DateManager'
import { DEFAULT_DATES } from './constants/defaultDates'
import { computeTimeRangeISO, formatKeywordFromDate, serializeDates, deserializeDates } from './utils/dateUtils'
import type { ObservedDate } from './utils/dateUtils'

function App() {
  // Lecture initiale depuis l'URL (synchrone, avant le premier rendu)
  const initialParams = (() => {
    const p = new URLSearchParams(window.location.search)
    const sRaw = Number(p.get('start'))
    const eRaw = Number(p.get('end'))
    const s = Number.isFinite(sRaw) ? Math.max(-30, Math.min(sRaw, 0)) : undefined
    const e = Number.isFinite(eRaw) ? Math.max(-30, Math.min(eRaw, 0)) : undefined
    const parsed = deserializeDates(p.get('dates'))
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
    window.history.replaceState(null, '', url)
  }, [dates, startOffset, endOffset])

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
                <a target="_blank" href={`https://trends.google.fr/trends/explore?date=${range.start}%20${range.end}&geo=FR&q=${encodeURIComponent(keyword)},%2Fm%2F0d07ph`}>Ouvrir dans Google Trends</a>
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
