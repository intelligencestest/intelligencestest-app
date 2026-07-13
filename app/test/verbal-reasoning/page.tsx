"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { VR_QUESTIONS, VR_DURATION_SECONDS, scoreVR } from "@/lib/questions/verbal-reasoning";
import { VR_QUESTIONS_ES } from "@/lib/questions/es/verbal-reasoning";
import { VR_QUESTIONS_FR } from "@/lib/questions/fr/verbal-reasoning";

const questions: RunnerQuestion[] = VR_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function VerbalReasoningTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Verbal Reasoning Test"
      shortName="Verbal Reasoning"
      categoryLabel="Cognitive"
      categoryClassName="border-violet-500/20 bg-violet-500/10 text-violet-300"
      accentColor="#4f46e5"
      durationSeconds={VR_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Multiple Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "20 min" },
        { label: "Question Type", value: "Multiple Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Answer questions on analogies, word relationships, and logical deductions.",
        "Read each question carefully before selecting your answer.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Responda preguntas sobre analogías, relaciones entre palabras y deducciones lógicas.",
        "Lea cada pregunta con atención antes de seleccionar su respuesta.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Répondez aux questions sur les analogies, relations entre mots et déductions logiques.",
        "Lisez attentivement chaque question avant de sélectionner votre réponse.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={VR_QUESTIONS_ES}
      frQuestions={VR_QUESTIONS_FR}
      submittingText="Scoring your verbal reasoning test..."
      scoreAnswers={(answers) => {
        const scored = scoreVR(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
