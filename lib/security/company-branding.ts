export const DEFAULT_REPORT_PRIMARY_COLOR = "#2457D6";
export const MAX_REPORT_FOOTER_TEXT_LENGTH = 180;

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export function normalizePrimaryColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return HEX_COLOR.test(trimmed) ? trimmed.toUpperCase() : null;
}

export function validatePrimaryColorInput(
  value: unknown
): { ok: true; value: string } | { ok: false; error: string } {
  const normalized = normalizePrimaryColor(value);
  if (normalized) return { ok: true, value: normalized };

  return {
    ok: false,
    error: "Primary color must be a six-digit hex color such as #2457D6.",
  };
}

export function validateReportFooterTextInput(
  value: unknown
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (value === undefined || value === null) return { ok: true, value: null };
  if (typeof value !== "string") {
    return { ok: false, error: "Report footer note must be text." };
  }

  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (normalized.length > MAX_REPORT_FOOTER_TEXT_LENGTH) {
    return {
      ok: false,
      error: `Report footer note must be ${MAX_REPORT_FOOTER_TEXT_LENGTH} characters or fewer.`,
    };
  }

  return { ok: true, value: normalized || null };
}
