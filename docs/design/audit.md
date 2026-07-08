# Design System Audit — existing screens vs. docs/design/design-system.md

Snapshot taken right after the Billing rebuild (the reference implementation).
This identifies violations; it does not fix them — each item below is a
candidate for a future redesign pass, sequenced by how badly it hurts the
"enterprise hiring intelligence" impression.

## Already fixed platform-wide

**`.enterprise-card` (globals.css) carried a decorative drop-shadow and a
solid-gray border on every static, in-flow card across the app** —
dashboard, candidates, settings, reports all inherited it. Shadows are
reserved for real elevation (dropdowns, modals, popovers) per the shadow
philosophy; a static card gets a border or nothing. Fixed at the token
level: the class now uses a hairline (`--it-hairline`, white/8%) border and
no shadow. This alone improves every screen listed below without touching
their markup.

## Compliant already — no action needed

- **`app/(dashboard)/dashboard/page.tsx`** — typographic facts, correct
  hairline-divider patterns. Reference-quality alongside Billing.
- **`components/dashboard/ProjectHealthCard.tsx`** — facts stated as text,
  not boxed.
- **`components/dashboard/ActionCenter.tsx`** — hairline-divider rows, no
  extra boxing.
- **`components/dashboard/QueueSection.tsx`** — same pattern, compliant.
- **`components/dashboard/WorkloadTiles.tsx`** — 4 stats share one card
  divided by hairlines, not 4 separate boxes. This is the correct pattern
  and worth reusing elsewhere.
- **`app/(dashboard)/candidates/[id]/page.tsx`** — stats are typographic,
  not boxed. Minor only.

## Violations, ranked by severity

### 1. Candidate executive report (`candidates/[id]/report/page.tsx`) — worst offender
- `SectionShell` stamps a numbered micro-label ("01"–"06") on all six
  sections. The system allows **one** micro-label per page as a section
  kicker — this page uses it as a per-section ornament, six times.
- Box-per-fact throughout: strengths, development areas, limitations,
  executive-summary evidence bullets, methodology notes, confidence/coverage
  figures — each single sentence or number gets its own bordered container.
- This is the highest-visibility page in the product (the actual deliverable
  a customer pays for) and currently reads the most like "internal tooling"
  of anything audited. Recommend this is the next page after Billing.

### 2. Assessments (`AssessmentsClient.tsx`)
- A full rainbow `categoryTones` map — blue, pink, indigo, emerald, orange,
  cyan, violet, amber, green, sky, teal, yellow — used decoratively per
  assessment category. Direct violation of "one accent, never decorative,"
  and it still carries a violet/purple in the same family we just retired
  from Billing.
- Box-per-fact: duration/question-count tile pairs repeated on every
  assessment card and again in the page header.
- Decorative colored icon badges per card (not functional wayfinding).
- Hardcoded legacy hex palette (`#1E2240`, `#0D1020`, `#1D4ED8`) instead of
  `--it-*` tokens — a second, inconsistent "blue" living next to the real one.

### 3. Projects (`ProjectsClient.tsx`)
- Same legacy hardcoded hex palette as Assessments — pre-dates the `--it-*`
  token system entirely.
- `premium-card`/`premium-card-hover` — heavier decorative shadow and a
  glow-on-hover effect, on static cards.
- A progress-bar fill and the primary button both use a glowing
  `box-shadow` for decoration, not elevation.
- Box-per-fact: Candidates/Completed shown as a 2-tile bordered grid per
  project card, each tile with a decorative icon.

### 4. Candidates list (`CandidatesClient.tsx`)
- "Status stats" row: 3 separate card tiles, each wrapping one label + one
  count — textbook box-per-fact.
- Decorative multi-color avatar palette includes `violet-500` — off-brand,
  purely for flair.
- An eyebrow pill with a pulsing dot ("Candidate roster") — decorative
  motion + a micro-label used as a page ornament rather than a section
  kicker. The same template repeats near-identically on Projects and
  Assessments — a sign it was copy-pasted as a "premium" cue rather than
  composed per page.

### 5. Settings — Account / Security / Company (`settings/page.tsx`, `security/page.tsx`, `company/page.tsx`)
- Surface-on-surface nesting: an `enterprise-panel` (profile avatar block,
  logo-preview block, icon-in-circle) sitting inside an `enterprise-card`.
  The system allows exactly two surface levels — this is three.
- Security page's KeyRound/Mail icons-in-circles are decorative, not
  functional wayfinding.

### 6. Settings — Team / Integrations empty states
- Both center their empty state inside a boxed card with a decorative icon
  circle. The system's empty-state rule is one calm left-aligned sentence,
  no illustration, not centered in a box. Smallest fix on this list —
  worth doing opportunistically.

## Suggested sequencing

Highest customer-facing impact first: **candidate report → dashboard is
already fine, skip → candidates list → assessments/projects (same legacy
palette, worth doing together) → settings empty states (quick, low-risk)**.
Each should get the same treatment as Billing: read the page, name the
violations against this doc, propose the typographic restructure, confirm,
then implement with a typecheck/lint/build gate before commit.
