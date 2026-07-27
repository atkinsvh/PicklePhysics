import type { Metadata } from "next";
import Link from "next/link";
import { getAllChapters } from "@/lib/markdown";
export const metadata: Metadata = {
  title: "Read",
  description: "Read all chapters of Ed's Picklery and Emporium",
};
export default function ReadPage() {
  const chapters = getAllChapters();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Read</h1>
      <p className="text-muted mb-8">All chapters in order. Click to start reading.</p>
      <div className="space-y-4">
        {chapters.map((ch) => (
          <Link
            key={ch.slug}
            href={`/chapter/${ch.slug}`}
            className="block p-5 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-pickle-green text-white font-bold text-lg rounded-full">
                {ch.frontMatter.chapter}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-pickle-green transition-colors">
                  {ch.frontMatter.title}
                </h2>
                {ch.frontMatter.description && (
                  <p className="text-sm text-muted mt-1">{ch.frontMatter.description}</p>
                )}
                {ch.frontMatter.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ch.frontMatter.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-surface text-muted rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
