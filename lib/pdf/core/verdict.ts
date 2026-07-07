import type { PdfMessages } from "./i18n";
import type { HiringRecommendationContent } from "./types";

/**
 * The Verdict Mark's vocabulary is locked at exactly three words, regardless of
 * which of the five underlying recommendation levels produced it. The mark is a
 * recognition device, not a nuance device — the full nuance still lives in the
 * verdict line rendered beneath it.
 */
export function verdictMarkWord(level: HiringRecommendationContent["level"], messages: PdfMessages): string {
  if (level === "strong" || level === "proceed") return messages.verdictProceed.toUpperCase();
  if (level === "review" || level === "caution") return messages.verdictCaution.toUpperCase();
  return messages.verdictDecline.toUpperCase();
}
