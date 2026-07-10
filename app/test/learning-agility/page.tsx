"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { LA_QUESTIONS, LA_DURATION_SECONDS, scoreLA } from "@/lib/questions/learning-agility";
import { LA_QUESTIONS_ES } from "@/lib/questions/es/learning-agility";

const questions: RunnerQuestion[] = LA_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function LearningAgilityTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Learning Agility Test"
      shortName="Learning Agility"
      categoryLabel="Cognitive"
      categoryClassName="border-blue-500/20 bg-blue-500/10 text-blue-300"
      accentColor="#4f46e5"
      durationSeconds={LA_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each scenario and select the most agile and effective response.",
        "Choose the answer that best demonstrates adaptability and a growth mindset.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Lea cada escenario y seleccione la respuesta más ágil y efectiva.",
        "Elija la respuesta que mejor demuestre adaptabilidad y mentalidad de crecimiento.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      esQuestions={LA_QUESTIONS_ES}
      submittingText="Scoring your learning agility test..."
      scoreAnswers={(answers) => {
        const scored = scoreLA(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
