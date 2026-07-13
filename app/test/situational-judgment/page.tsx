"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import {
  SJT_DIMENSIONS,
  SJT_DURATION_SECONDS,
  SJT_QUESTIONS,
  scoreSJT,
} from "@/lib/questions/situational-judgment";
import { SJT_QUESTIONS_ES } from "@/lib/questions/es/situational-judgment";
import { SJT_QUESTIONS_FR } from "@/lib/questions/fr/situational-judgment";

const dimensionClassNames = SJT_DIMENSIONS.reduce<Record<string, string>>((acc, dimension) => {
  acc[dimension.label] = dimension.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = SJT_QUESTIONS.map((question) => ({
  id: question.id,
  text: question.text,
  kind: "choice",
  options: question.options.map((option) => option.text),
  groupLabel: question.dimension,
  groupClassName: dimensionClassNames[question.dimension],
}));

export default function SituationalJudgmentTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Situational Judgment Test"
      shortName="Situational Judgment"
      categoryLabel="Workplace Judgment"
      categoryClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
      accentColor="#4f46e5"
      durationSeconds={SJT_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      dimensionSummary={SJT_DIMENSIONS}
      autoAdvanceLikert={false}
      instructions={[
        "Choose the response that shows the best workplace judgment in each scenario.",
        "Some options may be partially reasonable; select the strongest response overall.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Elija la respuesta que muestre el mejor criterio laboral en cada escenario.",
        "Algunas opciones pueden ser razonables; seleccione la respuesta más sólida en conjunto.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Choisissez la réponse qui montre le meilleur jugement professionnel dans chaque scénario.",
        "Certaines options peuvent être partiellement raisonnables ; sélectionnez la réponse globalement la plus solide.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={SJT_QUESTIONS_ES}
      frQuestions={SJT_QUESTIONS_FR}
      submittingText="Scoring your situational judgment test..."
      scoreAnswers={(answers) => {
        const scored = scoreSJT(answers);
        return {
          score: scored.percentage,
          rawAnswers: {
            answers,
            total: scored.total,
            max: scored.max,
            percentage: scored.percentage,
            dimensions: scored.dimensions,
            reviewed: scored.reviewed,
          },
        };
      }}
    />
  );
}
