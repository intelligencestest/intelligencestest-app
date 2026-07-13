"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { AR_QUESTIONS, AR_DURATION_SECONDS, scoreAR } from "@/lib/questions/abstract-reasoning";
import { AR_QUESTIONS_ES } from "@/lib/questions/es/abstract-reasoning";
import { AR_QUESTIONS_FR } from "@/lib/questions/fr/abstract-reasoning";

const questions: RunnerQuestion[] = AR_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function AbstractReasoningTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Abstract Reasoning Test"
      shortName="Abstract Reasoning"
      categoryLabel="Cognitive"
      categoryClassName="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
      accentColor="#4f46e5"
      durationSeconds={AR_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Pattern Recognition"
      details={[
        { label: "Questions", value: "25" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Pattern Recognition" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Identify patterns, sequences, and relationships in each question.",
        "Select the option that best completes or continues each pattern.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Identifique patrones, secuencias y relaciones en cada pregunta.",
        "Seleccione la opción que mejor complete o continúe cada patrón.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Identifiez les motifs, séquences et relations dans chaque question.",
        "Sélectionnez l'option qui complète ou poursuit le mieux chaque motif.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={AR_QUESTIONS_ES}
      frQuestions={AR_QUESTIONS_FR}
      submittingText="Scoring your abstract reasoning test..."
      scoreAnswers={(answers) => {
        const scored = scoreAR(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
