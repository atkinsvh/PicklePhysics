import type { Metadata } from "next";
import Link from "next/link";
import { getChaptersBySection } from "@/lib/markdown";
export const metadata: Metadata = {
  title: "Contents",
  description: "Table of contents for Ed's Picklery and Emporium",
};
export default function ContentsPage() {
  const sections = getChaptersBySection();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Contents</h1>
      <p className="text-muted mb-8">Browse all chapters organised by section.</p>
      {Object.entries(sections).map(([section, chapters]) => (
        <section key={section} className="mb-10">
          <h2 className="text-xl font-semibold text-foreground mb-4 pb-2 border-b-2 border-pickle-green">
            {section}
          </h2>
          <div className="space-y-2">
            {chapters.map((ch) => (
              <Link
                key={ch.slug}
                href={`/chapter/${ch.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-pickle-lighter transition-colors group"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-pickle-light text-pickle-dark font-bold text-xs rounded-full">
                  {ch.frontMatter.chapter}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground group-hover:text-pickle-green transition-colors">
                    {ch.frontMatter.title}
                  </span>
                  {ch.frontMatter.description && (
                    <p className="text-xs text-muted mt-0.5 truncate">{ch.frontMatter.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
