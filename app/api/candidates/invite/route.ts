import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import {
  createCandidateInvite,
  type CandidateInviteDeliveryMethod,
} from "@/lib/candidate-invite";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const projectId = typeof body?.project_id === "string" ? body.project_id : "";
  if (!projectId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) {
    return NextResponse.json({ error: "User has no company" }, { status: 400 });
  }

  const deliveryMethod: CandidateInviteDeliveryMethod = body?.delivery_method === "email" ? "email" : "link";
  const result = await createCandidateInvite({
    companyId: profile.company_id,
    fullName: body?.full_name,
    email: body?.email,
    projectId,
    assessmentType: body?.assessment_type,
    deliveryMethod,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        reason: result.reason,
        candidate_id: result.candidateId,
        test_url: result.testUrl,
      },
      { status: result.status }
    );
  }

  return NextResponse.json({
    candidate_id: result.candidateId,
    test_url: result.testUrl,
    ...(result.emailSent ? { email_sent: true } : {}),
  });
}
