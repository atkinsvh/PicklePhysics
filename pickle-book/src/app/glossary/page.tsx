import type { Metadata } from "next";
import Link from "next/link";
import { getGlossaryTerms } from "@/lib/markdown";
export const metadata: Metadata = {
  title: "Glossary",
  description: "Glossary of terms used in Ed's Picklery and Emporium",
};
export default function GlossaryPage() {
  const terms = getGlossaryTerms();
  const grouped: Record<string, typeof terms> = {};
  for (const term of terms) {
    const letter = term.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(term);
  }
  const letters = Object.keys(grouped).sort();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Glossary</h1>
      <p className="text-muted mb-8">
        Key terms and definitions used throughout this book.
      </p>
      {terms.length === 0 ? (
        <p className="text-muted">No glossary terms available yet.</p>
      ) : (
        <>
          {/* Alphabet nav */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#${letter}`}
                className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-pickle-green hover:bg-pickle-light rounded transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
          {/* Terms */}
          {letters.map((letter) => (
            <section key={letter} id={letter} className="mb-8 scroll-mt-20">
              <h2 className="text-2xl font-bold text-pickle-green mb-4">{letter}</h2>
              <dl className="space-y-4">
                {grouped[letter].map((term) => (
                  <div key={term.term} className="border-l-2 border-pickle-green pl-4">
                    <dt className="font-semibold text-foreground">{term.term}</dt>
                    <dd className="text-sm text-muted mt-1">{term.definition}</dd>
                    <dd className="text-xs text-muted mt-1">
                      <Link href={`/chapter/${term.chapter}`} className="text-pickle-green hover:underline">
                        View in chapter
                      </Link>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
