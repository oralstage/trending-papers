import { useState } from 'react';
import type { PaperWithS2 } from '../types';
import { S2FigureThumbnail } from './S2FigureThumbnail';
import { AbstractToggle } from './AbstractToggle';
import { sanitizeTitle } from '../utils/titleSanitizer';

interface Props {
  paper: PaperWithS2;
  s2Loading: boolean;
  onToggleBookmark: (id: string) => void;
}

export function PaperCard({ paper, s2Loading, onToggleBookmark }: Props) {
  const [showAllAuthors, setShowAllAuthors] = useState(false);
  const hiddenAuthors = paper.authors.length - 3;
  const linkUrl = paper.doiUrl ?? `https://openalex.org/${paper.openAlexId}`;

  return (
    <article
      className={`bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
        paper.matchesKeyword ? 'ring-2 ring-amber-400 border-amber-300' : 'border-gray-200'
      }`}
    >
      <div className="relative">
        <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
          <S2FigureThumbnail
            doi={paper.doi}
            doiUrl={paper.doiUrl}
            arxivId={paper.arxivId}
            s2PaperId={paper.s2PaperId}
            journalName={paper.journalName}
            journalHomepageUrl={paper.journalHomepageUrl}
            s2Loading={s2Loading}
          />
        </a>
        {paper.journalName && (
          <span className="absolute bottom-2 left-2 text-xs font-medium text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded truncate max-w-[calc(100%-16px)]">
            {paper.journalName}
          </span>
        )}
        <button
          onClick={() => onToggleBookmark(paper.openAlexId)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          title={paper.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <svg
            className={`w-4 h-4 ${paper.isBookmarked ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`}
            fill={paper.isBookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 leading-snug text-sm">
          <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-oa-primary"
            dangerouslySetInnerHTML={{ __html: sanitizeTitle(paper.title) }}
          />
        </h3>
        <p className="text-xs text-gray-500 mb-1">
          {(showAllAuthors ? paper.authors : paper.authors.slice(0, 3)).join(', ')}
          {!showAllAuthors && hiddenAuthors > 0 && (
            <button
              onClick={() => setShowAllAuthors(true)}
              className="text-blue-500 hover:text-blue-700 transition-colors ml-1"
            >
              +{hiddenAuthors} more
            </button>
          )}
          {showAllAuthors && hiddenAuthors > 0 && (
            <button
              onClick={() => setShowAllAuthors(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
            >
              show less
            </button>
          )}
        </p>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <time className="text-xs text-gray-400">
            {new Date(paper.publicationDate).toLocaleDateString()}
          </time>
          {paper.journalName && (
            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {paper.journalName}
            </span>
          )}
          {paper.citedByCount > 0 && (
            paper.s2PaperId ? (
              <a
                href={`https://www.semanticscholar.org/paper/${paper.s2PaperId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded hover:bg-purple-100 transition-colors"
              >
                {paper.citedByCount} cited
              </a>
            ) : (
              <span className="text-xs text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                {paper.citedByCount} cited
              </span>
            )
          )}
          {paper.isOpenAccess && (
            <span className="text-xs text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
              OA
            </span>
          )}
        </div>
        <AbstractToggle abstract={paper.abstract} />
        <div className="mt-2 flex gap-2">
          {paper.doiUrl && (
            <a
              href={paper.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              DOI
            </a>
          )}
          {paper.arxivId && (
            <a
              href={`https://arxiv.org/abs/${paper.arxivId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-oa-primary hover:underline"
            >
              arXiv
            </a>
          )}
          {paper.pdfUrl && (
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-600 hover:underline"
            >
              PDF
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
