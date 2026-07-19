import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { AgencyBriefData, AgencyBriefCandidate, ClientPriority } from "./types";

// Deliberately its own palette, not the internal report's locked EDITORIAL
// theme — this document needs to read as the agency's, not IntelligencesTest's.
// White page, navy/charcoal ink, one hairline gray. No score colors, no
// tier-colored badges — hierarchy is carried by type weight/size and a single
// navy accent, not a red/amber/green dashboard chip.
const COLOR = {
  navy: "#14213D",
  navySoft: "#3A4A6B",
  charcoal: "#2B2F38",
  slate: "#6B7280",
  faint: "#9CA3AF",
  hairline: "#E4E4E7",
  hairlineStrong: "#C9CBD1",
  paper: "#FFFFFF",
  boxBg: "#FAFAFA",
  boxBgTint: "#F7F8FA",
};

const PRIORITY_ORDER: ClientPriority[] = ["Priority 1", "Priority 2", "Review", "Lower priority", "Incomplete"];

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLOR.paper,
    color: COLOR.charcoal,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    paddingTop: 42,
    paddingBottom: 40,
    paddingHorizontal: 52,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 14,
  },
  title: {
    fontSize: 23,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 10,
    color: COLOR.slate,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  metaBlock: {
    marginRight: 32,
  },
  metaLabel: {
    fontSize: 7.5,
    color: COLOR.faint,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10.5,
    color: COLOR.navy,
    fontFamily: "Helvetica-Bold",
  },
  noteBox: {
    borderLeftWidth: 2,
    borderLeftColor: COLOR.hairlineStrong,
    paddingLeft: 12,
    marginBottom: 14,
  },
  noteText: {
    fontSize: 9.5,
    lineHeight: 1.45,
    color: COLOR.charcoal,
  },
  snapshotRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    paddingVertical: 9,
    marginBottom: 16,
  },
  snapshotCell: {
    flex: 1,
  },
  snapshotValue: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 2,
  },
  snapshotLabel: {
    fontSize: 7.5,
    color: COLOR.slate,
    lineHeight: 1.3,
  },
  // --- Section header system ---
  sectionHeaderBlock: {
    marginBottom: 9,
  },
  sectionEyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navySoft,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 6,
  },
  sectionRule: {
    borderBottomWidth: 1.5,
    borderBottomColor: COLOR.navy,
    width: 32,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: COLOR.slate,
    marginTop: 6,
  },
  // --- Executive Recommendation box (page 1) ---
  execBox: {
    backgroundColor: COLOR.boxBgTint,
    borderWidth: 1,
    borderColor: COLOR.hairline,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.navy,
    padding: 13,
    marginBottom: 16,
  },
  execRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  execRowLast: {
    flexDirection: "row",
  },
  execLabel: {
    width: 150,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR.slate,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  execValue: {
    flex: 1,
    fontSize: 10,
    color: COLOR.navy,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.4,
  },
  execValueMuted: {
    flex: 1,
    fontSize: 9.5,
    color: COLOR.charcoal,
    lineHeight: 1.45,
  },
  // --- Shortlist table (page 1) ---
  table: {
    width: "100%",
  },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.navy,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
    paddingVertical: 6,
  },
  tableCell: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: COLOR.charcoal,
  },
  colCandidate: { width: "15%", paddingRight: 6 },
  colRecommendation: { width: "20%", paddingRight: 6 },
  colPriority: { width: "17%", paddingRight: 6 },
  colEvidence: { width: "24%", paddingRight: 6 },
  colVerify: { width: "24%" },
  candidateNameCell: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
  },
  priorityTagP1: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLOR.navy },
  priorityTagP2: { fontSize: 8, fontFamily: "Helvetica-Bold", color: COLOR.navySoft },
  priorityTagReview: { fontSize: 8, fontFamily: "Helvetica", color: COLOR.charcoal },
  priorityTagLower: { fontSize: 8, fontFamily: "Helvetica", color: COLOR.slate },
  priorityTagIncomplete: { fontSize: 8, fontFamily: "Helvetica-Oblique", color: COLOR.faint },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 52,
    right: 52,
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
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 6.5,
    color: COLOR.faint,
    marginRight: 10,
  },
  footerPage: {
    fontSize: 7,
    color: COLOR.faint,
  },
  // --- Candidate detail cards ---
  candidateCardFeatured: {
    borderTopWidth: 2,
    borderTopColor: COLOR.navy,
    paddingTop: 12,
    paddingBottom: 13,
    marginBottom: 3,
  },
  candidateCardStandard: {
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    paddingTop: 10,
    paddingBottom: 11,
    marginBottom: 2,
  },
  candidateEyebrow: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navySoft,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  candidateNameLine: {
    fontSize: 13.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 2,
  },
  candidateNameLineMuted: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal,
    marginBottom: 2,
  },
  candidateHeadline: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    marginBottom: 8,
  },
  candidateHeadlineMuted: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navySoft,
    marginBottom: 8,
  },
  candidateMetaRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairline,
  },
  candidateMetaItem: {
    marginRight: 28,
  },
  candidateMetaLabel: {
    fontSize: 7,
    color: COLOR.faint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  candidateMetaValue: {
    fontSize: 9,
    color: COLOR.charcoal,
    fontFamily: "Helvetica-Bold",
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
    marginBottom: 4,
  },
  candidateSummary: {
    fontSize: 9,
    lineHeight: 1.55,
    color: COLOR.charcoal,
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
  // --- Recommendation Matrix page ---
  matrixGroup: {
    marginBottom: 18,
  },
  matrixGroupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLOR.hairlineStrong,
    paddingBottom: 5,
    marginBottom: 9,
  },
  matrixGroupTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  matrixGroupCount: {
    fontSize: 8,
    color: COLOR.faint,
  },
  matrixRow: {
    flexDirection: "row",
    marginBottom: 7,
  },
  matrixName: {
    width: 90,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLOR.charcoal,
  },
  matrixNote: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.45,
    color: COLOR.slate,
  },
  // --- Client Interview Focus page ---
  interviewCard: {
    borderTopWidth: 1,
    borderTopColor: COLOR.hairline,
    paddingTop: 11,
    paddingBottom: 11,
  },
  interviewCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  interviewCardName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: COLOR.navy,
  },
  interviewFieldRow: {
    marginBottom: 5,
  },
  interviewFieldLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLOR.faint,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  interviewFieldValue: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: COLOR.charcoal,
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
    padding: 15,
    marginTop: 22,
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

