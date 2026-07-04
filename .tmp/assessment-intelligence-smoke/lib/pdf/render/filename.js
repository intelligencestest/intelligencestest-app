"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterpriseReportFilename = enterpriseReportFilename;
function slug(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}
function enterpriseReportFilename(candidate, company) {
    const candidateName = slug(candidate.name || "candidate");
    const companyName = slug(company.name || "company");
    return `${companyName}-${candidateName}-assessment-report.pdf`;
}
