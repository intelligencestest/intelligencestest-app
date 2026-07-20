import { NextRequest, NextResponse } from "next/server";
import { processInviteBatchRows } from "@/lib/invite-batch-processor";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const querySecret = request.nextUrl.searchParams.get("secret")?.trim();
  return bearer === secret || querySecret === secret;
}

async function handleInviteBatches(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
    const result = await processInviteBatchRows(Number.isFinite(requestedLimit) ? requestedLimit : 10);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch processing failed";
    console.error("[invite-batches/cron]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return handleInviteBatches(request);
}

export async function POST(request: NextRequest) {
  return handleInviteBatches(request);
}
