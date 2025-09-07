import { useEffect, useRef, useState } from 'react'
import type { TimeseriesComparisonItem } from '../utils/trendsEmbed'
import { ensureTrendsScript, renderTimeseries } from '../utils/trendsEmbed'
import { schedule } from '../utils/loadQueue'

type Props = {
  items: TimeseriesComparisonItem[]
  from: string
  to: string
  manualOnly?: boolean
}

export default function TrendsChart({ items, from, to, manualOnly = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [, setLoaded] = useState(false)

  // Si manualOnly=false, on charge quand le composant devient visible
  useEffect(() => {
    if (manualOnly) return
    const el = containerRef.current
    if (!el) return
    let cancel = false
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          schedule(() => {
            if (!cancel) setShouldLoad(true)
          })
        }
      }
    })
    io.observe(el)
    return () => {
      cancel = true
      io.disconnect()
    }
  }, [manualOnly])

  // Charger le script Trends et rendre directement dans la page
  useEffect(() => {
    if (!shouldLoad) return
    const el = innerRef.current
    if (!el) return
    let cancelled = false
    schedule(async () => {
      await ensureTrendsScript()
      if (cancelled) return
      renderTimeseries(el, items, { from, to })
      setLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [shouldLoad, items, from, to])

  return (
    <div ref={containerRef} style={{ width: '100%', height: 360 }}>
      {shouldLoad ? (
        <div ref={innerRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div style={{display:'grid',placeItems:'center',height:'100%', backgroundColor: '#f0f0f01a'}}>
          <button onClick={() => schedule(() => setShouldLoad(true))}>Charger le graphique</button>
        </div>
      )}
      {shouldLoad && (
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            function onReload(e){
              try {
                // Simple refresh by toggling state via a custom event triggered from parent
                if (!e || !e.detail) return;
                // No id match logic here; each card has its own handler scope
                const ev = e;
                setTimeout(function(){
                  try { window.removeEventListener('trends:reload', onReload); } catch(_){}
                }, 0);
              } catch(_){}
            }
            window.addEventListener('trends:reload', onReload);
          })();
        ` }} />
      )}
    </div>
  )
}


