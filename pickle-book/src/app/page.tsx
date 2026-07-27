import Image from "next/image";
import Link from "next/link";
import PickleSticker from "@/components/PickleSticker";
import { getAllChapters } from "@/lib/markdown";
import { siteConfig } from "@/config/site";
export default function HomePage() {
  const chapters = getAllChapters();
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                {siteConfig.title}
              </h1>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                {siteConfig.description}. A comprehensive guide to the art and science of preserving vegetables, written with care by {siteConfig.author}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={chapters.length > 0 ? `/chapter/${chapters[0].slug}` : "/read"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pickle-green text-white font-semibold rounded-lg hover:bg-pickle-dark transition-colors"
                >
                  Start Reading
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/contents"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:border-pickle-green hover:text-pickle-green transition-colors"
                >
                  View Contents
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={siteConfig.coverImage}
                  alt="Book cover"
                  width={300}
                  height={400}
                  className="rounded-lg shadow-lg"
                  priority
                />
                <div className="absolute -bottom-4 -right-8 hidden md:block">
                  <PickleSticker pose="welcoming" size="large" message="Welcome aboard!" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Learning Outcomes */}
      <section className="border-t border-border bg-pickle-lighter">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">What You Will Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-border">
              <PickleSticker pose="reading" size="small" className="mb-3" />
              <h3 className="font-semibold text-foreground mb-2">The History</h3>
              <p className="text-sm text-muted">Discover thousands of years of pickling tradition from cultures around the world.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <PickleSticker pose="thinking" size="small" className="mb-3" />
              <h3 className="font-semibold text-foreground mb-2">The Science</h3>
              <p className="text-sm text-muted">Understand fermentation, acidity, and the microbiology behind preservation.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-border">
              <PickleSticker pose="celebrating" size="small" className="mb-3" />
              <h3 className="font-semibold text-foreground mb-2">The Craft</h3>
              <p className="text-sm text-muted">Master practical techniques to create your own pickles at home.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Chapter List */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Chapters</h2>
        <div className="space-y-3">
          {chapters.map((ch) => (
            <Link
              key={ch.slug}
              href={`/chapter/${ch.slug}`}
              className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
            >
              <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-pickle-light text-pickle-dark font-bold text-sm rounded-full">
                {ch.frontMatter.chapter}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground group-hover:text-pickle-green transition-colors">
                  {ch.frontMatter.title}
                </h3>
                {ch.frontMatter.description && (
                  <p className="text-sm text-muted truncate">{ch.frontMatter.description}</p>
                )}
              </div>
              <svg className="w-4 h-4 text-muted group-hover:text-pickle-green transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
