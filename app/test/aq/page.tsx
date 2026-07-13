"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogoMark } from "@/components/brand/BrandLogo";
import { AQ_QUESTIONS, AQ_DURATION_SECONDS, scoreAQ } from "@/lib/questions/aq";
import { AQ_QUESTIONS_ES } from "@/lib/questions/es/aq";
import { AQ_QUESTIONS_FR } from "@/lib/questions/fr/aq";
import { UI_STRINGS, Locale } from "@/lib/i18n/runner-strings";

type Phase = "validating" | "registering" | "ready" | "testing" | "submitting" | "completed" | "battery-continue" | "error";

interface CandidateInfo {
  id: string;
  full_name: string;
  email: string;
  project_id: string;
  company_id: string;
}

const CORE_EN = [
  { letter: "C", name: "Control", desc: "How much control you perceive" },
  { letter: "O", name: "Ownership", desc: "How accountable you feel" },
  { letter: "R", name: "Reach", desc: "How far adversity spreads" },
  { letter: "E", name: "Endurance", desc: "How long adversity lasts" },
];

const CORE_ES = [
  { letter: "C", name: "Control", desc: "Cuánto control percibe ante la adversidad" },
  { letter: "O", name: "Propiedad", desc: "Cuánta responsabilidad asume" },
  { letter: "R", name: "Alcance", desc: "Hasta dónde afecta la adversidad" },
  { letter: "E", name: "Resistencia", desc: "Cuánto tiempo dura la adversidad" },
];

const DIMENSION_LABEL_ES: Record<string, string> = {
  C: "Control",
  O: "Propiedad",
  R: "Alcance",
  E: "Resistencia",
};

const CORE_FR = [
  { letter: "C", name: "Contrôle", desc: "Le contrôle perçu face à l'adversité" },
  { letter: "O", name: "Appropriation", desc: "Le niveau de responsabilité assumé" },
  { letter: "R", name: "Portée", desc: "L'étendue de l'impact de l'adversité" },
  { letter: "E", name: "Endurance", desc: "La durée de l'adversité" },
];

const DIMENSION_LABEL_FR: Record<string, string> = {
  C: "Contrôle",
  O: "Appropriation",
  R: "Portée",
  E: "Endurance",
};

