import { NextRequest, NextResponse } from "next/server";
import { requireInternalAdminForApi } from "@/lib/internal-admin";
import { parseQuery, searchEntities } from "@/lib/admin/search";

export async function GET(request: NextRequest) {
  const { admin } = await requireInternalAdminForApi("support");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = request.nextUrl.searchParams.get("q") ?? "";
  const hits = await searchEntities(admin, parseQuery(raw));
  return NextResponse.json({ hits });
}
