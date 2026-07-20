import { NextRequest } from "next/server";
import { buildClientBriefHTML, type ShortlistData } from "@/lib/pdf/client-brief-template";
import { renderHTMLToPDF } from "@/lib/pdf/render-pdf";

// Dev-only preview of the new HTML/Puppeteer client-brief pipeline
// (lib/pdf/client-brief-template.ts + lib/pdf/render-pdf.ts). Static fixture
// data — no database call. Distinct from /api/dev/client-brief-pdf, which
// previews the older static @react-pdf/renderer agency-brief template.
//
// Fixture intentionally mirrors the editorial handoff's own reference
// sample (Sara M. / Yassine B., Northstar Talent / Atlas Mobility Group)
// so this render can be compared directly against the handoff's preview
// PNGs and acceptance checks.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIXTURE: ShortlistData = {
  locale: "en",
  agencyName: "Northstar Talent",
  agencyTagline: "Executive search partners",
  agencyLogoUrl: undefined,
  accentColor: "#B45309",
  reportFooterText: "Prepared exclusively for Atlas Mobility Group by Northstar Talent.",
  roleTitle: "Head of Regional Operations",
  shortlistName: "Head of Regional Operations Shortlist",
  clientName: "Atlas Mobility Group",
  date: "15 July 2026",
  narrative:
    "Sara M. presents the strongest overall alignment with the role, combining clear stakeholder communication, disciplined analysis and consistent decision quality. Yassine B. also merits interview consideration, with a credible operational profile and a particularly strong response in decision-making scenarios. We recommend interviewing both candidates, using the focused questions that follow to test how each translates these capabilities into the client's operating environment.",
  cards: [
    {
      name: "Sara M.",
      verdict: "strongest overall alignment, recommended for interview",
      isPrimary: true,
      overallScore: 4.6,
      radar: [
        { label: "Communication clarity", value: 4.8 },
        { label: "Analytical reasoning", value: 4.5 },
        { label: "Decision quality", value: 4.6 },
        { label: "Attention to detail", value: 4.4 },
        { label: "Stakeholder judgement", value: 4.7 },
      ],
    },
    {
      name: "Yassine B.",
      verdict: "credible operational alignment, recommended for interview",
      isPrimary: false,
      overallScore: 3.3,
      radar: [
        { label: "Communication clarity", value: 3.4 },
        { label: "Analytical reasoning", value: 3.1 },
        { label: "Decision quality", value: 3.9 },
        { label: "Attention to detail", value: 2.7 },
        { label: "Stakeholder judgement", value: 3.4 },
      ],
    },
  ],
  interviewPages: [
    {
      name: "Sara M.",
      verdict: "Recommended for interview",
      isPrimary: true,
      objectiveTitle: "Translate strong evidence into role-specific examples",
      objectiveCopy:
        "Sara's profile is strongest across communication, judgement and analytical discipline. Use the conversation to understand the scale of her ownership, how she makes trade-offs under pressure, and how she brings senior stakeholders with her.",
      questions: [
        {
          focusLabel: "Stakeholder judgement",
          question: "Tell us about a high-stakes operational decision where senior stakeholders wanted different outcomes. How did you move the group forward?",
          verifies: "Looks for a clear decision frame, explicit trade-offs, evidence of influence without over-reliance on authority, and a result the candidate can explain with precision.",
        },
        {
          focusLabel: "Decision quality",
          question: "Describe a moment when you had to act before all the information was available. What did you decide, and what changed your course?",
          verifies: "Tests whether she distinguishes reversible from irreversible decisions, identifies the critical unknowns, and adjusts thoughtfully when new information appears.",
        },
        {
          focusLabel: "Analytical reasoning",
          question: "Walk us through an operational problem you diagnosed from conflicting data. Which signals mattered, and which did you set aside?",
          verifies: "Looks for a structured hypothesis, disciplined use of evidence, awareness of data quality, and a clear connection between analysis and action.",
        },
        {
          focusLabel: "Communication clarity",
          question: "Give an example of a complex change you had to explain to teams with different levels of context. How did you make it actionable?",
          verifies: "Tests whether she adapts the message without losing substance, creates a clear action path, and confirms understanding across audiences.",
        },
      ],
    },
    {
      name: "Yassine B.",
      verdict: "Recommended for interview",
      isPrimary: false,
      objectiveTitle: "Explore decision ownership and execution discipline",
      objectiveCopy:
        "Yassine brings useful decision-making capability and credible operational instincts. Use the conversation to examine how he structures communication, protects execution quality, and turns sound judgement into reliable delivery across teams.",
      questions: [
        {
          focusLabel: "Decision quality",
          question: "Tell us about an operational decision you made that materially improved an outcome. What alternatives did you reject, and why?",
          verifies: "Looks for clear ownership, a rational comparison of options, and a direct link between the decision, execution choices and measurable result.",
        },
        {
          focusLabel: "Attention to detail",
          question: "Describe a situation where a small operational detail could have created a larger failure. How did you identify and control it?",
          verifies: "Tests whether he uses repeatable controls, identifies dependencies early, and balances precision with speed rather than relying on last-minute checking.",
        },
        {
          focusLabel: "Communication clarity",
          question: "How have you communicated a difficult operational decision to a team that initially disagreed with the direction?",
          verifies: "Looks for a concise rationale, respect for dissenting views, a clear explanation of consequences, and specific steps used to secure execution.",
        },
        {
          focusLabel: "Stakeholder judgement",
          question: "Give an example of a commitment you renegotiated with a senior stakeholder. How did you protect trust while changing the plan?",
          verifies: "Tests whether he raises constraints early, brings evidence to the conversation, proposes credible options, and leaves ownership unambiguous.",
        },
      ],
    },
  ],
};

export async function GET(request: NextRequest) {
  const download = request.nextUrl.searchParams.get("download") === "1";
  const html = buildClientBriefHTML(FIXTURE);
  const pdf = await renderHTMLToPDF(html);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="client-brief-sample.pdf"`,
      "Content-Type": "application/pdf",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
