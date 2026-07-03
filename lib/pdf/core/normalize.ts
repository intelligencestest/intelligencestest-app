import type {
  BenchmarkComparisonItem,
  ChartPoint,
  CompetencyScore,
  CompletedAssessmentResult,
  EnterpriseReportData,
  EnterpriseReportRenderOptions,
} from "./types";
import { clampScore, scorePercent } from "./layout";
import { completedAssessmentsOnly, hasBenchmarkEvidence } from "./section-registry";
import { scoreTone } from "./theme";

const DEFAULT_LIMITS: Required<EnterpriseReportRenderOptions> = {
  maxCompletedAssessments: 30,
  maxCompetencies: 60,
  maxChartPoints: 12,
  maxStrengths: 12,
  maxDevelopmentAreas: 12,
  maxInterviewQuestions: 18,
  maxBenchmarks: 12,
  maxBufferComplexity: 180,
  allowLargeBufferRender: false,
};

function limits(options: EnterpriseReportRenderOptions = {}): Required<EnterpriseReportRenderOptions> {
  return { ...DEFAULT_LIMITS, ...options };
}

function normalizeAssessment(assessment: CompletedAssessmentResult): CompletedAssessmentResult {
  const maxScore = assessment.maxScore && assessment.maxScore > 0 ? assessment.maxScore : 100;
  return {
    ...assessment,
    maxScore,
    score: clampScore(assessment.score, maxScore),
    dimensions: assessment.dimensions?.map((dimension) => {
      const dimensionMax = dimension.maxScore && dimension.maxScore > 0 ? dimension.maxScore : 100;
      return {
        ...dimension,
        maxScore: dimensionMax,
        score: clampScore(dimension.score, dimensionMax),
        tone: dimension.tone ?? scoreTone(scorePercent(dimension.score, dimensionMax)),
      };
    }),
  };
}

function normalizeCompetency(competency: CompetencyScore): CompetencyScore {
  const maxScore = competency.maxScore && competency.maxScore > 0 ? competency.maxScore : 100;
  return {
    ...competency,
    maxScore,
    score: clampScore(competency.score, maxScore),
    tone: competency.tone ?? scoreTone(scorePercent(competency.score, maxScore)),
  };
}

function normalizeChartPoint(point: ChartPoint): ChartPoint {
  const maxValue = point.maxValue && point.maxValue > 0 ? point.maxValue : 100;
  return {
    ...point,
    maxValue,
    value: clampScore(point.value, maxValue),
  };
}

function normalizeBenchmark(item: BenchmarkComparisonItem): BenchmarkComparisonItem {
  return {
    ...item,
    candidateScore: clampScore(item.candidateScore),
    benchmarkScore: item.benchmarkScore === undefined ? undefined : clampScore(item.benchmarkScore),
    percentile: item.percentile === undefined ? undefined : clampScore(item.percentile),
  };
}

export function normalizeEnterpriseReportData(
  data: EnterpriseReportData,
  options: EnterpriseReportRenderOptions = {},
): EnterpriseReportData {
  const safeLimits = limits(options);
  const assessments = completedAssessmentsOnly(data.assessments)
    .map(normalizeAssessment)
    .slice(0, safeLimits.maxCompletedAssessments);
  const completedAssessmentIds = new Set(assessments.map((assessment) => assessment.id).filter(Boolean));
  const hasCompletedSource = (sourceAssessmentId?: string) =>
    !sourceAssessmentId || completedAssessmentIds.size === 0 || completedAssessmentIds.has(sourceAssessmentId);
  const hasCompletedSources = (sourceAssessmentIds?: string[]) =>
    !sourceAssessmentIds?.length || completedAssessmentIds.size === 0 || sourceAssessmentIds.some((id) => completedAssessmentIds.has(id));
  const overallScore =
    data.overallScore === undefined
      ? assessments.length
        ? Math.round(assessments.reduce((sum, assessment) => sum + scorePercent(assessment.score, assessment.maxScore), 0) / assessments.length)
        : undefined
      : clampScore(data.overallScore);

  return {
    ...data,
    overallScore,
    assessments,
    competencies: data.competencies
      ?.filter((competency) => hasCompletedSources(competency.sourceAssessmentIds))
      .map(normalizeCompetency)
      .slice(0, safeLimits.maxCompetencies),
    radarChart: data.radarChart
      ?.filter((point) => hasCompletedSource(point.sourceAssessmentId))
      .map(normalizeChartPoint)
      .slice(0, safeLimits.maxChartPoints),
    barChart: data.barChart
      ?.filter((point) => hasCompletedSource(point.sourceAssessmentId))
      .map(normalizeChartPoint)
      .slice(0, safeLimits.maxChartPoints),
    strengths: data.strengths?.filter(Boolean).slice(0, safeLimits.maxStrengths),
    developmentAreas: data.developmentAreas?.filter(Boolean).slice(0, safeLimits.maxDevelopmentAreas),
    interviewQuestions: data.interviewQuestions?.filter((item) => item.question.trim()).slice(0, safeLimits.maxInterviewQuestions),
    benchmarkComparison: data.benchmarkComparison
      ?.filter(hasBenchmarkEvidence)
      .map(normalizeBenchmark)
      .slice(0, safeLimits.maxBenchmarks),
  };
}

export function estimateEnterpriseReportComplexity(data: EnterpriseReportData): number {
  return (
    data.assessments.length * 4 +
    (data.competencies?.length ?? 0) * 2 +
    (data.radarChart?.length ?? 0) +
    (data.barChart?.length ?? 0) +
    (data.strengths?.length ?? 0) +
    (data.developmentAreas?.length ?? 0) +
    (data.interviewQuestions?.length ?? 0) * 2 +
    (data.benchmarkComparison?.length ?? 0) * 2
  );
}

export function assertBufferRenderSafe(data: EnterpriseReportData, options: EnterpriseReportRenderOptions = {}): void {
  const safeLimits = limits(options);
  if (safeLimits.allowLargeBufferRender) return;

  const complexity = estimateEnterpriseReportComplexity(data);
  if (complexity > safeLimits.maxBufferComplexity) {
    throw new Error(
      `PDF report is too large for buffer rendering (${complexity}). Use renderEnterpriseReportToStream or allowLargeBufferRender explicitly.`,
    );
  }
}
