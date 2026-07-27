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
