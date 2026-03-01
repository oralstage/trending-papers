const S2_BATCH_ENDPOINT = 'https://api.semanticscholar.org/graph/v1/paper/batch';
const S2_API_KEY = import.meta.env.VITE_S2_API_KEY as string | undefined;

interface S2BatchResult {
  paperId: string;
  externalIds?: { DOI?: string };
  citationCount?: number;
}

export interface S2PaperData {
  paperId: string;
  citationCount: number | null;
}

export async function fetchS2PaperData(
  dois: string[],
): Promise<Map<string, S2PaperData>> {
  if (dois.length === 0) return new Map();

  const ids = dois.map((doi) => `DOI:${doi}`);

  try {
    const response = await fetch(
      `${S2_BATCH_ENDPOINT}?fields=paperId,externalIds,citationCount`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(S2_API_KEY ? { 'x-api-key': S2_API_KEY } : {}),
        },
        body: JSON.stringify({ ids }),
      },
    );

    if (!response.ok) {
      console.warn(`S2 batch request failed: ${response.status}`);
      return new Map();
    }

    const data: (S2BatchResult | null)[] = await response.json();
    const result = new Map<string, S2PaperData>();

    data.forEach((paper, index) => {
      if (paper?.paperId) {
        result.set(dois[index], {
          paperId: paper.paperId,
          citationCount: paper.citationCount ?? null,
        });
      }
    });

    return result;
  } catch (e) {
    console.warn('S2 batch request error:', e);
    return new Map();
  }
}

export function getS2FigureUrl(paperId: string, page: number): string {
  return `https://figures.semanticscholar.org/${paperId}/500px/${page}-Figure1-1.png`;
}
