import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendAuthEmail } from "@/lib/auth-email";
import { toAppLocale } from "@/lib/i18n/locales";
import { logAdminAction, requireInternalAdminForApi } from "@/lib/internal-admin";
import { normalizePlan, PLAN_LIMITS, TRIAL_DURATION_DAYS } from "@/lib/plan/limits";

const APP_URL = "https://app.intelligencestest.com";

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const { admin, user } = await requireInternalAdminForApi("ops");
  if (!admin || !user) return jsonError("Forbidden", 403);

  const body = await request.json().catch(() => null);
  const companyName = clean(body?.company_name);
  const adminEmail = clean(body?.admin_email).toLowerCase();
  const adminName = clean(body?.admin_name) || "Workspace Admin";
  const plan = clean(body?.plan) || "trial";
  const status = clean(body?.status) || "active";
  const language = toAppLocale(body?.language);
  const industry = clean(body?.industry);

  if (!companyName || !isEmail(adminEmail)) {
    return jsonError("Company name and a valid admin email are required.", 400);
  }
  const planId = normalizePlan(plan) ?? "trial";
  const planLimits = PLAN_LIMITS[planId];
  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .eq("email", adminEmail)
    .maybeSingle();

  if (existingUser) {
    return jsonError("A user with this email already exists.", 409);
  }

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: companyName,
      email: adminEmail,
      language,
      industry,
      onboarding_completed: true,
      plan: planId,
      trial_started_at: planId === "trial" ? trialStartedAt.toISOString() : null,
      trial_ends_at: planId === "trial" ? trialEndsAt.toISOString() : null,
      trial_status: planId === "trial" ? "active" : "converted",
      subscription_status: "manual",
      billing_provider: "manual",
      candidate_limit: planLimits.candidates,
      project_limit: planLimits.projects,
      recruiter_limit: planLimits.recruiters,
      status,
      disabled_at: status === "disabled" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (companyError || !company) {
    return jsonError(companyError?.message ?? "Could not create workspace.", 500);
  }

  const temporaryPassword = `${randomUUID()}Aa1!`;
  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email: adminEmail,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { full_name: adminName, company_id: company.id },
  });

  if (createUserError || !createdUser.user) {
    await admin.from("companies").delete().eq("id", company.id);
    return jsonError(createUserError?.message ?? "Could not create workspace admin.", 500);
  }

  const { error: userRowError } = await admin.from("users").insert({
    id: createdUser.user.id,
    company_id: company.id,
    full_name: adminName,
    email: adminEmail,
    role: "admin",
  });

  if (userRowError) {
    await admin.auth.admin.deleteUser(createdUser.user.id);
    await admin.from("companies").delete().eq("id", company.id);
    return jsonError(userRowError.message, 500);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: adminEmail,
    options: {
      redirectTo: `${APP_URL}/reset-password`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return jsonError(linkError?.message ?? "Workspace created, but password setup link failed.", 502);
  }

  const emailResult = await sendAuthEmail({
    kind: "welcome",
    locale: language,
    to: adminEmail,
    name: adminName,
    actionUrl: linkData.properties.action_link,
  });

  const { audited } = await logAdminAction(admin, user, {
    actionType: "company.create",
    entityType: "company",
    entityId: company.id,
    companyId: company.id,
    payload: { name: companyName, admin_email: adminEmail, plan: planId, status, language },
  });

  if (emailResult.error) {
    return jsonError(`Workspace created, but welcome email failed: ${emailResult.error.message}`, 502);
  }

  return NextResponse.json({ ok: true, company_id: company.id, audited });
}

const TRIAL_STATUSES = new Set(["active", "expired", "extended", "converted"]);
const SUBSCRIPTION_STATUSES = new Set(["manual", "pending_payment", "active", "past_due", "cancelled"]);
const BILLING_PROVIDERS = new Set(["manual", "paypal", "stripe"]);

