import Link from "next/link";
import PickleSticker from "@/components/PickleSticker";
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <PickleSticker pose="questioning" size="large" message="Oops! Page not found." />
      <h1 className="text-4xl font-bold text-foreground mt-8 mb-4">404 — Page Not Found</h1>
      <p className="text-muted mb-8 max-w-md">
        The page you are looking for does not exist or has been moved. Let us help you find your way back.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-pickle-green text-white font-semibold rounded-lg hover:bg-pickle-dark transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/read"
          className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:border-pickle-green hover:text-pickle-green transition-colors"
        >
          Start Reading
        </Link>
      </div>
    </div>
  );
}
