import type { OpenAlexResponse, OpenAlexWork, CMPaper } from '../types';
import { reconstructAbstract } from '../utils/abstractReconstructor';
import { OPENALEX_MAILTO, PUBLISHERS } from '../constants';

const BASE_URL = 'https://api.openalex.org/works';
const PER_PAGE = 100;
const SELECT_FIELDS = 'id,doi,title,authorships,publication_date,primary_location,locations,concepts,cited_by_count,abstract_inverted_index,open_access,primary_topic';

function extractDoi(doiUrl: string | null): string | null {
  if (!doiUrl) return null;
  return doiUrl.replace('https://doi.org/', '');
}

function extractArxivId(work: OpenAlexWork): string | null {
  const locations = work.locations ?? [];
  for (const loc of locations) {
    const sourceName = loc.source?.display_name?.toLowerCase() ?? '';
    if (sourceName.startsWith('arxiv')) {
      const url = loc.landing_page_url ?? '';
      const match = url.match(/arxiv\.org\/abs\/(\d+\.\d+)/);
      if (match) return match[1];
    }
  }
  const oaUrl = work.open_access?.oa_url ?? '';
  const oaMatch = oaUrl.match(/arxiv\.org\/(?:abs|pdf)\/(\d+\.\d+)/);
  if (oaMatch) return oaMatch[1];
  return null;
}

function toCMPaper(work: OpenAlexWork): CMPaper {
  const doi = extractDoi(work.doi);
  return {
    openAlexId: work.id.replace('https://openalex.org/', ''),
    doi,
    doiUrl: work.doi,
    arxivId: extractArxivId(work),
    title: work.title,
    authors: work.authorships.map((a) => a.author.display_name),
    publicationDate: work.publication_date,
    journalName: work.primary_location?.source?.display_name ?? null,
    publisherName: work.primary_location?.source?.host_organization_lineage_names?.[0] ?? null,
    publisherLineageIds: (work.primary_location?.source?.host_organization_lineage ?? []).map(
      (url) => url.replace('https://openalex.org/', ''),
    ),
    journalHomepageUrl: (() => {
      const lineage = (work.primary_location?.source?.host_organization_lineage ?? []).map(
        (url) => url.replace('https://openalex.org/', ''),
      );
      const pub = PUBLISHERS.find((p) => lineage.includes(p.id));
      return pub ? `https://${pub.domain}` : null;
    })(),
    citedByCount: work.cited_by_count,
    abstract: reconstructAbstract(work.abstract_inverted_index),
    isOpenAccess: work.open_access.is_oa,
    oaUrl: work.open_access.oa_url ?? null,
    pdfUrl: work.primary_location?.pdf_url ?? null,
    primaryTopicId: work.primary_topic?.id.replace('https://openalex.org/', '') ?? null,
    primaryTopicName: work.primary_topic?.display_name ?? null,
  };
}

function getDateMonthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export interface FetchResult {
  papers: CMPaper[];
  nextCursor: string | null;
}

export async function fetchTrendingPapers(
  subfieldIds: number[],
  windowMonths: number,
  cursor: string = '*',
  signal?: AbortSignal,
): Promise<FetchResult> {
  if (subfieldIds.length === 0) {
    return { papers: [], nextCursor: null };
  }

  const subfieldFilter = subfieldIds.join('|');
  const fromDate = getDateMonthsAgo(windowMonths);
  const filter = `primary_topic.subfield.id:${subfieldFilter},type:article,from_publication_date:${fromDate}`;

  const params = new URLSearchParams({
    filter,
    sort: 'cited_by_count:desc',
    select: SELECT_FIELDS,
    per_page: String(PER_PAGE),
    cursor,
    mailto: OPENALEX_MAILTO,
  });

  const res = await fetch(`${BASE_URL}?${params}`, { signal });
  if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);

  const data: OpenAlexResponse = await res.json();
  return {
    papers: data.results.map(toCMPaper),
    nextCursor: data.meta.next_cursor,
  };
}

export async function fetchPapersByIds(
  ids: string[],
  signal?: AbortSignal,
): Promise<CMPaper[]> {
  if (ids.length === 0) return [];

  const papers: CMPaper[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const idFilter = chunk.map((id) => `https://openalex.org/${id}`).join('|');
    const params = new URLSearchParams({
      filter: `openalex:${idFilter}`,
      select: SELECT_FIELDS,
      per_page: '50',
      mailto: OPENALEX_MAILTO,
    });

    const res = await fetch(`${BASE_URL}?${params}`, { signal });
    if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);

    const data: OpenAlexResponse = await res.json();
    papers.push(...data.results.map(toCMPaper));
  }
  return papers;
}
