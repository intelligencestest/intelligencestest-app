"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface Assessment {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number | null;
  question_count: number | null;
  status: string;
}

type Tone = {
  text: string;
  bg: string;
  border: string;
  dot: string;
  iconBg: string;
  iconBorder: string;
};

const categoryTones: Record<string, Tone> = {
  Cognitive: {
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    dot: "bg-blue-400",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/25",
  },
  Personality: {
    text: "text-pink-300",
    bg: "bg-pink-500/10",
    border: "border-pink-500/25",
    dot: "bg-pink-400",
    iconBg: "bg-pink-500/10",
    iconBorder: "border-pink-500/25",
  },
  "Workplace Judgment": {
    text: "text-indigo-300",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/25",
    dot: "bg-indigo-400",
    iconBg: "bg-indigo-500/10",
    iconBorder: "border-indigo-500/25",
  },
  Leadership: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    dot: "bg-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconBorder: "border-emerald-500/25",
  },
  Resilience: {
    text: "text-orange-300",
    bg: "bg-orange-500/10",
    border: "border-orange-500/25",
    dot: "bg-orange-400",
    iconBg: "bg-orange-500/10",
    iconBorder: "border-orange-500/25",
  },
  Communication: {
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/25",
    dot: "bg-cyan-400",
    iconBg: "bg-cyan-500/10",
    iconBorder: "border-cyan-500/25",
  },
  "Work Style": {
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    dot: "bg-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/25",
  },
  Mechanical: {
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    dot: "bg-amber-400",
    iconBg: "bg-amber-500/10",
    iconBorder: "border-amber-500/25",
  },
  Sales: {
    text: "text-green-300",
    bg: "bg-green-500/10",
    border: "border-green-500/25",
    dot: "bg-green-400",
    iconBg: "bg-green-500/10",
    iconBorder: "border-green-500/25",
  },
  "Customer Service": {
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
    dot: "bg-sky-400",
    iconBg: "bg-sky-500/10",
    iconBorder: "border-sky-500/25",
  },
  Teamwork: {
    text: "text-teal-300",
    bg: "bg-teal-500/10",
    border: "border-teal-500/25",
    dot: "bg-teal-400",
    iconBg: "bg-teal-500/10",
    iconBorder: "border-teal-500/25",
  },
  Productivity: {
    text: "text-yellow-300",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/25",
    dot: "bg-yellow-400",
    iconBg: "bg-yellow-500/10",
    iconBorder: "border-yellow-500/25",
  },
  Character: {
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    dot: "bg-violet-400",
    iconBg: "bg-violet-500/10",
    iconBorder: "border-violet-500/25",
  },
};

const fallbackTone: Tone = {
  text: "text-slate-300",
  bg: "bg-slate-500/10",
  border: "border-slate-500/20",
  dot: "bg-slate-500",
  iconBg: "bg-slate-500/10",
  iconBorder: "border-slate-500/20",
};

const preferredOrder = [
  "Critical Thinking Test",
  "Numerical Intelligence Test",
  "Personality Type Test",
  "Situational Judgment Test",
  "Emotional Intelligence Test",
  "Leadership Styles Test",
  "Adversity Quotient (AQ) Test",
  "Attention to Detail Test",
  "Verbal Reasoning Test",
  "Abstract Reasoning Test",
  "Mechanical Reasoning Test",
  "Communication Skills Test",
  "Problem Solving Test",
  "Work Style Test",
  "Sales Aptitude Test",
  "Customer Service Skills Test",
  "Teamwork & Collaboration Test",
  "Time Management Test",
  "Stress Tolerance Test",
  "Integrity & Ethics Test",
  "Decision Making Test",
  "Learning Agility Test",
];

