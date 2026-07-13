"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import {
  PERSONALITY_DIMENSIONS,
  PERSONALITY_DURATION_SECONDS,
  PERSONALITY_QUESTIONS,
  scorePersonality,
} from "@/lib/questions/personality-type";
import { PERSONALITY_QUESTIONS_ES } from "@/lib/questions/es/personality-type";
import { PERSONALITY_QUESTIONS_FR } from "@/lib/questions/fr/personality-type";

const dimensionClassNames = PERSONALITY_DIMENSIONS.reduce<Record<string, string>>((acc, dimension) => {
  acc[dimension.label] = dimension.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = PERSONALITY_QUESTIONS.map((question) => ({
  id: question.id,
  text: question.text,
  kind: "likert",
  groupLabel: question.dimension,
  groupClassName: dimensionClassNames[question.dimension],
}));

export default function PersonalityTypeTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Personality Type Test"
      shortName="Personality Type"
      categoryLabel="Personality"
      categoryClassName="border-pink-500/20 bg-pink-500/10 text-pink-300"
      accentColor="#ec4899"
      durationSeconds={PERSONALITY_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Likert Scale"
      details={[
        { label: "Questions", value: "40" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Likert Scale" },
      ]}
      dimensionSummary={PERSONALITY_DIMENSIONS}
      instructions={[
        "Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        "Answer based on your typical work behavior, not a single recent situation.",
        "There are no right or wrong answers in this personality profile.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Califique cada afirmación del 1 (Muy en desacuerdo) al 5 (Muy de acuerdo).",
        "Responda según su comportamiento laboral habitual, no una situación reciente.",
        "No hay respuestas correctas ni incorrectas en este perfil de personalidad.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Évaluez chaque affirmation de 1 (Pas du tout d'accord) à 5 (Tout à fait d'accord).",
        "Répondez selon votre comportement de travail habituel, pas une situation récente isolée.",
        "Il n'y a pas de bonnes ou mauvaises réponses dans ce profil de personnalité.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={PERSONALITY_QUESTIONS_ES}
      frQuestions={PERSONALITY_QUESTIONS_FR}
      submittingText="Saving your personality profile..."
      scoreAnswers={(answers) => {
        const scored = scorePersonality(answers);
        return {
          score: scored.percentage,
          rawAnswers: {
            answers,
            total: scored.total,
            percentage: scored.percentage,
            dimensions: scored.dimensions,
            strongest_dimension: scored.strongestDimension,
          },
        };
      }}
    />
  );
}
