import { renderToBuffer } from "@react-pdf/renderer";
import { ClientShortlistBrief } from "./ClientShortlistBrief";
import type { AgencyBriefData } from "./types";

export async function renderClientShortlistBriefToBuffer(data: AgencyBriefData): Promise<Buffer> {
  return renderToBuffer(ClientShortlistBrief({ data }));
}
