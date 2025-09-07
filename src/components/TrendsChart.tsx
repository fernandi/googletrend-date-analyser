import { useEffect, useMemo, useRef, useState } from 'react'
import type { TimeseriesComparisonItem } from '../utils/trendsEmbed'
import { schedule } from '../utils/loadQueue'

type Props = {
  items: TimeseriesComparisonItem[]
  from: string
  to: string
  manualOnly?: boolean
}

export default function TrendsChart({ items, from, to, manualOnly = true }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [, setLoaded] = useState(false)
  const [iframeKey] = useState(0)

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

  const srcDoc = useMemo(() => {
    if (!shouldLoad) return ''
    const geo = items[0]?.geo ?? 'FR'
    const q = items.map((i) => encodeURIComponent(i.keyword)).join(',')
    const widgetConfig = {
      comparisonItem: items,
      category: 0,
      property: '',
    }
    const exploreQuery = new URLSearchParams({ date: `${from} ${to}`, geo, q }).toString()
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><style>html,body,#c{margin:0;padding:0;}</style></head><body><div id="c"></div><script>function __render(){trends.embed.renderExploreWidget("TIMESERIES", ${JSON.stringify(
      widgetConfig
    )}, {exploreQuery: ${JSON.stringify(
      exploreQuery
    )}, guestPath: "https://trends.google.fr:443/trends/embed/"});}</script><script src="https://ssl.gstatic.com/trends_nrtr/4207_RC01/embed_loader.js" onload="__render()"></script></body></html>`
  }, [shouldLoad, items, from, to])

  return (
    <div ref={containerRef} style={{ width: '100%', height: 360 }}>
      {shouldLoad ? (
        <iframe
          key={iframeKey}
          style={{ width: '100%', height: '100%', border: '0' }}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          onLoad={() => setLoaded(true)}
        />
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


