/**
 * Construct APS (American Physical Society) Figure 1 URL directly from DOI.
 *
 * Pattern: https://journals.aps.org/{journal_slug}/article/10.1103/{doi_suffix}/figures/1/medium
 *
 * DOI examples:
 *   10.1103/PhysRevLett.134.086502  → prl
 *   10.1103/PhysRevB.111.085120     → prb
 *   10.1103/PhysRevX.15.011023      → prx
 */

const DOI_PREFIX_TO_SLUG: Record<string, string> = {
  PhysRevLett: 'prl',
  PhysRevB: 'prb',
  PhysRevX: 'prx',
  PhysRevA: 'pra',
  PhysRevE: 'pre',
  PhysRevD: 'prd',
  PhysRevC: 'prc',
  PhysRevResearch: 'prresearch',
  PhysRevMaterials: 'prmaterials',
  PhysRevApplied: 'prapplied',
  RevModPhys: 'rmp',
};

const cache = new Map<string, string | null>();

export function tryApsFigureUrl(doi: string | null): string | null {
  if (!doi) return null;
  if (cache.has(doi)) return cache.get(doi)!;

  // Match APS DOI pattern: 10.1103/{JournalPrefix}.{volume}.{id}
  const m = doi.match(/^10\.1103\/(\w+)\.\d+\.\d+$/);
  if (!m) {
    cache.set(doi, null);
    return null;
  }

  const journalPrefix = m[1];
  const slug = DOI_PREFIX_TO_SLUG[journalPrefix];
  if (!slug) {
    cache.set(doi, null);
    return null;
  }

  const doiSuffix = doi.replace('10.1103/', '');
  const figUrl = `https://journals.aps.org/${slug}/article/10.1103/${doiSuffix}/figures/1/medium`;

  cache.set(doi, figUrl);
  return figUrl;
}
