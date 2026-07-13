"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogoMark } from "@/components/brand/BrandLogo";
import { CT_QUESTIONS, CT_DURATION_SECONDS, scoreResults } from "@/lib/questions/critical-thinking";
import { CT_QUESTIONS_ES } from "@/lib/questions/es/critical-thinking";
import { CT_QUESTIONS_FR } from "@/lib/questions/fr/critical-thinking";
import { UI_STRINGS, Locale } from "@/lib/i18n/runner-strings";

type Phase = "validating" | "registering" | "ready" | "testing" | "submitting" | "completed" | "battery-continue" | "error";

interface CandidateInfo {
  id: string;
  full_name: string;
  email: string;
  project_id: string;
  company_id: string;
}

export default function CriticalThinkingTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  const [locale, setLocale] = useState<Locale>("es");
  const [token, setToken] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("validating");
  const [errorMsg, setErrorMsg] = useState("");
  const [candidate, setCandidate] = useState<CandidateInfo | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(CT_QUESTIONS.length).fill(null));
  const [secondsLeft, setSecondsLeft] = useState(CT_DURATION_SECONDS);
  const [result, setResult] = useState<ReturnType<typeof scoreResults> | null>(null);
  const [nextAssessment, setNextAssessment] = useState<{ route: string; remaining: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef<(number | null)[]>(Array(CT_QUESTIONS.length).fill(null));
  const submittedRef = useRef(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const s = UI_STRINGS[locale];

  useEffect(() => {
    searchParams.then((params) => {
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
          assessment_name: "Critical Thinking Test",
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
      setSecondsLeft((sec) => {
        if (sec <= 1) {
          clearInterval(timerRef.current!);
          submitAnswers(answersRef.current);
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
  }

  function selectAnswer(optionIndex: number) {
    const next = [...answersRef.current];
    next[current] = optionIndex;
    answersRef.current = next;
    setAnswers(next);
  }

  function navigate(dir: 1 | -1) {
    setCurrent((c) => Math.max(0, Math.min(CT_QUESTIONS.length - 1, c + dir)));
  }

  async function submitAnswers(finalAnswers: (number | null)[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("submitting");
    const scored = scoreResults(finalAnswers);
    setResult(scored);

    if (token) {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          assessment_name: "Critical Thinking Test",
          score: scored.percentage,
          raw_answers: finalAnswers,
        }),
      });
      const data = await res.json().catch(() => null);
      if (data?.next_assessment?.route && data.remaining_assessment_count > 0) {
        setNextAssessment({ route: data.next_assessment.route, remaining: data.remaining_assessment_count });
        setPhase("battery-continue");
        return;
      }
    }

    setPhase("completed");
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${m}:${remainder.toString().padStart(2, "0")}`;
  };

  const answered = answers.filter((a) => a !== null).length;
  const progress = ((current + 1) / CT_QUESTIONS.length) * 100;
  const timeWarning = secondsLeft < 300;

  const stats = [
    { label: s.questions, value: "40" },
    { label: s.timeLimit, value: "25 min" },
    { label: s.questionType, value: s.multipleChoice },
  ];

  const activeInstructions = locale === "es"
    ? [
        s.instructions.readCarefully,
        s.instructions.navigateFreely,
        s.instructions.unanswered,
        s.instructions.autoSubmit,
        s.instructions.stableConnection,
      ]
    : [
        s.instructions.readCarefully,
        s.instructions.navigateFreely,
        s.instructions.unanswered,
        s.instructions.autoSubmit,
        s.instructions.stableConnection,
      ];

  const esQ = CT_QUESTIONS_ES[current + 1];
  const frQ = CT_QUESTIONS_FR[current + 1];
  const localizedQ = locale === "es" ? esQ : locale === "fr" ? frQ : undefined;
  const question = localizedQ
    ? { ...CT_QUESTIONS[current], text: localizedQ.text, options: [...localizedQ.options] }
    : CT_QUESTIONS[current];

  if (phase === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--it-muted)]">{s.validating}</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--it-hairline)] bg-white p-8 text-center shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#b91c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--it-text)] mb-2">{s.errorHeading}</h2>
          <p className="text-[var(--it-muted)]">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (phase === "registering") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)] p-4">
        <div className="w-full max-w-md rounded-xl border border-[var(--it-hairline)] bg-white p-8 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[#1d4ed8]">
              {locale === "es" ? "Evaluación Cognitiva" : locale === "fr" ? "Évaluation Cognitive" : "Cognitive Assessment"}
            </div>
            <h1 className="text-2xl font-bold text-[var(--it-text)] mb-2">{locale === "es" ? "Prueba de Pensamiento Crítico" : locale === "fr" ? "Test de Pensée Critique" : "Critical Thinking Test"}</h1>
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
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[#1d4ed8]">
              {locale === "es" ? "Evaluación Cognitiva" : locale === "fr" ? "Évaluation Cognitive" : "Cognitive Assessment"}
            </div>
            <h1 className="text-3xl font-bold text-[var(--it-text)] mb-2">{locale === "es" ? "Prueba de Pensamiento Crítico" : locale === "fr" ? "Test de Pensée Critique" : "Critical Thinking Test"}</h1>
            <p className="text-[var(--it-muted)]">{s.welcomePrefix}<span className="font-medium text-[var(--it-text)]">{candidate?.full_name}</span></p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {stats.map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4 text-center">
                <div className="text-xl font-bold text-[var(--it-text)]">{value}</div>
                <div className="mt-1 text-xs text-[var(--it-muted)]">{label}</div>
              </div>
            ))}
          </div>

          <div className="mb-8 space-y-3 text-sm text-[var(--it-muted)]">
            {activeInstructions.map((line, i) => (
              <p key={i}>- {line}</p>
            ))}
          </div>

          <button
            onClick={startTest}
            className="w-full cursor-pointer rounded-lg bg-[var(--it-primary)] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[var(--it-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2"
          >
            {s.beginTest}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--it-bg)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--it-muted)]">{s.scoringAnswers}</p>
        </div>
      </div>
    );
  }

  if (phase === "battery-continue" && nextAssessment) {
    const continueUrl = `/test/${nextAssessment.route}?token=${token}&lang=${locale}`;
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
          <h1 className="mb-3 text-2xl font-semibold text-[var(--it-text)]">{s.nextAssessmentTitle}</h1>
          <p className="mb-6 leading-relaxed text-[var(--it-muted)]">{s.nextAssessmentBody(nextAssessment.remaining)}</p>
          <a
            href={continueUrl}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--it-primary)] py-3 font-semibold text-white shadow-sm transition-colors hover:bg-[var(--it-primary-hover)]"
          >
            {s.continueToNextButton}
          </a>
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
          <div className="mt-8 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4">
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
          <span className="text-sm font-medium text-[var(--it-text)]">{locale === "es" ? "Pensamiento Crítico" : locale === "fr" ? "Pensée Critique" : "Critical Thinking Test"}</span>
          <span className="text-xs text-[var(--it-muted)]">{candidate?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--it-muted)]">{s.answeredOf(answered, CT_QUESTIONS.length)}</span>
          <div className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${timeWarning ? "bg-red-50 text-[#b91c1c]" : "bg-[var(--it-surface-muted)] text-[var(--it-text)]"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="h-1 w-full bg-[var(--it-hairline)]">
        <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "#4f46e5" }} />
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--it-muted)]">
            {s.questionOf(current + 1, CT_QUESTIONS.length)}
          </span>
          <h2 className="text-lg font-semibold text-[var(--it-text)] mt-2 leading-relaxed">{question.text}</h2>
        </div>

        <div className="space-y-3 mb-8">
          {question.options.map((option, i) => {
            const selected = answers[current] === i;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full cursor-pointer rounded-lg border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 ${selected ? "border-[var(--it-primary)] bg-[var(--it-primary-soft)] text-[var(--it-text)]" : "border-[var(--it-hairline)] bg-white text-[var(--it-text)] hover:border-[#c7d2fe] hover:bg-[#f8faff]"}`}
              >
                <span className={`mr-3 font-semibold ${selected ? "text-[var(--it-link)]" : "text-[var(--it-muted)]"}`}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            disabled={current === 0}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--it-hairline)] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:border-[#cbd5e1] hover:bg-[var(--it-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {s.previous}
          </button>

          {current < CT_QUESTIONS.length - 1 ? (
            <button
              onClick={() => navigate(1)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--it-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--it-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2"
            >
              {s.next}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(answersRef.current)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#15803d] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803d] focus-visible:ring-offset-2"
            >
              {s.submitTest}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--it-hairline)] bg-white px-6 py-4">
        <div className="flex flex-wrap gap-1.5 max-w-3xl mx-auto">
          {CT_QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-7 w-7 cursor-pointer rounded border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 ${i === current ? "border-[var(--it-primary)] bg-[var(--it-primary)] text-white" : answers[i] !== null ? "border-emerald-200 bg-emerald-50 text-[#15803d] hover:border-emerald-300" : "border-[var(--it-hairline)] bg-white text-[var(--it-muted)] hover:border-[#cbd5e1] hover:bg-[var(--it-surface-muted)]"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
