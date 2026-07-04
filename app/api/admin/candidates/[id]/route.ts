import { NextRequest, NextResponse } from "next/server";
import { logAdminAction, requireInternalAdminForApi } from "@/lib/internal-admin";

/**
 * Console support actions on a candidate. Mirrors the recruiter-facing
 * extend capability but works across tenants and always writes an audit row.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { admin, user } = await requireInternalAdminForApi("support");
  if (!admin || !user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const extendInviteDays = body?.extendInviteDays as number | undefined;
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 500) || null : null;

  if (!Number.isInteger(extendInviteDays) || extendInviteDays! < 1 || extendInviteDays! > 30) {
    return NextResponse.json({ error: "extendInviteDays must be 1-30" }, { status: 400 });
  }

  const { data: candidate } = await admin
    .from("candidates")
    .select("id, company_id, pipeline_stage, outcome, token, token_expires_at")
    .eq("id", id)
    .maybeSingle();
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  if (candidate.pipeline_stage !== "invited") {
    return NextResponse.json({ error: "Only open invitations can be extended" }, { status: 400 });
  }
  if (!candidate.token) {
    return NextResponse.json({ error: "Candidate has no invite link to extend" }, { status: 400 });
  }

  const newExpiry = new Date(Date.now() + extendInviteDays! * 24 * 60 * 60 * 1000).toISOString();
  const updates: Record<string, unknown> = { token_expires_at: newExpiry };
  if (candidate.outcome === "expired") updates.outcome = "pending";

  const { error } = await admin.from("candidates").update(updates).eq("id", candidate.id);
  if (error) return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });

  const { audited } = await logAdminAction(admin, user, {
    actionType: "candidate.invite_extended",
    entityType: "candidate",
    entityId: candidate.id,
    companyId: candidate.company_id,
    reason,
    payload: { days: extendInviteDays, before: candidate.token_expires_at, after: newExpiry },
  });

  return NextResponse.json({ ok: true, token_expires_at: newExpiry, audited });
}
