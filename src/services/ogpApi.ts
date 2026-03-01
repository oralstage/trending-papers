// Fetch OGP image URL via Cloudflare Worker (shared with cm-viewer)
// KV is populated by Pi cron job for some publishers; others fetched directly by Worker

const CF_OGP_PROXY_URL = 'https://ogp-proxy.k-shinokita.workers.dev/ogp';
const MAX_CONCURRENT = 5;
let activeCount = 0;
const queue: Array<() => void> = [];

function enqueue(): Promise<void> {
  if (activeCount < MAX_CONCURRENT) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function dequeue() {
  activeCount--;
  const next = queue.shift();
  if (next) next();
}

const cache = new Map<string, string | null>();

export async function fetchOgpImageUrl(doiUrl: string): Promise<string | null> {
  if (cache.has(doiUrl)) return cache.get(doiUrl)!;

  await enqueue();
  try {
    const res = await fetch(`${CF_OGP_PROXY_URL}?url=${encodeURIComponent(doiUrl)}`);
    if (!res.ok) {
      cache.set(doiUrl, null);
      return null;
    }
    const data: { image: string | null } = await res.json();
    cache.set(doiUrl, data.image);
    return data.image;
  } catch {
    cache.set(doiUrl, null);
    return null;
  } finally {
    dequeue();
  }
}
