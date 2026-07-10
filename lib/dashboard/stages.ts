/** Canonical six-stage hiring pipeline (matches candidates.pipeline_stage). */
export const PIPELINE_STAGES = [
  "invited",
  "started",
  "completed",
  "reviewed",
  "interview",
  "hired",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

/** Segment/dot colors for stage visualizations; "expired" is the closed-invite bucket.
    Calibrated to the Graphite & Ivory palette (docs/design/design-language.md §1). */
export const STAGE_COLOR: Record<PipelineStage | "expired", string> = {
  invited: "bg-[#a8873d]",
  started: "bg-[#6e7f94]",
  completed: "bg-[#4f8467]",
  reviewed: "bg-[#827e70]",
  interview: "bg-[#66739b]",
  hired: "bg-[#7fa98c]",
  expired: "bg-[#55524a]",
};

/** i18n key (dashboard namespace) per stage. */
export const STAGE_LABEL_KEY: Record<PipelineStage | "expired", string> = {
  invited: "stageInvited",
  started: "stageStarted",
  completed: "stageCompleted",
  reviewed: "stageReviewed",
  interview: "stageInterview",
  hired: "stageHired",
  expired: "stageExpired",
};

export type StageCounts = Record<PipelineStage | "expired", number>;

export function emptyStageCounts(): StageCounts {
  return { invited: 0, started: 0, completed: 0, reviewed: 0, interview: 0, hired: 0, expired: 0 };
}

/**
 * Chip styling for the six pipeline stages plus the three closed-outcome
 * states (rejected/withdrawn/expired), derived from the same STAGE_COLOR
 * hexes so a given stage reads as the same color everywhere it appears
 * (candidate list, candidate detail, project health, pipeline strip).
 */
export const STATUS_CHIP_STYLE: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  invited: { bg: "bg-[rgba(168,135,61,0.08)]", text: "text-[#cdb584]", ring: "ring-[rgba(168,135,61,0.28)]", dot: STAGE_COLOR.invited },
  started: { bg: "bg-[rgba(110,127,148,0.08)]", text: "text-[#a9b8c9]", ring: "ring-[rgba(110,127,148,0.28)]", dot: STAGE_COLOR.started },
  completed: { bg: "bg-[rgba(79,132,103,0.08)]", text: "text-[#a9c8b4]", ring: "ring-[rgba(79,132,103,0.28)]", dot: STAGE_COLOR.completed },
  reviewed: { bg: "bg-[rgba(130,126,112,0.1)]", text: "text-[#c2beb0]", ring: "ring-[rgba(130,126,112,0.3)]", dot: STAGE_COLOR.reviewed },
  interview: { bg: "bg-[var(--it-primary-soft)]", text: "text-[var(--it-link)]", ring: "ring-[rgba(80,97,143,0.3)]", dot: STAGE_COLOR.interview },
  hired: { bg: "bg-[rgba(127,169,140,0.12)]", text: "text-[#b3d4c0]", ring: "ring-[rgba(127,169,140,0.32)]", dot: STAGE_COLOR.hired },
  rejected: { bg: "bg-[rgba(166,91,80,0.08)]", text: "text-[#cfa097]", ring: "ring-[rgba(166,91,80,0.28)]", dot: "bg-[#a65b50]" },
  withdrawn: { bg: "bg-[rgba(120,116,104,0.1)]", text: "text-[var(--it-muted)]", ring: "ring-[rgba(120,116,104,0.28)]", dot: "bg-[#787468]" },
  expired: { bg: "bg-[rgba(85,82,74,0.12)]", text: "text-slate-400", ring: "ring-[rgba(85,82,74,0.3)]", dot: STAGE_COLOR.expired },
};
