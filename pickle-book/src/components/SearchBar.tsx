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
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--color-muted)" }}
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
          className={`w-full pl-10 pr-4 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pickle-green/30 focus:border-pickle-green transition-colors ${
            compact ? "py-2" : "py-3"
          }`}
          style={{
            borderColor: "var(--color-border)",
            background: "rgba(255,255,255,0.06)",
            color: "var(--reader-color, #e5e7eb)",
          }}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-pickle-green hover:text-pickle-300 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}
