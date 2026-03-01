import { useState, useEffect, useMemo } from 'react';
import { getS2FigureUrl } from '../services/semanticScholarApi';
import { trySpringerFigureUrl } from '../services/springerFigureApi';
import { tryApsFigureUrl } from '../services/apsFigureApi';
import { fetchOgpImageUrl } from '../services/ogpApi';
import { fetchArxivHtmlFigureUrl } from '../services/arxivFigureApi';

const MAX_PAGE = 3;

interface Props {
  doi: string | null;
  doiUrl: string | null;
  arxivId: string | null;
  s2PaperId: string | null;
  journalName: string | null;
  journalHomepageUrl: string | null;
  s2Loading: boolean;
}

function getJournalColor(name: string | null): string {
  if (!name) return '#6b7280';
  const colors = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0d9488'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function Placeholder({ journalName, journalHomepageUrl }: { journalName: string | null; journalHomepageUrl: string | null }) {
  const color = getJournalColor(journalName);
  const domain = extractDomain(journalHomepageUrl);
  const [faviconFailed, setFaviconFailed] = useState(false);

  return (
    <div
      className="h-44 flex items-center justify-center rounded-t-lg"
      style={{ background: `linear-gradient(135deg, ${color}15, ${color}30)` }}
    >
      <div className="text-center">
        {domain && !faviconFailed ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
            alt={journalName ?? ''}
            className="w-16 h-16 mx-auto mb-1 rounded opacity-60"
            onError={() => setFaviconFailed(true)}
          />
        ) : (
          <svg className="w-10 h-10 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        )}
        {journalName && (
          <span className="text-xs text-gray-500 px-2 truncate block max-w-[180px]">{journalName}</span>
        )}
      </div>
    </div>
  );
}

export function S2FigureThumbnail({ doi, doiUrl, arxivId, s2PaperId, journalName, journalHomepageUrl, s2Loading }: Props) {
  const [page, setPage] = useState(1);
  const [s2Failed, setS2Failed] = useState(false);

  // Springer Nature direct figure URL (synchronous, from DOI pattern)
  const springerUrl = useMemo(() => trySpringerFigureUrl(doi), [doi]);
  const [springerFailed, setSpringerFailed] = useState(false);

  // APS direct figure URL (synchronous, from DOI pattern)
  const apsUrl = useMemo(() => tryApsFigureUrl(doi), [doi]);
  const [apsFailed, setApsFailed] = useState(false);

  // OGP image via Worker proxy
  const [ogpUrl, setOgpUrl] = useState<string | null>(null);
  const [ogpFailed, setOgpFailed] = useState(false);
  const [ogpLoading, setOgpLoading] = useState(false);

  const needOgp = (!springerUrl || springerFailed)
    && (!apsUrl || apsFailed)
    && ((!s2PaperId && !s2Loading) || s2Failed);

  useEffect(() => {
    if (!doiUrl || !needOgp) return;
    let cancelled = false;
    setOgpLoading(true);
    fetchOgpImageUrl(doiUrl).then((url) => {
      if (cancelled) return;
      setOgpUrl(url);
      if (!url) setOgpFailed(true);
      setOgpLoading(false);
    });
    return () => { cancelled = true; };
  }, [doiUrl, needOgp]);

  // arXiv: only if Springer, S2, and OGP all failed
  const [arxivFigUrl, setArxivFigUrl] = useState<string | null>(null);
  const [arxivFigFailed, setArxivFigFailed] = useState(false);
  const [arxivFigLoading, setArxivFigLoading] = useState(false);

  const needArxiv = needOgp && (!ogpUrl || ogpFailed) && !ogpLoading;

  useEffect(() => {
    if (!arxivId || !needArxiv) return;
    let cancelled = false;
    setArxivFigLoading(true);
    fetchArxivHtmlFigureUrl(arxivId).then((url) => {
      if (cancelled) return;
      setArxivFigUrl(url);
      if (!url) setArxivFigFailed(true);
      setArxivFigLoading(false);
    });
    return () => { cancelled = true; };
  }, [arxivId, needArxiv]);

  // 1a. Springer Nature direct figure URL (instant, no network wait)
  if (springerUrl && !springerFailed) {
    return (
      <div className="h-44 bg-gray-50 rounded-t-lg overflow-hidden">
        <img
          src={springerUrl}
          alt="Figure 1"
          className="w-full h-full object-contain"
          onError={() => setSpringerFailed(true)}
        />
      </div>
    );
  }

  // 1b. APS direct figure URL (instant, from DOI pattern)
  if (apsUrl && !apsFailed) {
    return (
      <div className="h-44 bg-gray-50 rounded-t-lg overflow-hidden">
        <img
          src={apsUrl}
          alt="Figure 1"
          className="w-full h-full object-contain"
          onError={() => setApsFailed(true)}
        />
      </div>
    );
  }

  if (s2Loading) {
    return <div className="h-44 bg-gray-100 animate-pulse rounded-t-lg" />;
  }

  // 2. S2 Figure (max 3 pages)
  if (s2PaperId && !s2Failed) {
    return (
      <div className="h-44 bg-gray-50 rounded-t-lg overflow-hidden">
        <img
          src={getS2FigureUrl(s2PaperId, page)}
          alt="Figure 1"
          className="w-full h-full object-contain"
          onError={() => {
            if (page < MAX_PAGE) setPage((p) => p + 1);
            else setS2Failed(true);
          }}
        />
      </div>
    );
  }

  // 3. OGP image via Worker proxy
  if (ogpLoading) {
    return <div className="h-44 bg-gray-100 animate-pulse rounded-t-lg" />;
  }

  if (ogpUrl && !ogpFailed) {
    return (
      <div className="h-44 bg-gray-50 rounded-t-lg overflow-hidden">
        <img
          src={ogpUrl}
          alt="OGP thumbnail"
          className="w-full h-full object-cover"
          onError={() => setOgpFailed(true)}
        />
      </div>
    );
  }

  // 4. arXiv figure loading
  if (arxivFigLoading) {
    return <div className="h-44 bg-gray-100 animate-pulse rounded-t-lg" />;
  }

  // 4. arXiv HTML figure
  if (arxivFigUrl && !arxivFigFailed) {
    return (
      <div className="h-44 bg-gray-50 rounded-t-lg overflow-hidden">
        <img
          src={arxivFigUrl}
          alt="Figure 1"
          className="w-full h-full object-contain"
          onError={() => setArxivFigFailed(true)}
        />
      </div>
    );
  }

  return <Placeholder journalName={journalName} journalHomepageUrl={journalHomepageUrl} />;
}
