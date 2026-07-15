import { NextRequest } from "next/server";
import { buildClientBriefHTML, type ShortlistData } from "@/lib/pdf/client-brief-template";
import { renderHTMLToPDF } from "@/lib/pdf/render-pdf";

// Dev-only preview of the new HTML/Puppeteer client-brief pipeline
// (lib/pdf/client-brief-template.ts + lib/pdf/render-pdf.ts). Static fixture
// data — no database call. Distinct from /api/dev/client-brief-pdf, which
// previews the older static @react-pdf/renderer agency-brief template.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIXTURE: ShortlistData = {
  locale: "en",
  agencyName: "Atlas Talent Partners",
  agencyLogoUrl: undefined,
  roleTitle: "Customer Service Agent",
  shortlistName: "Customer Service Shortlist — July 2026",
  clientName: "Meridian Retail Group",
  date: "July 2026",
  narrative:
    "Of five candidates evaluated for the Customer Service Agent role, two stand out clearly. Sara M. is our strongest recommendation because she shows consistent, strong evidence across communication clarity, customer handling judgment, and structured problem solving. Yassine B. is worth considering as a secondary option — he is reliable and detail-oriented with a fast learning curve, though his verbal confidence under pressure should be confirmed in the interview.",
  cards: [
    {
      name: "Sara M.",
      verdict: "Strongest recommendation for this role",
      isPrimary: true,
      radar: [
        { label: "Communication Clarity", value: 4.6 },
        { label: "Customer Handling", value: 4.4 },
        { label: "Structured Problem Solving", value: 4.2 },
        { label: "Reliability", value: 4.0 },
        { label: "Attention to Detail", value: 3.9 },
      ],
    },
    {
      name: "Yassine B.",
      verdict: "Strong secondary option, confirm in interview",
      isPrimary: false,
      radar: [
        { label: "Communication Clarity", value: 2.6 },
        { label: "Customer Handling", value: 2.8 },
        { label: "Structured Problem Solving", value: 2.4 },
        { label: "Reliability", value: 3.6 },
        { label: "Attention to Detail", value: 3.3 },
      ],
    },
  ],
  interviewPages: [
    {
      name: "Sara M.",
      verdict: "Strongest recommendation for this role",
      isPrimary: true,
      questions: [
        {
          question: "Tell me about a time you handled a very difficult or upset customer. What did you do?",
          verifies: "Confirms composure and consistent judgment when customer volume and pressure increase.",
        },
        {
          question: "Walk me through how you prioritize when you have several customer requests at once.",
          verifies: "Confirms structured, repeatable problem-solving under real workload conditions.",
        },
      ],
    },
    {
      name: "Yassine B.",
      verdict: "Strong secondary option, confirm in interview",
      isPrimary: false,
      questions: [
        {
          question: "Describe a situation where you had to explain something complex to a frustrated customer.",
          verifies: "Confirms his ability to stay clear and composed when handling pressure directly.",
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
