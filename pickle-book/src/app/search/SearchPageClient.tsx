"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import PickleSticker from "@/components/PickleSticker";

interface ChapterIndex {
  slug: string;
  title: string;
  section?: string;
  html: string;
}

interface SearchResult {
  slug: string;
  title: string;
  section?: string;
  snippet: string;
  score: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

function getSnippet(html: string, query: string, maxLength = 200): string {
  const plain = stripHtml(html);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let bestIndex = -1;
  for (const word of words) {
    const idx = plain.toLowerCase().indexOf(word);
    if (idx !== -1) { bestIndex = idx; break; }
  }
  if (bestIndex === -1) {
    return plain.slice(0, maxLength) + (plain.length > maxLength ? "..." : "");
  }
  const start = Math.max(0, bestIndex - 50);
  const end = Math.min(plain.length, start + maxLength);
  let snippet = plain.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < plain.length) snippet += "...";
  return snippet;
}

function searchLocal(chapters: ChapterIndex[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: SearchResult[] = [];

  for (const ch of chapters) {
    let score = 0;
    const titleLower = ch.title.toLowerCase();
    const contentLower = stripHtml(ch.html).toLowerCase();
    const sectionLower = (ch.section || "").toLowerCase();

    for (const word of words) {
      if (titleLower.includes(word)) score += 10;
      if (sectionLower.includes(word)) score += 5;
      if (contentLower.includes(word)) score += 1;
      const titleMatches = (titleLower.match(new RegExp(word, "gi")) || []).length;
      score += titleMatches * 3;
      const contentMatches = (contentLower.match(new RegExp(word, "gi")) || []).length;
      score += contentMatches * 0.5;
    }

    if (score > 0) {
      results.push({
        slug: ch.slug,
        title: ch.title,
        section: ch.section,
        snippet: highlightMatches(getSnippet(ch.html, query), query),
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

interface SearchPageClientProps {
  chapters: ChapterIndex[];
}

export default function SearchPageClient({ chapters }: SearchPageClientProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchLocal(chapters, query), [chapters, query]);

  return (
    <div>
      <div className="mb-8">
        <SearchBar onSearch={setQuery} />
      </div>
      {query && (
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </p>
      )}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <Link
              key={result.slug}
              href={`/chapter/${result.slug}`}
              className="block p-5 border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                {result.section && (
                  <span className="px-2 py-0.5 text-xs bg-pickle-light text-pickle-dark rounded font-medium">
                    {result.section}
                  </span>
                )}
                <h3 className="font-semibold transition-colors group-hover:text-pickle-green" style={{ color: "var(--reader-color)" }}>
                  {result.title}
                </h3>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-muted)" }}
                dangerouslySetInnerHTML={{ __html: result.snippet }}
              />
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <PickleSticker pose="questioning" size="medium" message="No results found!" />
          <p style={{ color: "var(--color-muted)" }} className="mt-4">Try a different search term.</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <PickleSticker pose="reading" size="medium" message="Type to search..." />
          <p style={{ color: "var(--color-muted)" }} className="mt-4">Enter a search term to find chapters.</p>
        </div>
      )}
    </div>
  );
}
