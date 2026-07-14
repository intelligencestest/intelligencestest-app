import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { AgencyBriefData, AgencyBriefCandidate } from "./types";

// Deliberately its own palette, not the internal report's locked EDITORIAL
// theme — this document needs to read as the agency's, not IntelligencesTest's.
// White page, navy/charcoal ink, one hairline gray. No score colors, no
// tier-colored badges — recommendation is carried by text and a thin navy
// marker bar, not a red/amber/green dashboard chip.
const COLOR = {
  navy: "#14213D",
  charcoal: "#2B2F38",
  slate: "#6B7280",
  faint: "#9CA3AF",
  hairline: "#E4E4E7",
  paper: "#FFFFFF",
  boxBg: "#FAFAFA",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.paper,
    color: COLOR.charcoal,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    paddingTop: 48,
    paddingBottom: 44,
    paddingHorizontal: 50,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  agencyLogo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  agencyIdentity: {
    flexDirection: "row",
    alignItems: "center",
  },
  agencyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
  },
  dateText: {
    fontSize: 9,
    color: COLOR.slate,
  },
  hairline: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: COLOR.slate,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  metaBlock: {
    marginRight: 32,
  },
  metaLabel: {
    fontSize: 7.5,
    color: COLOR.faint,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10.5,
    color: COLOR.navy,
    fontFamily: "Helvetica-Bold",
  },
  noteBox: {
    borderLeftWidth: 2,
    borderLeftColor: COLOR.hairline,
    paddingLeft: 12,
    marginBottom: 22,
  },
  noteText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: COLOR.charcoal,
  },
  snapshotRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    paddingVertical: 12,
    marginBottom: 22,
  },
  snapshotCell: {
    flex: 1,
  },
  snapshotValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 2,
  },
  snapshotLabel: {
    fontSize: 7.5,
    color: COLOR.slate,
    lineHeight: 1.3,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 12,
  },
  table: {
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.navy,
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: COLOR.charcoal,
  },
  colCandidate: { width: "16%", paddingRight: 6 },
  colRecommendation: { width: "24%", paddingRight: 6 },
  colRoleFit: { width: "12%", paddingRight: 6 },
  colStrengths: { width: "26%", paddingRight: 6 },
  colVerify: { width: "22%" },
  candidateNameCell: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: COLOR.slate,
  },
  footerBrand: {
    fontSize: 6.5,
    color: COLOR.faint,
  },
  // --- Candidate detail cards (page 2) ---
  candidateCard: {
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 2,
  },
  candidateCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  candidateCardName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
  },
  recommendationTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  recommendationMarker: {
    width: 3,
    height: 10,
    backgroundColor: COLOR.navy,
    marginRight: 6,
  },
  recommendationText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
  },
  candidateMetaRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  candidateMetaItem: {
    marginRight: 24,
  },
  candidateMetaLabel: {
    fontSize: 7,
    color: COLOR.faint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  candidateMetaValue: {
    fontSize: 8.5,
    color: COLOR.charcoal,
  },
  candidateSummary: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLOR.charcoal,
    marginBottom: 8,
  },
  candidateSubBlock: {
    marginBottom: 6,
  },
  candidateSubLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    fontSize: 8.5,
    color: COLOR.faint,
    marginRight: 5,
  },
  bulletText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: COLOR.charcoal,
    flex: 1,
  },
  // --- Interview focus page (page 3) ---
  interviewCard: {
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    paddingTop: 10,
    paddingBottom: 10,
  },
  interviewCardName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 4,
  },
  interviewQuestion: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLOR.charcoal,
    marginBottom: 4,
  },
  scorecardText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: COLOR.slate,
  },
  disclaimerBox: {
    backgroundColor: COLOR.boxBg,
    borderWidth: 1,
    borderColor: COLOR.hairline,
    padding: 14,
    marginTop: 20,
  },
  disclaimerLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: COLOR.slate,
  },
});

function AgencyHeader({ data }: { data: AgencyBriefData }) {
  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.agencyIdentity}>
          {data.agencyLogoUrl ? <Image src={data.agencyLogoUrl} style={styles.agencyLogo} /> : null}
          <Text style={styles.agencyName}>{data.agencyName}</Text>
        </View>
        <Text style={styles.dateText}>{data.date}</Text>
      </View>
      <View style={styles.hairline} />
    </View>
  );
}

function Footer({ preparedBy }: { preparedBy: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Prepared by {preparedBy}</Text>
      <Text style={styles.footerBrand}>Generated with IntelligencesTest</Text>
    </View>
  );
}

function SnapshotStat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.snapshotCell}>
      <Text style={styles.snapshotValue}>{value}</Text>
      <Text style={styles.snapshotLabel}>{label}</Text>
    </View>
  );
}

function ShortlistTableRow({ candidate }: { candidate: AgencyBriefCandidate }) {
  return (
    <View style={styles.tableRow} wrap={false}>
      <View style={styles.colCandidate}>
        <Text style={styles.candidateNameCell}>{candidate.name}</Text>
      </View>
      <View style={styles.colRecommendation}>
        <Text style={styles.tableCell}>{candidate.recommendation}</Text>
      </View>
      <View style={styles.colRoleFit}>
        <Text style={styles.tableCell}>{candidate.roleFit}</Text>
      </View>
      <View style={styles.colStrengths}>
        <Text style={styles.tableCell}>{candidate.strengths.join(", ")}</Text>
      </View>
      <View style={styles.colVerify}>
        <Text style={styles.tableCell}>{candidate.pointsToVerify.join("; ")}</Text>
      </View>
    </View>
  );
}

