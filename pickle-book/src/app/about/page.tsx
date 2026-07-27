import type { Metadata } from "next";
import PickleSticker from "@/components/PickleSticker";
export const metadata: Metadata = {
  title: "About",
  description: "About Ed's Picklery and Emporium",
};
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-6">About This Book</h1>
      <div className="prose">
        <p>
          <strong>Ed&apos;s Picklery and Emporium</strong> is an educational book dedicated to the
          art and science of pickling. It is designed to be accessible to beginners while
          providing enough depth for experienced preservers.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe that preserving food is both a valuable life skill and a window into
          chemistry, microbiology, and cultural history. This book aims to make that knowledge
          available to everyone.
        </p>
        <h2>About the Author</h2>
        <p>
          Written by <strong>Nick James</strong>, this book draws on years of practical
          experience and research into food preservation techniques from around the world.
        </p>
        <h2>Accessibility</h2>
        <p>
          This website is designed to meet WCAG 2.2 AA accessibility standards. Reader
          controls allow you to adjust font size, line spacing, and reading width to suit
          your preferences.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-6 mt-12">
        <PickleSticker pose="welcoming" size="medium" message="Glad you're here!" />
        <PickleSticker pose="reading" size="medium" message="Happy reading!" />
        <PickleSticker pose="celebrating" size="medium" message="Welcome!" />
      </div>
    </div>
  );
}
