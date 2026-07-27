"use client";
import { useEffect } from "react";
import { updateLastChapter } from "@/lib/progress";
export default function ChapterProgressTracker({ slug }: { slug: string }) {
  useEffect(() => {
    updateLastChapter(slug, 0);
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const position = docHeight > 0 ? scrollTop / docHeight : 0;
      updateLastChapter(slug, position);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);
  return null;
}
