"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { IE_QUESTIONS, IE_DURATION_SECONDS, scoreIE } from "@/lib/questions/integrity-ethics";
import { IE_QUESTIONS_ES } from "@/lib/questions/es/integrity-ethics";

const questions: RunnerQuestion[] = IE_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function IntegrityEthicsTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Integrity & Ethics Test"
      shortName="Integrity & Ethics"
      categoryLabel="Character"
      categoryClassName="border-violet-500/20 bg-violet-500/10 text-violet-300"
      accentColor="#4f46e5"
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
      instructionsEs={[
        "Lea cada escenario laboral y seleccione la respuesta más adecuada.",
        "Elija la respuesta que refleje el estándar más alto de integridad profesional.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      esQuestions={IE_QUESTIONS_ES}
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