export default function AQTest({
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
  const [answers, setAnswers] = useState<(number | null)[]>(Array(AQ_QUESTIONS.length).fill(null));
  const [secondsLeft, setSecondsLeft] = useState(AQ_DURATION_SECONDS);
  const [result, setResult] = useState<ReturnType<typeof scoreAQ> | null>(null);
  const [nextAssessment, setNextAssessment] = useState<{ route: string; remaining: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef<(number | null)[]>(Array(AQ_QUESTIONS.length).fill(null));
  const submittedRef = useRef(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const s = UI_STRINGS[locale];
  const coreDimensions = locale === "es" ? CORE_ES : locale === "fr" ? CORE_FR : CORE_EN;
  const likertLabels = [...s.likert];

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
          assessment_name: "Adversity Quotient (AQ) Test",
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

  function selectAnswer(value: number) {
    const next = [...answersRef.current];
    next[current] = value;
    answersRef.current = next;
    setAnswers(next);
    if (current < AQ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 300);
    }
  }

  async function submitAnswers(finalAnswers: (number | null)[]) {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("submitting");
    const scored = scoreAQ(finalAnswers);
    setResult(scored);

    if (token) {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          assessment_name: "Adversity Quotient (AQ) Test",
          score: scored.total,
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
  const progress = ((current + 1) / AQ_QUESTIONS.length) * 100;
  const timeWarning = secondsLeft < 180;

  const esQAQ = AQ_QUESTIONS_ES[current + 1];
  const frQAQ = AQ_QUESTIONS_FR[current + 1];
  const localizedQAQ = locale === "es" ? esQAQ : locale === "fr" ? frQAQ : undefined;
  const question = localizedQAQ
    ? { ...AQ_QUESTIONS[current], text: localizedQAQ.text }
    : AQ_QUESTIONS[current];

  const dimensionLabel =
    locale === "es"
      ? (DIMENSION_LABEL_ES[question.dimension] ?? question.dimension)
      : locale === "fr"
      ? (DIMENSION_LABEL_FR[question.dimension] ?? question.dimension)
      : (question.dimension === "C" ? "Control" :
         question.dimension === "O" ? "Ownership" :
         question.dimension === "R" ? "Reach" : "Endurance");

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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-[#6d28d9]">
              {locale === "es" ? "Evaluación de Resiliencia" : locale === "fr" ? "Évaluation de Résilience" : "Resilience Assessment"}
            </div>
            <h1 className="text-2xl font-bold text-[var(--it-text)] mb-2">{locale === "es" ? "Prueba de Cociente de Adversidad (AQ)" : locale === "fr" ? "Test de Quotient d'Adversité (AQ)" : "Adversity Quotient (AQ) Test"}</h1>
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-[#6d28d9]">
              {locale === "es" ? "Evaluación de Resiliencia" : locale === "fr" ? "Évaluation de Résilience" : "Resilience Assessment"}
            </div>
            <h1 className="text-3xl font-bold text-[var(--it-text)] mb-2">{locale === "es" ? "Prueba de Cociente de Adversidad (AQ)" : locale === "fr" ? "Test de Quotient d'Adversité (AQ)" : "Adversity Quotient (AQ) Test"}</h1>
            <p className="text-[var(--it-muted)]">{s.welcomePrefix}<span className="font-medium text-[var(--it-text)]">{candidate?.full_name}</span></p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: s.questions, value: "40" },
              { label: s.timeLimit, value: "20 min" },
              { label: s.questionType, value: s.likertScale },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4 text-center">
                <div className="text-xl font-bold text-[var(--it-text)]">{value}</div>
                <div className="mt-1 text-xs text-[var(--it-muted)]">{label}</div>
              </div>
            ))}
          </div>

          <div className="mb-6 rounded-lg border border-[var(--it-hairline)] bg-[var(--it-surface-muted)] p-4">
            <p className="mb-3 text-sm font-medium text-[var(--it-text)]">
              {locale === "es" ? "Esta prueba mide 4 dimensiones CORE:" : locale === "fr" ? "Ce test mesure 4 dimensions CORE :" : "This test measures 4 CORE dimensions:"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {coreDimensions.map(({ letter, name, desc }) => (
                <div key={letter} className="flex items-start gap-2">
                  <span className="w-4 font-bold text-[#1d4ed8]">{letter}</span>
                  <div>
                    <span className="font-medium text-[var(--it-text)]">{name}</span>
                    <span className="text-[var(--it-muted)]"> - {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8 space-y-2 text-sm text-[var(--it-muted)]">
            {locale === "es" ? (
              <>
                <p>- {s.instructions.selectRate}</p>
                <p>- {s.instructions.noRightWrong}</p>
                <p>- {s.instructions.autoSubmit}</p>
              </>
            ) : (
              <>
                <p>- {s.instructions.selectRate}</p>
                <p>- {s.instructions.noRightWrong}</p>
                <p>- {s.instructions.autoSubmit}</p>
              </>
            )}
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
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--it-muted)]">
            {locale === "es" ? "Calculando su puntuación AQ..." : locale === "fr" ? "Calcul de votre score AQ en cours..." : "Calculating your AQ score..."}
          </p>
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
          <span className="text-sm font-medium text-[var(--it-text)]">{locale === "es" ? "Evaluación AQ" : locale === "fr" ? "Évaluation AQ" : "AQ Assessment"}</span>
          <span className="text-xs text-[var(--it-muted)]">{candidate?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--it-muted)]">{s.answeredOf(answered, AQ_QUESTIONS.length)}</span>
          <div
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-sm font-bold ${timeWarning ? "bg-red-50 text-[#b91c1c]" : "bg-[var(--it-surface-muted)] text-[var(--it-text)]"}`}
          >
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

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--it-muted)]">
              {s.questionOf(current + 1, AQ_QUESTIONS.length)}
            </span>
            <span className="rounded-full border px-2 py-0.5 text-xs font-medium" style={{
              backgroundColor: question.dimension === "C" ? "#eff6ff" :
                question.dimension === "O" ? "#ecfdf5" :
                question.dimension === "R" ? "#fffbeb" : "#f5f3ff",
              borderColor: question.dimension === "C" ? "#bfdbfe" :
                question.dimension === "O" ? "#a7f3d0" :
                question.dimension === "R" ? "#fde68a" : "#ddd6fe",
              color: question.dimension === "C" ? "#1d4ed8" :
                question.dimension === "O" ? "#047857" :
                question.dimension === "R" ? "#92400e" : "#6d28d9",
            }}>
              {dimensionLabel}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--it-text)] leading-relaxed">{question.text}</h2>
        </div>

        <div className="space-y-3 mb-10">
          {likertLabels.map((label, i) => {
            const value = i + 1;
            const selected = answers[current] === value;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(value)}
                className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 ${selected ? "border-[var(--it-primary)] bg-[var(--it-primary-soft)] text-[var(--it-text)]" : "border-[var(--it-hairline)] bg-white text-[var(--it-text)] hover:border-[#c7d2fe] hover:bg-[#f8faff]"}`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-[var(--it-primary)] bg-[var(--it-primary)] text-white" : "border-[var(--it-hairline)] bg-[var(--it-surface-muted)] text-[var(--it-muted)]"}`}
                >
                  {value}
                </span>
                <span className="text-sm">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--it-hairline)] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:border-[#cbd5e1] hover:bg-[var(--it-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--it-primary)] focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {s.previous}
          </button>

          {current < AQ_QUESTIONS.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
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
              {s.submitButton}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--it-hairline)] bg-white px-6 py-4">
        <div className="flex flex-wrap gap-1.5 max-w-2xl mx-auto">
          {AQ_QUESTIONS.map((_, i) => (
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
