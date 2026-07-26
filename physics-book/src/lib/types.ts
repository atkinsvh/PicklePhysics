export interface ChapterFrontMatter {
  title: string;
  chapter: number;
  order: number;
  section?: string;
  description?: string;
  date?: string;
  author?: string;
  tags?: string[];
  draft?: boolean;
  glossary?: GlossaryTerm[];
}

export interface ChapterData {
  slug: string;
  frontMatter: ChapterFrontMatter;
  content: string;
  html: string;
  headings: TableOfContentsEntry[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

export interface TableOfContentsEntry {
  id: string;
  text: string;
  level: number;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  relatedTerms?: string[];
}

export interface ReadingProgress {
  lastChapter: string | null;
  lastPosition: number;
  completedChapters: string[];
  bookmarkedChapters: string[];
  recentlyViewed: string[];
  lastUpdated: number;
}

export interface SearchResult {
  slug: string;
  title: string;
  section?: string;
  snippet: string;
  score: number;
}

export interface ReaderSettings {
  fontSize: number;
  lineHeight: number;
  readingWidth: "narrow" | "medium" | "wide";
  theme: "light" | "dark" | "galaxy";
  hideDecorations: boolean;
}
