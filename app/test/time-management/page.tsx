"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { TM_QUESTIONS, TM_DURATION_SECONDS, scoreTM } from "@/lib/questions/time-management";
import { TM_QUESTIONS_ES } from "@/lib/questions/es/time-management";
import { TM_QUESTIONS_FR } from "@/lib/questions/fr/time-management";

const questions: RunnerQuestion[] = TM_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function TimeManagementTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Time Management Test"
      shortName="Time Management"
      categoryLabel="Productivity"
      categoryClassName="border-amber-500/20 bg-amber-500/10 text-amber-300"
      accentColor="#d97706"
      durationSeconds={TM_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each workplace scenario and select the most effective response.",
        "Choose the answer that reflects best-practice time and priority management.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Lea cada escenario laboral y seleccione la respuesta más efectiva.",
        "Elija la respuesta que refleje las mejores prácticas de gestión del tiempo y prioridades.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Lisez chaque scénario professionnel et sélectionnez la réponse la plus efficace.",
        "Choisissez la réponse qui reflète les meilleures pratiques de gestion du temps et des priorités.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={TM_QUESTIONS_ES}
      frQuestions={TM_QUESTIONS_FR}
      submittingText="Scoring your time management test..."
      scoreAnswers={(answers) => {
        const scored = scoreTM(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, dimensions: scored.dimensions },
        };
      }}
    />
  );
}
