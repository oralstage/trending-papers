import { useMemo, useEffect, useCallback, useState } from 'react';
import type { PaperWithS2, ViewTab, TrendingSubTab } from './types';
import { DEFAULT_SUBFIELD_IDS, DEFAULT_WINDOW_MONTHS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTrendingPapers } from './hooks/useTrendingPapers';
import { useBookmarkPapers } from './hooks/useBookmarkPapers';
import { useSemanticScholar } from './hooks/useSemanticScholar';
import { useKeywordFilter } from './hooks/useKeywordFilter';
import { useSubfieldTopics } from './hooks/useSubfieldTopics';
import { Header } from './components/Header';
import { TopicSelector } from './components/ConceptSelector';
import { SubTabBar } from './components/SubTabBar';
import { TimeWindowSlider } from './components/TimeWindowSlider';
import { PaperList } from './components/PaperList';
import { KeywordFilter } from './components/KeywordFilter';

function App() {
  const [activeTab, setActiveTab] = useLocalStorage<ViewTab>('tp-tab', 'trending');
  const [selectedSubfields, setSelectedSubfields] = useLocalStorage<number[]>('tp-subfields', DEFAULT_SUBFIELD_IDS);
  const [windowMonths, setWindowMonths] = useLocalStorage<number>('tp-window', DEFAULT_WINDOW_MONTHS);
  const [subTab, setSubTab] = useLocalStorage<TrendingSubTab>('tp-subtab', 'citations');
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>('tp-bookmarks', []);
  const [excludedTopicsList, setExcludedTopicsList] = useLocalStorage<string[]>('tp-excluded-topics', []);
  const excludedTopics = useMemo(() => new Set(excludedTopicsList), [excludedTopicsList]);
  const [menuOpen, setMenuOpen] = useState(false);

  const { topicsBySubfield } = useSubfieldTopics(selectedSubfields);

  const toggleExcludedTopic = useCallback((topicId: string) => {
    setExcludedTopicsList((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId],
    );
  }, [setExcludedTopicsList]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const trendingData = useTrendingPapers(selectedSubfields, windowMonths);
  const bookmarkData = useBookmarkPapers(bookmarks);

  const activeData = (() => {
    if (activeTab === 'bookmarks') {
      return {
        papers: bookmarkData.papers,
        isLoading: bookmarkData.isLoading,
        error: bookmarkData.error,
        refetch: bookmarkData.refetch,
        hasMore: false,
        isLoadingMore: false,
        loadMore: () => {},
      };
    }
    return trendingData;
  })();

  const velocityPapers = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    return [...trendingData.papers].sort((a, b) => {
      const daysA = Math.max(1, (now - new Date(a.publicationDate).getTime()) / 86_400_000);
      const daysB = Math.max(1, (now - new Date(b.publicationDate).getTime()) / 86_400_000);
      return (b.citedByCount / daysB) - (a.citedByCount / daysA);
    });
  }, [trendingData.papers]);

  const papersForDisplay = activeTab === 'trending' && subTab === 'velocity'
    ? velocityPapers
    : activeData.papers;

  const { s2DataMap, isLoading: s2Loading } = useSemanticScholar(papersForDisplay);
  const { inputValue, setInputValue, mode, setMode, filterPapers, hasKeywords } = useKeywordFilter();

  const bookmarkSet = useMemo(() => new Set(bookmarks), [bookmarks]);

  const toggleBookmark = useCallback((paperId: string) => {
    setBookmarks((prev) =>
      prev.includes(paperId) ? prev.filter((id) => id !== paperId) : [...prev, paperId],
    );
  }, [setBookmarks]);

  const enrichedPapers: PaperWithS2[] = useMemo(
    () =>
      papersForDisplay.map((paper) => {
        const s2Data = paper.doi ? s2DataMap.get(paper.doi) : undefined;
        return {
          ...paper,
          s2PaperId: s2Data?.paperId ?? null,
          matchesKeyword: false,
          isBookmarked: bookmarkSet.has(paper.openAlexId),
        };
      }),
    [papersForDisplay, s2DataMap, bookmarkSet],
  );

  const displayPapers = useMemo(() => {
    let filtered = filterPapers(enrichedPapers);
    if (excludedTopics.size > 0) {
      filtered = filtered.filter((p) => !p.primaryTopicId || !excludedTopics.has(p.primaryTopicId));
    }
    return filtered;
  }, [filterPapers, enrichedPapers, excludedTopics]);

  const matchCount = displayPapers.filter((p) => p.matchesKeyword).length;

  const loadingMessage = activeTab === 'bookmarks'
    ? 'Loading bookmarks...'
    : 'Fetching trending papers...';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />

      {/* Drawer overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-40 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h2 className="font-semibold text-gray-800 text-lg">Filters</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <TopicSelector
            selected={selectedSubfields}
            onChange={setSelectedSubfields}
            topicsBySubfield={topicsBySubfield}
            excludedTopics={excludedTopics}
            onToggleExcludedTopic={toggleExcludedTopic}
          />
          <div className="border-t border-gray-100 pt-4">
            <KeywordFilter
              value={inputValue}
              onChange={setInputValue}
              mode={mode}
              onModeChange={setMode}
              totalCount={enrichedPapers.length}
              filteredCount={mode === 'filter' ? displayPapers.length : matchCount}
              hasKeywords={hasKeywords}
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Tab bar + Sub-tab bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'bg-oa-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-oa-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Bookmarks
              {bookmarks.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === 'bookmarks' ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>
          {activeTab === 'trending' && (
            <SubTabBar active={subTab} onChange={setSubTab} />
          )}
        </div>

        {/* Time window slider */}
        {activeTab === 'trending' && (
          <div className="mb-4 max-w-md">
            <TimeWindowSlider value={windowMonths} onChange={setWindowMonths} />
          </div>
        )}

        {activeData.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
            <p className="font-medium">Error loading papers</p>
            <p className="text-sm mt-1">{activeData.error}</p>
            <button
              onClick={activeData.refetch}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        )}

        {activeData.isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-oa-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-3 text-sm">{loadingMessage}</p>
            </div>
          </div>
        )}

        {!activeData.isLoading && !activeData.error && (
          <>
            {activeTab === 'bookmarks' && bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-sm">No bookmarks yet</p>
                <p className="text-xs mt-1">Bookmark papers from the Trending tab</p>
              </div>
            ) : (
            <>
            {activeTab === 'trending' && selectedSubfields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <p className="text-sm">No topics selected</p>
                <p className="text-xs mt-1">Open the menu to select research topics</p>
              </div>
            ) : (
            <>
            {displayPapers.length > 0 && (
              <p className="text-sm text-gray-500 mb-3">
                {displayPapers.length} papers
                {displayPapers.length !== papersForDisplay.length && ` (of ${papersForDisplay.length})`}
                {s2Loading && ' · Loading thumbnails...'}
              </p>
            )}
            <PaperList
              papers={displayPapers}
              s2Loading={s2Loading}
              onToggleBookmark={toggleBookmark}
            />

            {activeData.hasMore && !activeData.isLoadingMore && (
              <div className="flex justify-center mt-6 mb-4">
                <button
                  onClick={activeData.loadMore}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium shadow-sm"
                >
                  Load more papers
                </button>
              </div>
            )}

            {activeData.isLoadingMore && (
              <div className="flex items-center justify-center py-6">
                <div className="w-6 h-6 border-3 border-oa-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500 text-sm ml-3">Loading more papers...</span>
              </div>
            )}
          </>
            )}
          </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
