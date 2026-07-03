import { renderToBuffer, renderToStream } from "@react-pdf/renderer";
import { EnterpriseAssessmentReport } from "../templates/EnterpriseAssessmentReport";
import type { EnterpriseReportData, EnterpriseReportRenderOptions } from "../core/types";
import { assertBufferRenderSafe, normalizeEnterpriseReportData } from "../core/normalize";
import { registerEnterprisePdfFonts } from "../core/fonts";

export function createEnterpriseReportElement(data: EnterpriseReportData, options: EnterpriseReportRenderOptions = {}) {
  registerEnterprisePdfFonts(data.fonts);
  return <EnterpriseAssessmentReport data={normalizeEnterpriseReportData(data, options)} />;
}

export async function renderEnterpriseReportToBuffer(
  data: EnterpriseReportData,
  options: EnterpriseReportRenderOptions = {},
): Promise<Buffer> {
  const normalizedData = normalizeEnterpriseReportData(data, options);
  assertBufferRenderSafe(normalizedData, options);
  registerEnterprisePdfFonts(data.fonts);
  return renderToBuffer(<EnterpriseAssessmentReport data={normalizedData} />);
}

export async function renderEnterpriseReportToStream(
  data: EnterpriseReportData,
  options: EnterpriseReportRenderOptions = {},
): Promise<NodeJS.ReadableStream> {
  const normalizedData = normalizeEnterpriseReportData(data, options);
  registerEnterprisePdfFonts(data.fonts);
  return renderToStream(<EnterpriseAssessmentReport data={normalizedData} />);
}
