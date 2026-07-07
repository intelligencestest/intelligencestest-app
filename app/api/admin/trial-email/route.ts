import { NextRequest, NextResponse } from "next/server";
import { logAdminAction, requireInternalAdminForApi } from "@/lib/internal-admin";
import { sendTrialEmail, type TrialEmailKind } from "@/lib/trial-email";

const KINDS: TrialEmailKind[] = ["trial_started", "trial_day1", "trial_day2", "trial_ending", "trial_expired"];

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/** Manual trigger for a trial-lifecycle email (support role) — no scheduler exists yet; this is the callable entry point until one does. */
export async function POST(request: NextRequest) {
  const { admin, user } = await requireInternalAdminForApi("support");
  if (!admin || !user) return jsonError("Forbidden", 403);

  const body = await request.json().catch(() => null);
  const companyId = typeof body?.company_id === "string" ? body.company_id : "";
  const kind = body?.kind as TrialEmailKind;

  if (!companyId || !KINDS.includes(kind)) {
    return jsonError("company_id and a valid kind are required.", 400);
  }

  const { data: company } = await admin.from("companies").select("id, name, email, language").eq("id", companyId).maybeSingle();
  if (!company) return jsonError("Company not found.", 404);

  const { data: recipient } = await admin
    .from("users")
    .select("full_name, email")
    .eq("company_id", companyId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const to = recipient?.email ?? company.email;
  if (!to) return jsonError("No recipient email found for this company.", 400);

  const result = await sendTrialEmail({ kind, locale: company.language, to, name: recipient?.full_name ?? null });

  if (result.error) {
    return jsonError(result.error.message, 502);
  }

  const { audited } = await logAdminAction(admin, user, {
    actionType: "trial_email.send",
    entityType: "company",
    entityId: companyId,
    companyId,
    payload: { kind, to },
  });

  return NextResponse.json({ ok: true, audited });
}
