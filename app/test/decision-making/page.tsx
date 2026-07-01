"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { DM_QUESTIONS, DM_DURATION_SECONDS, scoreDM } from "@/lib/questions/decision-making";
import { DM_QUESTIONS_ES } from "@/lib/questions/es/decision-making";

const questions: RunnerQuestion[] = DM_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function DecisionMakingTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Decision Making Test"
      shortName="Decision Making"
      categoryLabel="Workplace Judgment"
      categoryClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
      accentColor="#4f46e5"
      durationSeconds={DM_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each scenario and select the most effective decision-making response.",
        "Choose the answer that reflects sound analysis, judgment, and risk awareness.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Lea cada escenario y seleccione la respuesta de toma de decisiones más efectiva.",
        "Elija la respuesta que refleje un análisis sólido, buen criterio y conciencia del riesgo.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      esQuestions={DM_QUESTIONS_ES}
      submittingText="Scoring your decision making test..."
      scoreAnswers={(answers) => {
        const scored = scoreDM(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
