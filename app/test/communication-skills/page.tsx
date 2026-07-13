"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { CS_QUESTIONS, CS_DURATION_SECONDS, CS_DIMENSIONS, scoreCS } from "@/lib/questions/communication-skills";
import { CS_QUESTIONS_ES } from "@/lib/questions/es/communication-skills";
import { CS_QUESTIONS_FR } from "@/lib/questions/fr/communication-skills";

const dimensionClassNames = CS_DIMENSIONS.reduce<Record<string, string>>((acc, d) => {
  acc[d.label] = d.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = CS_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "likert",
  groupLabel: q.dimension,
  groupClassName: dimensionClassNames[q.dimension],
}));

export default function CommunicationSkillsTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Communication Skills Test"
      shortName="Communication Skills"
      categoryLabel="Communication"
      categoryClassName="border-sky-500/20 bg-sky-500/10 text-sky-300"
      accentColor="#0284c7"
      durationSeconds={CS_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Likert Scale"
      details={[
        { label: "Questions", value: "35" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Likert Scale" },
      ]}
      dimensionSummary={CS_DIMENSIONS}
      instructions={[
        "Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        "Answer based on how you typically communicate, not on an ideal scenario.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Califique cada afirmación del 1 (Muy en desacuerdo) al 5 (Muy de acuerdo).",
        "Responda según cómo se comunica habitualmente, no según un escenario ideal.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Évaluez chaque affirmation de 1 (Pas du tout d'accord) à 5 (Tout à fait d'accord).",
        "Répondez en fonction de la façon dont vous communiquez habituellement, pas selon un scénario idéal.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={CS_QUESTIONS_ES}
      frQuestions={CS_QUESTIONS_FR}
      submittingText="Saving your communication skills profile..."
      scoreAnswers={(answers) => {
        const scored = scoreCS(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
