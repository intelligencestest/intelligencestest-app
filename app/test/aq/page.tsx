"use client";

import { useEffect, useRef, useState } from "react";
import { AQ_QUESTIONS, AQ_DURATION_SECONDS, LIKERT_LABELS, scoreAQ } from "@/lib/questions/aq";

type Phase = "validating" | "registering" | "ready" | "testing" | "submitting" | "completed" | "error";

interface CandidateInfo {
  id: string;
  full_name: string;
  email: string;
  project_id: string;
  company_id: string;
}

export default function AQTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
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

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    searchParams.then((params) => {
      const t = params.token ?? null;
      const p = params.project ?? null;

      if (p) {
        setProjectId(p);
        setPhase("registering");
        return;
      }

      setToken(t);
      if (!t) {
        setErrorMsg("No invitation token provided. Please use the link from your invitation email.");
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
          setErrorMsg("Failed to validate your invitation. Please try again.");
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
        setRegError(data.error ?? "Failed to register. Please try again.");
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
      setRegError("Network error. Please try again.");
    }
    setRegistering(false);
  }

  function startTest() {
    setPhase("testing");
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          submitAnswers(answers);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function selectAnswer(value: number) {
    const next = [...answers];
    next[current] = value;
    setAnswers(next);
    // Auto-advance after selection if not last question
    if (current < AQ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 300);
    }
  }

  async function submitAnswers(finalAnswers: (number | null)[]) {
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

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const answered = answers.filter((a) => a !== null).length;
  const progress = ((current + 1) / AQ_QUESTIONS.length) * 100;
  const timeWarning = secondsLeft < 180;

  if (phase === "validating") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Validating your invitation...</p>
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
          <h2 className="text-xl font-semibold text-white mb-2">Unable to start test</h2>
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
              Resilience Assessment
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Adversity Quotient (AQ) Test</h1>
            <p className="text-slate-400 text-sm">Enter your details to begin the assessment.</p>
          </div>

          {regError && (
            <div className="mb-4 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
              {regError}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full rounded-xl border border-[#1E2240] bg-[#07080F] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                required
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="jane@example.com"
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
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" /></svg> Setting up...</>
              ) : "Continue to Assessment"}
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
              Resilience Assessment
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Adversity Quotient (AQ) Test</h1>
            <p className="text-slate-400">Welcome, <span className="text-white font-medium">{candidate?.full_name}</span></p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Questions", value: "40" },
              { label: "Time Limit", value: "20 min" },
              { label: "Question Type", value: "Likert Scale" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-4 rounded-lg" style={{ backgroundColor: "#1E2240" }}>
                <div className="text-xl font-bold text-white">{value}</div>
                <div className="text-xs text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: "#1E2240" }}>
            <p className="text-sm font-medium text-white mb-3">This test measures 4 CORE dimensions:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { letter: "C", name: "Control", desc: "How much control you perceive" },
                { letter: "O", name: "Ownership", desc: "How accountable you feel" },
                { letter: "R", name: "Reach", desc: "How far adversity spreads" },
                { letter: "E", name: "Endurance", desc: "How long adversity lasts" },
              ].map(({ letter, name, desc }) => (
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
            <p>- Rate each statement on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
            <p>- Answer honestly - there are no right or wrong answers.</p>
            <p>- The test auto-submits when the timer reaches zero.</p>
          </div>

          <button
            onClick={startTest}
            className="w-full py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1D4ED8" }}
          >
            Begin Assessment
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
          <p className="text-slate-400">Calculating your AQ score...</p>
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
          <h1 className="mb-3 text-2xl font-semibold text-white">Assessment Submitted</h1>
          <p className="mb-2 leading-relaxed text-slate-300">
            Your assessment has been submitted successfully.
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            Your responses are saved and ready for review by the organization.
          </p>
          <div className="mt-8 rounded-lg border border-[#1E2240] bg-[#07080F] p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Status</p>
            <p className="mt-1 text-sm font-medium text-emerald-300">Submitted securely</p>
          </div>
          <p className="mt-6 text-xs text-slate-600">You may now close this window.</p>
        </div>
      </div>
    );
  }

  const question = AQ_QUESTIONS[current];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#0D1020", borderColor: "#1E2240" }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">AQ Assessment</span>
          <span className="text-xs text-slate-400">{candidate?.full_name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{answered}/{AQ_QUESTIONS.length} answered</span>
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

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ backgroundColor: "#1E2240" }}>
        <div className="h-1 transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "#7c3aed" }} />
      </div>

      {/* Question */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Question {current + 1} of {AQ_QUESTIONS.length}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
              backgroundColor: question.dimension === "C" ? "rgba(59,130,246,0.15)" :
                question.dimension === "O" ? "rgba(16,185,129,0.15)" :
                question.dimension === "R" ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)",
              color: question.dimension === "C" ? "#60a5fa" :
                question.dimension === "O" ? "#34d399" :
                question.dimension === "R" ? "#fbbf24" : "#c084fc",
            }}>
              {question.dimension === "C" ? "Control" : question.dimension === "O" ? "Ownership" : question.dimension === "R" ? "Reach" : "Endurance"}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white leading-relaxed">{question.text}</h2>
        </div>

        <div className="space-y-3 mb-10">
          {LIKERT_LABELS.map((label, i) => {
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
            Previous
          </button>

          {current < AQ_QUESTIONS.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#7c3aed", color: "#fff" }}
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => submitAnswers(answers)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#10b981", color: "#fff" }}
            >
              Submit Assessment
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Question grid nav */}
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
