import { isValidCandidateEmail } from "@/lib/candidate-invite";

export const MAX_INVITE_BATCH_ROWS = 200;
export const MAX_INVITE_CSV_BYTES = 512 * 1024;

export interface ParsedInviteRow {
  rowNumber: number;
  name: string;
  email: string;
  role?: string;
  testType?: string;
  roleOrTestType?: string;
}

export type InviteCsvResult =
  | { ok: true; rows: ParsedInviteRow[] }
  | { ok: false; errors: string[] };

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseCsvRecords(text: string): { records: string[][]; error?: string } {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  const pushRow = () => {
    row.push(field);
    if (row.some((value) => value.trim() !== "")) records.push(row);
    row = [];
    field = "";
  };

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field === "") {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      pushRow();
    } else if (character === "\r") {
      if (text[index + 1] !== "\n") pushRow();
    } else {
      field += character;
    }
  }

  if (quoted) return { records: [], error: "The CSV contains an unclosed quoted field." };
  if (field !== "" || row.length > 0) pushRow();
  return { records };
}

function findHeader(headers: string[], aliases: string[]): number {
  return headers.findIndex((header) => aliases.includes(header));
}

export function parseInviteCsv(text: string): InviteCsvResult {
  const parsed = parseCsvRecords(text);
  if (parsed.error) return { ok: false, errors: [parsed.error] };
  if (parsed.records.length < 2) {
    return { ok: false, errors: ["The CSV must contain a header row and at least one candidate row."] };
  }

  const headers = parsed.records[0].map(normalizeHeader);
  const nameIndex = findHeader(headers, ["name", "candidate_name", "full_name"]);
  const emailIndex = findHeader(headers, ["email", "candidate_email", "email_address"]);
  const roleIndex = findHeader(headers, ["role", "role_title", "position"]);
  const testTypeIndex = findHeader(headers, ["test", "test_type", "assessment", "assessment_type"]);
  const roleOrTestTypeIndex = findHeader(headers, ["role_test_type"]);

  const headerErrors: string[] = [];
  if (nameIndex === -1) headerErrors.push('Missing a "name" column.');
  if (emailIndex === -1) headerErrors.push('Missing an "email" column.');
  if (headerErrors.length > 0) return { ok: false, errors: headerErrors };

  const dataRows = parsed.records.slice(1);
  if (dataRows.length > MAX_INVITE_BATCH_ROWS) {
    return {
      ok: false,
      errors: [`A batch can contain at most ${MAX_INVITE_BATCH_ROWS} candidate rows.`],
    };
  }

  const errors: string[] = [];
  const rows: ParsedInviteRow[] = [];
  const seenEmails = new Set<string>();

  dataRows.forEach((record, index) => {
    const rowNumber = index + 2;
    const name = (record[nameIndex] ?? "").trim();
    const email = (record[emailIndex] ?? "").trim().toLowerCase();

    if (!name) errors.push(`Row ${rowNumber}: candidate name is required.`);
    if (name.length > 500) errors.push(`Row ${rowNumber}: candidate name is too long.`);
    if (!isValidCandidateEmail(email)) errors.push(`Row ${rowNumber}: email address is invalid.`);
    if (seenEmails.has(email)) errors.push(`Row ${rowNumber}: duplicate email address in this CSV.`);
    if (email) seenEmails.add(email);

    rows.push({
      rowNumber,
      name,
      email,
      ...(roleIndex >= 0 && record[roleIndex]?.trim() ? { role: record[roleIndex].trim() } : {}),
      ...(testTypeIndex >= 0 && record[testTypeIndex]?.trim() ? { testType: record[testTypeIndex].trim() } : {}),
      ...(roleOrTestTypeIndex >= 0 && record[roleOrTestTypeIndex]?.trim()
        ? { roleOrTestType: record[roleOrTestTypeIndex].trim() }
        : {}),
    });
  });

  if (errors.length > 0) return { ok: false, errors: errors.slice(0, 25) };
  return { ok: true, rows };
}
