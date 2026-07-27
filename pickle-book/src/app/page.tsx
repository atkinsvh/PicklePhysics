import Image from "next/image";
import Link from "next/link";
import PickleSticker from "@/components/PickleSticker";
import { getAllChapters } from "@/lib/markdown";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  const chapters = getAllChapters();
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold leading-tight mb-4"
                style={{ color: "var(--reader-color, #e5e7eb)", fontFamily: "var(--font-cinzel), serif" }}
              >
                {siteConfig.title}
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: "var(--color-muted)" }}>
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
                  className="inline-flex items-center gap-2 px-6 py-3 border font-semibold rounded-lg hover:border-pickle-green hover:text-pickle-green transition-colors"
                  style={{ borderColor: "var(--color-border)", color: "var(--reader-color)" }}
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
      <section className="border-t border-b bg-pickle-lighter" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--reader-color)" }}>What You Will Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg p-6 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--color-border)" }}>
              <PickleSticker pose="reading" size="small" className="mb-3" />
              <h3 className="font-semibold mb-2" style={{ color: "var(--reader-color)" }}>The History</h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>Discover thousands of years of pickling tradition from cultures around the world.</p>
            </div>
            <div className="rounded-lg p-6 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--color-border)" }}>
              <PickleSticker pose="thinking" size="small" className="mb-3" />
              <h3 className="font-semibold mb-2" style={{ color: "var(--reader-color)" }}>The Science</h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>Understand fermentation, acidity, and the microbiology behind preservation.</p>
            </div>
            <div className="rounded-lg p-6 border" style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--color-border)" }}>
              <PickleSticker pose="celebrating" size="small" className="mb-3" />
              <h3 className="font-semibold mb-2" style={{ color: "var(--reader-color)" }}>The Craft</h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>Master practical techniques to create your own pickles at home.</p>
            </div>
          </div>
        </div>
      </section>
      {/* Chapter List */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--reader-color)" }}>Chapters</h2>
        <div className="space-y-3">
          {chapters.map((ch) => (
            <Link
              key={ch.slug}
              href={`/chapter/${ch.slug}`}
              className="flex items-center gap-4 p-4 border rounded-lg hover:border-pickle-green hover:bg-pickle-lighter transition-colors group"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-pickle-light text-pickle-dark font-bold text-sm rounded-full">
                {ch.frontMatter.chapter}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold transition-colors group-hover:text-pickle-green" style={{ color: "var(--reader-color)" }}>
                  {ch.frontMatter.title}
                </h3>
                {ch.frontMatter.description && (
                  <p className="text-sm truncate" style={{ color: "var(--color-muted)" }}>{ch.frontMatter.description}</p>
                )}
              </div>
              <svg className="w-4 h-4 transition-colors group-hover:text-pickle-green flex-shrink-0" style={{ color: "var(--color-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
