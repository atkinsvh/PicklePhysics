import type { ChapterData, SearchResult } from "./types";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "need",
  "this", "that", "these", "those", "i", "me", "my", "we", "our",
  "you", "your", "he", "him", "his", "she", "her", "it", "its",
  "they", "them", "their", "what", "which", "who", "where", "when",
  "why", "how", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "just", "about", "also", "into", "its",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function extractSnippet(html: string, queryTokens: string[], maxLength = 160): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  if (sentences.length === 0) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  let bestIdx = 0;
  let bestScore = 0;
  for (let i = 0; i < sentences.length; i++) {
    const lower = sentences[i].toLowerCase();
    let score = 0;
    for (const t of queryTokens) {
      if (lower.includes(t)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  const snippet = sentences.slice(bestIdx, bestIdx + 2).join(". ").trim();
  return snippet.length > maxLength ? snippet.slice(0, maxLength) + "..." : snippet;
}

export function buildSearchIndex(chapters: ChapterData[]): SearchResult[] {
  return chapters
    .filter((ch) => !ch.frontMatter.draft)
    .map((ch) => ({
      slug: ch.slug,
      title: ch.frontMatter.title,
      section: ch.frontMatter.section,
      snippet: extractSnippet(ch.html, []),
      score: 0,
    }));
}

export function searchIndex(query: string, index: SearchResult[]): SearchResult[] {
  if (!query.trim()) return [];
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const entry of index) {
    let score = 0;
    const titleLower = entry.title.toLowerCase();
    const snippetLower = entry.snippet.toLowerCase();
    const queryLower = query.toLowerCase();

    if (titleLower.includes(queryLower)) score += 10;

    for (const t of queryTokens) {
      if (titleLower.includes(t)) score += 3;
      if (snippetLower.includes(t)) score += 1;
    }

    if (score > 0) {
      results.push({
        ...entry,
        snippet: extractSnippet(entry.snippet, queryTokens),
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 20);
}
