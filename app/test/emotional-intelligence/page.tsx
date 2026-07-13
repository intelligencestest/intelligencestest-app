"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { EI_DIMENSIONS, EI_DURATION_SECONDS, EI_QUESTIONS, scoreEI } from "@/lib/questions/emotional-intelligence";
import { EI_QUESTIONS_ES } from "@/lib/questions/es/emotional-intelligence";
import { EI_QUESTIONS_FR } from "@/lib/questions/fr/emotional-intelligence";

const dimensionClassNames = EI_DIMENSIONS.reduce<Record<string, string>>((acc, dimension) => {
  acc[dimension.label] = dimension.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = EI_QUESTIONS.map((question) => ({
  id: question.id,
  text: question.text,
  kind: "likert",
  groupLabel: question.dimension,
  groupClassName: dimensionClassNames[question.dimension],
}));

export default function EmotionalIntelligenceTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Emotional Intelligence Test"
      shortName="Emotional Intelligence"
      categoryLabel="Emotional Intelligence"
      categoryClassName="border-purple-500/20 bg-purple-500/10 text-purple-300"
      accentColor="#4f46e5"
      durationSeconds={EI_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Likert Scale"
      details={[
        { label: "Questions", value: "40" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Likert Scale" },
      ]}
      dimensionSummary={EI_DIMENSIONS}
      instructions={[
        "Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        "Answer honestly based on your typical behavior, not your ideal behavior.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Califique cada afirmación del 1 (Muy en desacuerdo) al 5 (Muy de acuerdo).",
        "Responda con honestidad según su comportamiento habitual, no el ideal.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Évaluez chaque affirmation de 1 (Pas du tout d'accord) à 5 (Tout à fait d'accord).",
        "Répondez honnêtement selon votre comportement habituel, pas votre comportement idéal.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={EI_QUESTIONS_ES}
      frQuestions={EI_QUESTIONS_FR}
      submittingText="Saving your emotional intelligence results..."
      scoreAnswers={(answers) => {
        const scored = scoreEI(answers);
        return {
          score: scored.percentage,
          rawAnswers: {
            answers,
            total: scored.total,
            percentage: scored.percentage,
            dimensions: scored.dimensions,
          },
        };
      }}
    />
  );
}