const sampleQuestions: Array<{ match: (name: string) => boolean; text: string; options: string[] }> = [
  {
    match: (name) => name.includes("critical"),
    text: "All analysts review briefs before submitting reports. Maya submitted a report. What can be concluded?",
    options: ["Maya reviewed a brief", "Maya may have reviewed a brief", "All submitted reports are accurate", "No conclusion is possible"],
  },
  {
    match: (name) => name.includes("numerical"),
    text: "Sales increased from 80 to 100 units. What was the percentage increase?",
    options: ["20%", "25%", "30%", "40%"],
  },
  {
    match: (name) => name.includes("personality"),
    text: "I plan my work carefully before moving into execution.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
  {
    match: (name) => name.includes("situational"),
    text: "A stakeholder asks for an unrealistic deadline. What is the strongest response?",
    options: ["Say yes and hope scope changes", "Explain tradeoffs and offer a realistic path", "Reject the request", "Ask someone else to respond"],
  },
  {
    match: (name) => name.includes("emotional"),
    text: "I notice how my mood affects the way I communicate with others.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
  {
    match: (name) => name.includes("leadership"),
    text: "A team is uncertain about direction. What do you do first?",
    options: ["Set a clear future direction", "Coach individuals", "Repair morale", "Invite shared input"],
  },
  {
    match: (name) => name.includes("adversity") || name.includes("aq"),
    text: "When facing a difficult situation, I believe I can influence the outcome.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
  {
    match: (name) => name.includes("attention"),
    text: "Which entry does not match the formatting rule used by the rest of the list?",
    options: ["AX-1042", "AX-1402", "AX-1047", "XA-1042"],
  },
  {
    match: (name) => name.includes("verbal"),
    text: "If all approved invoices are reviewed, and this invoice was not reviewed, what follows?",
    options: ["It was approved", "It was not approved", "It may still be approved", "It was rejected"],
  },
  {
    match: (name) => name.includes("abstract"),
    text: "Which pattern best completes the sequence?",
    options: ["Same shape, darker fill", "Rotated shape, same fill", "New shape, lighter fill", "Mirrored shape, darker fill"],
  },
  {
    match: (name) => name.includes("mechanical"),
    text: "If gear A turns clockwise and touches gear B, which direction does gear B turn?",
    options: ["Clockwise", "Counterclockwise", "It does not move", "Direction cannot be known"],
  },
  {
    match: (name) => name.includes("communication"),
    text: "A client misunderstood your update. What is the best next step?",
    options: ["Repeat the same message", "Clarify the key point and next action", "Wait for them to calm down", "Send every detail"],
  },
  {
    match: (name) => name.includes("problem"),
    text: "You have limited data and a deadline today. What is the best response?",
    options: ["Wait for perfect data", "Use evidence, state assumptions, and flag risk", "Guess quickly", "Ask someone else to decide"],
  },
  {
    match: (name) => name.includes("work style"),
    text: "I prefer clear priorities and structured execution.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
  {
    match: (name) => name.includes("sales aptitude") || name.includes("sales"),
    text: "A prospect says 'Your price is too high.' What is your best initial response?",
    options: ["Offer a discount immediately", "Ask 'Compared to what?' and explore the value the investment generates", "Explain your cost structure in detail", "Tell them the price is non-negotiable"],
  },
  {
    match: (name) => name.includes("customer service"),
    text: "A customer is upset about a delayed order. What is your first action?",
    options: ["Explain the reasons for the delay immediately", "Acknowledge their frustration and apologise before asking for details", "Transfer to a manager", "Look up the order number in silence"],
  },
  {
    match: (name) => name.includes("teamwork") || name.includes("collaboration"),
    text: "I step in to help a colleague who is struggling, even when it is not my formal responsibility.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
  {
    match: (name) => name.includes("time management"),
    text: "You have four tasks due today. Two are urgent and important. What do you tackle first?",
    options: ["The easiest task to build momentum", "The two that are both urgent and important", "Work through the list in order", "Delegate the hardest task"],
  },
  {
    match: (name) => name.includes("stress tolerance"),
    text: "I remain calm and make sound decisions even when under significant time pressure.",
    options: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
  {
    match: (name) => name.includes("integrity") || name.includes("ethics"),
    text: "You discover an error in a report already shared with leadership. What do you do?",
    options: ["Hope no one notices and correct it quietly next time", "Inform the relevant parties immediately and correct the error", "Wait to see if anyone raises it first", "Ask a colleague to flag it anonymously"],
  },
  {
    match: (name) => name.includes("decision making") || name.includes("decision-making"),
    text: "You must decide between two proposals with limited time. What is your first step?",
    options: ["Choose the lower-cost option immediately", "Define clear evaluation criteria before comparing", "Go with the more recognisable brand", "Ask your manager to decide"],
  },
  {
    match: (name) => name.includes("learning agility"),
    text: "A colleague suggests a different approach to a task you have always done the same way. What do you do?",
    options: ["Dismiss it — your method is proven", "Evaluate it on its merits and pilot it if promising", "Adopt it only if instructed to by a manager", "Ignore it — experience outweighs novelty"],
  },
];

function isActive(assessment: Assessment) {
  return assessment.status === "active";
}

function slugForAssessment(name: string) {
  const normalized = name.toLowerCase();
  const mapped: Array<[RegExp, string]> = [
    [/critical.*thinking/, "critical-thinking"],
    [/numerical/, "numerical-intelligence"],
    [/personality.*type/, "personality-type"],
    [/situational.*judgment/, "situational-judgment"],
    [/emotional/, "emotional-intelligence"],
    [/leadership/, "leadership-styles"],
    [/adversity|aq/, "aq"],
    [/attention.*detail/, "attention-detail"],
    [/verbal.*reasoning/, "verbal-reasoning"],
    [/abstract.*reasoning/, "abstract-reasoning"],
    [/mechanical.*reasoning/, "mechanical-reasoning"],
    [/communication.*skills/, "communication-skills"],
    [/problem.*solving/, "problem-solving"],
    [/work.*style/, "work-style"],
    [/sales.*aptitude/, "sales-aptitude"],
    [/customer.*service/, "customer-service-skills"],
    [/teamwork|collaboration/, "teamwork-collaboration"],
    [/time.*management/, "time-management"],
    [/stress.*tolerance/, "stress-tolerance"],
    [/integrity.*ethics/, "integrity-ethics"],
    [/decision.*making/, "decision-making"],
    [/learning.*agility/, "learning-agility"],
  ];
  return mapped.find(([pattern]) => pattern.test(normalized))?.[1] ?? normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getTone(category: string) {
  return categoryTones[category] ?? fallbackTone;
}

function getSortIndex(name: string) {
  const index = preferredOrder.findIndex((item) => item.toLowerCase() === name.toLowerCase());
  return index === -1 ? preferredOrder.length : index;
}

function getSample(assessment: Assessment) {
  const normalized = assessment.name.toLowerCase();
  return (
    sampleQuestions.find((sample) => sample.match(normalized)) ?? {
      text: "A sample question preview will appear here once the question bank is published.",
      options: ["Option A", "Option B", "Option C", "Option D"],
    }
  );
}

function groupAssessments(assessments: Assessment[]) {
  const groups = new Map<string, Assessment[]>();
  assessments.forEach((assessment) => {
    const category = assessment.category || "Other";
    groups.set(category, [...(groups.get(category) ?? []), assessment]);
  });

  return [...groups.entries()]
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => {
        if (isActive(a) !== isActive(b)) return isActive(a) ? -1 : 1;
        return getSortIndex(a.name) - getSortIndex(b.name) || a.name.localeCompare(b.name);
      }),
    }))
    .sort((a, b) => {
      const aActive = a.items.filter(isActive).length;
      const bActive = b.items.filter(isActive).length;
      if (aActive !== bActive) return bActive - aActive;
      return a.category.localeCompare(b.category);
    });
}

export default function AssessmentsClient({ assessments }: { assessments: Assessment[] }) {
  const [preview, setPreview] = useState<Assessment | null>(null);
  const grouped = useMemo(() => groupAssessments(assessments), [assessments]);
  const activeCount = assessments.filter(isActive).length;
  const totalMinutes = assessments.filter(isActive).reduce((sum, assessment) => sum + (assessment.duration_minutes ?? 0), 0);
  const sample = preview ? getSample(preview) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#0D1020] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
            Assessment library
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Assessment Library</h1>
          <p className="mt-1 text-sm text-slate-500">
            {activeCount} active tests across {grouped.length} categories
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#1E2240] bg-[#0D1020] px-4 py-3">
            <p className="text-xs text-slate-500">Available now</p>
            <p className="mt-1 text-sm font-semibold text-white">{activeCount} tests</p>
          </div>
          <div className="rounded-xl border border-[#1E2240] bg-[#0D1020] px-4 py-3">
            <p className="text-xs text-slate-500">Total battery</p>
            <p className="mt-1 text-sm font-semibold text-white">{totalMinutes} min</p>
          </div>
        </div>
      </div>

      {grouped.map((group) => {
        const tone = getTone(group.category);
        const activeInCategory = group.items.filter(isActive).length;
        return (
          <section key={group.category} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className={`${tone.bg} ${tone.border} inline-flex items-center gap-2 rounded-full border px-3 py-1.5`}>
                <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                <h2 className={`text-sm font-semibold ${tone.text}`}>{group.category}</h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {activeInCategory} active / {group.items.length} total
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((assessment, index) => {
                const active = isActive(assessment);
                const route = slugForAssessment(assessment.name);
                return (
                  <div
                    key={assessment.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPreview(assessment)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") setPreview(assessment);
                    }}
                    className={`group flex min-h-[320px] cursor-pointer flex-col rounded-xl border p-5 transition-colors animate-fade-up ${
                      active
                        ? "premium-card premium-card-hover"
                        : "border-[#1E2240] bg-[#0D1020]/68 hover:border-slate-600/40"
                    }`}
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className={`${active ? tone.bg : "bg-slate-500/10"} ${active ? tone.border : "border-slate-500/20"} inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? tone.dot : "bg-slate-500"}`} />
                        <span className={`text-xs font-medium ${active ? tone.text : "text-slate-400"}`}>{assessment.category}</span>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        active
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-slate-500"}`} />
                        {active ? "Active" : "Coming Soon"}
                      </span>
                    </div>

                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${active ? `${tone.iconBorder} ${tone.iconBg} ${tone.text}` : "border-[#1E2240] bg-[#07080F] text-slate-500"}`}>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 4.5h6m-8.25 3h10.5m-12 3h13.5M7.5 21h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 16.5 7.5h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 7.5 21Z" />
                      </svg>
                    </div>

                    <h3 className={`mb-2 text-base font-semibold ${active ? "text-white" : "text-slate-300"}`}>{assessment.name}</h3>
                    <p className={`flex-1 text-sm leading-relaxed ${active ? "text-slate-500" : "text-slate-600"}`}>
                      {assessment.description ?? "Assessment details are being prepared."}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                        <p className="text-xs text-slate-600">Duration</p>
                        <p className="mt-1 text-sm font-semibold text-white">{assessment.duration_minutes ?? "-"} min</p>
                      </div>
                      <div className="rounded-xl border border-[#1E2240] bg-[#07080F]/55 p-3">
                        <p className="text-xs text-slate-600">Questions</p>
                        <p className="mt-1 text-sm font-semibold text-white">{assessment.question_count ?? "-"}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#1E2240] pt-4">
                      {active ? (
                        <Link
                          href={`/test/${route}`}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/25 transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/50 focus:ring-offset-2 focus:ring-offset-[#0D1020]"
                        >
                          Start
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="inline-flex w-full items-center justify-center rounded-xl border border-slate-500/20 bg-slate-500/10 px-4 py-2.5 text-sm font-semibold text-slate-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {preview && sample && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setPreview(null)}>
          <div
            className="w-full max-w-2xl rounded-2xl border border-[#1E2240] bg-[#0D1020] p-6 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#07080F] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
                  {preview.category}
                </div>
                <h3 className="text-xl font-semibold text-white">{preview.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{preview.description ?? "Assessment details are being prepared."}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-[#1E2240] hover:text-white"
                aria-label="Close preview"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-4">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="mt-1 text-lg font-semibold text-white">{preview.duration_minutes ?? "-"} min</p>
              </div>
              <div className="rounded-xl border border-[#1E2240] bg-[#07080F] p-4">
                <p className="text-xs text-slate-500">Questions</p>
                <p className="mt-1 text-lg font-semibold text-white">{preview.question_count ?? "-"}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1E2240] bg-[#07080F] p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Sample question</p>
              <p className="text-sm font-medium leading-relaxed text-white">{sample.text}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {sample.options.map((option, index) => (
                  <div key={option} className="rounded-lg border border-[#1E2240] bg-[#0D1020] px-3 py-2 text-sm text-slate-400">
                    <span className="mr-2 font-semibold text-slate-500">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="cursor-pointer rounded-xl border border-[#1E2240] px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Close
              </button>
              {isActive(preview) ? (
                <Link
                  href={`/projects/new?assessment=${preview.id}`}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                >
                  Add to Project
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-xl border border-slate-500/20 bg-slate-500/10 px-4 py-2.5 text-sm font-semibold text-slate-400">
                  Coming Soon
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
