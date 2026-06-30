"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { CSERV_QUESTIONS, CSERV_DURATION_SECONDS, scoreCServ } from "@/lib/questions/customer-service-skills";

const questions: RunnerQuestion[] = CSERV_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function CustomerServiceSkillsTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Customer Service Skills Test"
      shortName="Customer Service"
      categoryLabel="Customer Service"
      categoryClassName="border-sky-500/20 bg-sky-500/10 text-sky-300"
      accentColor="#0284c7"
      durationSeconds={CSERV_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "35" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each customer scenario and select the most effective response.",
        "Choose the answer that reflects best-practice customer service.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      submittingText="Scoring your customer service skills test..."
      scoreAnswers={(answers) => {
        const scored = scoreCServ(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
