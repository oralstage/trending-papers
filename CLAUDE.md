# Trending Papers

Multi-discipline trending academic paper viewer. React SPA fetching highly-cited papers from OpenAlex API with topic-based filtering, time window slider, and citation/velocity sorting. Frontend-only, no backend needed.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS 4
- **Hosting**: Cloudflare Pages
- **APIs**: OpenAlex, Semantic Scholar

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc -b && vite build
npm run lint         # eslint
npm run preview      # Preview production build

# Deploy frontend
npx wrangler pages deploy dist --project-name=trending-papers
```

## Architecture

### Data Flow

```
OpenAlex API (sorted by cited_by_count:desc)
    --> useTrendingPapers(subfieldIds, windowMonths)
                    |
                    v
               CMPaper[]
          +---------+---------+
          |                   |
     Citations            Velocity
     (as-is)         (client re-sort:
                      citedByCount / daysSincePublication)
          |                   |
          +---------+---------+
                    |
             useSemanticScholar (S2 thumbnails)
                    |
                    v
             PaperWithS2[]  -->  keyword filter  -->  PaperList
```

### Views

- **Trending**: Papers sorted by citation count or velocity within a user-selected time window
  - **Citations**: Server-side sort by total citation count (descending)
  - **Velocity**: Client-side re-sort by citations/day (favors recent high-impact papers)
- **Bookmarks**: User-bookmarked papers stored in localStorage

### Topic Selector

- 7 field groups: Physics, Chemistry, Materials Science, Computer Science, Biology, Mathematics, Earth Science
- Multi-select with OR logic (papers matching any selected subfield)
- Uses `primary_topic.subfield.id` filter
- Selection persisted in localStorage

### Time Window Slider

- Continuous slider: 1 month to 5 years
- Tick marks at 1m, 3m, 6m, 1y, 2y, 3y, 5y
- 500ms debounce before triggering API call
- Persisted in localStorage

### Thumbnail Resolution Chain (S2FigureThumbnail)

1. Springer Nature direct figure URL (instant, DOI-pattern based)
2. Semantic Scholar figure CDN (pages 1-3)
3. OGP image via shared Worker proxy (ogp-proxy.k-shinokita.workers.dev)
4. arXiv HTML figure scraping
5. Colored placeholder

## Key Files

```
src/
  App.tsx                        # Root component, topic/trending/bookmark orchestration
  types.ts                       # CMPaper, PaperWithS2, ViewTab, TrendingSubTab
  constants.ts                   # FIELD_GROUPS, PUBLISHERS, DEFAULT_SUBFIELD_IDS

  components/
    Header.tsx                   # App header
    ConceptSelector.tsx          # Expandable topic groups with checkboxes, chips
    SubTabBar.tsx                # Citations / Velocity toggle
    TimeWindowSlider.tsx         # Continuous time window slider with debounce
    PaperCard.tsx                # Paper card with thumbnail, metadata, badges
    PaperList.tsx                # Responsive grid layout
    S2FigureThumbnail.tsx        # Multi-fallback thumbnail resolver
    KeywordFilter.tsx            # Keyword input with highlight/filter mode
    AbstractToggle.tsx           # Collapsible abstract display

  hooks/
    useTrendingPapers.ts         # Trending papers fetch with cursor pagination
    useBookmarkPapers.ts         # Bookmark fetch by IDs
    useSemanticScholar.ts        # S2 paper ID batch resolution
    useKeywordFilter.ts          # Keyword matching logic
    useLocalStorage.ts           # Generic persistent state hook

  utils/
    titleSanitizer.ts            # MathML/HTML → clean <sub>/<sup> for paper titles
    abstractReconstructor.ts     # OpenAlex inverted index → plain text

  services/
    openAlexApi.ts               # OpenAlex: trending (by subfields + time window), by-IDs
    semanticScholarApi.ts        # S2 batch API for thumbnails
    arxivFigureApi.ts            # arXiv HTML figure scraping
    springerFigureApi.ts         # Springer Nature direct figure URLs
    ogpApi.ts                    # OGP image via shared CF Worker proxy
```

## Conventions

- All hooks use AbortController pattern for cleanup (React StrictMode safe)
- localStorage keys prefixed with `tp-`
- OpenAlex requests include `mailto` parameter for polite pool
- API fetches use per_page=100
- Trending sort is server-side (cited_by_count:desc); velocity sort is client-side
- Custom theme colors: `oa-primary` (#e16b31), `oa-dark` (#7c2d12)

## Change Log

### 2026-03-01
- **Initial creation**: Built from openalex-papers (Journal Crossview) and cm-viewer patterns. Combined multi-discipline topic selection with trending paper functionality (citations/velocity). Added continuous time window slider (1-60 months) with debounce. No journal/publisher filter needed since trending papers are already quality-filtered by citation count.
