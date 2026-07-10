import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sendTrialEmail, type TrialEmailKind } from "@/lib/trial-email";

const DAY_MS = 24 * 60 * 60 * 1000;

type TrialEmailColumn =
  | "trial_started_email_sent_at"
  | "trial_day1_email_sent_at"
  | "trial_day2_email_sent_at"
  | "trial_ending_email_sent_at"
  | "trial_expired_email_sent_at";

interface TrialCompany {
  id: string;
  name: string | null;
  email: string | null;
  language: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  subscription_status: string | null;
  trial_started_email_sent_at: string | null;
  trial_day1_email_sent_at: string | null;
  trial_day2_email_sent_at: string | null;
  trial_ending_email_sent_at: string | null;
  trial_expired_email_sent_at: string | null;
}

interface TrialRecipient {
  company_id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

const EMAIL_COLUMNS: Record<TrialEmailKind, TrialEmailColumn> = {
  trial_started: "trial_started_email_sent_at",
  trial_day1: "trial_day1_email_sent_at",
  trial_day2: "trial_day2_email_sent_at",
  trial_ending: "trial_ending_email_sent_at",
  trial_expired: "trial_expired_email_sent_at",
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const querySecret = request.nextUrl.searchParams.get("secret")?.trim();
  return bearer === secret || querySecret === secret;
}

function pickEmail(company: TrialCompany, nowMs: number): TrialEmailKind | null {
  if (!company.trial_started_at || !company.trial_ends_at) return null;
  if (company.subscription_status === "active") return null;

  const startedMs = new Date(company.trial_started_at).getTime();
  const endsMs = new Date(company.trial_ends_at).getTime();
  if (!Number.isFinite(startedMs) || !Number.isFinite(endsMs)) return null;

  const daysSinceStart = Math.floor((nowMs - startedMs) / DAY_MS);
  const msUntilEnd = endsMs - nowMs;

  if (msUntilEnd <= 0 && !company.trial_expired_email_sent_at) return "trial_expired";
  if (msUntilEnd > 0 && msUntilEnd <= DAY_MS && !company.trial_ending_email_sent_at) return "trial_ending";
  if (daysSinceStart >= 2 && !company.trial_day2_email_sent_at) return "trial_day2";
  if (daysSinceStart >= 1 && !company.trial_day1_email_sent_at) return "trial_day1";
  if (daysSinceStart >= 0 && !company.trial_started_email_sent_at) return "trial_started";
  return null;
}

async function handleTrialEmails(request: NextRequest) {
  if (!isAuthorized(request)) {
    return jsonError("Unauthorized", 401);
  }

  const admin = createAdminClient();
  const now = new Date();
  const nowMs = now.getTime();
  const nowIso = now.toISOString();

  const { data: companies, error } = await admin
    .from("companies")
    .select(
      "id, name, email, language, trial_started_at, trial_ends_at, subscription_status, trial_started_email_sent_at, trial_day1_email_sent_at, trial_day2_email_sent_at, trial_ending_email_sent_at, trial_expired_email_sent_at"
    )
    .eq("plan", "trial")
    .in("trial_status", ["active", "extended", "expired"])
    .not("trial_started_at", "is", null)
    .not("trial_ends_at", "is", null)
    .limit(250);

  if (error) {
    return jsonError(error.message, 500);
  }

  const rows = (companies ?? []) as TrialCompany[];
  const companyIds = rows.map((company) => company.id);
  const recipientsByCompany = new Map<string, TrialRecipient>();

  if (companyIds.length > 0) {
    const { data: recipients } = await admin
      .from("users")
      .select("company_id, full_name, email, created_at")
      .in("company_id", companyIds)
      .order("created_at", { ascending: true });

    for (const recipient of (recipients ?? []) as TrialRecipient[]) {
      if (!recipientsByCompany.has(recipient.company_id)) {
        recipientsByCompany.set(recipient.company_id, recipient);
      }
    }
  }

  const sent: Array<{ companyId: string; kind: TrialEmailKind; to: string }> = [];
  const skipped: Array<{ companyId: string; reason: string }> = [];
  const failed: Array<{ companyId: string; kind: TrialEmailKind; error: string }> = [];

  for (const company of rows) {
    const kind = pickEmail(company, nowMs);
    if (!kind) {
      skipped.push({ companyId: company.id, reason: "no_email_due" });
      continue;
    }

    const recipient = recipientsByCompany.get(company.id);
    const to = recipient?.email ?? company.email;
    if (!to) {
      skipped.push({ companyId: company.id, reason: "missing_recipient" });
      continue;
    }

    const result = await sendTrialEmail({
      kind,
      locale: company.language,
      to,
      name: recipient?.full_name ?? null,
    });

    if (result.error) {
      failed.push({ companyId: company.id, kind, error: result.error.message });
      continue;
    }

    const sentColumn = EMAIL_COLUMNS[kind];
    const updates: Record<string, string> = {
      [sentColumn]: nowIso,
      updated_at: nowIso,
    };
    if (kind === "trial_expired") {
      updates.trial_status = "expired";
    }

    const { error: updateError } = await admin
      .from("companies")
      .update(updates)
      .eq("id", company.id)
      .is(sentColumn, null);

    if (updateError) {
      failed.push({ companyId: company.id, kind, error: updateError.message });
      continue;
    }

    sent.push({ companyId: company.id, kind, to });
  }

  return NextResponse.json({ ok: true, sent, skipped: skipped.length, failed });
}

export async function GET(request: NextRequest) {
  return handleTrialEmails(request);
}

export async function POST(request: NextRequest) {
  return handleTrialEmails(request);
}
