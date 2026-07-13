"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { AD_QUESTIONS, AD_DURATION_SECONDS, scoreAD } from "@/lib/questions/attention-detail";
import { AD_QUESTIONS_ES } from "@/lib/questions/es/attention-detail";
import { AD_QUESTIONS_FR } from "@/lib/questions/fr/attention-detail";

const questions: RunnerQuestion[] = AD_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function AttentionDetailTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Attention to Detail Test"
      shortName="Attention to Detail"
      categoryLabel="Cognitive"
      categoryClassName="border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
      accentColor="#eab308"
      durationSeconds={AD_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Error Detection"
      details={[
        { label: "Questions", value: "40" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Error Detection" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each question carefully — small differences matter.",
        "Look for spelling errors, data inconsistencies, and mismatched references.",
        "Choose the most accurate answer from the four options.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Lea cada pregunta con atención — las pequeñas diferencias importan.",
        "Busque errores de escritura, inconsistencias de datos y referencias incorrectas.",
        "Elija la respuesta más precisa entre las cuatro opciones.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Lisez chaque question avec attention — les petites différences comptent.",
        "Repérez les erreurs orthographiques, les incohérences de données et les références erronées.",
        "Choisissez la réponse la plus précise parmi les quatre options.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={AD_QUESTIONS_ES}
      frQuestions={AD_QUESTIONS_FR}
      submittingText="Scoring your attention to detail test..."
      scoreAnswers={(answers) => {
        const scored = scoreAD(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
