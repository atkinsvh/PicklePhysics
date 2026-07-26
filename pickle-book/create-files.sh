#!/usr/bin/env bash
set -e
BASE="."
# 1. src/lib/types.ts
mkdir -p "$BASE/src/lib"
cat > "$BASE/src/lib/types.ts" << 'ENDOFFILE'
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
  highlights: string[];
}
export interface ReaderSettings {
  fontSize: number;
  lineSpacing: number;
  readingWidth: "narrow" | "medium" | "wide";
  theme: "light" | "dark" | "sepia";
  showStickers: boolean;
}
ENDOFFILE
# 2. src/lib/markdown.ts
cat > "$BASE/src/lib/markdown.ts" << 'ENDOFFILE'
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkHtml from "remark-html";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type {
  ChapterData,
  ChapterFrontMatter,
  TableOfContentsEntry,
} from "./types";
const CONTENT_DIR = path.join(process.cwd(), "content");
function getProcessor() {
  return remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkHtml, { sanitize: false })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" });
}
function extractHeadings(html: string): TableOfContentsEntry[] {
  const headings: TableOfContentsEntry[] = [];
  const regex = /<h([1-6])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    headings.push({
      id: match[2],
      text,
      level: parseInt(match[1]),
    });
  }
  return headings;
}
export function getAllChapterSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}
export function getChapterBySlug(slug: string): ChapterData | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const frontMatter = data as ChapterFrontMatter;
  const processor = getProcessor();
  const html = String(processor.processSync(content));
  const headings = extractHeadings(html);
  return {
    slug,
    frontMatter,
    content,
    html,
    headings,
    prev: null,
    next: null,
  };
}
export function getAllChapters(): ChapterData[] {
  const slugs = getAllChapterSlugs();
  let chapters = slugs
    .map((slug) => getChapterBySlug(slug))
    .filter((ch): ch is ChapterData => ch !== null && !ch.frontMatter.draft);
  chapters.sort((a, b) => a.frontMatter.order - b.frontMatter.order);
  for (let i = 0; i < chapters.length; i++) {
    chapters[i].prev =
      i > 0
        ? { slug: chapters[i - 1].slug, title: chapters[i - 1].frontMatter.title }
        : null;
    chapters[i].next =
      i < chapters.length - 1
        ? { slug: chapters[i + 1].slug, title: chapters[i + 1].frontMatter.title }
        : null;
  }
  return chapters;
}
export function getChapterByOrder(order: number): ChapterData | null {
  const chapters = getAllChapters();
  return chapters.find((ch) => ch.frontMatter.order === order) || null;
}
export function getGlossaryTerms(): { term: string; definition: string; chapter: string }[] {
  const chapters = getAllChapters();
  const terms: { term: string; definition: string; chapter: string }[] = [];
  for (const ch of chapters) {
    if (ch.frontMatter.glossary) {
      for (const g of ch.frontMatter.glossary) {
        terms.push({ term: g.term, definition: g.definition, chapter: ch.slug });
      }
    }
  }
  return terms.sort((a, b) => a.term.localeCompare(b.term));
}
export function getChaptersBySection(): Record<string, ChapterData[]> {
  const chapters = getAllChapters();
  const grouped: Record<string, ChapterData[]> = {};
  for (const ch of chapters) {
    const section = ch.frontMatter.section || "Uncategorized";
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(ch);
  }
  return grouped;
}
ENDOFFILE
# 3. src/lib/progress.ts
cat > "$BASE/src/lib/progress.ts" << 'ENDOFFILE'
import type { ReadingProgress } from "./types";
const STORAGE_KEY = "pickle-book-progress";
const DEFAULT_PROGRESS: ReadingProgress = {
  lastChapter: null,
  lastPosition: 0,
  completedChapters: [],
  bookmarkedChapters: [],
  recentlyViewed: [],
  lastUpdated: 0,
};
export function getProgress(): ReadingProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}
export function saveProgress(progress: ReadingProgress): void {
  if (typeof window === "undefined") return;
  try {
    progress.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage full or unavailable
  }
}
export function updateLastChapter(slug: string, position: number): void {
  const progress = getProgress();
  progress.lastChapter = slug;
  progress.lastPosition = position;
  addRecentlyViewed(slug);
  saveProgress(progress);
}
export function markChapterComplete(slug: string): void {
  const progress = getProgress();
  if (!progress.completedChapters.includes(slug)) {
    progress.completedChapters.push(slug);
  }
  saveProgress(progress);
}
export function toggleBookmark(slug: string): boolean {
  const progress = getProgress();
  const idx = progress.bookmarkedChapters.indexOf(slug);
  if (idx === -1) {
    progress.bookmarkedChapters.push(slug);
    saveProgress(progress);
    return true;
  } else {
    progress.bookmarkedChapters.splice(idx, 1);
    saveProgress(progress);
    return false;
  }
}
export function isBookmarked(slug: string): boolean {
  return getProgress().bookmarkedChapters.includes(slug);
}
export function isChapterComplete(slug: string): boolean {
  return getProgress().completedChapters.includes(slug);
}
export function addRecentlyViewed(slug: string): void {
  const progress = getProgress();
  progress.recentlyViewed = progress.recentlyViewed.filter((s) => s !== slug);
  progress.recentlyViewed.unshift(slug);
  if (progress.recentlyViewed.length > 10) {
    progress.recentlyViewed = progress.recentlyViewed.slice(0, 10);
  }
}
export function getCompletionPercentage(totalChapters: number): number {
  const progress = getProgress();
  if (totalChapters === 0) return 0;
  return Math.round((progress.completedChapters.length / totalChapters) * 100);
}
export function resetProgress(): void {
  saveProgress({ ...DEFAULT_PROGRESS, lastUpdated: Date.now() });
}
ENDOFFILE
# 4. src/lib/search.ts
cat > "$BASE/src/lib/search.ts" << 'ENDOFFILE'
import { getAllChapters } from "./markdown";
import type { SearchResult } from "./types";
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  const words = query.split(/\s+/).filter(Boolean);
  let result = text;
  for (const word of words) {
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    result = result.replace(regex, `<mark>$1</mark>`);
  }
  return result;
}
function getSnippet(html: string, query: string, maxLength: number = 200): string {
  const plain = stripHtml(html);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let bestIndex = -1;
  for (const word of words) {
    const idx = plain.toLowerCase().indexOf(word);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }
  if (bestIndex === -1) {
    return plain.slice(0, maxLength) + (plain.length > maxLength ? "..." : "");
  }
  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(plain.length, start + maxLength);
  let snippet = plain.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < plain.length) snippet = snippet + "...";
  return snippet;
}
function scoreResult(
  title: string,
  html: string,
  section: string | undefined,
  query: string
): number {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 0;
  const titleLower = title.toLowerCase();
  const htmlLower = stripHtml(html).toLowerCase();
  const sectionLower = (section || "").toLowerCase();
  for (const word of words) {
    if (titleLower.includes(word)) score += 10;
    if (sectionLower.includes(word)) score += 5;
    if (htmlLower.includes(word)) score += 1;
    const regex = new RegExp(word, "gi");
    const titleMatches = (titleLower.match(regex) || []).length;
    score += titleMatches * 3;
    const contentMatches = (htmlLower.match(regex) || []).length;
    score += contentMatches * 0.5;
  }
  return score;
}
export function searchChapters(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const chapters = getAllChapters();
  const results: SearchResult[] = [];
  for (const chapter of chapters) {
    const score = scoreResult(
      chapter.frontMatter.title,
      chapter.html,
      chapter.frontMatter.section,
      query
    );
    if (score > 0) {
      const snippet = getSnippet(chapter.html, query);
      results.push({
        slug: chapter.slug,
        title: chapter.frontMatter.title,
        section: chapter.frontMatter.section,
        snippet: highlightMatches(snippet, query),
        score,
        highlights: [],
      });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}
ENDOFFILE
# 5. src/styles/globals.css
mkdir -p "$BASE/src/styles"
cat > "$BASE/src/styles/globals.css" << 'ENDOFFILE'
@import "tailwindcss";
@theme inline {
  --color-pickle-green: #22c55e;
  --color-pickle-dark: #15803d;
  --color-pickle-light: #dcfce7;
  --color-pickle-lighter: #f0fdf4;
  --color-pickle-50: #f0fdf4;
  --color-pickle-100: #dcfce7;
  --color-pickle-200: #bbf7d0;
  --color-pickle-300: #86efac;
  --color-pickle-400: #4ade80;
  --color-pickle-500: #22c55e;
  --color-pickle-600: #16a34a;
  --color-pickle-700: #15803d;
  --color-pickle-800: #166534;
  --color-pickle-900: #14532d;
  --color-background: #ffffff;
  --color-foreground: #171717;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-surface: #f9fafb;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0a0a0a;
    --color-foreground: #ededed;
    --color-muted: #9ca3af;
    --color-border: #374151;
    --color-surface: #111827;
  }
}
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans, Arial, Helvetica, sans-serif);
}
.prose { max-width: 100%; color: var(--color-foreground); }
.prose h1 { font-size: 2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.25; }
.prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.75rem; line-height: 1.3; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
.prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; line-height: 1.4; }
.prose h4 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
.prose p { margin-bottom: 1.25rem; line-height: 1.8; }
.prose a { color: var(--color-pickle-green); text-decoration: underline; text-underline-offset: 2px; }
.prose a:hover { color: var(--color-pickle-dark); }
.prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
.prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
.prose li { margin-bottom: 0.375rem; line-height: 1.7; }
.prose blockquote { border-left: 4px solid var(--color-pickle-green); padding: 1rem; margin: 1.5rem 0; color: var(--color-muted); font-style: italic; background: var(--color-pickle-lighter); border-radius: 0 0.5rem 0.5rem 0; }
.prose code { background: var(--color-surface); padding: 0.15rem 0.35rem; border-radius: 0.25rem; font-size: 0.9em; font-family: var(--font-mono, monospace); border: 1px solid var(--color-border); }
.prose pre { background: var(--color-surface); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; border: 1px solid var(--color-border); }
.prose pre code { background: none; padding: 0; border: none; }
.prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
.prose th, .prose td { border: 1px solid var(--color-border); padding: 0.625rem 0.875rem; text-align: left; }
.prose th { background: var(--color-surface); font-weight: 600; }
.prose img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
.prose hr { border: none; border-top: 2px solid var(--color-border); margin: 2rem 0; }
.prose strong { font-weight: 600; }
.prose em { font-style: italic; }
.katex-display { margin: 1.5rem 0; overflow-x: auto; padding: 0.5rem 0; }
@media print {
  body { background: white; color: black; font-size: 12pt; }
  .no-print, header, footer, nav { display: none !important; }
  .prose { max-width: 100%; }
  .prose a { color: black; text-decoration: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
ENDOFFILE
# 6. src/components/Header.tsx
mkdir -p "$BASE/src/components"
cat > "$BASE/src/components/Header.tsx" << 'ENDOFFILE'
"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import MobileNav from "./MobileNav";
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border no-print">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src={siteConfig.horizontalLogo}
            alt={siteConfig.title}
            width={140}
            height={36}
            className="h-8 w-auto"
            priority
          />
          <span className="hidden sm:inline font-semibold text-lg text-foreground group-hover:text-pickle-green transition-colors">
            {siteConfig.title}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted hover:text-pickle-green transition-colors rounded-md hover:bg-pickle-light"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-md text-muted hover:text-pickle-green hover:bg-pickle-light transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
ENDOFFILE
# 7. src/components/Footer.tsx
cat > "$BASE/src/components/Footer.tsx" << 'ENDOFFILE'
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto no-print">
      <div className="h-1 bg-gradient-to-r from-pickle-light via-pickle-green to-pickle-light" />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image
                src={siteConfig.simplifiedLogo}
                alt={siteConfig.title}
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold text-foreground">{siteConfig.title}</span>
            </Link>
            <p className="text-sm text-muted">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Navigation</h3>
            <ul className="space-y-2">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-pickle-green transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <p className="text-sm text-muted mb-2">
              Written by {siteConfig.author}
            </p>
            <p className="text-sm text-muted">
              Educational content for curious minds.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
ENDOFFILE
# 8. src/components/MobileNav.tsx
cat > "$BASE/src/components/MobileNav.tsx" << 'ENDOFFILE'
"use client";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}
export default function MobileNav({ open, onClose }: MobileNavProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-50 shadow-lg transform transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <Image
              src={siteConfig.simplifiedLogo}
              alt={siteConfig.title}
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="font-semibold text-sm text-foreground">{siteConfig.title}</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted hover:text-pickle-green hover:bg-pickle-light transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block px-3 py-2.5 text-sm font-medium text-muted hover:text-pickle-green hover:bg-pickle-light rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
ENDOFFILE
# 9. src/components/ReaderSettings.tsx
cat > "$BASE/src/components/ReaderSettings.tsx" << 'ENDOFFILE'
"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ReaderSettings } from "@/lib/types";
const SETTINGS_KEY = "pickle-book-settings";
const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineSpacing: 1.8,
  readingWidth: "medium",
  theme: "light",
  showStickers: true,
};
interface ReaderSettingsContextType {
  settings: ReaderSettings;
  updateSettings: (partial: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
}
const ReaderSettingsContext = createContext<ReaderSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});
export function useReaderSettings() {
  return useContext(ReaderSettingsContext);
}
function loadSettings(): ReaderSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
export default function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, mounted]);
  const updateSettings = useCallback((partial: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);
  return (
    <ReaderSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      <div
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineSpacing,
        }}
      >
        {children}
      </div>
    </ReaderSettingsContext.Provider>
  );
}
ENDOFFILE
# 10. src/components/ReadingControls.tsx
cat > "$BASE/src/components/ReadingControls.tsx" << 'ENDOFFILE'
"use client";
import { useState } from "react";
import { useReaderSettings } from "./ReaderSettings";
export default function ReadingControls() {
  const { settings, updateSettings, resetSettings } = useReaderSettings();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md text-muted hover:text-pickle-green hover:bg-pickle-light transition-colors"
        aria-label="Reading settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-border rounded-lg shadow-lg p-4 z-50">
          <h3 className="font-semibold text-sm text-foreground mb-4">Reading Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Font Size: {settings.fontSize}px
              </label>
              <input
                type="range"
                min={12}
                max={24}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-pickle-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Line Spacing: {settings.lineSpacing}
              </label>
              <input
                type="range"
                min={1.2}
                max={2.5}
                step={0.1}
                value={settings.lineSpacing}
                onChange={(e) => updateSettings({ lineSpacing: parseFloat(e.target.value) })}
                className="w-full accent-pickle-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Reading Width</label>
              <div className="flex gap-2">
                {(["narrow", "medium", "wide"] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSettings({ readingWidth: w })}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      settings.readingWidth === w
                        ? "bg-pickle-green text-white border-pickle-green"
                        : "border-border text-muted hover:border-pickle-green"
                    }`}
                  >
                    {w.charAt(0).toUpperCase() + w.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-2">Theme</label>
              <div className="flex gap-2">
                {(["light", "dark", "sepia"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => updateSettings({ theme: t })}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                      settings.theme === t
                        ? "bg-pickle-green text-white border-pickle-green"
                        : "border-border text-muted hover:border-pickle-green"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted">Show Stickers</label>
              <button
                onClick={() => updateSettings({ showStickers: !settings.showStickers })}
                className={`w-10 h-5 rounded-full transition-colors ${
                  settings.showStickers ? "bg-pickle-green" : "bg-gray-300"
                }`}
              >
                <span
                  className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    settings.showStickers ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            <button
              onClick={resetSettings}
              className="w-full text-xs text-muted hover:text-pickle-green transition-colors py-1"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
ENDOFFILE
# 11. src/components/BookmarkButton.tsx
cat > "$BASE/src/components/BookmarkButton.tsx" << 'ENDOFFILE'
"use client";
import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/progress";
interface BookmarkButtonProps {
  slug: string;
}
export default function BookmarkButton({ slug }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    setBookmarked(isBookmarked(slug));
  }, [slug]);
  const handleToggle = () => {
    const result = toggleBookmark(slug);
    setBookmarked(result);
  };
  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-md transition-colors ${
        bookmarked
          ? "text-pickle-green bg-pickle-light"
          : "text-muted hover:text-pickle-green hover:bg-pickle-light"
      }`}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <svg className="w-5 h-5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
