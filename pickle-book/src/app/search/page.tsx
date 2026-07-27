import type { Metadata } from "next";
import { searchChapters } from "@/lib/search";
import SearchPageClient from "./SearchPageClient";
export const metadata: Metadata = {
  title: "Search",
  description: "Search through Ed's Picklery and Emporium",
};
interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const initialQuery = q || "";
  const results = initialQuery ? searchChapters(initialQuery) : [];
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">Search</h1>
      <SearchPageClient initialQuery={initialQuery} initialResults={results} />
    </div>
  );
}
