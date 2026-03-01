import { useState, useEffect, useRef } from 'react';
import type { TopicInfo } from '../types';
import { OPENALEX_MAILTO } from '../constants';

const cache = new Map<number, TopicInfo[]>();

async function fetchTopicsForSubfield(subfieldId: number, signal?: AbortSignal): Promise<TopicInfo[]> {
  if (cache.has(subfieldId)) return cache.get(subfieldId)!;

  const params = new URLSearchParams({
    'filter': `subfield.id:${subfieldId}`,
    'per_page': '100',
    'select': 'id,display_name',
    'mailto': OPENALEX_MAILTO,
  });

  const res = await fetch(`https://api.openalex.org/topics?${params}`, { signal });
  if (!res.ok) throw new Error(`OpenAlex API error: ${res.status}`);

  const data = await res.json();
  const topics: TopicInfo[] = data.results.map((t: { id: string; display_name: string }) => ({
    id: t.id.replace('https://openalex.org/', ''),
    name: t.display_name,
  }));

  cache.set(subfieldId, topics);
  return topics;
}

export function useSubfieldTopics(subfieldIds: number[]) {
  const [topicsBySubfield, setTopicsBySubfield] = useState<Map<number, TopicInfo[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (subfieldIds.length === 0) {
      setTopicsBySubfield(new Map());
      return;
    }

    const missing = subfieldIds.filter((id) => !topicsBySubfield.has(id));
    if (missing.length === 0) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    Promise.all(
      missing.map((id) => fetchTopicsForSubfield(id, controller.signal).then((topics) => [id, topics] as const)),
    )
      .then((results) => {
        if (controller.signal.aborted) return;
        setTopicsBySubfield((prev) => {
          const next = new Map(prev);
          for (const [id, topics] of results) {
            next.set(id, topics);
          }
          return next;
        });
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch topics:', e);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => { controller.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subfieldIds.join(',')]);

  return { topicsBySubfield, loading };
}
