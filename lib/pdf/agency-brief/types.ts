// Client Shortlist Brief — an agency-branded, client-safe PDF distinct from
// the internal EnterpriseAssessmentReport template. Isolated on purpose: this
// document leaves the agency's building, so its data shape, copy, and layout
// should be free to diverge from the internal report without either one
// constraining the other's evolution.

export type ClientPriority = "Priority 1" | "Priority 2" | "Review" | "Lower priority" | "Incomplete";

export interface AgencyBriefCandidate {
  name: string;
  /** Client-safe label only — e.g. "Recommended for client interview". Never a raw score or internal tier code. */
  recommendation: string;
  /** Short scannable tier tag, distinct from the fuller `recommendation` sentence. Drives table/matrix grouping and card hierarchy. */
  clientPriority: ClientPriority;
  roleFit: string;
  confidence: string;
  /** 1-2 sentence client-safe justification. No raw scores, no severity words. */
  summary: string;
  /** One-line note for the Recommendation Matrix page — shorter than `summary`. */
  matrixNote: string;
  /** 2-4 word phrase used in the executive "client discussion priorities" roll-up (page 1) and the shortlist table's verification column. */
  keyVerificationPhrase: string;
  strengths: string[];
  pointsToVerify: string[];
  /** The interview question itself. */
  interviewFocus: string;
  /** What a good answer to `interviewFocus` should demonstrate — used on the Client Interview Focus page. */
  interviewVerifies: string;
}

export interface AgencyBriefSnapshot {
  totalCandidates: number;
  completedAssessments: number;
  recommendedForInterview: number;
  requiresVerification: number;
  incompleteEvidence: number;
}

export interface AgencyBriefData {
  agencyName: string;
  /** data: URI or remote URL. Omit to render the agency name only, no placeholder mark. */
  agencyLogoUrl?: string;
  roleTitle: string;
  shortlistName: string;
  /** Pre-formatted display date (e.g. "July 2026") — not a Date, so callers control locale formatting. */
  date: string;
  /**
   * Optional and off by default (see brief: some agencies won't want their
   * client's name on a document that could circulate further than intended).
   * Must be explicitly opted into with showClientName.
   */
  clientName?: string;
  showClientName?: boolean;
  preparedBy?: string;
  snapshot: AgencyBriefSnapshot;
  candidates: AgencyBriefCandidate[];
}
