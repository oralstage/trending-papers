import { useState, useCallback, useMemo } from 'react';
import type { PaperWithS2, FilterMode } from '../types';

export function useKeywordFilter() {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<FilterMode>('highlight');

  const keywords = useMemo(() => {
    return inputValue
      .split(/[,\s]+/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
  }, [inputValue]);

  const matchesPaper = useCallback(
    (paper: PaperWithS2): boolean => {
      if (keywords.length === 0) return false;
      const text = `${paper.title} ${paper.abstract} ${paper.authors.join(' ')}`.toLowerCase();
      return keywords.some((kw) => text.includes(kw));
    },
    [keywords],
  );

  const filterPapers = useCallback(
    (papers: PaperWithS2[]): PaperWithS2[] => {
      if (keywords.length === 0) {
        return papers.map((p) => ({ ...p, matchesKeyword: false }));
      }

      const tagged = papers.map((p) => ({ ...p, matchesKeyword: matchesPaper(p) }));

      if (mode === 'filter') {
        return tagged.filter((p) => p.matchesKeyword);
      }

      return tagged;
    },
    [keywords, mode, matchesPaper],
  );

  return { inputValue, setInputValue, mode, setMode, filterPapers, hasKeywords: keywords.length > 0 };
}
