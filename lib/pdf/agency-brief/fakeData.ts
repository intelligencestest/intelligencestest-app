import type { AgencyBriefData } from "./types";

// Static fake data for template development. See types.ts for the shape this
// will take once wired to real candidate/shortlist data.
export const FAKE_AGENCY_BRIEF: AgencyBriefData = {
  agencyName: "Atlas Talent Partners",
  roleTitle: "Customer Service Agent",
  shortlistName: "Customer Service Shortlist — July 2026",
  date: "July 2026",
  preparedBy: "Atlas Talent Partners",
  showClientName: false,
  snapshot: {
    totalCandidates: 5,
    completedAssessments: 4,
    recommendedForInterview: 2,
    requiresVerification: 2,
    incompleteEvidence: 1,
  },
  candidates: [
    {
      name: "Sara M.",
      recommendation: "Recommended for client interview",
      roleFit: "Strong",
      confidence: "High",
      summary:
        "Sara shows strong evidence of alignment with the Customer Service Agent role, especially in communication clarity, customer handling judgment, and structured problem solving.",
      strengths: ["Communication clarity", "Customer handling", "Structured problem solving"],
      pointsToVerify: ["Stress handling in high-volume situations"],
      interviewFocus: "Ask about difficult customer interactions and workload pressure.",
    },
    {
      name: "Yassine B.",
      recommendation: "Recommended with verification",
      roleFit: "Moderate to strong",
      confidence: "Medium",
      summary:
        "Yassine shows consistent evidence of attention to detail and reliability, with a strong pace of learning. Interview discussion should confirm his verbal confidence under pressure.",
      strengths: ["Attention to detail", "Reliability", "Learning agility"],
      pointsToVerify: ["Verbal confidence and speed under pressure"],
      interviewFocus: "Ask for examples of handling multiple customer requests at once.",
    },
    {
      name: "Amine K.",
      recommendation: "Keep under review",
      roleFit: "Moderate",
      confidence: "Medium",
      summary:
        "Amine demonstrates consistency and calm, process-driven communication. The evidence available does not yet clarify how he adapts when a situation falls outside standard procedure.",
      strengths: ["Consistency", "Process following", "Calm communication"],
      pointsToVerify: ["Initiative and adaptability"],
      interviewFocus: "Ask how he reacts when procedures change.",
    },
    {
      name: "Lina R.",
      recommendation: "Lower priority for this role",
      roleFit: "Limited",
      confidence: "Medium",
      summary:
        "Lina shows a positive attitude and basic communication ability. Current evidence suggests she may need more development in role-specific judgment before this position is a strong fit.",
      strengths: ["Basic communication", "Positive attitude"],
      pointsToVerify: ["Role-specific judgment and attention to detail"],
      interviewFocus: "Ask scenario-based customer service questions if proceeding.",
    },
    {
      name: "Mehdi T.",
      recommendation: "Not enough evidence",
      roleFit: "Incomplete",
      confidence: "Low",
      summary:
        "Mehdi has not yet completed the assessment battery for this shortlist. No recommendation can be made until the outstanding assessments are finished.",
      strengths: ["Assessment incomplete"],
      pointsToVerify: ["Completion required before recommendation"],
      interviewFocus: "Not ready for client recommendation.",
    },
  ],
};
