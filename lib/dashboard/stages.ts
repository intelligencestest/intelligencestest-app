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
