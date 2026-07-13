"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogoMark } from "@/components/brand/BrandLogo";
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
  instructionsFr?: string[];
  details?: Array<{ label: string; value: string }>;
  dimensionSummary?: Array<{ label: string; description: string; className: string }>;
  submittingText: string;
  autoAdvanceLikert?: boolean;
  esQuestions?: EsQuestionMap;
  frQuestions?: EsQuestionMap;
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
  instructionsFr,
  details,
  dimensionSummary,
  submittingText,
  autoAdvanceLikert = true,
  esQuestions,
  frQuestions,
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

  const localeQuestionMap = locale === "es" ? esQuestions : locale === "fr" ? frQuestions : undefined;
  const localizedQuestions: RunnerQuestion[] = localeQuestionMap
    ? questions.map((q) => {
        const localizedQ = localeQuestionMap[q.id];
        if (!localizedQ) return q;
        if (q.kind === "choice" && localizedQ.options) {
          return { ...q, text: localizedQ.text, options: [...localizedQ.options] };
        }
        return { ...q, text: localizedQ.text };
      })
    : questions;

  useEffect(() => {
    Promise.resolve(searchParams).then((params) => {
      const rawLang = params.lang;
      const resolvedLocale: Locale = rawLang === "en" ? "en" : rawLang === "fr" ? "fr" : "es";
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
            // The candidate record carries the workspace language — it wins
            // over the URL parameter as the source of truth.
            if (data.candidate?.language === "en" || data.candidate?.language === "es" || data.candidate?.language === "fr") {
              setLocale(data.candidate.language);
            }
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

  const activeInstructions =
    locale === "es" && instructionsEs
      ? instructionsEs
      : locale === "fr" && instructionsFr
        ? instructionsFr
        : instructions;
  const likertLabels = [...s.likert];
  // The API keeps the English name as its key; only the display localizes.
  const displayName = i18nAssessmentName(assessmentName, locale);
  const displayShort = i18nAssessmentShort(assessmentName, shortName, locale);
  const displayCategory = i18nCategoryLabel(categoryLabel, locale);

  if (phase === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-[var(--it-muted)]">{s.validating}</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--it-hairline)] bg-white p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg className="h-6 w-6 text-[#b91c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[var(--it-text)]">{s.errorHeading}</h2>
          <p className="mb-6 text-[var(--it-muted)]">{errorMsg}</p>
          <p className="text-xs leading-relaxed text-[var(--it-muted)]">{s.candidateSupport}</p>
        </div>
      </div>
    );
  }

  if (phase === "registering") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--it-hairline)] bg-white p-8 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div className="mb-8 text-center">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${categoryClassName}`} style={{ color: "var(--it-muted)" }}>
              {displayCategory}
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[var(--it-text)]">{displayName}</h1>
            <p className="text-sm text-[var(--it-muted)]">{s.registerHeading}</p>
          </div>

          {regError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-[#b91c1c]">
              {regError}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--it-text)]">{s.nameLabel}</label>
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={locale === "es" ? "María García" : locale === "fr" ? "Camille Dubois" : "Jane Smith"}
                className="w-full rounded-xl border border-[var(--it-hairline)] bg-white px-4 py-3 text-sm text-[var(--it-text)] outline-none transition-colors placeholder:text-[var(--it-faint)] focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--it-text)]">{s.emailLabel}</label>
              <input
                required
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder={locale === "es" ? "maria@ejemplo.com" : locale === "fr" ? "camille@exemple.fr" : "jane@example.com"}
                className="w-full rounded-xl border border-[var(--it-hairline)] bg-white px-4 py-3 text-sm text-[var(--it-text)] outline-none transition-colors placeholder:text-[var(--it-faint)] focus:border-[var(--it-primary)] focus:ring-2 focus:ring-[var(--it-primary)]/25"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--it-primary)] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[var(--it-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)] p-4">
        <div className="w-full max-w-2xl rounded-xl border border-[var(--it-hairline)] bg-white p-8 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div className="mb-6 text-center">
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${categoryClassName}`} style={{ color: "var(--it-muted)" }}>
              {displayCategory}
            </div>
            <h1 className="mb-2 text-3xl font-bold text-[var(--it-text)]">{displayName}</h1>
            <p className="text-[var(--it-muted)]">
              {s.welcomePrefix}<span className="font-medium text-[var(--it-text)]">{candidate?.full_name}</span>
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4 text-center">
                <div className="text-xl font-bold text-[var(--it-text)]">{value}</div>
                <div className="mt-1 text-xs text-[var(--it-muted)]">{label}</div>
              </div>
            ))}
          </div>

          {dimensionSummary && (
            <div className="mb-6 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4">
              <p className="mb-3 text-sm font-medium text-[var(--it-text)]">{s.thisMeasures}</p>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                {dimensionSummary.map((dimension) => (
                  <div key={dimension.label} className="flex items-start gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${dimension.className}`} style={{ color: "var(--it-muted)" }}>{dimension.label}</span>
                    <span className="text-[var(--it-muted)]">{dimension.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8 space-y-2 text-sm text-[var(--it-muted)]">
            {activeInstructions.map((instruction, i) => (
              <p key={i}>- {instruction}</p>
            ))}
          </div>

          <button
            onClick={startTest}
            className="w-full cursor-pointer rounded-lg bg-[var(--it-primary)] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[var(--it-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2"
          >
            {s.beginButton}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-[var(--it-muted)]">{submittingText}</p>
        </div>
      </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
        <div className="w-full max-w-md rounded-lg border border-[var(--it-hairline)] bg-white p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05),0_12px_32px_-16px_rgba(16,24,40,0.12)]">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] px-3 py-1 text-xs font-medium text-[var(--it-link)]">
            <BrandLogoMark className="h-5 w-5 rounded-md" imageClassName="p-0.5" />
            IntelligencesTest
          </div>
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-50">
            <svg className="h-8 w-8 text-[#15803d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mb-3 text-2xl font-semibold text-[var(--it-text)]">{s.submittedTitle}</h1>
          <p className="mb-2 leading-relaxed text-[var(--it-muted)]">{s.submittedMessage}</p>
          <p className="text-sm leading-relaxed text-[var(--it-muted)]">{s.submittedSub}</p>
          {result?.completionMetric && (
            <div className="mt-6 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--it-muted)]">{result.completionMetric.label}</p>
              <p className={`mt-1 text-sm font-semibold ${result.completionMetric.colorClassName ?? "text-[var(--it-text)]"}`}>
                {result.completionMetric.value}
              </p>
            </div>
          )}
          <div className="mt-6 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--it-muted)]">{s.status}</p>
            <p className="mt-1 text-sm font-medium text-[#15803d]">{s.submittedSecurely}</p>
          </div>
          <p className="mt-6 text-xs text-[var(--it-muted)]">{s.closeWindow}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--it-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--it-hairline)] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--it-text)]">{displayShort}</span>
          <span className="text-xs text-[var(--it-muted)]">{candidate?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--it-muted)]">{s.answeredOf(answered, localizedQuestions.length)}</span>
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${timeWarning ? "bg-red-50 text-[#b91c1c]" : "bg-[var(--it-surface-muted)] text-[var(--it-text)]"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-[var(--it-hairline)]">
        <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: accentColor }} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-8">
        <div className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--it-muted)]">
              {s.questionOf(current + 1, localizedQuestions.length)}
            </span>
            {question.groupLabel && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${question.groupClassName ?? "bg-slate-500/10"}`} style={{ color: "var(--it-muted)" }}>
                {question.groupLabel}
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold leading-relaxed text-[var(--it-text)]">{question.text}</h2>
        </div>

        <div className="mb-8 space-y-3">
          {(question.kind === "likert" ? likertLabels : question.options).map((option, index) => {
            const value = question.kind === "likert" ? index + 1 : index;
            const selected = answers[current] === value;
            return (
              <button
                key={option}
                onClick={() => selectAnswer(value)}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 ${selected ? "border-[var(--it-primary)] bg-[var(--it-primary-soft)] text-[var(--it-text)]" : "border-[var(--it-hairline)] bg-white text-[var(--it-text)] hover:border-[#c7d2fe] hover:bg-[#f8faff]"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-[var(--it-primary)] bg-[var(--it-primary)] text-white" : "border-[var(--it-hairline)] bg-[var(--it-surface-muted)] text-[var(--it-muted)]"}`}
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
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--it-hairline)] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:border-[#cbd5e1] hover:bg-[var(--it-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {s.previous}
          </button>

          {current < localizedQuestions.length - 1 ? (
            <button
              onClick={() => navigate(1)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--it-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--it-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2"
            >
              {s.next}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(answersRef.current)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#15803d] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2"
            >
              {s.submitButton}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--it-hairline)] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-1.5">
          {localizedQuestions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-7 w-7 cursor-pointer rounded border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 ${index === current ? "border-[var(--it-primary)] bg-[var(--it-primary)] text-white" : answers[index] !== null ? "border-emerald-200 bg-emerald-50 text-[#15803d] hover:border-emerald-300" : "border-[var(--it-hairline)] bg-white text-[var(--it-muted)] hover:border-[#cbd5e1] hover:bg-[var(--it-surface-muted)]"}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
