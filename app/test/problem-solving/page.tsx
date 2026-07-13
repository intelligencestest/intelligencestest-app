"use client";

import AssessmentRunner, { RunnerQuestion } from "../_components/AssessmentRunner";
import { PS_QUESTIONS, PS_DURATION_SECONDS, scorePS } from "@/lib/questions/problem-solving";
import { PS_QUESTIONS_ES } from "@/lib/questions/es/problem-solving";
import { PS_QUESTIONS_FR } from "@/lib/questions/fr/problem-solving";

const questions: RunnerQuestion[] = PS_QUESTIONS.map((q) => ({
  id: q.id,
  text: q.text,
  kind: "choice",
  options: q.options,
}));

export default function ProblemSolvingTest({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; project?: string; lang?: string }>;
}) {
  return (
    <AssessmentRunner
      searchParams={searchParams}
      assessmentName="Problem Solving Test"
      shortName="Problem Solving"
      categoryLabel="Judgment"
      categoryClassName="border-teal-500/20 bg-teal-500/10 text-teal-300"
      accentColor="#0d9488"
      durationSeconds={PS_DURATION_SECONDS}
      questions={questions}
      questionTypeLabel="Scenario Choice"
      details={[
        { label: "Questions", value: "30" },
        { label: "Time Limit", value: "25 min" },
        { label: "Question Type", value: "Scenario Choice" },
      ]}
      autoAdvanceLikert={false}
      instructions={[
        "Read each workplace scenario and choose the most effective response.",
        "Select the option that demonstrates the best judgment and approach.",
        "Your score is not shown after completion; results are saved for review.",
        "The test auto-submits when the timer reaches zero.",
      ]}
      instructionsEs={[
        "Lea cada escenario laboral y elija la respuesta más efectiva.",
        "Seleccione la opción que demuestre el mejor criterio y enfoque.",
        "Su puntuación no se muestra al finalizar; los resultados se guardan para revisión.",
        "La prueba se envía automáticamente cuando el temporizador llega a cero.",
      ]}
      instructionsFr={[
        "Lisez chaque scénario professionnel et choisissez la réponse la plus efficace.",
        "Sélectionnez l'option qui démontre le meilleur jugement et la meilleure approche.",
        "Votre score ne s'affiche pas à la fin ; les résultats sont enregistrés pour examen.",
        "Le test s'envoie automatiquement lorsque le temps atteint zéro.",
      ]}
      esQuestions={PS_QUESTIONS_ES}
      frQuestions={PS_QUESTIONS_FR}
      submittingText="Scoring your problem solving test..."
      scoreAnswers={(answers) => {
        const scored = scorePS(answers);
        return {
          score: scored.percentage,
          rawAnswers: { answers, correct: scored.correct, total: scored.total, percentage: scored.percentage },
        };
      }}
    />
  );
}
