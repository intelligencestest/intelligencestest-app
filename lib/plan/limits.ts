import type { createAdminClient } from "@/lib/supabase-server";

type AdminClient = ReturnType<typeof createAdminClient>;

export type PlanId = "trial" | "starter" | "professional" | "enterprise";
export type TrialStatus = "active" | "expired" | "extended" | "converted";
export type SubscriptionStatus = "manual" | "pending_payment" | "active" | "past_due" | "cancelled";
export type BillingProvider = "manual" | "paypal" | "stripe";
export type LimitKind = "candidate" | "project" | "recruiter";

const PLAN_IDS: readonly PlanId[] = ["trial", "starter", "professional", "enterprise"];

export const TRIAL_DURATION_DAYS = 3;

export interface PlanLimits {
  candidates: number | null;
  projects: number | null;
  recruiters: number | null;
}

/** Trial and Starter share the same caps by design — the trial is a time-boxed preview of Starter. */
export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  trial: { candidates: 10, projects: 1, recruiters: 1 },
  starter: { candidates: 10, projects: 1, recruiters: 1 },
  professional: { candidates: 50, projects: 3, recruiters: 3 },
  enterprise: { candidates: null, projects: null, recruiters: null },
};

export const PLAN_PRICE_EUR: Record<PlanId, number | null> = {
  trial: null,
  starter: 29,
  professional: 79,
  enterprise: null,
};

export function normalizePlan(value: unknown): PlanId | null {
  return typeof value === "string" && (PLAN_IDS as string[]).includes(value) ? (value as PlanId) : null;
}

export interface CompanyPlanState {
  companyId: string;
  /** Raw column value — may be a legacy plan (e.g. "standard") predating this system. */
  plan: string;
  planId: PlanId | null;
  trialStatus: TrialStatus;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  /** Whole days remaining, only meaningful while plan === "trial" && trialStatus === "active". */
  trialDaysLeft: number | null;
  isTrialExpired: boolean;
  subscriptionStatus: SubscriptionStatus;
  billingProvider: BillingProvider;
  /** Company-specific overrides (e.g. custom Enterprise caps) win over the plan default; null means unlimited. */
  limits: PlanLimits;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Reads a company's plan/trial row and lazily self-heals trial_status —
 * flips 'active' to 'expired' the first time it's read past trial_ends_at.
 * This is the only place trial expiry is decided, so there is no scheduled
 * job to keep in sync.
 */
export async function getCompanyPlanState(admin: AdminClient, companyId: string): Promise<CompanyPlanState | null> {
  const { data: company } = await admin
    .from("companies")
    .select(
      "id, plan, trial_status, trial_started_at, trial_ends_at, subscription_status, billing_provider, candidate_limit, project_limit, recruiter_limit"
    )
    .eq("id", companyId)
    .maybeSingle();

  if (!company) return null;

  const planId = normalizePlan(company.plan);
  let trialStatus = (company.trial_status ?? "active") as TrialStatus;
  const now = Date.now();
  const trialEndsAtMs = company.trial_ends_at ? new Date(company.trial_ends_at).getTime() : null;

  if (planId === "trial" && trialStatus === "active" && trialEndsAtMs !== null && trialEndsAtMs < now) {
    trialStatus = "expired";
    await admin.from("companies").update({ trial_status: "expired" }).eq("id", companyId);
  }

  const isTrialExpired = planId === "trial" && trialStatus === "expired";
  const trialDaysLeft =
    planId === "trial" && trialStatus === "active" && trialEndsAtMs !== null
      ? Math.max(0, Math.ceil((trialEndsAtMs - now) / DAY_MS))
      : null;

  const planDefaults = planId ? PLAN_LIMITS[planId] : { candidates: null, projects: null, recruiters: null };

  return {
    companyId,
    plan: company.plan,
    planId,
    trialStatus,
    trialStartedAt: company.trial_started_at,
    trialEndsAt: company.trial_ends_at,
    trialDaysLeft,
    isTrialExpired,
    subscriptionStatus: company.subscription_status as SubscriptionStatus,
    billingProvider: company.billing_provider as BillingProvider,
    limits: {
      candidates: company.candidate_limit ?? planDefaults.candidates,
      projects: company.project_limit ?? planDefaults.projects,
      recruiters: company.recruiter_limit ?? planDefaults.recruiters,
    },
  };
}

async function countUsage(admin: AdminClient, companyId: string, kind: LimitKind): Promise<number> {
  if (kind === "recruiter") {
    const { count } = await admin.from("users").select("id", { count: "exact", head: true }).eq("company_id", companyId);
    return count ?? 0;
  }
  if (kind === "project") {
    const { count } = await admin.from("hiring_projects").select("id", { count: "exact", head: true }).eq("company_id", companyId);
    return count ?? 0;
  }
  // Candidates are metered per calendar month (matches the Starter/Professional "candidates/month" pricing).
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count } = await admin
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", startOfMonth.toISOString());
  return count ?? 0;
}

