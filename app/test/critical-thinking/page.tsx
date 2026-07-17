"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { CT_QUESTIONS, CT_DURATION_SECONDS, scoreResults } from "@/lib/questions/critical-thinking";
import { CT_QUESTIONS_ES } from "@/lib/questions/es/critical-thinking";
import { CT_QUESTIONS_FR } from "@/lib/questions/fr/critical-thinking";

const questions: RunnerQuestion[] = CT_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function CriticalThinkingTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Critical Thinking Test"
      shortName="Critical Thinking"
      categoryLabel="Cognitive"
      categoryClassName="border-blue-500/20 bg-blue-500/10 text-blue-300"
      accentColor="#4f46e5"
      durationSeconds={CT_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Multiple Choice"
      details={[
        { label: "Questions", value: "40" },
        { label: "Time Limit", value: "25 min" },
        { label: "Question Type", value: "Multiple Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each question carefully before selecting your answer.",
        "You can navigate freely between questions and change your answers.",
        "Unanswered questions count as incorrect — attempt every question.",
        "The test auto-submits when the timer reaches zero.",
        "Ensure a stable internet connection before beginning.",
      ]}
      instructionsEs={[
        "Lea cada pregunta cuidadosamente antes de seleccionar su respuesta.",
        "Puede navegar libremente entre preguntas y cambiar sus respuestas.",
        "Las preguntas sin respuesta se cuentan como incorrectas — responda todas.",
        "La prueba se envía automáticamente cuando el tiempo llega a cero.",
        "Asegure una conexión a internet estable antes de comenzar.",
      ]}
      instructionsFr={[
        "Lisez attentivement chaque question avant de sélectionner votre réponse.",
        "Vous pouvez naviguer librement entre les questions et modifier vos réponses.",
        "Les questions sans réponse comptent comme incorrectes — répondez à toutes les questions.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
        "Assurez-vous d'avoir une connexion internet stable avant de commencer.",
      ]}
      esQuestions={CT_QUESTIONS_ES}
      frQuestions={CT_QUESTIONS_FR}
      submittingText="Scoring your answers..."
      scoreAnswers={(answers) => {
        const scored = scoreResults(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage, interpretation: scored.interpretation },
        };
      }}
    />
  );
}
