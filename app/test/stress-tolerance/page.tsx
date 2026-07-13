"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { ST_QUESTIONS, ST_DURATION_SECONDS, ST_DIMENSIONS, scoreST } from "@/lib/questions/stress-tolerance";
import { ST_QUESTIONS_ES } from "@/lib/questions/es/stress-tolerance";
import { ST_QUESTIONS_FR } from "@/lib/questions/fr/stress-tolerance";

const dimensionClassNames = ST_DIMENSIONS.reduce<Record<string, string>>((acc, d) => {
  acc[d.label] = d.className;
  return acc;
}, {});

const questions: RunnerQuestion[] = ST_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "likert",
  groupLabel: q.dimension,
  groupClassName: dimensionClassNames[q.dimension],
}));

export default function StressToleranceTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Stress Tolerance Test"
      shortName="Stress Tolerance"
      categoryLabel="Resilience"
      categoryClassName="border-orange-500/20 bg-orange-500/10 text-orange-300"
      accentColor="#ea580c"
      durationSeconds={ST_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Likert Scale"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "15 min" },
        { label: "Question Type", value: "Likert Scale" },
      ]}
      dimensionSummary={ST_DIMENSIONS}
      instructions={[
        "Rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree).",
        "Answer based on how you genuinely behave under pressure, not how you would ideally like to.",
        "Your results are not shown after completion; they are reviewed by the hiring team.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Califique cada afirmación del 1 (Muy en desacuerdo) al 5 (Muy de acuerdo).",
        "Responda según cómo se comporta realmente bajo presión, no cómo le gustaría hacerlo.",
        "Sus resultados no se muestran al finalizar; los revisa el equipo de selección.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Évaluez chaque affirmation de 1 (Pas du tout d'accord) à 5 (Tout à fait d'accord).",
        "Répondez selon votre comportement réel sous pression, pas selon ce que vous aimeriez idéalement faire.",
        "Vos résultats ne s'affichent pas à la fin ; ils sont examinés par l'équipe de recrutement.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={ST_QUESTIONS_ES}
      frQuestions={ST_QUESTIONS_FR}
      submittingText="Saving your stress tolerance profile..."
      scoreAnswers={(answers) => {
        const scored = scoreST(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
