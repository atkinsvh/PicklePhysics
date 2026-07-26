import type { ReadingProgress } from "./types";

const STORAGE_KEY = "pickle-book-progress";

export const DEFAULT_PROGRESS: ReadingProgress = {
  lastChapter: null,
  lastPosition: 0,
  completedChapters: [],
  bookmarkedChapters: [],
  recentlyViewed: [],
  lastUpdated: Date.now(),
};

export function getProgress(): ReadingProgress {
  if (typeof window === "undefined") return structuredClone(DEFAULT_PROGRESS);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_PROGRESS);
    const parsed = JSON.parse(raw) as Partial<ReadingProgress>;
    return {
      lastChapter: parsed.lastChapter ?? null,
      lastPosition: parsed.lastPosition ?? 0,
      completedChapters: Array.isArray(parsed.completedChapters) ? parsed.completedChapters : [],
      bookmarkedChapters: Array.isArray(parsed.bookmarkedChapters) ? parsed.bookmarkedChapters : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
      lastUpdated: parsed.lastUpdated ?? Date.now(),
    };
  } catch {
    return structuredClone(DEFAULT_PROGRESS);
  }
}

export function saveProgress(progress: ReadingProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...progress, lastUpdated: Date.now() }));
  } catch (err) {
    console.warn("Failed to save reading progress:", err);
  }
}

export function markChapterComplete(slug: string): void {
  const progress = getProgress();
  if (!progress.completedChapters.includes(slug)) {
    progress.completedChapters.push(slug);
  }
  saveProgress(progress);
}

export function isChapterComplete(slug: string): boolean {
  return getProgress().completedChapters.includes(slug);
}

export function addBookmark(slug: string): void {
  const progress = getProgress();
  if (!progress.bookmarkedChapters.includes(slug)) {
    progress.bookmarkedChapters.push(slug);
  }
  saveProgress(progress);
}

export function removeBookmark(slug: string): void {
  const progress = getProgress();
  progress.bookmarkedChapters = progress.bookmarkedChapters.filter((s) => s !== slug);
  saveProgress(progress);
}

export function toggleBookmark(slug: string): boolean {
  const progress = getProgress();
  const idx = progress.bookmarkedChapters.indexOf(slug);
  if (idx === -1) {
    progress.bookmarkedChapters.push(slug);
    saveProgress(progress);
    return true;
  }
  progress.bookmarkedChapters.splice(idx, 1);
  saveProgress(progress);
  return false;
}

export function isBookmarked(slug: string): boolean {
  return getProgress().bookmarkedChapters.includes(slug);
}

export function addRecentlyViewed(slug: string): void {
  const progress = getProgress();
  progress.recentlyViewed = progress.recentlyViewed.filter((s) => s !== slug);
  progress.recentlyViewed.unshift(slug);
  if (progress.recentlyViewed.length > 20) {
    progress.recentlyViewed = progress.recentlyViewed.slice(0, 20);
  }
  saveProgress(progress);
}

export function setLastPosition(slug: string, position: number): void {
  const progress = getProgress();
  progress.lastChapter = slug;
  progress.lastPosition = position;
  saveProgress(progress);
}

export function getLastChapter(): string | null {
  return getProgress().lastChapter;
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Failed to reset reading progress:", err);
  }
}
