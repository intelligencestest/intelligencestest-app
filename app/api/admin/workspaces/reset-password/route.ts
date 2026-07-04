import { NextRequest, NextResponse } from "next/server";
import { sendAuthEmail } from "@/lib/auth-email";
import { toAppLocale } from "@/lib/i18n/locales";
import { logAdminAction, requireInternalAdminForApi } from "@/lib/internal-admin";

const APP_URL = "https://app.intelligencestest.com";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const { admin, user } = await requireInternalAdminForApi("support");
  if (!admin || !user) return jsonError("Forbidden", 403);

  const body = await request.json().catch(() => null);
  const companyId = clean(body?.company_id);
  const email = clean(body?.email).toLowerCase();

  if (!companyId) {
    return jsonError("Company id is required.", 400);
  }

  let query = admin
    .from("users")
    .select("full_name, email, company_id, companies(language)")
    .eq("company_id", companyId)
    .eq("role", "admin")
    .limit(1);

  if (email) {
    query = query.eq("email", email);
  }

  const { data: users, error: userError } = await query;
  const target = users?.[0];

  if (userError || !target?.email) {
    return jsonError(userError?.message ?? "Workspace admin not found.", 404);
  }

  const targetCompany = Array.isArray(target.companies) ? target.companies[0] : target.companies;
  const locale = toAppLocale(targetCompany?.language);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: target.email,
    options: {
      redirectTo: `${APP_URL}/auth/callback?next=/reset-password`,
    },
  });

  if (error || !data?.properties?.action_link) {
    return jsonError(error?.message ?? "Could not generate password reset link.", 500);
  }

  const result = await sendAuthEmail({
    kind: "recovery",
    locale,
    to: target.email,
    name: target.full_name,
    actionUrl: data.properties.action_link,
  });

  if (result.error) {
    return jsonError(`Could not send reset email: ${result.error.message}`, 502);
  }

  const { audited } = await logAdminAction(admin, user, {
    actionType: "user.password_reset_sent",
    entityType: "user",
    entityId: target.email,
    companyId,
  });

  return NextResponse.json({ ok: true, audited });
}
