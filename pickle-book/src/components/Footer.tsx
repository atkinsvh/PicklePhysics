import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto no-print">
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
              <span className="font-semibold text-foreground">{siteConfig.title}</span>
            </Link>
            <p className="text-sm text-muted">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">Navigation</h3>
            <ul className="space-y-2">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-pickle-green transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-3">About</h3>
            <p className="text-sm text-muted mb-2">
              Written by {siteConfig.author}
            </p>
            <p className="text-sm text-muted">
              Educational content for curious minds.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} {siteConfig.title}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