ENDOFFILE
# 12. src/components/ReadingProgressBar.tsx
cat > "$BASE/src/components/ReadingProgressBar.tsx" << 'ENDOFFILE'
"use client";
import { useEffect, useState } from "react";
export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[60] no-print">
      <div
        className="h-full bg-gradient-to-r from-pickle-400 via-pickle-green to-pickle-500 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
ENDOFFILE
# 13. src/components/SearchBar.tsx
cat > "$BASE/src/components/SearchBar.tsx" << 'ENDOFFILE'
"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
interface SearchBarProps {
  initialQuery?: string;
  compact?: boolean;
}
export default function SearchBar({ initialQuery = "", compact = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };
  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "w-full max-w-xl"}>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chapters..."
          className={`w-full pl-10 pr-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pickle-green/30 focus:border-pickle-green transition-colors bg-white ${
            compact ? "py-2" : "py-3"
          }`}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-pickle-green hover:text-pickle-dark transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
ENDOFFILE
# 14. src/components/TableOfContents.tsx
cat > "$BASE/src/components/TableOfContents.tsx" << 'ENDOFFILE'
"use client";
import { useState } from "react";
import type { TableOfContentsEntry } from "@/lib/types";
interface TableOfContentsProps {
  headings: TableOfContentsEntry[];
}
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [collapsed, setCollapsed] = useState(false);
  if (headings.length === 0) return null;
  const minLevel = Math.min(...headings.map((h) => h.level));
  return (
    <div className="border border-border rounded-lg bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-pickle-lighter transition-colors rounded-lg"
      >
        <span>Table of Contents</span>
        <svg
          className={`w-4 h-4 text-muted transition-transform ${collapsed ? "" : "rotate-90"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {!collapsed && (
        <nav className="px-4 pb-4">
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - minLevel) * 1}rem` }}
              >
                <a
                  href={`#${heading.id}`}
                  className="block py-1 text-sm text-muted hover:text-pickle-green transition-colors leading-snug"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
