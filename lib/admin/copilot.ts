import type { TimelineEvent } from "./timeline";

/**
 * AI Support Copilot — extension point (Phase 2/3).
 *
 * Entity pages already assemble everything a model needs (facts + unified
 * timeline); this module fixes the contract between that context and a
 * future LLM call so the UI slot and data plumbing don't change when the
 * copilot ships. Planned capabilities: company/candidate summaries,
 * suggested support actions (each mapping to an existing audited console
 * action — the copilot proposes, the human clicks), and paste-ready ticket
 * context.
 */
export interface SupportContext {
  entityType: "company" | "candidate" | "recruiter" | "project";
  entityId: string;
  /** Small, factual, serializable — exactly what the entity page shows. */
  facts: Record<string, string | number | boolean | null>;
  timeline: TimelineEvent[];
}

export interface CopilotSummary {
  summary: string;
  /** Every suggestion must resolve to an existing audited console action. */
  suggestedActions: { label: string; href: string }[];
  ticketContext: string;
  generatedAt: string;
}

export function buildSupportContext(
  entityType: SupportContext["entityType"],
  entityId: string,
  facts: SupportContext["facts"],
  timeline: TimelineEvent[]
): SupportContext {
  return { entityType, entityId, facts, timeline };
}

/**
 * Disabled until the copilot ships — consumers must handle null and render
 * no slot. TODO(itoc-phase-2): LLM call over SupportContext with the
 * claude-api skill's current model guidance.
 */
export async function getCopilotSummary(_context: SupportContext): Promise<CopilotSummary | null> {
  return null;
}
