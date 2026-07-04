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
  invited: "bg-amber-400",
  started: "bg-blue-400",
  completed: "bg-emerald-400",
  reviewed: "bg-violet-400",
  interview: "bg-[#6B9FFF]",
  hired: "bg-emerald-300",
  expired: "bg-slate-600",
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
