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
