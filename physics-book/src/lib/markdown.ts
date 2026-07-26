import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import katex from "katex";
import type {
  ChapterData,
  ChapterFrontMatter,
  TableOfContentsEntry,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const processor = remark().use(remarkGfm).use(remarkHtml);

function processMath(content: string): { processed: string; mathMap: Map<string, string> } {
  const mathMap = new Map<string, string>();
  let counter = 0;
  const processed = content
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, tex: string) => {
      const key = `katex-${counter++}`;
      mathMap.set(key, katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }));
      return `\n<!--${key}-->\n`;
    })
    .replace(/\$([^\$\n]+?)\$/g, (_, tex: string) => {
      const key = `katex-${counter++}`;
      mathMap.set(key, katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }));
      return `<!--${key}-->`;
    });
  return { processed, mathMap };
}

function restoreMath(html: string, mathMap: Map<string, string>): string {
  let result = html;
  for (const [key, mathHtml] of mathMap) {
    result = result.replace(new RegExp(`<!--${key}-->`), mathHtml);
  }
  return result;
}

function addHeadingIds(html: string): string {
  return html.replace(/<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (_, level: string, attrs: string | undefined, content: string) => {
    if (attrs?.includes("id=")) return `<h${level}${attrs}>${content}</h${level}>`;
    const text = content.replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
    return `<h${level} id="${id}">${content}</h${level}>`;
  });
}

function extractHeadings(html: string): TableOfContentsEntry[] {
  const headings: TableOfContentsEntry[] = [];
  const regex = /<h([1-6])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), id: match[2], text: match[3].replace(/<[^>]+>/g, "").trim() });
  }
  return headings;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const { processed, mathMap } = processMath(markdown);
  const file = processor.processSync(processed);
  let html = file.toString();
  html = restoreMath(html, mathMap);
  html = addHeadingIds(html);
  return html;
}

export async function getAllChapters(): Promise<ChapterData[]> {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const chapters = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    return { slug, frontMatter: data as ChapterFrontMatter, rawContent: content };
  });
  chapters.sort((a, b) => (a.frontMatter.order ?? 999) - (b.frontMatter.order ?? 999));
  const result: ChapterData[] = [];
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    if (ch.frontMatter.draft) continue;
    const html = await markdownToHtml(ch.rawContent);
    const headings = extractHeadings(html);
    result.push({
      slug: ch.slug, frontMatter: ch.frontMatter, content: ch.rawContent, html, headings,
      prev: i > 0 ? { slug: chapters[i - 1].slug, title: chapters[i - 1].frontMatter.title } : null,
      next: i < chapters.length - 1 ? { slug: chapters[i + 1].slug, title: chapters[i + 1].frontMatter.title } : null,
    });
  }
  return result;
}

export async function getChapter(slug: string): Promise<ChapterData | null> {
  const chapters = await getAllChapters();
  return chapters.find((ch) => ch.slug === slug) || null;
}

export async function getAllGlossaryTerms() {
  const chapters = await getAllChapters();
  const terms: Array<{ term: string; definition: string; relatedTerms?: string[]; chapter: string }> = [];
  for (const ch of chapters) {
    if (ch.frontMatter.glossary) {
      for (const term of ch.frontMatter.glossary) terms.push({ ...term, chapter: ch.slug });
    }
  }
  terms.sort((a, b) => a.term.localeCompare(b.term));
  return terms;
}
