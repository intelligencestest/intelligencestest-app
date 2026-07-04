import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import type { User } from "@supabase/supabase-js";

/**
 * Console roles. Reads are open to every role; writes are gated:
 *   support    — safe per-entity fixes (extend invite, reset password)
 *   ops        — tenant lifecycle (create/disable company, change plan)
 *   superadmin — destructive ceremonies (hard delete), admin management
 */
export type AdminRole = "support" | "ops" | "superadmin";

const ROLE_ORDER: Record<AdminRole, number> = { support: 0, ops: 1, superadmin: 2 };

export function roleAtLeast(role: AdminRole, min: AdminRole): boolean {
  return ROLE_ORDER[role] >= ROLE_ORDER[min];
}

export interface InternalAdmin {
  user: User;
  role: AdminRole;
  /** True when authorized via the env allowlist rather than internal_admins. */
  breakGlass: boolean;
}

function configuredAdminEmails() {
  const raw = process.env.INTERNAL_ADMIN_EMAILS || process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isInternalAdminEmail(email?: string | null) {
  if (!email) return false;
  const normalized = email.toLowerCase();
  const allowed = configuredAdminEmails();

  if (allowed.length > 0) {
    return allowed.includes(normalized);
  }

  return normalized === "contact@intelligencestest.com";
}

/**
 * Resolves the signed-in user to a console operator. internal_admins rows
 * win; the env allowlist remains as break-glass bootstrap (superadmin) so
 * the console stays reachable before migration 021 and during incidents.
 */
export async function getInternalAdmin(): Promise<InternalAdmin | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("internal_admins")
    .select("role, disabled_at")
    .eq("user_id", user.id)
    .maybeSingle();

  // error covers migration-not-applied; fall through to break-glass.
  if (!error && row) {
    if (row.disabled_at) return null;
    const role = (["support", "ops", "superadmin"] as const).includes(row.role)
      ? (row.role as AdminRole)
      : "support";
    return { user, role, breakGlass: false };
  }

  if (isInternalAdminEmail(user.email)) {
    return { user, role: "superadmin", breakGlass: true };
  }
  return null;
}

/** Back-compat wrapper used by older pages; prefer getInternalAdmin. */
export async function getInternalAdminUser(): Promise<User | null> {
  const resolved = await getInternalAdmin();
  return resolved?.user ?? null;
}

export async function requireInternalAdminForApi(minRole: AdminRole = "support") {
  const resolved = await getInternalAdmin();

  if (!resolved || !roleAtLeast(resolved.role, minRole)) {
    return { user: null, admin: null, role: null as AdminRole | null };
  }

  return { user: resolved.user, admin: createAdminClient(), role: resolved.role };
}

export interface AdminActionEntry {
  actionType: string;
  entityType?: string;
  entityId?: string;
  companyId?: string | null;
  reason?: string | null;
  /** Before/after values or action parameters — keep it small and factual. */
  payload?: Record<string, unknown>;
}

/**
 * Appends to the admin_actions audit stream. Every console mutation calls
 * this after the write succeeds. Failure to audit never rolls back the
 * action, but is surfaced to the caller so routes can flag it.
 */
export async function logAdminAction(
  admin: ReturnType<typeof createAdminClient>,
  actor: User,
  entry: AdminActionEntry
): Promise<{ audited: boolean }> {
  const { error } = await admin.from("admin_actions").insert({
    admin_user_id: actor.id,
    admin_email: actor.email ?? "unknown",
    action_type: entry.actionType,
    entity_type: entry.entityType ?? null,
    entity_id: entry.entityId ?? null,
    company_id: entry.companyId ?? null,
    reason: entry.reason ?? null,
    payload: entry.payload ?? null,
  });

  if (error) {
    console.error("[admin-audit] write failed:", error.message);
    return { audited: false };
  }
  return { audited: true };
}
