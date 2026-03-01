export interface OpenAlexResponse {
  meta: {
    count: number;
    per_page: number;
    next_cursor: string | null;
  };
  results: OpenAlexWork[];
}

export interface OpenAlexWork {
  id: string;
  doi: string | null;
  title: string;
  authorships: OpenAlexAuthorship[];
  publication_date: string;
  primary_location: OpenAlexLocation | null;
  locations: OpenAlexLocation[];
  concepts: OpenAlexConcept[];
  cited_by_count: number;
  abstract_inverted_index: Record<string, number[]> | null;
  open_access: {
    is_oa: boolean;
    oa_status: string;
    oa_url: string | null;
  };
  primary_topic: {
    id: string;
    display_name: string;
    subfield: { id: string; display_name: string };
  } | null;
}

export interface OpenAlexAuthorship {
  author: {
    id: string;
    display_name: string;
  };
  raw_author_name: string;
}

export interface OpenAlexLocation {
  source: {
    id: string;
    display_name: string;
    type: string;
    host_organization_lineage_names?: string[];
    host_organization_lineage?: string[];
    homepage_url?: string | null;
  } | null;
  landing_page_url: string | null;
  pdf_url: string | null;
  is_oa: boolean;
}

export interface OpenAlexConcept {
  id: string;
  display_name: string;
  level: number;
  score: number;
}

export interface CMPaper {
  openAlexId: string;
  doi: string | null;
  doiUrl: string | null;
  arxivId: string | null;
  title: string;
  authors: string[];
  publicationDate: string;
  journalName: string | null;
  publisherName: string | null;
  publisherLineageIds: string[];
  journalHomepageUrl: string | null;
  citedByCount: number;
  abstract: string;
  isOpenAccess: boolean;
  oaUrl: string | null;
  pdfUrl: string | null;
  primaryTopicId: string | null;
  primaryTopicName: string | null;
}

export interface TopicInfo {
  id: string;
  name: string;
}

export interface PaperWithS2 extends CMPaper {
  s2PaperId: string | null;
  matchesKeyword: boolean;
  isBookmarked: boolean;
}

export type FilterMode = 'highlight' | 'filter';
export type ViewTab = 'trending' | 'bookmarks';
export type TrendingSubTab = 'citations' | 'velocity';
