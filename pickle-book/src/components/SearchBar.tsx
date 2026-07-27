"use client";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  initialQuery?: string;
  compact?: boolean;
  onSearch?: (query: string) => void;
}

export default function SearchBar({ initialQuery = "", compact = false, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleChange = (value: string) => {
    setQuery(value);
    if (onSearch) {
      onSearch(value);
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
          onChange={(e) => handleChange(e.target.value)}
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
      </div>
    </form>
  );
}
