"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import MobileNav from "./MobileNav";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border no-print" style={{ background: "var(--surface-color, #16162a)" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src={siteConfig.horizontalLogo}
            alt={siteConfig.title}
            width={140}
            height={36}
            className="h-8 w-auto"
            priority
          />
          <span className="hidden sm:inline font-semibold text-lg transition-colors" style={{ color: "var(--reader-color, #e5e7eb)" }}>
            {siteConfig.title}
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {siteConfig.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-white/10"
              style={{ color: "var(--color-muted, #9ca3af)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-md transition-colors hover:bg-white/10"
          style={{ color: "var(--color-muted, #9ca3af)" }}
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
