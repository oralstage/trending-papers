import { useState, useEffect, useRef, useCallback } from 'react';
import type { CMPaper } from '../types';
import { fetchPapersByIds } from '../services/openAlexApi';

export function useBookmarkPapers(bookmarkIds: string[]) {
  const [papers, setPapers] = useState<CMPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const idsRef = useRef(bookmarkIds);
  idsRef.current = bookmarkIds;

  const load = useCallback(() => {
    abortRef.current?.abort();
    const ids = idsRef.current;

    if (ids.length === 0) {
      setPapers([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchPapersByIds(ids, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          const map = new Map(result.map((p) => [p.openAlexId, p]));
          setPapers(ids.map((id) => map.get(id)).filter((p): p is CMPaper => !!p));
          setIsLoading(false);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message);
          setIsLoading(false);
        }
      });
  }, []);

  const bookmarkKey = bookmarkIds.join(',');

  useEffect(() => {
    load();
    return () => { abortRef.current?.abort(); };
  }, [bookmarkKey, load]);

  return { papers, isLoading, error, refetch: load };
}
