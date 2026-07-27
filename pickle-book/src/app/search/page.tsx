import type { Metadata } from "next";
import { getAllChapters } from "@/lib/markdown";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search",
  description: "Search through Ed's Picklery and Emporium",
};

export default function SearchPage() {
  const chapters = getAllChapters().map((ch) => ({
    slug: ch.slug,
    title: ch.frontMatter.title,
    section: ch.frontMatter.section,
    html: ch.html,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--reader-color)" }}>Search</h1>
      <SearchPageClient chapters={chapters} />
    </div>
  );
}