const PRIORITY_TAG_STYLE: Record<ClientPriority, typeof styles.priorityTagP1> = {
  "Priority 1": styles.priorityTagP1,
  "Priority 2": styles.priorityTagP2,
  Review: styles.priorityTagReview,
  "Lower priority": styles.priorityTagLower,
  Incomplete: styles.priorityTagIncomplete,
};

function byPriority(candidates: AgencyBriefCandidate[], priority: ClientPriority) {
  return candidates.filter((c) => c.clientPriority === priority);
}

function joinNames(candidates: AgencyBriefCandidate[]): string {
  return candidates.map((c) => c.name).join(", ");
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeaderBlock}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

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
      <View style={styles.footerRight}>
        <Text style={styles.footerBrand}>Generated with IntelligencesTest</Text>
        <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </View>
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

function ExecutiveRecommendationBox({ data }: { data: AgencyBriefData }) {
  const primary = byPriority(data.candidates, "Priority 1");
  const secondary = byPriority(data.candidates, "Priority 2");
  const incomplete = byPriority(data.candidates, "Incomplete");
  const discussionPriorities = data.candidates
    .filter((c) => c.clientPriority === "Priority 1" || c.clientPriority === "Priority 2" || c.clientPriority === "Review")
    .map((c) => c.keyVerificationPhrase);

  return (
    <View style={styles.execBox}>
      {primary.length > 0 && (
        <View style={styles.execRow}>
          <Text style={styles.execLabel}>Primary Recommendation</Text>
          <Text style={styles.execValue}>{joinNames(primary)}</Text>
        </View>
      )}
      {secondary.length > 0 && (
        <View style={styles.execRow}>
          <Text style={styles.execLabel}>Secondary Recommendation</Text>
          <Text style={styles.execValue}>{joinNames(secondary)}</Text>
        </View>
      )}
      {discussionPriorities.length > 0 && (
        <View style={styles.execRow}>
          <Text style={styles.execLabel}>Client Discussion Priorities</Text>
          <Text style={styles.execValueMuted}>{discussionPriorities.join(", ")}</Text>
        </View>
      )}
      {incomplete.length > 0 && (
        <View style={styles.execRowLast}>
          <Text style={styles.execLabel}>Incomplete Evidence</Text>
          <Text style={styles.execValueMuted}>
            {incomplete.map((c) => `${c.name} requires completion before recommendation.`).join(" ")}
          </Text>
        </View>
      )}
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
      <View style={styles.colPriority}>
        <Text style={PRIORITY_TAG_STYLE[candidate.clientPriority]}>{candidate.clientPriority}</Text>
      </View>
      <View style={styles.colEvidence}>
        <Text style={styles.tableCell}>{candidate.strengths.slice(0, 2).join(", ")}</Text>
      </View>
      <View style={styles.colVerify}>
        <Text style={styles.tableCell}>{candidate.keyVerificationPhrase}</Text>
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
        <SnapshotStat value={snapshot.recommendedForInterview} label="Recommended for interview" />
        <SnapshotStat value={snapshot.requiresVerification} label="Requires verification" />
        <SnapshotStat value={snapshot.incompleteEvidence} label="Incomplete evidence" />
      </View>

      <SectionHeader eyebrow="Agency Recommendation" title="Executive Recommendation" />
      <ExecutiveRecommendationBox data={data} />

      <SectionHeader eyebrow="Full Shortlist" title="Shortlist Overview" />
      <View style={styles.table}>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.colCandidate]}>Candidate</Text>
          <Text style={[styles.tableHeaderCell, styles.colRecommendation]}>Recommendation</Text>
          <Text style={[styles.tableHeaderCell, styles.colPriority]}>Client Priority</Text>
          <Text style={[styles.tableHeaderCell, styles.colEvidence]}>Evidence Summary</Text>
          <Text style={[styles.tableHeaderCell, styles.colVerify]}>Verification Focus</Text>
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
  const featured = candidate.clientPriority === "Priority 1" || candidate.clientPriority === "Priority 2";
  const eyebrow = candidate.clientPriority === "Priority 1" ? "Primary Recommendation"
    : candidate.clientPriority === "Priority 2" ? "Secondary Recommendation"
    : null;

  return (
    <View style={featured ? styles.candidateCardFeatured : styles.candidateCardStandard} wrap={false}>
      {eyebrow ? <Text style={styles.candidateEyebrow}>{eyebrow}</Text> : null}
      <Text style={featured ? styles.candidateNameLine : styles.candidateNameLineMuted}>{candidate.name}</Text>
      <Text style={featured ? styles.candidateHeadline : styles.candidateHeadlineMuted}>{candidate.recommendation}</Text>

      <View style={styles.candidateMetaRow}>
        <View style={styles.candidateMetaItem}>
          <Text style={styles.candidateMetaLabel}>Client Priority</Text>
          <Text style={styles.candidateMetaValue}>{candidate.clientPriority}</Text>
        </View>
        <View style={styles.candidateMetaItem}>
          <Text style={styles.candidateMetaLabel}>Role Fit</Text>
          <Text style={styles.candidateMetaValue}>{candidate.roleFit}</Text>
        </View>
        <View style={styles.candidateMetaItem}>
          <Text style={styles.candidateMetaLabel}>Confidence</Text>
          <Text style={styles.candidateMetaValue}>{candidate.confidence}</Text>
        </View>
      </View>

      <View style={styles.candidateSubBlock}>
        <Text style={styles.candidateSubLabel}>Recommendation Rationale</Text>
        <Text style={styles.candidateSummary}>{candidate.summary}</Text>
      </View>

      <View style={styles.candidateSubBlock}>
        <Text style={styles.candidateSubLabel}>Evidence Supporting the Recommendation</Text>
        {candidate.strengths.map((strength) => (
          <View key={strength} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>—</Text>
            <Text style={styles.bulletText}>{strength}</Text>
          </View>
        ))}
      </View>

      <View style={styles.candidateSubBlock}>
        <Text style={styles.candidateSubLabel}>What to Verify with the Client / Interview</Text>
        {candidate.pointsToVerify.map((point) => (
          <View key={point} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>—</Text>
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
      </View>

      <View>
        <Text style={styles.candidateSubLabel}>Suggested Interview Focus</Text>
        <Text style={styles.candidateSummary}>{candidate.interviewFocus}</Text>
      </View>
    </View>
  );
}

function CandidateDetailPage({ data }: { data: AgencyBriefData }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <AgencyHeader data={data} />
      <SectionHeader
        eyebrow="Individual Assessment"
        title="Candidate Recommendation Details"
        subtitle="Ordered by client priority — primary recommendation first."
      />
      {data.candidates.map((candidate) => (
        <CandidateDetailCard key={candidate.name} candidate={candidate} />
      ))}
      <Footer preparedBy={data.preparedBy ?? data.agencyName} />
    </Page>
  );
}

const MATRIX_GROUP_LABEL: Record<ClientPriority, string> = {
  "Priority 1": "Recommended for Client Interview",
  "Priority 2": "Recommended with Verification",
  Review: "Keep Under Review",
  "Lower priority": "Lower Priority",
  Incomplete: "Incomplete Evidence",
};

function RecommendationMatrixPage({ data }: { data: AgencyBriefData }) {
  const groups = PRIORITY_ORDER.map((priority) => ({
    priority,
    candidates: byPriority(data.candidates, priority),
  })).filter((group) => group.candidates.length > 0);

  return (
    <Page size="A4" style={styles.page} wrap>
      <AgencyHeader data={data} />
      <SectionHeader
        eyebrow="Client Discussion"
        title="Recommendation Matrix"
        subtitle="Candidates grouped by client priority, for a fast client-facing summary."
      />
      {groups.map((group) => (
        <View key={group.priority} style={styles.matrixGroup} wrap={false}>
          <View style={styles.matrixGroupHeader}>
            <Text style={styles.matrixGroupTitle}>{MATRIX_GROUP_LABEL[group.priority]}</Text>
            <Text style={styles.matrixGroupCount}>{group.candidates.length}</Text>
          </View>
          {group.candidates.map((candidate) => (
            <View key={candidate.name} style={styles.matrixRow}>
              <Text style={styles.matrixName}>{candidate.name}</Text>
              <Text style={styles.matrixNote}>{candidate.matrixNote}</Text>
            </View>
          ))}
        </View>
      ))}
      <Footer preparedBy={data.preparedBy ?? data.agencyName} />
    </Page>
  );
}

function ClientInterviewFocusPage({ data }: { data: AgencyBriefData }) {
  return (
    <Page size="A4" style={styles.page} wrap>
      <AgencyHeader data={data} />
      <SectionHeader
        eyebrow="Interview Preparation"
        title="Client Interview Focus"
        subtitle="A structured interview plan the agency can hand to the client."
      />

      {data.candidates.map((candidate) => (
        <View key={candidate.name} style={styles.interviewCard} wrap={false}>
          <View style={styles.interviewCardHeader}>
            <Text style={styles.interviewCardName}>{candidate.name}</Text>
            <Text style={PRIORITY_TAG_STYLE[candidate.clientPriority]}>{candidate.clientPriority}</Text>
          </View>

          <View style={styles.interviewFieldRow}>
            <Text style={styles.interviewFieldLabel}>Question Focus</Text>
            <Text style={styles.interviewFieldValue}>{candidate.interviewFocus}</Text>
          </View>

          <View style={styles.interviewFieldRow}>
            <Text style={styles.interviewFieldLabel}>What the Answer Should Verify</Text>
            <Text style={styles.interviewFieldValue}>{candidate.interviewVerifies}</Text>
          </View>

          <Text style={styles.scorecardText}>
            Scorecard guidance: rate each response against role-specific criteria (1–5). Weight concrete, specific
            examples over general statements.
          </Text>
        </View>
      ))}

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerLabel}>Human Review Note</Text>
        <Text style={styles.disclaimerText}>
          This brief supports human-led recruitment decisions and should be reviewed alongside interviews, role
          requirements, and the agency&apos;s professional judgment.
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
      <RecommendationMatrixPage data={data} />
      <ClientInterviewFocusPage data={data} />
    </Document>
  );
}
