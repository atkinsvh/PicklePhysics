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
    <div className="border rounded-lg" style={{ borderColor: "var(--color-border)", background: "rgba(255,255,255,0.04)" }}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors rounded-lg hover:bg-white/5"
        style={{ color: "var(--reader-color)" }}
      >
        <span>Table of Contents</span>
        <svg
          className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-90"}`}
          style={{ color: "var(--color-muted)" }}
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
                  className="block py-1 text-sm transition-colors leading-snug hover:text-pickle-green"
                  style={{ color: "var(--color-muted)" }}
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
