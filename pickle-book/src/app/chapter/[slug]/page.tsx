import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllChapterSlugs, getChapterBySlug } from "@/lib/markdown";
import TableOfContents from "@/components/TableOfContents";
import BookmarkButton from "@/components/BookmarkButton";
import ReadingControls from "@/components/ReadingControls";
import PickleSticker from "@/components/PickleSticker";
import ChapterProgressTracker from "./ChapterProgressTracker";
export function generateStaticParams() {
  const slugs = getAllChapterSlugs();
  return slugs.map((slug) => ({ slug }));
}
interface ChapterPageProps {
  params: Promise<{ slug: string }>;
}
export async function generateMetadata({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return { title: "Chapter Not Found" };
  return {
    title: chapter.frontMatter.title,
    description: chapter.frontMatter.description || `Chapter ${chapter.frontMatter.chapter}`,
  };
}
export default async function ChapterPage({ params }: ChapterPageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ChapterProgressTracker slug={slug} />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Main content */}
        <article>
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-muted mb-3">
              {chapter.frontMatter.section && (
                <span className="px-2 py-0.5 bg-pickle-light text-pickle-dark rounded text-xs font-medium">
                  {chapter.frontMatter.section}
                </span>
              )}
              <span>Chapter {chapter.frontMatter.chapter}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {chapter.frontMatter.title}
            </h1>
            {chapter.frontMatter.description && (
              <p className="text-lg text-muted leading-relaxed">
                {chapter.frontMatter.description}
              </p>
            )}
          </header>
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: chapter.html }}
          />
          {/* Prev / Next */}
          <nav className="mt-12 pt-8 border-t border-border flex justify-between gap-4">
            {chapter.prev ? (
              <Link
                href={`/chapter/${chapter.prev.slug}`}
                className="flex-1 p-4 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
              >
                <span className="text-xs text-muted">Previous</span>
                <p className="font-semibold text-sm text-foreground group-hover:text-pickle-green transition-colors">
                  {chapter.prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {chapter.next ? (
              <Link
                href={`/chapter/${chapter.next.slug}`}
                className="flex-1 p-4 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors text-right group"
              >
                <span className="text-xs text-muted">Next</span>
                <p className="font-semibold text-sm text-foreground group-hover:text-pickle-green transition-colors">
                  {chapter.next.title}
                </p>
              </Link>
            ) : (
              <div className="flex-1 p-4 bg-pickle-lighter rounded-lg text-center">
                <PickleSticker pose="celebrating" size="small" message="You finished the book!" className="inline-flex" />
              </div>
            )}
          </nav>
        </article>
        {/* Sidebar */}
        <aside className="hidden lg:block space-y-4 no-print">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <BookmarkButton slug={slug} />
              <ReadingControls />
            </div>
            <TableOfContents headings={chapter.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
