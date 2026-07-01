import { createAdminClient } from "@/lib/supabase-server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";

const testPaths: Record<string, string> = {
  "Critical Thinking Test": "critical-thinking",
  "Adversity Quotient (AQ) Test": "aq",
  "Emotional Intelligence Test": "emotional-intelligence",
  "Leadership Styles Test": "leadership-styles",
  "Numerical Intelligence Test": "numerical-intelligence",
  "Personality Type Test": "personality-type",
  "Situational Judgment Test": "situational-judgment",
  "Attention to Detail Test": "attention-detail",
  "Verbal Reasoning Test": "verbal-reasoning",
  "Abstract Reasoning Test": "abstract-reasoning",
  "Mechanical Reasoning Test": "mechanical-reasoning",
  "Communication Skills Test": "communication-skills",
  "Problem Solving Test": "problem-solving",
  "Work Style Assessment": "work-style",
  "Sales Aptitude Test": "sales-aptitude",
  "Customer Service Skills Test": "customer-service-skills",
  "Teamwork & Collaboration Test": "teamwork-collaboration",
  "Time Management Test": "time-management",
  "Stress Tolerance Test": "stress-tolerance",
  "Integrity & Ethics Test": "integrity-ethics",
  "Decision Making Test": "decision-making",
  "Learning Agility Test": "learning-agility",
};

function buildInviteEmail(opts: {
  candidateName: string | null;
  companyName: string;
  testUrl: string;
}): string {
  const greeting = opts.candidateName ? `Hi ${opts.candidateName},` : "Hi there,";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#07080F;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:48px auto;padding:40px;background-color:#0D1020;border:1px solid #1E2240;border-radius:16px">
    <p style="margin:0 0 32px;font-size:13px;font-weight:600;color:#8CB1FF;letter-spacing:0.05em;text-transform:uppercase">${opts.companyName}</p>
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#FFFFFF;line-height:1.3">${greeting}</h1>
    <p style="margin:0 0 28px;font-size:15px;color:#94A3B8;line-height:1.65">
      You've been invited to complete an online assessment. Find a quiet space and set aside uninterrupted time before you start — once begun, the timer cannot be paused.
    </p>
    <a href="${opts.testUrl}" style="display:inline-block;background-color:#1D4ED8;color:#FFFFFF;font-size:15px;font-weight:600;padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.01em">
      Start your assessment &rarr;
    </a>
    <p style="margin:28px 0 0;font-size:12px;color:#475569;line-height:1.6">
      This link expires in <strong style="color:#64748B">7 days</strong>. If you weren't expecting this invitation, you can safely ignore this email.
    </p>
    <hr style="border:none;border-top:1px solid #1E2240;margin:24px 0">
    <p style="margin:0;font-size:11px;color:#334155">Sent by ${opts.companyName} via IntelligencesTest</p>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { full_name, email, project_id, assessment_type, delivery_method } = body;

  if (!project_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate email early when sending via email to avoid creating dangling records
  if (delivery_method === "email") {
    if (!email || !String(email).includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
  }

  const admin = createAdminClient();

  const { data: userProfile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!userProfile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const { data: company } = await admin
    .from("companies")
    .select("name, language")
    .eq("id", userProfile.company_id)
    .single();

  const lang = company?.language && ["en", "es"].includes(company.language) ? company.language : "en";
  const companyName = company?.name ?? "Your Company";

  if (!assessment_type) {
    return NextResponse.json({ error: "Assessment type is required" }, { status: 400 });
  }

  const { data: assessment } = await admin
    .from("assessments")
    .select("id")
    .eq("name", assessment_type)
    .single();

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  const { data: linked } = await admin
    .from("project_assessments")
    .select("assessment_id")
    .eq("project_id", project_id)
    .eq("assessment_id", assessment.id)
    .maybeSingle();

  if (!linked) {
    return NextResponse.json({ error: "This assessment is not part of the selected project" }, { status: 403 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: candidate, error } = await admin
    .from("candidates")
    .insert({
      company_id: userProfile.company_id,
      project_id,
      full_name: (full_name ?? "").trim(),
      email: (email ?? "").toLowerCase().trim(),
      status: "invited",
      token,
      token_expires_at: expiresAt,
    })
    .select("id, token")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }

  const testPath = testPaths[assessment_type] ?? "critical-thinking";
  const langParam = lang !== "en" ? `&lang=${lang}` : "";
  const testUrl = `/test/${testPath}?token=${candidate.token}${langParam}`;

  if (delivery_method === "email") {
    const origin = new URL(request.url).origin;
    const absoluteUrl = `${origin}${testUrl}`;
    const toAddress = email.toLowerCase().trim();

    console.log("[invite/email] sending", {
      from: process.env.RESEND_FROM_EMAIL ?? "(RESEND_FROM_EMAIL not set)",
      to: toAddress,
      apiKeyPresent: !!process.env.RESEND_API_KEY,
      apiKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8) ?? "(none)",
      subject: `${companyName} — Your assessment invitation`,
      testUrl: absoluteUrl,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resendResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: toAddress,
      subject: `${companyName} — Your assessment invitation`,
      html: buildInviteEmail({
        candidateName: full_name?.trim() || null,
        companyName,
        testUrl: absoluteUrl,
      }),
    });

    console.log("[invite/email] Resend response", JSON.stringify(resendResult));

    if (resendResult.error) {
      console.error("[invite/email] send FAILED:", resendResult.error);
      return NextResponse.json(
        { error: `Candidate created but email failed: ${resendResult.error.message}`, test_url: testUrl, candidate_id: candidate.id },
        { status: 502 }
      );
    }

    console.log("[invite/email] sent OK, id:", resendResult.data?.id);
    return NextResponse.json({ candidate_id: candidate.id, test_url: testUrl, email_sent: true });
  }

  return NextResponse.json({ candidate_id: candidate.id, test_url: testUrl });
}