function limitKeyFor(kind: LimitKind): keyof PlanLimits {
  if (kind === "candidate") return "candidates";
  if (kind === "project") return "projects";
  return "recruiters";
}

function limitMessage(kind: LimitKind, used: number, limit: number) {
  const es: Record<LimitKind, string> = {
    candidate:
      `Ha alcanzado el límite de su plan (${used}/${limit} candidatos este mes). Solicite una ampliación para continuar invitando candidatos.`,
    project:
      `Ha alcanzado el límite de su plan (${used}/${limit} proyectos activos). Solicite una ampliación para continuar creando proyectos.`,
    recruiter:
      `Ha alcanzado el límite de su plan (${used}/${limit} reclutadores). Solicite una ampliación para continuar.`,
  };
  const en: Record<LimitKind, string> = {
    candidate: `You've reached your plan limit (${used}/${limit} candidates this month). Request an extension to keep inviting candidates.`,
    project: `You've reached your plan limit (${used}/${limit} active projects). Request an extension to keep creating projects.`,
    recruiter: `You've reached your plan limit (${used}/${limit} recruiters). Request an extension to continue.`,
  };
  return { es: es[kind], en: en[kind] };
}

const TRIAL_EXPIRED_MESSAGE = {
  es: "Su prueba ha finalizado. Sus datos siguen disponibles; solicite una ampliación para continuar creando proyectos e invitando candidatos.",
  en: "Your trial has ended. Your existing data remains available; request an extension to keep creating projects and inviting candidates.",
};

export interface LimitCheckResult {
  ok: boolean;
  reason?: "trial_expired" | "limit_reached";
  used?: number;
  limit?: number | null;
  message?: { es: string; en: string };
}

/**
 * The single choke-point call for both invite-candidate and create-project.
 * Trial expiry blocks candidates/projects outright, regardless of count —
 * everything else is a plain usage-vs-limit check (null limit = unlimited).
 */
export async function assertWithinLimit(admin: AdminClient, companyId: string, kind: LimitKind): Promise<LimitCheckResult> {
  const state = await getCompanyPlanState(admin, companyId);
  if (!state) return { ok: true };

  if (kind !== "recruiter" && state.isTrialExpired) {
    return { ok: false, reason: "trial_expired", message: TRIAL_EXPIRED_MESSAGE };
  }

  const limit = state.limits[limitKeyFor(kind)];
  if (limit === null || limit === undefined) return { ok: true };

  const used = await countUsage(admin, companyId, kind);
  if (used >= limit) {
    return { ok: false, reason: "limit_reached", used, limit, message: limitMessage(kind, used, limit) };
  }
  return { ok: true, used, limit };
}

export interface PlanUsageSummary extends CompanyPlanState {
  usage: { candidates: number; projects: number; recruiters: number };
}

/** Full plan + trial + usage snapshot for the customer-facing dashboard/settings. */
export async function getPlanUsageSummary(admin: AdminClient, companyId: string): Promise<PlanUsageSummary | null> {
  const state = await getCompanyPlanState(admin, companyId);
  if (!state) return null;

  const [candidates, projects, recruiters] = await Promise.all([
    countUsage(admin, companyId, "candidate"),
    countUsage(admin, companyId, "project"),
    countUsage(admin, companyId, "recruiter"),
  ]);

  return { ...state, usage: { candidates, projects, recruiters } };
}
