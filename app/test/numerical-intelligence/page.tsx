"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import {
  NUMERICAL_DURATION_SECONDS,
  NUMERICAL_QUESTIONS,
  scoreNumerical,
} from "@/lib/questions/numerical-intelligence";
import { NUMERICAL_QUESTIONS_ES } from "@/lib/questions/es/numerical-intelligence";

const questions: RunnerQuestion[] = NUMERICAL_QUESTIONS.map((question) => ({
  id: question.id,
  text: question.text,
  kind: "choice",
  options: question.options,
}));

export default function NumericalIntelligenceTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Numerical Intelligence Test"
      shortName="Numerical Intelligence"
      categoryLabel="Numerical Reasoning"
      categoryClassName="border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
      accentColor="#06b6d4"
      durationSeconds={NUMERICAL_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Multiple Choice"
      details={[
        { label: "Questions", value: "35" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Multiple Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Choose the best answer for each numerical reasoning question.",
        "Use scratch paper or a calculator only if your organization allowed it.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Elija la mejor respuesta para cada pregunta de razonamiento numérico.",
        "Use papel borrador o calculadora solo si su organización lo permite.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      esQuestions={NUMERICAL_QUESTIONS_ES}
      submittingText="Scoring your numerical intelligence test..."
      scoreAnswers={(answers) => {
        const scored = scoreNumerical(answers);
        return {
          score: scored.percentage,
          rawAnswers: {
            answers,
            correct: scored.correct,
            total: scored.total,
            percentage: scored.percentage,
            reviewed: scored.reviewed,
          },
        };
      }}
    />
  );
}
