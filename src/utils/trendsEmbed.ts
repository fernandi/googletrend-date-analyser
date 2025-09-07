declare global {
  interface Window {
    trends?: {
      embed: {
        renderExploreWidget: (
          type: 'TIMESERIES',
          widgetConfig: unknown,
          opts: { exploreQuery: string; guestPath: string }
        ) => void
      }
    }
  }
}

const TRENDS_SCRIPT_URL =
  'https://ssl.gstatic.com/trends_nrtr/4207_RC01/embed_loader.js';

let scriptLoadingPromise: Promise<void> | null = null;

export function ensureTrendsScript(): Promise<void> {
  if (window.trends && window.trends.embed) {
    return Promise.resolve();
  }
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${TRENDS_SCRIPT_URL}"]`
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject());
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = TRENDS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Trends'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export type TimeseriesComparisonItem = {
  keyword: string; // e.g. '17 novembre' or '/m/0d07ph'
  geo: string; // e.g. 'FR'
  time: string; // 'YYYY-MM-DD YYYY-MM-DD'
};

export function renderTimeseries(
  element: HTMLElement,
  items: TimeseriesComparisonItem[],
  opts: { geo?: string; from: string; to: string }
) {
  const query = new URLSearchParams({
    date: `${opts.from} ${opts.to}`,
    geo: items[0]?.geo ?? 'FR',
    q: items.map((i) => encodeURIComponent(i.keyword)).join(','),
  }).toString();

  // The Trends embed API targets the given element by currently focused container.
  // To isolate per-chart rendering, we temporarily mount a unique container id.
  const container = document.createElement('div');
  element.innerHTML = '';
  element.appendChild(container);

  window.trends!.embed.renderExploreWidget(
    'TIMESERIES',
    {
      comparisonItem: items,
      category: 0,
      property: '',
    },
    {
      exploreQuery: query,
      guestPath: 'https://trends.google.com:443/trends/embed/',
    }
  );
}


