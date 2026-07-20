import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import {
  DEFAULT_REPORT_PRIMARY_COLOR,
  validatePrimaryColorInput,
  validateReportFooterTextInput,
} from "@/lib/security/company-branding";
import { sanitizeLogoUrl, validateLogoUrlInput } from "@/lib/security/logo-url";

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function currentUserProfile() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null, company: null };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("id, company_id, full_name, email, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return { user, profile, company: null };
  }

  const { data: company } = await admin
    .from("companies")
    .select("id, name, email, logo_url, industry, language, primary_color, report_footer_text")
    .eq("id", profile.company_id)
    .single();

  return { user, profile, company };
}

export async function GET() {
  const { user, profile, company } = await currentUserProfile();

  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    full_name: profile.full_name ?? "",
    email: profile.email ?? user.email ?? "",
    role: profile.role ?? "admin",
    company_name: company?.name ?? "",
    company_email: company?.email ?? "",
    logo_url: sanitizeLogoUrl(company?.logo_url) ?? "",
    industry: company?.industry ?? "",
    language: company?.language ?? "es",
    primary_color: company?.primary_color ?? DEFAULT_REPORT_PRIMARY_COLOR,
    report_footer_text: company?.report_footer_text ?? "",
  });
}

export async function PATCH(request: NextRequest) {
  const { user, profile, company } = await currentUserProfile();

  if (!user || !profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const fullName = clean(body?.full_name);
  const companyName = clean(body?.company_name);
  const industry = clean(body?.industry);
  const logoUrl = validateLogoUrlInput(body?.logo_url);
  const hasPrimaryColor = body && Object.prototype.hasOwnProperty.call(body, "primary_color");
  const primaryColor = hasPrimaryColor ? validatePrimaryColorInput(body.primary_color) : null;
  const hasReportFooterText = body && Object.prototype.hasOwnProperty.call(body, "report_footer_text");
  const reportFooterText = hasReportFooterText ? validateReportFooterTextInput(body.report_footer_text) : null;

  if (!fullName || !companyName) {
    return NextResponse.json({ error: "Name and company are required." }, { status: 400 });
  }
  if (!logoUrl.ok) {
    return NextResponse.json({ error: logoUrl.error }, { status: 400 });
  }
  if (primaryColor && !primaryColor.ok) {
    return NextResponse.json({ error: primaryColor.error }, { status: 400 });
  }
  if (reportFooterText && !reportFooterText.ok) {
    return NextResponse.json({ error: reportFooterText.error }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error: userError } = await admin
    .from("users")
    .update({ full_name: fullName })
    .eq("id", profile.id);

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  if (company?.id) {
    const companyUpdates: Record<string, string | null> = {
      name: companyName,
      industry,
      logo_url: logoUrl.value,
      updated_at: new Date().toISOString(),
    };
    if (primaryColor?.ok) companyUpdates.primary_color = primaryColor.value;
    if (reportFooterText?.ok) companyUpdates.report_footer_text = reportFooterText.value;

    const { error: companyError } = await admin
      .from("companies")
      .update(companyUpdates)
      .eq("id", company.id);

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
