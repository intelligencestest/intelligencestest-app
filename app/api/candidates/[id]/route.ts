import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";

const STAGES = ["invited", "started", "completed", "reviewed", "interview", "hired"] as const;
const OUTCOMES = ["pending", "rejected", "withdrawn", "expired"] as const;

type Stage = (typeof STAGES)[number];
type Outcome = (typeof OUTCOMES)[number];

// Legacy status keeps only its original three values so older pages
// and the test flow remain consistent during the transition.
function legacyStatus(stage: Stage): string {
  return stage === "invited" || stage === "started" || stage === "completed" ? stage : "completed";
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("users").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const { data: candidate } = await admin
    .from("candidates")
    .select("id, company_id, pipeline_stage, outcome, token")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .maybeSingle();
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  let body: { stage?: unknown; outcome?: unknown; extendInviteDays?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const stage = body.stage as Stage | undefined;
  const outcome = body.outcome as Outcome | undefined;
  const extendInviteDays = body.extendInviteDays as number | undefined;

  if (stage === undefined && outcome === undefined && extendInviteDays === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  if (stage !== undefined && !STAGES.includes(stage)) {
    return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
  }
  if (outcome !== undefined && !OUTCOMES.includes(outcome)) {
    return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
  }
  if (extendInviteDays !== undefined) {
    if (!Number.isInteger(extendInviteDays) || extendInviteDays < 1 || extendInviteDays > 30) {
      return NextResponse.json({ error: "extendInviteDays must be 1-30" }, { status: 400 });
    }
    if (candidate.pipeline_stage !== "invited") {
      return NextResponse.json({ error: "Only open invitations can be extended" }, { status: 400 });
    }
    if (!candidate.token) {
      return NextResponse.json({ error: "Candidate has no invite link to extend" }, { status: 400 });
    }
  }

  const updates: Record<string, unknown> = {};
  if (extendInviteDays !== undefined) {
    updates.token_expires_at = new Date(Date.now() + extendInviteDays * 24 * 60 * 60 * 1000).toISOString();
    // A lapsed invite becomes live again once its link is extended.
    if (candidate.outcome === "expired") updates.outcome = "pending";
  }
  if (stage !== undefined && stage !== candidate.pipeline_stage) {
    updates.pipeline_stage = stage;
    updates.stage_changed_at = new Date().toISOString();
    updates.status = legacyStatus(stage);
  }
  if (outcome !== undefined && outcome !== candidate.outcome) {
    updates.outcome = outcome;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, unchanged: true });
  }

  const { data: updated, error } = await admin
    .from("candidates")
    .update(updates)
    .eq("id", candidate.id)
    .select("id, pipeline_stage, outcome, stage_changed_at")
    .single();

  if (error || !updated) {
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, candidate: updated });
}
