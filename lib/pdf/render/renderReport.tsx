import { renderToBuffer, renderToStream } from "@react-pdf/renderer";
import { EnterpriseAssessmentReport } from "../templates/EnterpriseAssessmentReport";
import type { EnterpriseReportData } from "../core/types";

export function createEnterpriseReportElement(data: EnterpriseReportData) {
  return <EnterpriseAssessmentReport data={data} />;
}

export async function renderEnterpriseReportToBuffer(data: EnterpriseReportData): Promise<Buffer> {
  return renderToBuffer(createEnterpriseReportElement(data));
}

export async function renderEnterpriseReportToStream(data: EnterpriseReportData): Promise<NodeJS.ReadableStream> {
  return renderToStream(createEnterpriseReportElement(data));
}
