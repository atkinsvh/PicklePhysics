"use client";
import { useState, useEffect } from "react";
import { toggleBookmark, isBookmarked } from "@/lib/progress";
interface BookmarkButtonProps {
  slug: string;
}
export default function BookmarkButton({ slug }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  useEffect(() => {
    setBookmarked(isBookmarked(slug));
  }, [slug]);
  const handleToggle = () => {
    const result = toggleBookmark(slug);
    setBookmarked(result);
  };
  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-md transition-colors ${
        bookmarked
          ? "text-pickle-green bg-pickle-light"
          : "text-muted hover:text-pickle-green hover:bg-pickle-light"
      }`}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <svg className="w-5 h-5" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