function ExecutiveSummaryPage({ data }: { data: AgencyBriefData }) {
  const { snapshot } = data;
  return (
    <Page size="A4" style={styles.page} wrap>
      <AgencyHeader data={data} />

      <Text style={styles.title}>Client Shortlist Brief</Text>
      <Text style={styles.subtitle}>Structured recommendation summary for recruitment decision support</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Role</Text>
          <Text style={styles.metaValue}>{data.roleTitle}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Shortlist</Text>
          <Text style={styles.metaValue}>{data.shortlistName}</Text>
        </View>
        {data.showClientName && data.clientName ? (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Client</Text>
            <Text style={styles.metaValue}>{data.clientName}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          This brief summarizes the structured assessment evidence for the shortlisted candidates. It is intended to
          support interview prioritization and client discussion. Final decisions remain subject to human review.
        </Text>
      </View>

      <View style={styles.snapshotRow}>
        <SnapshotStat value={snapshot.totalCandidates} label="Total candidates" />
        <SnapshotStat value={snapshot.completedAssessments} label="Completed assessments" />
        <SnapshotStat value={snapshot.recommendedForInterview} label="Recommended for client interview" />
        <SnapshotStat value={snapshot.requiresVerification} label="Requires verification" />
        <SnapshotStat value={snapshot.incompleteEvidence} label="Incomplete evidence" />
      </View>

      <Text style={styles.sectionTitle}>Shortlist Overview</Text>
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colCandidate]}>Candidate</Text>
          <Text style={[styles.tableHeaderCell, styles.colRecommendation]}>Recommendation</Text>
          <Text style={[styles.tableHeaderCell, styles.colRoleFit]}>Role Fit</Text>
          <Text style={[styles.tableHeaderCell, styles.colStrengths]}>Key Strengths</Text>
          <Text style={[styles.tableHeaderCell, styles.colVerify]}>Points to Verify</Text>
        </View>
        {data.candidates.map((candidate) => (
          <ShortlistTableRow key={candidate.name} candidate={candidate} />
        ))}
      </View>

      <Footer preparedBy={data.preparedBy ?? data.agencyName} />
    </Page>
  );
}

function CandidateDetailCard({ candidate }: { candidate: AgencyBriefCandidate }) {
  return (
    <View style={styles.candidateCard} wrap={false}>
      <View style={styles.candidateCardHeader}>
        <Text style={styles.candidateCardName}>{candidate.name}</Text>
        <View style={styles.recommendationTag}>
          <View style={styles.recommendationMarker} />
          <Text style={styles.recommendationText}>{candidate.recommendation}</Text>
        </View>
      </View>

      <View style={styles.candidateMetaRow}>
        <View style={styles.candidateMetaItem}>
          <Text style={styles.candidateMetaLabel}>Role Fit</Text>
          <Text style={styles.candidateMetaValue}>{candidate.roleFit}</Text>
        </View>
        <View style={styles.candidateMetaItem}>
          <Text style={styles.candidateMetaLabel}>Confidence</Text>
          <Text style={styles.candidateMetaValue}>{candidate.confidence}</Text>
        </View>
      </View>

      <Text style={styles.candidateSummary}>{candidate.summary}</Text>

      <View style={styles.candidateSubBlock}>
        <Text style={styles.candidateSubLabel}>Role-Relevant Strengths</Text>
        {candidate.strengths.map((strength) => (
          <View key={strength} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>—</Text>
            <Text style={styles.bulletText}>{strength}</Text>
          </View>
        ))}
      </View>

      <View style={styles.candidateSubBlock}>
        <Text style={styles.candidateSubLabel}>Points to Verify</Text>
        {candidate.pointsToVerify.map((point) => (
          <View key={point} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>—</Text>
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CandidateDetailPage({ data }: { data: AgencyBriefData }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <AgencyHeader data={data} />
      <Text style={styles.sectionTitle}>Candidate Recommendation Details</Text>
      {data.candidates.map((candidate) => (
        <CandidateDetailCard key={candidate.name} candidate={candidate} />
      ))}
      <Footer preparedBy={data.preparedBy ?? data.agencyName} />
    </Page>
  );
}

function InterviewFocusPage({ data }: { data: AgencyBriefData }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <AgencyHeader data={data} />
      <Text style={styles.sectionTitle}>Interview Focus &amp; Review Notes</Text>

      {data.candidates.map((candidate) => (
        <View key={candidate.name} style={styles.interviewCard} wrap={false}>
          <Text style={styles.interviewCardName}>{candidate.name}</Text>
          <Text style={styles.interviewQuestion}>{candidate.interviewFocus}</Text>
          <Text style={styles.scorecardText}>
            Scorecard guidance: rate each response against role-specific criteria (1–5). Weight concrete, specific
            examples over general statements.
          </Text>
        </View>
      ))}

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerLabel}>Human Review Note</Text>
        <Text style={styles.disclaimerText}>
          This brief is designed to support the recruitment process. It does not replace professional judgment and
          does not constitute an automatic hiring decision. Recommendations should be reviewed alongside interview
          outcomes, role requirements, and the agency&apos;s professional assessment.
        </Text>
      </View>

      <Footer preparedBy={data.preparedBy ?? data.agencyName} />
    </Page>
  );
}

export function ClientShortlistBrief({ data }: { data: AgencyBriefData }) {
  return (
    <Document title={`${data.shortlistName} — Client Shortlist Brief`} author={data.agencyName}>
      <ExecutiveSummaryPage data={data} />
      <CandidateDetailPage data={data} />
      <InterviewFocusPage data={data} />
    </Document>
  );
}
