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

/** Segment/dot colors for stage visualizations; "expired" is the closed-invite bucket. */
export const STAGE_COLOR: Record<PipelineStage | "expired", string> = {
  invited: "bg-[#b8862f]",
  started: "bg-[#527aa3]",
  completed: "bg-[#3f8f6b]",
  reviewed: "bg-[#788197]",
  interview: "bg-[#647895]",
  hired: "bg-[#7fb695]",
  expired: "bg-[#4b5563]",
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
  invited: { bg: "bg-[rgba(184,134,47,0.08)]", text: "text-[#d2b174]", ring: "ring-[rgba(184,134,47,0.28)]", dot: STAGE_COLOR.invited },
  started: { bg: "bg-[rgba(82,122,163,0.08)]", text: "text-[#9bb7d2]", ring: "ring-[rgba(82,122,163,0.28)]", dot: STAGE_COLOR.started },
  completed: { bg: "bg-[rgba(63,143,107,0.08)]", text: "text-[#91c7ad]", ring: "ring-[rgba(63,143,107,0.28)]", dot: STAGE_COLOR.completed },
  reviewed: { bg: "bg-[rgba(120,129,151,0.1)]", text: "text-[#b7bccb]", ring: "ring-[rgba(120,129,151,0.3)]", dot: STAGE_COLOR.reviewed },
  interview: { bg: "bg-[var(--it-primary-soft)]", text: "text-[#9fb3e5]", ring: "ring-[rgba(46,85,184,0.3)]", dot: STAGE_COLOR.interview },
  hired: { bg: "bg-[rgba(127,182,149,0.12)]", text: "text-[#a8d9bc]", ring: "ring-[rgba(127,182,149,0.32)]", dot: STAGE_COLOR.hired },
  rejected: { bg: "bg-[rgba(185,82,76,0.08)]", text: "text-[#d99792]", ring: "ring-[rgba(185,82,76,0.28)]", dot: "bg-[#b9524c]" },
  withdrawn: { bg: "bg-[rgba(104,115,134,0.1)]", text: "text-[var(--it-muted)]", ring: "ring-[rgba(104,115,134,0.28)]", dot: "bg-[#687386]" },
  expired: { bg: "bg-[rgba(75,85,99,0.12)]", text: "text-slate-400", ring: "ring-[rgba(75,85,99,0.3)]", dot: STAGE_COLOR.expired },
};
