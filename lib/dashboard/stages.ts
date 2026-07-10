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
    Calibrated to the light enterprise palette (docs/design/design-language.md §1). */
export const STAGE_COLOR: Record<PipelineStage | "expired", string> = {
  invited: "bg-[#d97706]",
  started: "bg-[#4a7096]",
  completed: "bg-[#16a34a]",
  reviewed: "bg-[#9ca3af]",
  interview: "bg-[#6366f1]",
  hired: "bg-[#15803d]",
  expired: "bg-[#6b7280]",
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
  invited: { bg: "bg-[rgba(217,119,6,0.07)]", text: "text-[#b45309]", ring: "ring-[rgba(217,119,6,0.28)]", dot: STAGE_COLOR.invited },
  started: { bg: "bg-[rgba(74,112,150,0.07)]", text: "text-[#3a5c7e]", ring: "ring-[rgba(74,112,150,0.3)]", dot: STAGE_COLOR.started },
  completed: { bg: "bg-[rgba(22,163,74,0.07)]", text: "text-[#15803d]", ring: "ring-[rgba(22,163,74,0.25)]", dot: STAGE_COLOR.completed },
  reviewed: { bg: "bg-[rgba(107,114,128,0.08)]", text: "text-[#4b5563]", ring: "ring-[rgba(107,114,128,0.25)]", dot: STAGE_COLOR.reviewed },
  interview: { bg: "bg-[var(--it-primary-soft)]", text: "text-[var(--it-link)]", ring: "ring-[rgba(79,70,229,0.25)]", dot: STAGE_COLOR.interview },
  hired: { bg: "bg-[rgba(22,163,74,0.1)]", text: "text-[#166534]", ring: "ring-[rgba(22,163,74,0.3)]", dot: STAGE_COLOR.hired },
  rejected: { bg: "bg-[rgba(220,38,38,0.06)]", text: "text-[#b91c1c]", ring: "ring-[rgba(220,38,38,0.25)]", dot: "bg-[#dc2626]" },
  withdrawn: { bg: "bg-[rgba(107,114,128,0.08)]", text: "text-[var(--it-muted)]", ring: "ring-[rgba(107,114,128,0.25)]", dot: "bg-[#9ca3af]" },
  expired: { bg: "bg-[rgba(107,114,128,0.1)]", text: "text-[#6b7280]", ring: "ring-[rgba(107,114,128,0.28)]", dot: STAGE_COLOR.expired },
};