ENDOFFILE
# 15. src/components/PickleSticker.tsx
cat > "$BASE/src/components/PickleSticker.tsx" << 'ENDOFFILE'
"use client";
import Image from "next/image";
type Pose =
  | "reading"
  | "writing"
  | "thinking"
  | "celebrating"
  | "warning"
  | "questioning"
  | "sleeping"
  | "experimenting"
  | "pointing"
  | "welcoming";
interface PickleStickerProps {
  pose: Pose;
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
}
const POSE_MAP: Record<Pose, string> = {
  reading: "/stickers/pickle-reading-a-book-v01-01.png",
  writing: "/stickers/pickle-writing-v01-01.png",
  thinking: "/stickers/pickle-thinking-v01-01.png",
  celebrating: "/stickers/pickle-celebrating-v01-01.png",
  warning: "/stickers/pickle-holding-a-warning-sign-v01-01.png",
  questioning: "/stickers/pickle-asking-a-question-v01-01.png",
  sleeping: "/stickers/pickle-sleeping-beside-a-bookmark-v01-01.png",
  experimenting: "/stickers/pickle-performing-an-experiment-v01-01.png",
  pointing: "/stickers/pickle-pointing-v01-01.png",
  welcoming: "/stickers/pickle-welcoming-the-reader-v01-01.png",
};
const SIZE_MAP: Record<"small" | "medium" | "large", number> = {
  small: 64,
  medium: 128,
  large: 256,
};
export default function PickleSticker({
  pose,
  size = "medium",
  message,
  className = "",
}: PickleStickerProps) {
  const src = POSE_MAP[pose];
  const px = SIZE_MAP[size];
  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <Image
        src={src}
        alt={`Chibi pickle sticker - ${pose}`}
        width={px}
        height={px}
        className="drop-shadow-sm"
        unoptimized
      />
      {message && (
        <span className="text-xs text-muted text-center max-w-[120px] leading-tight italic">
          {message}
        </span>
      )}
    </div>
  );
}
ENDOFFILE
# 16. src/components/callouts.tsx
cat > "$BASE/src/components/callouts.tsx" << 'ENDOFFILE'
import Image from "next/image";
import { type ReactNode } from "react";
interface CalloutProps {
  title?: string;
  children: ReactNode;
  icon?: string;
}
function CalloutBase({
  title,
  children,
  icon,
  borderColor,
  bgColor,
}: CalloutProps & { borderColor: string; bgColor: string }) {
  return (
    <div
      className={`border-l-4 rounded-r-lg p-4 my-6 ${borderColor} ${bgColor}`}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-2">
          {icon && (
            <Image
              src={icon}
              alt=""
              width={20}
              height={20}
              className="h-5 w-5"
            />
          )}
          {title && (
            <h4 className="font-semibold text-sm text-foreground">{title}</h4>
          )}
        </div>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
export function ImportantNote({ title = "Important Note", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/important-note-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-lighter"
    >
      {children}
    </CalloutBase>
  );
}
export function Definition({ title = "Definition", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/definition-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-light/50"
    >
      {children}
    </CalloutBase>
  );
}
export function Warning({ title = "Warning", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/warning-icon-v01-01.png"
      borderColor="border-amber-500"
      bgColor="bg-amber-50"
    >
      {children}
    </CalloutBase>
  );
}
export function Example({ title = "Example", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/example-icon-v01-01.png"
      borderColor="border-purple-500"
      bgColor="bg-purple-50"
    >
      {children}
    </CalloutBase>
  );
}
export function KeyConcept({ title = "Key Concept", children }: { title?: string; children: ReactNode }) {
  return (
    <div className="my-6 border border-pickle-dark rounded-lg bg-pickle-lighter p-5 relative overflow-hidden">
      <div className="absolute top-2 right-2 opacity-20">
        <Image
          src="/stickers/pickle-showing-a-key-concept-v01-01.png"
          alt=""
          width={64}
          height={64}
        />
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Image
          src="/images/interface/important-note-icon-v01-01.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <h4 className="font-semibold text-sm text-pickle-dark">{title}</h4>
      </div>
      <div className="text-sm leading-relaxed relative z-10">{children}</div>
    </div>
  );
}
export function Question({ title = "Question", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/question-icon-v01-01.png"
      borderColor="border-blue-400"
      bgColor="bg-blue-50"
    >
      {children}
    </CalloutBase>
  );
}
export function Answer({ title = "Answer", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="my-4 group">
      <summary className="flex items-center gap-2 cursor-pointer px-4 py-3 border border-border rounded-lg hover:bg-pickle-lighter transition-colors">
        <Image
          src="/images/interface/answer-icon-v01-01.png"
          alt=""
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <span className="font-semibold text-sm text-foreground">{title}</span>
        <svg className="w-4 h-4 text-muted ml-auto transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </summary>
      <div className="mt-2 px-4 py-3 text-sm leading-relaxed bg-white border border-t-0 border-border rounded-b-lg">
        {children}
      </div>
    </details>
  );
}
export function Experiment({ title = "Experiment", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/experiment-icon-v01-01.png"
      borderColor="border-orange-400"
      bgColor="bg-orange-50"
    >
      {children}
    </CalloutBase>
  );
}
export function Summary({ title = "Summary", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/summary-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-light"
    >
      {children}
    </CalloutBase>
  );
}
export function LearningObjectives({ title = "Learning Objectives", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/learning-objectives-icon-v01-01.png"
      borderColor="border-pickle-green"
      bgColor="bg-pickle-lighter"
    >
      {children}
    </CalloutBase>
  );
}
export function Vocabulary({ title = "Vocabulary", children }: { title?: string; children: ReactNode }) {
  return (
    <CalloutBase
      title={title}
      icon="/images/interface/vocabulary-icon-v01-01.png"
      borderColor="border-teal-500"
      bgColor="bg-teal-50"
    >
      {children}
    </CalloutBase>
  );
}
ENDOFFILE
# 17. src/app/globals.css (overwrite with full version)
cat > "$BASE/src/app/globals.css" << 'ENDOFFILE'
@import "tailwindcss";
@theme inline {
  --color-pickle-green: #22c55e;
  --color-pickle-dark: #15803d;
  --color-pickle-light: #dcfce7;
  --color-pickle-lighter: #f0fdf4;
  --color-pickle-50: #f0fdf4;
  --color-pickle-100: #dcfce7;
  --color-pickle-200: #bbf7d0;
  --color-pickle-300: #86efac;
  --color-pickle-400: #4ade80;
  --color-pickle-500: #22c55e;
  --color-pickle-600: #16a34a;
  --color-pickle-700: #15803d;
  --color-pickle-800: #166534;
  --color-pickle-900: #14532d;
  --color-background: #ffffff;
  --color-foreground: #171717;
  --color-muted: #6b7280;
  --color-border: #e5e7eb;
  --color-surface: #f9fafb;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0a0a0a;
    --color-foreground: #ededed;
    --color-muted: #9ca3af;
    --color-border: #374151;
    --color-surface: #111827;
  }
}
body {
  background: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans, Arial, Helvetica, sans-serif);
}
.prose { max-width: 100%; color: var(--color-foreground); }
.prose h1 { font-size: 2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.25; }
.prose h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.75rem; line-height: 1.3; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border); }
.prose h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; line-height: 1.4; }
.prose h4 { font-size: 1.1rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; }
.prose p { margin-bottom: 1.25rem; line-height: 1.8; }
.prose a { color: var(--color-pickle-green); text-decoration: underline; text-underline-offset: 2px; }
.prose a:hover { color: var(--color-pickle-dark); }
.prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
.prose ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.25rem; }
.prose li { margin-bottom: 0.375rem; line-height: 1.7; }
.prose blockquote { border-left: 4px solid var(--color-pickle-green); padding: 1rem; margin: 1.5rem 0; color: var(--color-muted); font-style: italic; background: var(--color-pickle-lighter); border-radius: 0 0.5rem 0.5rem 0; }
.prose code { background: var(--color-surface); padding: 0.15rem 0.35rem; border-radius: 0.25rem; font-size: 0.9em; font-family: var(--font-mono, monospace); border: 1px solid var(--color-border); }
.prose pre { background: var(--color-surface); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin: 1.5rem 0; border: 1px solid var(--color-border); }
.prose pre code { background: none; padding: 0; border: none; }
.prose table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
.prose th, .prose td { border: 1px solid var(--color-border); padding: 0.625rem 0.875rem; text-align: left; }
.prose th { background: var(--color-surface); font-weight: 600; }
.prose img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0; }
.prose hr { border: none; border-top: 2px solid var(--color-border); margin: 2rem 0; }
.prose strong { font-weight: 600; }
.prose em { font-style: italic; }
.katex-display { margin: 1.5rem 0; overflow-x: auto; padding: 0.5rem 0; }
@media print {
  body { background: white; color: black; font-size: 12pt; }
  .no-print, header, footer, nav { display: none !important; }
  .prose { max-width: 100%; }
  .prose a { color: black; text-decoration: none; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
}
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
ENDOFFILE
# 18. src/app/layout.tsx (overwrite)
cat > "$BASE/src/app/layout.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReaderSettingsProvider from "@/components/ReaderSettings";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import { siteConfig } from "@/config/site";
import "./globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(`https://${siteConfig.domain}`),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: `https://${siteConfig.domain}`,
    siteName: siteConfig.title,
    images: [{ url: siteConfig.socialImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
  icons: {
    icon: siteConfig.favicon,
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ReadingProgressBar />
        <Header />
        <ReaderSettingsProvider>
          <main className="flex-1">{children}</main>
        </ReaderSettingsProvider>
        <Footer />
      </body>
    </html>
  );
}
ENDOFFILE
# 19. content/chapter-01-introduction.md
mkdir -p "$BASE/content"
cat > "$BASE/content/chapter-01-introduction.md" << 'ENDOFFILE'
---
title: "Welcome to Ed's Picklery"
chapter: 1
order: 1
section: "Getting Started"
description: "An introduction to the wonderful world of pickles and how this book will guide you."
date: "2024-01-01"
author: "Nick James"
glossary:
  - term: "Pickle"
    definition: "A cucumber or other vegetable preserved in vinegar, brine, or a similar solution."
  - term: "Brine"
    definition: "A high-concentration solution of salt in water, used for preserving food."
tags: ["introduction", "getting-started"]
---
# Welcome to Ed's Picklery
Welcome, dear reader, to **Ed's Picklery and Emporium** — your complete guide to the art, science, and philosophy of pickling.
## What This Book Covers
This book will take you on a journey through the fascinating world of preserved vegetables. Whether you are a complete beginner or a seasoned preserver, there is something here for everyone.
### How to Use This Book
Each chapter builds on the previous one, so we recommend reading in order. However, feel free to jump to any chapter that catches your interest using the table of contents.
## Learning Objectives
By the end of this book, you will understand:
- The history and cultural significance of pickling
- The science behind preservation
- How to create your own pickles safely
- Advanced techniques for flavour development
## A Note on Safety
> Always follow proper food safety guidelines when pickling at home. When in doubt, consult a trusted reference.
Let us begin our journey into the world of pickles. Turn the page to discover what exactly makes a pickle so special.
ENDOFFILE
# 20. content/chapter-02-what-are-pickles.md
cat > "$BASE/content/chapter-02-what-are-pickles.md" << 'ENDOFFILE'
---
title: "What Are Pickles?"
chapter: 2
order: 2
section: "Getting Started"
description: "A deep dive into the history and science of pickles."
date: "2024-01-02"
author: "Nick James"
glossary:
  - term: "Fermentation"
    definition: "The metabolic process by which microorganisms convert sugars into acids, gases, or alcohol."
  - term: "Acetic acid"
    definition: "The main active component of vinegar, used in pickling to preserve food."
  - term: "Lactobacillus"
    definition: "A type of bacteria responsible for lactic acid fermentation in pickles."
tags: ["history", "science", "fermentation"]
---
# What Are Pickles?
Before we can master the art of pickling, we must first understand what a pickle truly is.
## A Brief History
Pickling is one of the oldest food preservation techniques in human history. Evidence of pickled foods dates back to **2400 BCE** in Mesopotamia, where cucumbers were imported from India and preserved in brine.
### The Spread of Pickling
Over the centuries, pickling spread across the globe:
1. **Ancient Rome** — Soldiers carried pickles as portable nutrition
2. **Medieval Europe** — Pickling became essential for surviving long winters
3. **Age of Exploration** — Sailors used pickles to prevent scurvy on long voyages
4. **Modern Era** — Pickling evolved into both a science and an art form
## The Science of Pickling
There are two primary methods of pickling:
### Vinegar Pickling
In vinegar pickling, the acidic environment created by acetic acid prevents the growth of harmful bacteria. The typical ratio is:
$$\text{Acidity} = \frac{[\text{CH}_3\text{COOH}]}{[\text{Total Solution}]} \geq 5\%$$
### Fermentation
Fermentation relies on naturally occurring *Lactobacillus* bacteria to produce lactic acid. This process:
- Takes longer (days to weeks)
- Creates more complex flavours
- Produces probiotics beneficial for gut health
## Key Differences
| Feature | Vinegar Pickling | Fermentation |
|---------|-----------------|--------------|
| Speed | Minutes to hours | Days to weeks |
| Flavour | Tangy, sharp | Complex, umami |
| Probiotics | None | Yes |
| Shelf Life | 1-2 years | Months |
## Summary
Pickles are far more than just preserved cucumbers. They represent thousands of years of human ingenuity, and the science behind them is both elegant and accessible. In the next chapter, we will explore the practical methods you can use to start pickling at home.
ENDOFFILE
# 21. content/chapter-03-the-pickle-method.md
cat > "$BASE/content/chapter-03-the-pickle-method.md" << 'ENDOFFILE'
---
title: "The Pickle Method"
chapter: 3
order: 3
section: "The Method"
description: "Learn the practical method for creating your own pickles at home."
date: "2024-01-03"
author: "Nick James"
glossary:
  - term: "Brine"
    definition: "A saltwater solution used in the fermentation process of pickling."
  - term: "Canning"
    definition: "A method of preserving food in sealed containers, typically using heat."
  - term: "pH"
    definition: "A measure of acidity; pickles should have a pH below 4.6 for safety."
tags: ["method", "practical", "experiments"]
---
# The Pickle Method
Now that you understand the theory, it is time to put knowledge into practice.
## Equipment You Will Need
Before starting, gather the following equipment:
- Clean glass jars with airtight lids
- A large non-reactive pot (stainless steel or enamel)
- A sharp knife and cutting board
- A kitchen scale
- pH testing strips
## The Basic Method
### Step 1: Prepare Your Vegetables
Wash your vegetables thoroughly. Cut them into your desired shape — spears, slices, or leave them whole for a traditional approach.
### Step 2: Prepare the Brine
The standard brine ratio for a basic pickle is:
$$\text{Salt Concentration} = \frac{m_{\text{salt}}}{m_{\text{water}}} \times 100\%$$
For a basic brine, use approximately **5–8% salt** by weight.
### Step 3: Pack the Jars
Pack your prepared vegetables tightly into clean jars. Add any spices or aromatics you desire — dill, garlic, peppercorns, and mustard seeds are popular choices.
### Step 4: Pour and Seal
Pour the hot brine over the vegetables, ensuring they are fully submerged. Leave approximately 1cm of headspace at the top. Seal the jars immediately.
## Experiment: Flavour Combinations
Try creating your own unique flavour profile by experimenting with different spice combinations:
| Base | Spice Blend | Character |
|------|-------------|-----------|
| Classic | Dill, garlic, peppercorn | Traditional, bright |
| Spicy | Chilli, ginger, Sichuan pepper | Warm, aromatic |
| Sweet | Mustard seed, turmeric, sugar | Mellow, complex |
| Herbaceous | Rosemary, thyme, bay leaf | Earthy, fragrant |
## Review Questions
1. Why is it important to maintain a salt concentration of at least 5%?
2. What role does pH play in the safety of pickled foods?
3. Name three factors that affect the fermentation process.
4. Why must jars be sterilised before use?
## Safety Reminders
> **Never** taste pickles that appear to have mould growing on them. When in doubt, discard the entire batch.
Always ensure your pickles maintain a pH below **4.6** to prevent the growth of *Clostridium botulinum*.
## Summary
The pickle method is a straightforward process that anyone can master. With practice, you will develop an intuition for the perfect brine, the ideal fermentation time, and the flavour combinations that suit your palate. In the chapters ahead, we will explore advanced techniques and creative variations.
ENDOFFILE
# 22. src/app/page.tsx (overwrite)
cat > "$BASE/src/app/page.tsx" << 'ENDOFFILE'
import Image from "next/image";
import Link from "next/link";
import PickleSticker from "@/components/PickleSticker";
import { getAllChapters } from "@/lib/markdown";
import { siteConfig } from "@/config/site";
export default function HomePage() {
  const chapters = getAllChapters();
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                {siteConfig.title}
              </h1>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                {siteConfig.description}. A comprehensive guide to the art and science of preserving vegetables, written with care by {siteConfig.author}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={chapters.length > 0 ? `/chapter/${chapters[0].slug}` : "/read"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pickle-green text-white font-semibold rounded-lg hover:bg-pickle-dark transition-colors"
                >
                  Start Reading
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/contents"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:border-pickle-green hover:text-pickle-green transition-colors"
                >
                  View Contents
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={siteConfig.coverImage}
                  alt="Book cover"
                  width={300}
                  height={400}
                  className="rounded-lg shadow-lg"
                  priority
                />
                <div className="absolute -bottom-4 -right-8 hidden md:block">
                  <PickleSticker pose="welcoming" size="large" message="Welcome aboard!" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Learning Outcomes */}
      <section className="border-t border-border bg-pickle-lighter">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">What You Will Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-border">
              <PickleSticker pose="reading" size="small" className="mb-3" />
              <h3 className="font-semibold text-foreground mb-2">The History</h3>
              <p className="text-sm text-muted">Discover thousands of years of pickling tradition from cultures around the world.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <PickleSticker pose="thinking" size="small" className="mb-3" />
              <h3 className="font-semibold text-foreground mb-2">The Science</h3>
              <p className="text-sm text-muted">Understand fermentation, acidity, and the microbiology behind preservation.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <PickleSticker pose="celebrating" size="small" className="mb-3" />
              <h3 className="font-semibold text-foreground mb-2">The Craft</h3>
              <p className="text-sm text-muted">Master practical techniques to create your own pickles at home.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Chapter List */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Chapters</h2>
        <div className="space-y-3">
          {chapters.map((ch) => (
            <Link
              key={ch.slug}
              href={`/chapter/${ch.slug}`}
              className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
            >
              <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-pickle-light text-pickle-dark font-bold text-sm rounded-full">
                {ch.frontMatter.chapter}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-pickle-green transition-colors">
                  {ch.frontMatter.title}
                </h3>
                {ch.frontMatter.description && (
                  <p className="text-sm text-muted truncate">{ch.frontMatter.description}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-muted group-hover:text-pickle-green transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
ENDOFFILE
# 23. src/app/chapter/[slug]/page.tsx + ChapterProgressTracker.tsx
mkdir -p "$BASE/src/app/chapter/[slug]"
cat > "$BASE/src/app/chapter/[slug]/page.tsx" << 'ENDOFFILE'
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllChapterSlugs, getChapterBySlug } from "@/lib/markdown";
import TableOfContents from "@/components/TableOfContents";
import BookmarkButton from "@/components/BookmarkButton";
import ReadingControls from "@/components/ReadingControls";
import PickleSticker from "@/components/PickleSticker";
import ChapterProgressTracker from "./ChapterProgressTracker";
export function generateStaticParams() {
  const slugs = getAllChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}
interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}
export async function generateMetadata({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return { title: "Chapter Not Found" };
  return {
    title: chapter.frontMatter.title,
    description: chapter.frontMatter.description || `Chapter ${chapter.frontMatter.chapter}`,
  };
}
export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ChapterProgressTracker slug={slug} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Main content */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted mb-3">
              {chapter.frontMatter.section && (
                <span className="px-2 py-0.5 bg-pickle-light text-pickle-dark rounded text-xs font-medium">
                  {chapter.frontMatter.section}
                </span>
              )}
              <span>Chapter {chapter.frontMatter.chapter}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {chapter.frontMatter.title}
            </h1>
            {chapter.frontMatter.description && (
              <p className="text-lg text-muted leading-relaxed">
                {chapter.frontMatter.description}
              </p>
            )}
          </header>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: chapter.html }}
          />
          {/* Prev / Next */}
          <nav className="mt-12 pt-8 border-t border-border flex justify-between gap-4">
            {chapter.prev ? (
              <Link
                href={`/chapter/${chapter.prev.slug}`}
                className="flex-1 p-4 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
              >
                <span className="text-xs text-muted">Previous</span>
                <p className="font-semibold text-sm text-foreground group-hover:text-pickle-green transition-colors">
                  {chapter.prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {chapter.next ? (
              <Link
                href={`/chapter/${chapter.next.slug}`}
                className="flex-1 p-4 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors text-right group"
              >
                <span className="text-xs text-muted">Next</span>
                <p className="font-semibold text-sm text-foreground group-hover:text-pickle-green transition-colors">
                  {chapter.next.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1 p-4 bg-pickle-lighter rounded-lg text-center">
                <PickleSticker pose="celebrating" size="small" message="You finished the book!" className="inline-flex" />
              </div>
            )}
          </nav>
        </article>
        {/* Sidebar */}
        <aside className="hidden lg:block space-y-4 no-print">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <BookmarkButton slug={slug} />
              <ReadingControls />
            </div>
            <TableOfContents headings={chapter.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
ENDOFFILE
cat > "$BASE/src/app/chapter/[slug]/ChapterProgressTracker.tsx" << 'ENDOFFILE'
"use client";
import { useEffect } from "react";
import { updateLastChapter } from "@/lib/progress";
export default function ChapterProgressTracker({ slug }: { slug: string }) {
  useEffect(() => {
    updateLastChapter(slug, 0);
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const position = docHeight > 0 ? scrollTop / docHeight : 0;
      updateLastChapter(slug, position);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);
  return null;
}
ENDOFFILE
# 24. src/app/contents/page.tsx
mkdir -p "$BASE/src/app/contents"
cat > "$BASE/src/app/contents/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import Link from "next/link";
import { getChaptersBySection } from "@/lib/markdown";
export const metadata: Metadata = {
  title: "Contents",
  description: "Table of contents for Ed's Picklery and Emporium",
};
export default function ContentsPage() {
  const sections = getChaptersBySection();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Contents</h1>
      <p className="text-muted mb-8">Browse all chapters organised by section.</p>
      {Object.entries(sections).map(([section, chapters]) => (
        <section key={section} className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b-2 border-pickle-green">
            {section}
          </h2>
          <div className="space-y-2">
            {chapters.map((ch) => (
              <Link
                key={ch.slug}
                href={`/chapter/${ch.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-pickle-lighter transition-colors group"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pickle-light text-pickle-dark font-bold text-xs rounded-full">
                  {ch.frontMatter.chapter}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground group-hover:text-pickle-green transition-colors">
                    {ch.frontMatter.title}
                  </span>
                  {ch.frontMatter.description && (
                    <p className="text-xs text-muted mt-0.5 truncate">{ch.frontMatter.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
ENDOFFILE
# 25. src/app/read/page.tsx
mkdir -p "$BASE/src/app/read"
cat > "$BASE/src/app/read/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import Link from "next/link";
import { getAllChapters } from "@/lib/markdown";
export const metadata: Metadata = {
  title: "Read",
  description: "Read all chapters of Ed's Picklery and Emporium",
};
export default function ReadPage() {
  const chapters = getAllChapters();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Read</h1>
      <p className="text-muted mb-8">All chapters in order. Click to start reading.</p>
      <div className="space-y-4">
        {chapters.map((ch) => (
          <Link
            key={ch.slug}
            href={`/chapter/${ch.slug}`}
            className="block p-5 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-pickle-green text-white font-bold text-lg rounded-full">
                {ch.frontMatter.chapter}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-pickle-green transition-colors">
                  {ch.frontMatter.title}
                </h2>
                {ch.frontMatter.description && (
                  <p className="text-sm text-muted mt-1">{ch.frontMatter.description}</p>
                )}
                {ch.frontMatter.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ch.frontMatter.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-surface text-muted rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
ENDOFFILE
# 26. src/app/search/page.tsx
mkdir -p "$BASE/src/app/search"
cat > "$BASE/src/app/search/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import { searchChapters } from "@/lib/search";
import SearchPageClient from "./SearchPageClient";
export const metadata: Metadata = {
  title: "Search",
  description: "Search through Ed's Picklery and Emporium",
};
interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const initialQuery = q || "";
  const results = initialQuery ? searchChapters(initialQuery) : [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Search</h1>
      <SearchPageClient initialQuery={initialQuery} initialResults={results} />
    </div>
  );
}
ENDOFFILE
# 27. src/app/search/SearchPageClient.tsx
cat > "$BASE/src/app/search/SearchPageClient.tsx" << 'ENDOFFILE'
"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PickleSticker from "@/components/PickleSticker";
import type { SearchResult } from "@/lib/types";
interface SearchPageClientProps {
  initialQuery: string;
  initialResults: SearchResult[];
}
export default function SearchPageClient({ initialQuery, initialResults }: SearchPageClientProps) {
  const router = useRouter();
  return (
    <div>
      <div className="mb-8">
        <SearchBar initialQuery={initialQuery} />
      </div>
      {initialQuery && (
        <p className="text-sm text-muted mb-6">
          {initialResults.length} result{initialResults.length !== 1 ? "s" : ""} for &ldquo;{initialQuery}&rdquo;
        </p>
      )}
      {initialResults.length > 0 ? (
        <div className="space-y-4">
          {initialResults.map((result) => (
            <Link
              key={result.slug}
              href={`/chapter/${result.slug}`}
              className="block p-5 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                {result.section && (
                  <span className="px-2 py-0.5 text-xs bg-pickle-light text-pickle-dark rounded font-medium">
                    {result.section}
                  </span>
                )}
                <h3 className="font-semibold text-foreground group-hover:text-pickle-green transition-colors">
                  {result.title}
                </h3>
              </div>
              <p
                className="text-sm text-muted leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.snippet }}
              />
            </Link>
          ))}
        </div>
      ) : initialQuery ? (
        <div className="text-center py-12">
          <PickleSticker pose="questioning" size="medium" message="No results found!" />
          <p className="text-muted mt-4">Try a different search term.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <PickleSticker pose="reading" size="medium" message="Type to search..." />
          <p className="text-muted mt-4">Enter a search term to find chapters.</p>
        </div>
      )}
    </div>
  );
}
ENDOFFILE
# 28. src/app/glossary/page.tsx
mkdir -p "$BASE/src/app/glossary"
cat > "$BASE/src/app/glossary/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import Link from "next/link";
import { getGlossaryTerms } from "@/lib/markdown";
export const metadata: Metadata = {
  title: "Glossary",
  description: "Glossary of terms used in Ed's Picklery and Emporium",
};
export default function GlossaryPage() {
  const terms = getGlossaryTerms();
  const grouped: Record<string, typeof terms> = {};
  for (const term of terms) {
    const letter = term.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }
  const letters = Object.keys(grouped).sort();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Glossary</h1>
      <p className="text-muted mb-8">
        Key terms and definitions used throughout this book.
      </p>
      {terms.length === 0 ? (
        <p className="text-muted">No glossary terms available yet.</p>
      ) : (
        <>
          {/* Alphabet nav */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-pickle-green hover:bg-pickle-light rounded transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
          {/* Terms */}
          {letters.map((letter) => (
            <section key={letter} id={letter} className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-pickle-green mb-4">{letter}</h2>
              <dl className="space-y-4">
                {grouped[letter].map((term) => (
                  <div key={term.term} className="border-l-2 border-pickle-green pl-4">
                    <dt className="font-semibold text-foreground">{term.term}</dt>
                    <dd className="text-sm text-muted mt-1">{term.definition}</dd>
                    <dd className="text-xs text-muted mt-1">
                      <Link href={`/chapter/${term.chapter}`} className="text-pickle-green hover:underline">
                        View in chapter
                      </Link>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
ENDOFFILE
# 29. src/app/about/page.tsx
mkdir -p "$BASE/src/app/about"
cat > "$BASE/src/app/about/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
import PickleSticker from "@/components/PickleSticker";
export const metadata: Metadata = {
  title: "About",
  description: "About Ed's Picklery and Emporium",
};
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">About This Book</h1>
      <div className="prose">
        <p>
          <strong>Ed&apos;s Picklery and Emporium</strong> is an educational book dedicated to the
          art and science of pickling. It is designed to be accessible to beginners while
          providing enough depth for experienced preservers.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe that preserving food is both a valuable life skill and a window into
          chemistry, microbiology, and cultural history. This book aims to make that knowledge
          available to everyone.
        </p>
        <h2>About the Author</h2>
        <p>
          Written by <strong>Nick James</strong>, this book draws on years of practical
          experience and research into food preservation techniques from around the world.
        </p>
        <h2>Accessibility</h2>
        <p>
          This website is designed to meet WCAG 2.2 AA accessibility standards. Reader
          controls allow you to adjust font size, line spacing, and reading width to suit
          your preferences.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 mt-12">
        <PickleSticker pose="welcoming" size="medium" message="Glad you're here!" />
        <PickleSticker pose="reading" size="medium" message="Happy reading!" />
        <PickleSticker pose="celebrating" size="medium" message="Welcome!" />
      </div>
    </div>
  );
}
ENDOFFILE
# 30. src/app/resources/page.tsx
mkdir -p "$BASE/src/app/resources"
cat > "$BASE/src/app/resources/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resources",
  description: "Additional resources for Ed's Picklery and Emporium",
};
export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Resources</h1>
      <div className="prose">
        <h2>Recommended Reading</h2>
        <ul>
          <li><strong>The Art of Fermentation</strong> by Sandor Ellix Katz — the definitive guide to fermentation techniques</li>
          <li><strong>Preserving by the Pint</strong> by Marisa McClellan — small-batch preserving for beginners</li>
          <li><strong>Animal, Vegetable, Miracle</strong> by Barbara Kingsolver — a memoir about seasonal eating</li>
        </ul>
        <h2>Equipment Suppliers</h2>
        <ul>
          <li>Quality canning jars and lids</li>
          <li>Kitchen scales with 0.1g precision</li>
          <li>pH testing strips and meters</li>
          <li>Non-reactive pots and utensils</li>
        </ul>
        <h2>Food Safety References</h2>
        <ul>
          <li>National Center for Home Food Preservation (NCHFP)</li>
          <li>USDA Complete Guide to Home Canning</li>
          <li>Local cooperative extension services</li>
        </ul>
        <h2>Online Communities</h2>
        <ul>
          <li>r/Fermentation — active community of home fermenters</li>
          <li>Homebrewtalk forums — extensive pickling and fermentation threads</li>
          <li>Local food preservation groups and workshops</li>
        </ul>
      </div>
    </div>
  );
}
ENDOFFILE
# 31. src/app/references/page.tsx
mkdir -p "$BASE/src/app/references"
cat > "$BASE/src/app/references/page.tsx" << 'ENDOFFILE'
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "References",
  description: "References and citations for Ed's Picklery and Emporium",
};
export default function ReferencesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">References</h1>
      <div className="prose">
        <h2>Academic Sources</h2>
        <ol>
          <li>
            Marco, M.L., et al. (2017). &ldquo;Health benefits of fermented foods: microbiota and beyond.&rdquo;
            <em>Current Opinion in Biotechnology</em>, 44, 94–102.
          </li>
          <li>
            Pandey, K.R., et al. (2015). &ldquo;Probiotics, prebiotics and synbiotics — a review.&rdquo;
            <em>Journal of Food Science and Technology</em>, 52(12), 7577–7587.
          </li>
          <li>
            Breidt, F., et al. (2007). &ldquo;Fermented vegetables.&rdquo;
            <em>Food Microbiology: Fundamentals and Frontiers</em>, 3rd edition.
          </li>
        </ol>
        <h2>Historical References</h2>
        <ol start={4}>
          <li>
            Harrison, M. (2004). &ldquo;Food and Medicine in Roman Antiquity.&rdquo;
            <em>Cambridge University Press</em>.
          </li>
          <li>
            Davidson, A. (2014). <em>The Oxford Companion to Food</em>. Oxford University Press.
          </li>
        </ol>
        <h2>Food Safety</h2>
        <ol start={6}>
          <li>
            USDA. (2015). <em>Complete Guide to Home Canning</em>. Agriculture Information Bulletin No. 539.
          </li>
          <li>
            National Center for Home Food Preservation. (2023). Methods for pickling vegetables.
            <em>NCHFP Guide</em>.
          </li>
        </ol>
      </div>
    </div>
  );
}
ENDOFFILE
# 32. src/app/not-found.tsx
cat > "$BASE/src/app/not-found.tsx" << 'ENDOFFILE'
import Link from "next/link";
import PickleSticker from "@/components/PickleSticker";
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <PickleSticker pose="questioning" size="large" message="Oops! Page not found." />
      <h1 className="text-4xl font-bold text-foreground mt-8 mb-4">404 — Page Not Found</h1>
      <p className="text-muted mb-8 max-w-md">
        The page you are looking for does not exist or has been moved. Let us help you find your way back.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-pickle-green text-white font-semibold rounded-lg hover:bg-pickle-dark transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/read"
          className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:border-pickle-green hover:text-pickle-green transition-colors"
        >
          Start Reading
        </Link>
      </div>
    </div>
  );
}
ENDOFFILE
# 33. src/app/api/search/route.ts
mkdir -p "$BASE/src/app/api/search"
cat > "$BASE/src/app/api/search/route.ts" << 'ENDOFFILE'
import { NextRequest, NextResponse } from "next/server";
import { searchChapters } from "@/lib/search";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json({ results: [], query: "" });
  }
  const results = searchChapters(q);
  return NextResponse.json({ results, query: q });
}
ENDOFFILE
# 34. tailwind.config.ts (create if not exists)
cat > "$BASE/tailwind.config.ts" << 'ENDOFFILE'
import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pickle-green": "#22c55e",
        "pickle-dark": "#15803d",
        "pickle-light": "#dcfce7",
        "pickle-lighter": "#f0fdf4",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        surface: "var(--color-surface)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "Helvetica", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
ENDOFFILE
echo "All 34 files created successfully!"
echo "Run 'npm run dev' to start the development server."