function cleanIntOrNull(value: unknown): number | null | undefined {
  if (value === null) return null; // explicit null → unlimited
  if (value === undefined) return undefined; // not provided → leave untouched
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

export async function PATCH(request: NextRequest) {
  const { admin, user } = await requireInternalAdminForApi("ops");
  if (!admin || !user) return jsonError("Forbidden", 403);

  const body = await request.json().catch(() => null);
  const companyId = clean(body?.company_id);
  const status = clean(body?.status);
  const reason = clean(body?.reason) || null;

  if (!companyId) {
    return jsonError("Company id is required.", 400);
  }

  const { data: before } = await admin
    .from("companies")
    .select(
      "name, email, plan, status, language, industry, trial_status, trial_ends_at, subscription_status, billing_provider, pending_plan, paypal_subscription_id, paypal_subscription_status, candidate_limit, project_limit, recruiter_limit"
    )
    .eq("id", companyId)
    .maybeSingle();
  if (!before) return jsonError("Company not found.", 404);

  const updates: Record<string, string | number | null | boolean> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof body?.company_name === "string") updates.name = clean(body.company_name);
  if (typeof body?.email === "string") updates.email = clean(body.email).toLowerCase();
  if (typeof body?.plan === "string") {
    const planId = normalizePlan(clean(body.plan));
    if (planId) {
      const planLimits = PLAN_LIMITS[planId];
      updates.plan = planId;
      updates.candidate_limit = planLimits.candidates;
      updates.project_limit = planLimits.projects;
      updates.recruiter_limit = planLimits.recruiters;
      if (planId === "trial") {
        const startedAt = new Date();
        updates.trial_started_at = startedAt.toISOString();
        updates.trial_ends_at = new Date(startedAt.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();
        updates.trial_status = "active";
        updates.subscription_status = "manual";
        updates.billing_provider = "manual";
        updates.pending_plan = null;
      } else {
        updates.trial_status = "converted";
        updates.pending_plan = null;
      }
    }
  }
  if (typeof body?.language === "string") updates.language = toAppLocale(body.language);
  if (typeof body?.industry === "string") updates.industry = clean(body.industry);
  if (typeof body?.logo_url === "string") updates.logo_url = clean(body.logo_url, 1000);

  // Trial / subscription lifecycle — "ops — change plan" per the console's role model.
  if (typeof body?.trial_status === "string" && TRIAL_STATUSES.has(body.trial_status)) {
    updates.trial_status = body.trial_status;
  }
  if (typeof body?.extend_trial_days === "number" && body.extend_trial_days > 0) {
    const base = before.trial_ends_at && new Date(before.trial_ends_at).getTime() > Date.now() ? new Date(before.trial_ends_at) : new Date();
    updates.trial_ends_at = new Date(base.getTime() + body.extend_trial_days * 24 * 60 * 60 * 1000).toISOString();
    updates.trial_status = "extended";
  }
  if (typeof body?.subscription_status === "string" && SUBSCRIPTION_STATUSES.has(body.subscription_status)) {
    updates.subscription_status = body.subscription_status;
  }
  if (typeof body?.billing_provider === "string" && BILLING_PROVIDERS.has(body.billing_provider)) {
    updates.billing_provider = body.billing_provider;
  }
  if (body?.clear_pending_plan === true) {
    updates.pending_plan = null;
  }
  const candidateLimit = cleanIntOrNull(body?.candidate_limit);
  if (candidateLimit !== undefined) updates.candidate_limit = candidateLimit;
  const projectLimit = cleanIntOrNull(body?.project_limit);
  if (projectLimit !== undefined) updates.project_limit = projectLimit;
  const recruiterLimit = cleanIntOrNull(body?.recruiter_limit);
  if (recruiterLimit !== undefined) updates.recruiter_limit = recruiterLimit;

  if (status) {
    updates.status = status === "disabled" ? "disabled" : "active";
    updates.disabled_at = status === "disabled" ? new Date().toISOString() : null;
  }

  const { error } = await admin.from("companies").update(updates).eq("id", companyId);

  if (error) {
    return jsonError(error.message, 500);
  }

  const { audited } = await logAdminAction(admin, user, {
    actionType: updates.status === "disabled" ? "company.disable" : "company.update",
    entityType: "company",
    entityId: companyId,
    companyId,
    reason,
    payload: { before, after: updates },
  });

  return NextResponse.json({ ok: true, audited });
}

export async function DELETE(request: NextRequest) {
  // Hard delete is a destructive ceremony: superadmin only.
  const { admin, user } = await requireInternalAdminForApi("superadmin");
  if (!admin || !user) return jsonError("Forbidden", 403);

  const companyId = request.nextUrl.searchParams.get("company_id");
  if (!companyId) return jsonError("Company id is required.", 400);

  const { data: doomed } = await admin
    .from("companies")
    .select("name, email, plan, status")
    .eq("id", companyId)
    .maybeSingle();

  const { data: users } = await admin.from("users").select("id").eq("company_id", companyId);
  const userIds = (users ?? []).map((user) => user.id).filter(Boolean);

  const { data: projects } = await admin.from("hiring_projects").select("id").eq("company_id", companyId);
  const projectIds = (projects ?? []).map((project) => project.id).filter(Boolean);

  if (projectIds.length > 0) {
    await admin.from("project_assessments").delete().in("project_id", projectIds);
  }

  await admin.from("results").delete().eq("company_id", companyId);
  await admin.from("candidates").delete().eq("company_id", companyId);
  await admin.from("hiring_projects").delete().eq("company_id", companyId);
  await admin.from("users").delete().eq("company_id", companyId);
  const { error } = await admin.from("companies").delete().eq("id", companyId);

  if (error) {
    return jsonError(error.message, 500);
  }

  await Promise.allSettled(userIds.map((userId) => admin.auth.admin.deleteUser(userId)));

  // The audit row is what remains of the tenant: record what was deleted.
  const { audited } = await logAdminAction(admin, user, {
    actionType: "company.hard_delete",
    entityType: "company",
    entityId: companyId,
    companyId,
    payload: { deleted: doomed ?? { id: companyId }, users: userIds.length, projects: projectIds.length },
  });

  return NextResponse.json({ ok: true, audited });
}
