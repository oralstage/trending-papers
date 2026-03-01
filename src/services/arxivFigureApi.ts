// Fetch figure URL from arXiv HTML with concurrency control
// arXiv blocks when too many simultaneous requests are made

const MAX_CONCURRENT = 3;
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

export async function fetchArxivHtmlFigureUrl(arxivId: string): Promise<string | null> {
  if (cache.has(arxivId)) return cache.get(arxivId)!;

  await enqueue();
  try {
    const res = await fetch(`https://arxiv.org/html/${arxivId}v1`);
    if (!res.ok) {
      cache.set(arxivId, null);
      return null;
    }
    const html = await res.text();
    const match = html.match(/src="((?:extracted\/)?[^"]*?(?<!ltx_)[^"]*\.(?:png|jpg|jpeg|gif))"/);
    if (!match || match[1].includes('/static/') || match[1].startsWith('ltx_')) {
      cache.set(arxivId, null);
      return null;
    }
    const url = `https://arxiv.org/html/${arxivId}v1/${match[1]}`;
    cache.set(arxivId, url);
    return url;
  } catch {
    cache.set(arxivId, null);
    return null;
  } finally {
    dequeue();
  }
}
