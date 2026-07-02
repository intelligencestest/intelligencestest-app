import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import type { User } from "@supabase/supabase-js";

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

export async function getInternalAdminUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return isInternalAdminEmail(user?.email) ? user : null;
}

export async function requireInternalAdminForApi() {
  const user = await getInternalAdminUser();

  if (!user) {
    return { user: null, admin: null };
  }

  return { user, admin: createAdminClient() };
}
