import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { toAppLocale, type AppLocale } from "@/lib/i18n/locales";
import { assertWithinLimit } from "@/lib/plan/limits";
import {
  MAX_INVITE_CSV_BYTES,
  parseInviteCsv,
  type ParsedInviteRow,
} from "@/lib/invite-csv";

export const runtime = "nodejs";

function comparable(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function consistencyErrors(
  rows: ParsedInviteRow[],
  project: { name: string; role_title: string | null },
  testType: string
): string[] {
  const acceptedRoles = new Set([comparable(project.name), comparable(project.role_title)].filter(Boolean));
  const acceptedTest = comparable(testType);
  const errors: string[] = [];

  for (const row of rows) {
    if (row.role && !acceptedRoles.has(comparable(row.role))) {
      errors.push(`Row ${row.rowNumber}: role does not match the selected project.`);
    }
    if (row.testType && comparable(row.testType) !== acceptedTest) {
      errors.push(`Row ${row.rowNumber}: test type does not match the selected assessment.`);
    }
    if (row.roleOrTestType) {
      const value = comparable(row.roleOrTestType);
      if (!acceptedRoles.has(value) && value !== acceptedTest) {
        errors.push(`Row ${row.rowNumber}: role/test type does not match the selected project or assessment.`);
      }
    }
  }

  return errors.slice(0, 25);
}

async function currentCompany(): Promise<{
  user: { id: string } | null;
  companyId: string | null;
  language: AppLocale;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, companyId: null, language: "en" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) return { user, companyId: null, language: "en" };

  const { data: company } = await admin
    .from("companies")
    .select("language")
    .eq("id", profile.company_id)
    .maybeSingle();
  return { user, companyId: profile.company_id, language: toAppLocale(company?.language) };
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_INVITE_CSV_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "CSV files must be 512 KB or smaller." }, { status: 413 });
  }

  const { user, companyId, language } = await currentCompany();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!companyId) return NextResponse.json({ error: "User has no company" }, { status: 400 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const projectValue = formData?.get("project_id");
  const testTypeValue = formData?.get("test_type");
  const projectId = typeof projectValue === "string" ? projectValue : "";
  const requestedTestType = typeof testTypeValue === "string" ? testTypeValue.trim() : "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a CSV file to upload." }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "The uploaded file must use the .csv extension." }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_INVITE_CSV_BYTES) {
    return NextResponse.json({ error: "CSV files must be 512 KB or smaller." }, { status: 413 });
  }
  if (!projectId || !requestedTestType) {
    return NextResponse.json({ error: "Project and assessment are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("hiring_projects")
    .select("id, name, role_title")
    .eq("id", projectId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data: assessmentRows } = await admin
    .from("project_assessments")
    .select("assessments(name)")
    .eq("project_id", project.id)
    .returns<{ assessments: { name: string } | { name: string }[] | null }[]>();
  const testTypes = (assessmentRows ?? [])
    .map((row) => (Array.isArray(row.assessments) ? row.assessments[0]?.name : row.assessments?.name))
    .filter((name): name is string => Boolean(name));
  const testType = testTypes.find((name) => name === requestedTestType);
  if (!testType) {
    return NextResponse.json({ error: "Assessment is not linked to the selected project." }, { status: 400 });
  }

  const parsed = parseInviteCsv(await file.text());
  if (!parsed.ok) {
    return NextResponse.json({ error: "CSV validation failed.", errors: parsed.errors }, { status: 400 });
  }
  const mismatches = consistencyErrors(parsed.rows, project, testType);
  if (mismatches.length > 0) {
    return NextResponse.json({ error: "CSV project/test values do not match.", errors: mismatches }, { status: 400 });
  }

  const limitCheck = await assertWithinLimit(admin, companyId, "candidate");
  if (!limitCheck.ok) {
    return NextResponse.json(
      { error: limitCheck.message?.[language] ?? "Candidate limit reached", reason: limitCheck.reason },
      { status: 403 }
    );
  }

  const now = new Date().toISOString();
  const { data: batch, error: batchError } = await admin
    .from("invite_batches")
    .insert({
      company_id: companyId,
      project_id: project.id,
      created_by: user.id,
      test_type: testType,
      source_filename: file.name.slice(0, 255),
      total_count: parsed.rows.length,
      status: "pending",
      updated_at: now,
    })
    .select("id, status, total_count, sent_count, failed_count, created_at")
    .single();
  if (batchError || !batch) {
    return NextResponse.json({ error: batchError?.message ?? "Failed to create invite batch." }, { status: 500 });
  }

  const { error: rowsError } = await admin.from("invite_batch_rows").insert(
    parsed.rows.map((row) => ({
      batch_id: batch.id,
      company_id: companyId,
      row_number: row.rowNumber,
      candidate_name: row.name,
      candidate_email: row.email,
      status: "pending",
      updated_at: now,
    }))
  );
  if (rowsError) {
    await admin.from("invite_batches").delete().eq("id", batch.id).eq("company_id", companyId);
    return NextResponse.json({ error: rowsError.message }, { status: 500 });
  }

  const remainingSlots =
    limitCheck.limit === null || limitCheck.limit === undefined
      ? null
      : Math.max(0, limitCheck.limit - (limitCheck.used ?? 0));

  return NextResponse.json({ batch, remaining_slots: remainingSlots }, { status: 201 });
}

export async function GET() {
  const { user, companyId } = await currentCompany();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!companyId) return NextResponse.json({ error: "User has no company" }, { status: 400 });

  const admin = createAdminClient();
  const { data: batches, error } = await admin
    .from("invite_batches")
    .select(
      "id, project_id, test_type, source_filename, status, total_count, sent_count, failed_count, error_message, created_at, started_at, completed_at, hiring_projects(name, role_title)"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const batchIds = (batches ?? []).map((batch) => batch.id);
  const failuresByBatch = new Map<string, unknown[]>();
  if (batchIds.length > 0) {
    const { data: failures } = await admin
      .from("invite_batch_rows")
      .select("id, batch_id, row_number, candidate_name, candidate_email, error_message, candidate_id")
      .eq("company_id", companyId)
      .eq("status", "failed")
      .in("batch_id", batchIds)
      .order("row_number")
      .limit(200);
    for (const failure of failures ?? []) {
      failuresByBatch.set(failure.batch_id, [...(failuresByBatch.get(failure.batch_id) ?? []), failure]);
    }
  }

  return NextResponse.json({
    batches: (batches ?? []).map((batch) => ({
      ...batch,
      failed_rows: failuresByBatch.get(batch.id) ?? [],
    })),
  });
}
