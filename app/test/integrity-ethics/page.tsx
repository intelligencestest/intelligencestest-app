"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { IE_QUESTIONS, IE_DURATION_SECONDS, scoreIE } from "@/lib/questions/integrity-ethics";

const questions: RunnerQuestion[] = IE_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function IntegrityEthicsTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Integrity & Ethics Test"
      shortName="Integrity & Ethics"
      categoryLabel="Character"
      categoryClassName="border-violet-500/20 bg-violet-500/10 text-violet-300"
      accentColor="#7c3aed"
      durationSeconds={IE_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each workplace scenario and select the most appropriate response.",
        "Choose the answer that reflects the highest standard of professional integrity.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your integrity and ethics test..."
      scoreAnswers={(answers) => {
        const scored = scoreIE(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
