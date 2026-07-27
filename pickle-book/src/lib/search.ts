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
