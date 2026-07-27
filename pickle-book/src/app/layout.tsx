import type { Metadata } from "next";
import { Lato, Lobster, Cinzel_Decorative } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReaderSettingsProvider from "@/components/ReaderSettings";
import ReadingToolbar from "@/components/ReadingToolbar";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import { siteConfig } from "@/config/site";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

const lobster = Lobster({
  variable: "--font-lobster",
  subsets: ["latin"],
  weight: "400",
});

const cinzel = Cinzel_Decorative({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(`https://${siteConfig.domain}`),
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: `https://${siteConfig.domain}`,
    siteName: siteConfig.title,
    images: [{ url: siteConfig.socialImage, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
  icons: {
    icon: siteConfig.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${lobster.variable} ${cinzel.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        style={{
          background: "var(--reader-bg, #1a1a2e)",
          color: "var(--reader-color, #e5e7eb)",
          fontFamily: "var(--reader-font, var(--font-lato), sans-serif)",
          fontSize: "var(--reader-font-size, 18px)",
          lineHeight: "var(--reader-line-height, 1.8)",
        }}
      >
        <ReadingProgressBar />
        <Header />
        <ReaderSettingsProvider>
          <ReadingToolbar />
          <main className="flex-1">{children}</main>
        </ReaderSettingsProvider>
        <Footer />
      </body>
    </html>
  );
}
