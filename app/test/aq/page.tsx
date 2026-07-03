"use client";

import { useEffect, useRef, useState } from "react";
import { AQ_QUESTIONS, AQ_DURATION_SECONDS, scoreAQ } from "@/lib/questions/aq";
import { AQ_QUESTIONS_ES } from "@/lib/questions/es/aq";
import { UI_STRINGS, Locale } from "@/lib/i18n/runner-strings";

type Phase = "validating" | "registering" | "ready" | "testing" | "submitting" | "completed" | "error";

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answersRef = useRef<(number | null)[]>(Array(AQ_QUESTIONS.length).fill(null));
  const submittedRef = useRef(false);

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const s = UI_STRINGS[locale];
  const coreDimensions = locale === "es" ? CORE_ES : CORE_EN;
  const likertLabels = [...s.likert];

  useEffect(() => {
    searchParams.then((params) => {
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
            // The candidate record carries the workspace language — it wins
            // over the URL parameter as the source of truth.
            if (data.candidate?.language === "en" || data.candidate?.language === "es") {
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
      await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          assessment_name: "Adversity Quotient (AQ) Test",
          score: scored.total,
          raw_answers: finalAnswers,
        }),
      });
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
  const question = locale === "es" && esQAQ
    ? { ...AQ_QUESTIONS[current], text: esQAQ.text }
    : AQ_QUESTIONS[current];

  const dimensionLabel =
    locale === "es"
      ? (DIMENSION_LABEL_ES[question.dimension] ?? question.dimension)
      : (question.dimension === "C" ? "Control" :
         question.dimension === "O" ? "Ownership" :
         question.dimension === "R" ? "Reach" : "Endurance");

  if (phase === "validating") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">{s.validating}</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center rounded-xl border p-8" style={{ backgroundColor: "#0D1020", borderColor: "#1E2240" }}>
          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">{s.errorHeading}</h2>
          <p className="text-slate-400">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (phase === "registering") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full rounded-xl border p-8" style={{ backgroundColor: "#0D1020", borderColor: "#1E2240" }}>
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              {locale === "es" ? "Evaluación de Resiliencia" : "Resilience Assessment"}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{locale === "es" ? "Prueba de Cociente de Adversidad (AQ)" : "Adversity Quotient (AQ) Test"}</h1>
            <p className="text-slate-400 text-sm">{s.registerHeading}</p>
          </div>

          {regError && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              {regError}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{s.nameLabel}</label>
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={locale === "es" ? "María García" : "Jane Smith"}
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{s.emailLabel}</label>
              <input
                required
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder={locale === "es" ? "maria@ejemplo.com" : "jane@example.com"}
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25"
              />
            </div>
            <button
              type="submit"
              disabled={registering}
              className="mt-2 w-full py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#7c3aed" }}
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
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full rounded-xl border p-8" style={{ backgroundColor: "#0D1020", borderColor: "#1E2240" }}>
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
              {locale === "es" ? "Evaluación de Resiliencia" : "Resilience Assessment"}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{locale === "es" ? "Prueba de Cociente de Adversidad (AQ)" : "Adversity Quotient (AQ) Test"}</h1>
            <p className="text-slate-400">{s.welcomePrefix}<span className="text-white font-medium">{candidate?.full_name}</span></p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: s.questions, value: "40" },
              { label: s.timeLimit, value: "20 min" },
              { label: s.questionType, value: s.likertScale },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 rounded-lg" style={{ backgroundColor: "#1E2240" }}>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "#1E2240" }}>
            <p className="text-sm font-medium text-white mb-3">
              {locale === "es" ? "Esta prueba mide 4 dimensiones CORE:" : "This test measures 4 CORE dimensions:"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {coreDimensions.map(({ letter, name, desc }) => (
                <div key={letter} className="flex items-start gap-2">
                  <span className="font-bold text-blue-400 w-4">{letter}</span>
                  <div>
                    <span className="font-medium text-white">{name}</span>
                    <span className="text-slate-400"> - {desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-8 text-sm text-slate-300">
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
            className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">
            {locale === "es" ? "Calculando su puntuación AQ..." : "Calculating your AQ score..."}
          </p>
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
          <div className="mt-8 rounded-lg border border-[#1E2240] bg-[#07080F] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{s.status}</p>
            <p className="mt-1 text-sm font-medium text-emerald-300">{s.submittedSecurely}</p>
          </div>
          <p className="mt-6 text-xs text-slate-600">{s.closeWindow}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#0D1020", borderColor: "#1E2240" }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">{locale === "es" ? "Evaluación AQ" : "AQ Assessment"}</span>
          <span className="text-xs text-slate-400">{candidate?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{s.answeredOf(answered, AQ_QUESTIONS.length)}</span>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${timeWarning ? "bg-red-500/10 text-red-400" : "text-white"}`}
            style={!timeWarning ? { backgroundColor: "#1E2240" } : {}}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(secondsLeft)}
          </div>
        </div>
      </div>

      <div className="h-1 w-full" style={{ backgroundColor: "#1E2240" }}>
        <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "#7c3aed" }} />
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {s.questionOf(current + 1, AQ_QUESTIONS.length)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
              backgroundColor: question.dimension === "C" ? "rgba(59,130,246,0.15)" :
                question.dimension === "O" ? "rgba(16,185,129,0.15)" :
                question.dimension === "R" ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)",
              color: question.dimension === "C" ? "#60a5fa" :
                question.dimension === "O" ? "#34d399" :
                question.dimension === "R" ? "#fbbf24" : "#c084fc",
            }}>
              {dimensionLabel}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white leading-relaxed">{question.text}</h2>
        </div>

        <div className="space-y-3 mb-10">
          {likertLabels.map((label, i) => {
            const value = i + 1;
            const selected = answers[current] === value;
            return (
              <button
                key={i}
                onClick={() => selectAnswer(value)}
                className="w-full text-left px-5 py-4 rounded-lg border transition-all flex items-center gap-4"
                style={{
                  backgroundColor: selected ? "rgba(124,58,237,0.15)" : "#1E2240",
                  borderColor: selected ? "#7c3aed" : "transparent",
                  color: selected ? "#c084fc" : "#e2e8f0",
                }}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all"
                  style={{
                    backgroundColor: selected ? "#7c3aed" : "#0D1020",
                    color: selected ? "#fff" : "#94a3b8",
                  }}
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-30"
            style={{ backgroundColor: "#1E2240", color: "#e2e8f0" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {s.previous}
          </button>

          {current < AQ_QUESTIONS.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#7c3aed", color: "#fff" }}
            >
              {s.next}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(answersRef.current)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#10b981", color: "#fff" }}
            >
              {s.submitButton}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="border-t px-6 py-4" style={{ backgroundColor: "#0D1020", borderColor: "#1E2240" }}>
        <div className="flex flex-wrap gap-1.5 max-w-2xl mx-auto">
          {AQ_QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-7 h-7 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: i === current ? "#7c3aed" : answers[i] !== null ? "rgba(16,185,129,0.2)" : "#1E2240",
                color: i === current ? "#fff" : answers[i] !== null ? "#6ee7b7" : "#94a3b8",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
