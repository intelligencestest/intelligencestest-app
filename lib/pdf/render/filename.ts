import type { CandidateInfo, CompanyInfo } from "../core/types";

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function enterpriseReportFilename(candidate: CandidateInfo, company: CompanyInfo): string {
  const candidateName = slug(candidate.name || "candidate");
  const companyName = slug(company.name || "company");
  return `${companyName}-${candidateName}-assessment-report.pdf`;
}
