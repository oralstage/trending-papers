/**
 * Construct Springer Nature Figure 1 URL directly from DOI.
 * Mirrors the approach in raspi-scripts/rss-filter/generate_feed.py: try_springer_figure()
 *
 * Pattern: https://media.springernature.com/lw685/springer-static/image/
 *          art%3A10.1038%2F{doi_suffix}/MediaObjects/{journal_id}_{year}_{article_id}_Fig1_HTML.png
 */

const cache = new Map<string, string | null>();

export function trySpringerFigureUrl(doi: string | null): string | null {
  if (!doi) return null;
  if (cache.has(doi)) return cache.get(doi)!;

  // Match Nature DOI pattern: 10.1038/s{journal_id}-{0}{yy}-{article_id}-{suffix}
  const m = doi.match(/10\.1038\/(s(\d+)-(\d)(\d{2})-(\d+)-\w+)/);
  if (!m) {
    cache.set(doi, null);
    return null;
  }

  const doiSuffix = m[1];
  const journalId = m[2];
  const yy = m[4];
  const articleId = m[5].replace(/^0+/, ''); // strip leading zeros

  const year = `20${yy}`;
  const filePrefix = `${journalId}_${year}_${articleId}`;

  const figUrl =
    `https://media.springernature.com/lw685/springer-static/image/` +
    `art%3A10.1038%2F${doiSuffix}/MediaObjects/${filePrefix}_Fig1_HTML.png`;

  cache.set(doi, figUrl);
  return figUrl;
}

/**
 * Verify the Springer figure URL exists (HEAD request).
 * Returns the URL if valid, null otherwise.
 */
export async function verifySpringerFigure(doi: string | null): Promise<string | null> {
  const url = trySpringerFigureUrl(doi);
  if (!url) return null;

  try {
    const resp = await fetch(url, { method: 'HEAD' });
    if (resp.ok) return url;
  } catch {
    // CORS might block HEAD, but browser will still load the image
    // Return the URL anyway and let <img> onError handle it
    return url;
  }
  return null;
}
