import { useState, useEffect } from 'react';
import type { CMPaper } from '../types';
import type { S2PaperData } from '../services/semanticScholarApi';
import { fetchS2PaperData } from '../services/semanticScholarApi';

export function useSemanticScholar(papers: CMPaper[]) {
  const [s2DataMap, setS2DataMap] = useState<Map<string, S2PaperData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const dois = papers
      .map((p) => p.doi)
      .filter((doi): doi is string => doi !== null);

    if (dois.length === 0) {
      setS2DataMap(new Map());
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchS2PaperData(dois)
      .then((data) => { if (!cancelled) setS2DataMap(data); })
      .catch(() => { if (!cancelled) setS2DataMap(new Map()); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [papers]);

  return { s2DataMap, isLoading };
}
