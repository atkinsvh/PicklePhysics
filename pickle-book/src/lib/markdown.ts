import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkHtml from "remark-html";
import type {
  ChapterData,
  ChapterFrontMatter,
  TableOfContentsEntry,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function getProcessor() {
  return remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkHtml, { sanitize: false });
}

function extractHeadings(html: string): TableOfContentsEntry[] {
  const headings: TableOfContentsEntry[] = [];
  const regex = /<h([1-6])\s+id="([^"]*)"[^>]*>(.*?)<\/h\1>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[3].replace(/<[^>]+>/g, "").trim();
    headings.push({
      id: match[2] || text.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      text,
      level: parseInt(match[1]),
    });
  }
  return headings;
}

function addHeadingIds(html: string): string {
  return html.replace(
    /<h([1-6])([^>]*)>(.*?)<\/h\1>/g,
    (full, level, attrs, inner) => {
      if (attrs.includes("id=")) return full;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return `<h${level} id="${id}"${attrs}>${inner}</h${level}>`;
    }
  );
}

export function getAllChapterSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getChapterBySlug(slug: string): ChapterData | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  const frontMatter = data as ChapterFrontMatter;
  const processor = getProcessor();
  const rawHtml = String(processor.processSync(content));
  const html = addHeadingIds(rawHtml);
  const headings = extractHeadings(html);
  return {
    slug,
    frontMatter,
    content,
    html,
    headings,
    prev: null,
    next: null,
  };
}

export function getAllChapters(): ChapterData[] {
  const slugs = getAllChapterSlugs();
  let chapters = slugs
    .map((slug) => getChapterBySlug(slug))
    .filter((ch): ch is ChapterData => ch !== null && !ch.frontMatter.draft);
  chapters.sort((a, b) => a.frontMatter.order - b.frontMatter.order);
  for (let i = 0; i < chapters.length; i++) {
    chapters[i].prev =
      i > 0
        ? { slug: chapters[i - 1].slug, title: chapters[i - 1].frontMatter.title }
        : null;
    chapters[i].next =
      i < chapters.length - 1
        ? { slug: chapters[i + 1].slug, title: chapters[i + 1].frontMatter.title }
        : null;
  }
  return chapters;
}

export function getChapterByOrder(order: number): ChapterData | null {
  const chapters = getAllChapters();
  return chapters.find((ch) => ch.frontMatter.order === order) || null;
}

export function getGlossaryTerms(): { term: string; definition: string; chapter: string }[] {
  const chapters = getAllChapters();
  const terms: { term: string; definition: string; chapter: string }[] = [];
  for (const ch of chapters) {
    if (ch.frontMatter.glossary) {
      for (const g of ch.frontMatter.glossary) {
        terms.push({ term: g.term, definition: g.definition, chapter: ch.slug });
      }
    }
  }
  return terms.sort((a, b) => a.term.localeCompare(b.term));
}

export function getChaptersBySection(): Record<string, ChapterData[]> {
  const chapters = getAllChapters();
  const grouped: Record<string, ChapterData[]> = {};
  for (const ch of chapters) {
    const section = ch.frontMatter.section || "Uncategorized";
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(ch);
  }
  return grouped;
}
