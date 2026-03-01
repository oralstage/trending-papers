import { useState, useEffect, useCallback, useRef } from 'react';
import type { CMPaper } from '../types';
import { fetchTrendingPapers } from '../services/openAlexApi';

export function useTrendingPapers(subfieldIds: number[], windowMonths: number) {
  const [papers, setPapers] = useState<CMPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const nextCursorRef = useRef<string | null>('*');
  const abortRef = useRef<AbortController | null>(null);
  const filterKey = `${subfieldIds.join(',')}_${windowMonths}`;

  const fetchInitial = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setPapers([]);
    nextCursorRef.current = '*';

    try {
      const result = await fetchTrendingPapers(subfieldIds, windowMonths, '*', controller.signal);
      if (!controller.signal.aborted) {
        setPapers(result.papers);
        nextCursorRef.current = result.nextCursor;
        setHasMore(result.nextCursor !== null);
      }
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : 'Failed to fetch papers');
      }
    } finally {
      if (!controller.signal.aborted) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const loadMore = useCallback(async () => {
    if (!nextCursorRef.current || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const result = await fetchTrendingPapers(subfieldIds, windowMonths, nextCursorRef.current);
      const existingIds = new Set(papers.map((p) => p.openAlexId));
      const newPapers = result.papers.filter((p) => !existingIds.has(p.openAlexId));
      setPapers((prev) => [...prev, ...newPapers]);
      nextCursorRef.current = result.nextCursor;
      setHasMore(result.nextCursor !== null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load more papers');
    } finally {
      setIsLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, papers, isLoadingMore, hasMore]);

  useEffect(() => {
    fetchInitial();
    return () => { abortRef.current?.abort(); };
  }, [fetchInitial]);

  return { papers, isLoading, isLoadingMore, error, hasMore, refetch: fetchInitial, loadMore };
}
