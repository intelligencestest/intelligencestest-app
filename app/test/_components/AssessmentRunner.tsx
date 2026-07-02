"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { UI_STRINGS, Locale } from "@/lib/i18n/runner-strings";
import {
  assessmentName as i18nAssessmentName,
  assessmentShort as i18nAssessmentShort,
  categoryLabel as i18nCategoryLabel,
} from "@/lib/i18n/assessment-terms";

type Phase = "validating" | "registering" | "ready" | "testing" | "submitting" | "completed" | "error";

interface CandidateInfo {
  id: string;
  full_name: string;
  email: string;
  project_id: string;
  company_id: string;
}

interface ChoiceQuestion {
  id: number;
  text: string;
  kind: "choice";
  options: string[];
  groupLabel?: string;
  groupClassName?: string;
}

interface LikertQuestion {
  id: number;
  text: string;
  kind: "likert";
  groupLabel?: string;
  groupClassName?: string;
}

export type RunnerQuestion = ChoiceQuestion | LikertQuestion;

export type EsQuestionMap = Record<number, { text: string; options?: readonly string[] }>;

export interface ScoreResult {
  score: number;
  rawAnswers: unknown;
  completionMetric?: {
    label: string;
    value: string;
    colorClassName?: string;
  };
}

interface AssessmentRunnerProps {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
  assessmentName: string;
  shortName: string;
  categoryLabel: string;
  categoryClassName: string;
  accentColor: string;
  durationSeconds: number;
  questions: RunnerQuestion[];
  questionTypeLabel: string;
  instructions: string[];
  instructionsEs?: string[];
  details?: Array<{ label: string; value: string }>;
  dimensionSummary?: Array<{ label: string; description: string; className: string }>;
  submittingText: string;
  autoAdvanceLikert?: boolean;
  esQuestions?: EsQuestionMap;
  scoreAnswers: (answers: (number | null)[]) => ScoreResult;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function AssessmentRunner({
  searchParams,
  assessmentName,
  shortName,
  categoryLabel,
  categoryClassName,
  accentColor,
  durationSeconds,
  questions,
  questionTypeLabel,
  instructions,
  instructionsEs,
  details,
  dimensionSummary,
  submittingText,
  autoAdvanceLikert = true,
  esQuestions,
  scoreAnswers,
}: AssessmentRunnerProps) {
  const [locale, setLocale] = useState<Locale>("es");
  const [token, setToken] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("validating");
  const [errorMsg, setErrorMsg] = useState("");
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef<(number | null)[]>(Array(questions.length).fill(null));
  const submittedRef = useRef(false);

  const s = UI_STRINGS[locale];

  const localizedQuestions: RunnerQuestion[] =
    locale === "es" && esQuestions
      ? questions.map((q) => {
          const esQ = esQuestions[q.id];
          if (!esQ) return q;
          if (q.kind === "choice" && esQ.options) {
            return { ...q, text: esQ.text, options: [...esQ.options] };
          }
          return { ...q, text: esQ.text };
        })
      : questions;

  useEffect(() => {
    Promise.resolve(searchParams).then((params) => {
      const rawLang = params.lang;
      const resolvedLocale: Locale = rawLang === "en" ? "en" : "es";
      setLocale(resolvedLocale);
      const strings = UI_STRINGS[resolvedLocale];

      const t = params.token ?? null;
      const p = params.project ?? null;

      if (p) {
        setProjectId(p);
        setPhase("registering");
        return;
      }

      setToken(t);
      if (!t) {
        setErrorMsg(strings.noToken);
        setPhase("error");
        return;
      }

      fetch(`/api/test/validate?token=${t}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setErrorMsg(data.error);
            setPhase("error");
          } else {
            setCandidate(data.candidate);
            setPhase("ready");
          }
        })
        .catch(() => {
          setErrorMsg(strings.validateFailed);
          setPhase("error");
        });
    });
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");
    setRegistering(true);

    try {
      const res = await fetch("/api/test/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          project_id: projectId,
          assessment_name: assessmentName,
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setRegError(data.error ?? s.registerError);
      } else {
        setToken(data.token);
        setCandidate({
          id: data.candidate_id,
          full_name: regName,
          email: regEmail,
          project_id: projectId!,
          company_id: data.company_id,
        });
        setPhase("ready");
      }
    } catch {
      setRegError(s.networkError);
    }

    setRegistering(false);
  }

  function startTest() {
    setPhase("testing");
    timerRef.current = setInterval(() => {
      setSecondsLeft((seconds) => {
        if (seconds <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitAnswers(answersRef.current);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  }

  function selectAnswer(value: number) {
    const next = [...answersRef.current];
    next[current] = value;
    answersRef.current = next;
    setAnswers(next);

    if (localizedQuestions[current].kind === "likert" && autoAdvanceLikert && current < localizedQuestions.length - 1) {
      setTimeout(() => {
        setCurrent((c) => (c === current ? c + 1 : c));
      }, 250);
    }
  }

  function navigate(dir: 1 | -1) {
    setCurrent((c) => Math.max(0, Math.min(localizedQuestions.length - 1, c + dir)));
  }

  async function submitAnswers(finalAnswers: (number | null)[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("submitting");

    const scored = scoreAnswers(finalAnswers);
    setResult(scored);

    if (token) {
      await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          assessment_name: assessmentName,
          score: scored.score,
          raw_answers: scored.rawAnswers,
        }),
      });
    }

    setPhase("completed");
  }

  const answered = answers.filter((answer) => answer !== null).length;
  const progress = ((current + 1) / localizedQuestions.length) * 100;
  const timeWarning = secondsLeft < 180;
  const question = localizedQuestions[current];

  const rawStats = details ?? [
    { label: "Questions", value: `${localizedQuestions.length}` },
    { label: "Time Limit", value: `${Math.round(durationSeconds / 60)} min` },
    { label: "Question Type", value: questionTypeLabel },
  ];
  const stats = rawStats.map(({ label, value }) => {
    const lc = label.toLowerCase();
    return {
      label:
        lc === "questions" ? s.questions :
        lc === "time limit" ? s.timeLimit :
        lc === "question type" ? s.questionType :
        label,
      value:
        value === "Multiple Choice" ? s.multipleChoice :
        value === "Likert Scale" ? s.likertScale :
        value,
    };
  });

  const activeInstructions = locale === "es" && instructionsEs ? instructionsEs : instructions;
  const likertLabels = [...s.likert];
  // The API keeps the English name as its key; only the display localizes.
  const displayName = i18nAssessmentName(assessmentName, locale);
  const displayShort = i18nAssessmentShort(assessmentName, shortName, locale);
  const displayCategory = i18nCategoryLabel(categoryLabel, locale);

  if (phase === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-slate-400">{s.validating}</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[#1E2240] bg-[#0D1020] p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">{s.errorHeading}</h2>
          <p className="mb-6 text-slate-400">{errorMsg}</p>
          <Link
            href="/assessments"
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-[#2d3a70] hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m7-7-7 7 7 7" />
            </svg>
            {locale === "es" ? "Volver a la biblioteca" : "Back to library"}
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "registering") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-[#1E2240] bg-[#0D1020] p-8">
          <div className="mb-8 text-center">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${categoryClassName}`}>
              {displayCategory}
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">{displayName}</h1>
            <p className="text-sm text-slate-400">{s.registerHeading}</p>
          </div>

          {regError && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              {regError}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">{s.nameLabel}</label>
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">{s.emailLabel}</label>
              <input
                required
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {registering ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                  {s.settingUp}
                </>
              ) : s.continueButton}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-xl border border-[#1E2240] bg-[#0D1020] p-8">
          <div className="mb-6 text-center">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${categoryClassName}`}>
              {displayCategory}
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white">{displayName}</h1>
            <p className="text-slate-400">
              {s.welcomePrefix}<span className="font-medium text-white">{candidate?.full_name}</span>
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-[#1E2240] p-4 text-center">
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="mt-1 text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          {dimensionSummary && (
            <div className="mb-6 rounded-lg bg-[#1E2240] p-4">
              <p className="mb-3 text-sm font-medium text-white">{s.thisMeasures}</p>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                {dimensionSummary.map((dimension) => (
                  <div key={dimension.label} className="flex items-start gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${dimension.className}`}>{dimension.label}</span>
                    <span className="text-slate-400">{dimension.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 space-y-2 text-sm text-slate-300">
            {activeInstructions.map((instruction, i) => (
              <p key={i}>- {instruction}</p>
            ))}
          </div>

          <button
            onClick={startTest}
            className="w-full cursor-pointer rounded-lg py-3 font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1D4ED8" }}
          >
            {s.beginButton}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-slate-400">{submittingText}</p>
        </div>
      </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07080F] p-6">
        <div className="w-full max-w-md rounded-lg border border-[#1E2240] bg-[#0D1020] p-8 text-center shadow-2xl shadow-black/30">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1E2240] bg-[#07080F] px-3 py-1 text-xs font-medium text-[#9BB8FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Intelligences Test
          </div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10">
            <svg className="h-8 w-8 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-white">{s.submittedTitle}</h1>
          <p className="mb-2 leading-relaxed text-slate-300">{s.submittedMessage}</p>
          <p className="text-sm leading-relaxed text-slate-500">{s.submittedSub}</p>
          {result?.completionMetric && (
            <div className="mt-6 rounded-lg border border-[#1E2240] bg-[#07080F] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{result.completionMetric.label}</p>
              <p className={`mt-1 text-sm font-semibold ${result.completionMetric.colorClassName ?? "text-white"}`}>
                {result.completionMetric.value}
              </p>
            </div>
          )}
          <div className="mt-6 rounded-lg border border-[#1E2240] bg-[#07080F] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{s.status}</p>
            <p className="mt-1 text-sm font-medium text-emerald-300">{s.submittedSecurely}</p>
          </div>
          <p className="mt-6 text-xs text-slate-600">{s.closeWindow}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b border-[#1E2240] bg-[#0D1020] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">{displayShort}</span>
          <span className="text-xs text-slate-400">{candidate?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{s.answeredOf(answered, localizedQuestions.length)}</span>
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${timeWarning ? "bg-red-500/10 text-red-400" : "bg-[#1E2240] text-white"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-[#1E2240]">
        <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {s.questionOf(current + 1, localizedQuestions.length)}
            </span>
            {question.groupLabel && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${question.groupClassName ?? "bg-slate-500/10 text-slate-300"}`}>
                {question.groupLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold leading-relaxed text-white">{question.text}</h2>
        </div>

        <div className="mb-8 space-y-3">
          {(question.kind === "likert" ? likertLabels : question.options).map((option, index) => {
            const value = question.kind === "likert" ? index + 1 : index;
            const selected = answers[current] === value;
            return (
              <button
                key={option}
                onClick={() => selectAnswer(value)}
                className="flex w-full cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 text-left transition-colors"
                style={{
                  backgroundColor: selected ? "rgba(29, 78, 216, 0.15)" : "#1E2240",
                  borderColor: selected ? accentColor : "transparent",
                  color: selected ? "#bfdbfe" : "#e2e8f0",
                }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: selected ? accentColor : "#0D1020",
                    color: selected ? "#fff" : "#94a3b8",
                  }}
                >
                  {question.kind === "likert" ? value : String.fromCharCode(65 + index)}
                </span>
                <span className="text-sm leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            disabled={current === 0}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#1E2240] px-4 py-2 text-sm font-medium text-slate-200 transition-opacity disabled:cursor-default disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {s.previous}
          </button>

          {current < localizedQuestions.length - 1 ? (
            <button
              onClick={() => navigate(1)}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {s.next}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(answersRef.current)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {s.submitButton}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[#1E2240] bg-[#0D1020] px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-1.5">
          {localizedQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className="h-7 w-7 cursor-pointer rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: index === current ? accentColor : answers[index] !== null ? "rgba(16,185,129,0.2)" : "#1E2240",
                color: index === current ? "#fff" : answers[index] !== null ? "#6ee7b7" : "#94a3b8",
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
