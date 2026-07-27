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
