import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t mt-auto no-print" style={{ background: "var(--surface-color, #16162a)", borderColor: "var(--color-border)" }}>
      <div className="h-1 bg-gradient-to-r from-pickle-light via-pickle-green to-pickle-light" />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image
                src={siteConfig.simplifiedLogo}
                alt={siteConfig.title}
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="font-semibold" style={{ color: "var(--reader-color)" }}>{siteConfig.title}</span>
            </Link>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: "var(--reader-color)" }}>Navigation</h3>
            <ul className="space-y-2">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-pickle-green"
                    style={{ color: "var(--color-muted)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3" style={{ color: "var(--reader-color)" }}>About</h3>
            <p className="text-sm mb-2" style={{ color: "var(--color-muted)" }}>
              Written by {siteConfig.author}
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              Educational content for curious minds.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            &copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
