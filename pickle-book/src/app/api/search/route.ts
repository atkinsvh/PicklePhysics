import { NextRequest, NextResponse } from "next/server";
import { searchChapters } from "@/lib/search";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) {
    return NextResponse.json({ results: [], query: "" });
  }
  const results = searchChapters(q);
  return NextResponse.json({ results, query: q });
}
