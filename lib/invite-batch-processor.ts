import { createCandidateInvite } from "@/lib/candidate-invite";
import { createAdminClient } from "@/lib/supabase-server";

interface ClaimedBatchRow {
  id: string;
  batch_id: string;
  company_id: string;
  candidate_name: string;
  candidate_email: string;
}

interface InviteBatch {
  id: string;
  company_id: string;
  project_id: string;
  test_type: string;
}

type BatchRowStatus = "pending" | "processing" | "sent" | "failed";

interface BatchStatusRow {
  status: BatchRowStatus;
}

export interface ProcessInviteBatchResult {
  claimed: number;
  sent: number;
  failed: number;
  errors: Array<{ rowId: string; error: string }>;
}

function safeErrorMessage(value: unknown) {
  const message = value instanceof Error ? value.message : typeof value === "string" ? value : "Unknown processing error";
  return message.slice(0, 1000);
}

async function refreshBatchStatus(batchId: string) {
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("invite_batch_rows")
    .select("status")
    .eq("batch_id", batchId);

  if (error) throw new Error(`Could not refresh batch ${batchId}: ${error.message}`);

  const statuses = (rows ?? []) as BatchStatusRow[];
  const sentCount = statuses.filter((row) => row.status === "sent").length;
  const failedCount = statuses.filter((row) => row.status === "failed").length;
  const hasOpenRows = statuses.some((row) => row.status === "pending" || row.status === "processing");
  const now = new Date().toISOString();
  const status = hasOpenRows
    ? "processing"
    : failedCount === 0
      ? "completed"
      : sentCount === 0
        ? "failed"
        : "completed_with_failures";

  const { error: updateError } = await admin
    .from("invite_batches")
    .update({
      status,
      sent_count: sentCount,
      failed_count: failedCount,
      completed_at: hasOpenRows ? null : now,
      updated_at: now,
    })
    .eq("id", batchId);

  if (updateError) throw new Error(`Could not update batch ${batchId}: ${updateError.message}`);
}

export async function processInviteBatchRows(limit = 10): Promise<ProcessInviteBatchResult> {
  const admin = createAdminClient();
  const claimLimit = Math.min(Math.max(Math.trunc(limit), 1), 25);
  const { data: claimedRows, error: claimError } = await admin.rpc("claim_invite_batch_rows", {
    p_limit: claimLimit,
  });

  if (claimError) throw new Error(`Could not claim invite rows: ${claimError.message}`);

  const claimed = (claimedRows ?? []) as ClaimedBatchRow[];
  if (claimed.length === 0) {
    return { claimed: 0, sent: 0, failed: 0, errors: [] };
  }

  const batchIds = [...new Set(claimed.map((row) => row.batch_id))];
  const { data: batchRows, error: batchError } = await admin
    .from("invite_batches")
    .select("id, company_id, project_id, test_type")
    .in("id", batchIds);

  if (batchError) throw new Error(`Could not load invite batches: ${batchError.message}`);

  const batches = new Map(((batchRows ?? []) as InviteBatch[]).map((batch) => [batch.id, batch]));
  const result: ProcessInviteBatchResult = { claimed: claimed.length, sent: 0, failed: 0, errors: [] };

  // Process sequentially so the existing monthly cap check observes each
  // candidate inserted earlier in this same run.
  for (const row of claimed) {
    const batch = batches.get(row.batch_id);
    let candidateId: string | null = null;
    let rowError: string | null = null;

    try {
      if (!batch || batch.company_id !== row.company_id) {
        rowError = "Batch configuration was not found";
      } else {
        const invite = await createCandidateInvite({
          companyId: row.company_id,
          fullName: row.candidate_name,
          email: row.candidate_email,
          projectId: batch.project_id,
          assessmentType: batch.test_type,
          deliveryMethod: "email",
          token: row.id,
          idempotencyKey: `invite-batch-${row.id}`,
        });

        candidateId = invite.candidateId ?? null;
        if (!invite.ok) rowError = invite.error;
      }
    } catch (error) {
      rowError = safeErrorMessage(error);
    }

    const now = new Date().toISOString();
    const status: BatchRowStatus = rowError ? "failed" : "sent";
    const { error: updateError } = await admin
      .from("invite_batch_rows")
      .update({
        status,
        error_message: rowError,
        candidate_id: candidateId,
        processed_at: now,
        updated_at: now,
      })
      .eq("id", row.id)
      .eq("status", "processing");

    if (updateError) {
      const message = safeErrorMessage(updateError.message);
      result.failed += 1;
      result.errors.push({ rowId: row.id, error: message });
    } else if (rowError) {
      result.failed += 1;
      result.errors.push({ rowId: row.id, error: rowError });
    } else {
      result.sent += 1;
    }
  }

  for (const batchId of batchIds) {
    try {
      await refreshBatchStatus(batchId);
    } catch (error) {
      result.errors.push({ rowId: batchId, error: safeErrorMessage(error) });
    }
  }

  return result;
}
