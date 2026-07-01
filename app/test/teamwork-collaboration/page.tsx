"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { TW_QUESTIONS, TW_DURATION_SECONDS, TW_DIMENSIONS, scoreTW } from "@/lib/questions/teamwork-collaboration";
import { TW_QUESTIONS_ES } from "@/lib/questions/es/teamwork-collaboration";

const dimensionClassNames = TW_DIMENSIONS.reduce<Record<string, string>>((acc, d) => {
  acc[d.label] = d.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = TW_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "likert",
  groupLabel: q.dimension,
  groupClassName: dimensionClassNames[q.dimension],
}));

export default function TeamworkCollaborationTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Teamwork & Collaboration Test"
      shortName="Teamwork"
      categoryLabel="Teamwork"
      categoryClassName="border-teal-500/20 bg-teal-500/10 text-teal-300"
      accentColor="#0d9488"
      durationSeconds={TW_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Likert Scale"
      details={[
        { label: "Questions", value: "35" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Likert Scale" },
      ]}
      dimensionSummary={TW_DIMENSIONS}
      instructions={[
        "Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        "Answer based on how you typically behave in a team, not how you aspire to behave.",
        "Your results are not shown after completion; they are reviewed by the hiring team.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Califique cada afirmación del 1 (Muy en desacuerdo) al 5 (Muy de acuerdo).",
        "Responda según cómo se comporta habitualmente en equipo, no cómo aspira a hacerlo.",
        "Sus resultados no se muestran al finalizar; los revisa el equipo de selección.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      esQuestions={TW_QUESTIONS_ES}
      submittingText="Saving your teamwork profile..."
      scoreAnswers={(answers) => {
        const scored = scoreTW(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
