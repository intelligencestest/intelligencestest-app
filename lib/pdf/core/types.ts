export type BasePdfLocale = "en" | "es";
export type PdfLocale = BasePdfLocale | (string & {});
export type PdfDirection = "ltr" | "rtl";
export type PdfThemeMode = "light" | "dark";
export type ScoreTone = "high" | "medium" | "low" | "neutral";
export type ConfidenceLevel = "high" | "moderate" | "low";

export interface PdfFontSource {
  family: string;
  regular?: string;
  medium?: string;
  semibold?: string;
  bold?: string;
}

export interface PdfThemeInput {
  mode?: PdfThemeMode;
  direction?: PdfDirection;
  fontFamily?: string;
  brandName?: string;
  footerBrandName?: string;
  logoUrl?: string;
  coverLogoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  pageBackground?: string;
  cardBackground?: string;
  textColor?: string;
  mutedTextColor?: string;
}

export interface PdfTheme {
  mode: PdfThemeMode;
  direction: PdfDirection;
  fontFamily: string;
  brandName: string;
  footerBrandName: string;
  logoUrl?: string;
  coverLogoUrl?: string;
  page: {
    background: string;
    foreground: string;
    muted: string;
    subtle: string;
  };
  surface: {
    card: string;
    cardMuted: string;
    inverse: string;
  };
  border: {
    default: string;
    strong: string;
  };
  brand: {
    primary: string;
    accent: string;
  };
  score: {
    high: string;
    medium: string;
    low: string;
    neutral: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pageX: number;
    pageTop: number;
    pageBottom: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
}

export interface ReportMeta {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  keywords?: string[];
  generatedAt?: string;
  confidentialityLabel?: string;
  accessibilitySummary?: string;
}

export interface CandidateInfo {
  id?: string;
  name: string;
  email?: string;
  role?: string;
  location?: string;
  completedAt?: string;
}

export interface CompanyInfo {
  name: string;
  logoUrl?: string;
  industry?: string;
  recruiterName?: string;
  recruiterEmail?: string;
}

export interface AssessmentDimensionScore {
  id?: string;
  label: string;
  score: number;
  maxScore?: number;
  tone?: ScoreTone;
  description?: string;
}

export interface CompletedAssessmentResult {
  id?: string;
  name: string;
  category?: string;
  score: number;
  maxScore?: number;
  completedAt?: string;
  confidence?: ConfidenceLevel;
  dimensions?: AssessmentDimensionScore[];
  status?: "completed" | "incomplete" | "assigned";
}

export interface CompetencyScore {
  id?: string;
  label: string;
  score: number;
  maxScore?: number;
  tone?: ScoreTone;
  category?: string;
  description?: string;
  evidence?: string;
  sourceAssessmentIds?: string[];
}

export interface ChartPoint {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  sourceAssessmentId?: string;
}

export interface ExecutiveSummaryContent {
  headline: string;
  summary: string;
  evidence?: string[];
  confidence?: ConfidenceLevel;
}

export interface HiringRecommendationContent {
  level: "strong" | "proceed" | "review" | "caution" | "notRecommended";
  title: string;
  rationale: string;
  confidence?: ConfidenceLevel;
  nextSteps?: string[];
}

export interface BenchmarkComparisonItem {
  label: string;
  candidateScore: number;
  benchmarkScore?: number;
  percentile?: number;
  source?: string;
  note?: string;
}

export interface InterviewQuestion {
  question: string;
  competency?: string;
  reason?: string;
}

export interface ReportSectionVisibility {
  cover?: boolean;
  candidateInfo?: boolean;
  companyInfo?: boolean;
  executiveSummary?: boolean;
  overallScore?: boolean;
  competencies?: boolean;
  radarChart?: boolean;
  barChart?: boolean;
  strengths?: boolean;
  developmentAreas?: boolean;
  hiringRecommendation?: boolean;
  interviewQuestions?: boolean;
  benchmarkComparison?: boolean;
}

export interface EnterpriseReportData {
  locale?: PdfLocale;
  direction?: PdfDirection;
  theme?: PdfThemeInput;
  fonts?: PdfFontSource[];
  meta?: ReportMeta;
  candidate: CandidateInfo;
  company: CompanyInfo;
  assessments: CompletedAssessmentResult[];
  overallScore?: number;
  overallScoreLabel?: string;
  executiveSummary?: ExecutiveSummaryContent;
  competencies?: CompetencyScore[];
  radarChart?: ChartPoint[];
  barChart?: ChartPoint[];
  strengths?: string[];
  developmentAreas?: string[];
  hiringRecommendation?: HiringRecommendationContent;
  interviewQuestions?: InterviewQuestion[];
  benchmarkComparison?: BenchmarkComparisonItem[];
  sections?: ReportSectionVisibility;
}

export interface EnterpriseReportRenderOptions {
  maxCompletedAssessments?: number;
  maxCompetencies?: number;
  maxChartPoints?: number;
  maxStrengths?: number;
  maxDevelopmentAreas?: number;
  maxInterviewQuestions?: number;
  maxBenchmarks?: number;
  maxBufferComplexity?: number;
  allowLargeBufferRender?: boolean;
}
