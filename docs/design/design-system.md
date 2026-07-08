# IntelligencesTest Design System

This is the reference for every screen in the product — dashboard, candidates,
reports, projects, assessments, inbox, settings, company pages, admin console,
onboarding. It exists so any screen, old or new, can be checked against a
single standard instead of reinvented per page.

## Positioning → design behavior

The product's positioning is: **Enterprise hiring intelligence. Evidence.
Trust. Executive decisions. Calm. Editorial. Minimal. Premium.** Those words
only matter if they change what we build. Here's the translation:

- **Evidence** → data is presented precisely — exact figures, tabular
  numerals — with nothing decorative competing with it. The number is the
  design; it doesn't need a frame around it to matter.
- **Trust** → restrained and consistent, never flashy. One muted accent
  color, used the same way everywhere, forever.
- **Executive decisions** → low information density, one obvious next
  action per screen. Executives scan; they don't study.
- **Calm** → whitespace is the primary structural material. No motion on
  load, no shadow-heavy elevation, no visual noise competing for attention.
- **Editorial** → typographic hierarchy does the work containers used to
  do. A well-set heading replaces a card.
- **Minimal / Premium** → the tie-breaker rule below.

## The tie-breaker rule

**Whenever unsure between adding a visual element or removing one, remove
it.** The interface communicates primarily through typography, spacing, and
hierarchy — not containers. If a border, a card, a background tint, or an
icon isn't doing real work, it's noise.

---

## 1. Typography scale

A closed set. Nothing outside this list.

| Role | Size / Line-height | Weight | Usage |
|---|---|---|---|
| Display (page title) | 28px / 34px | 600 | Once per page. |
| Section heading | 18px / 26px | 600 | Sparingly — one per major section, not per card. |
| Body | 14px / 22px | 400 | Default text. |
| Small / metadata | 13px / 20px | 400, muted | Secondary facts, timestamps, dot-separated status lines. |
| Micro label | 11px / 16px | 600, uppercase, tracking 0.08em, faint | At most once per page as a section kicker. Never stamped on every card. |
| Numerals (prices, stats, counts) | contextual | 600, tabular-nums | Sized to importance — the one hero number on a page is allowed to be large (28–32px); everything else stays at body/small size. |

Weight is binary: 600 to lead the eye, 400 for everything else. No bold
(700+) anywhere — it reads as shouting, not confidence.

## 2. Spacing scale

Base unit 4px. Canonical steps only: **4, 8, 12, 16, 24, 32, 48, 64.** No
arbitrary halves (`py-3.5`, `gap-2.5`) — round to the nearest step.

- Icon-to-label, inline gaps: 8
- Label-to-value within one fact: 4–8
- Between related elements inside a block: 16
- Between distinct blocks within a section: 24
- Between major page sections: 48
- Page margins: 32–48 depending on viewport

## 3. Border philosophy

Borders are a last resort, applied in this order of preference:
**whitespace > a single hairline divider > a bordered container.**

- When used: 1px, `white/8%` (never a solid gray).
- Never double up a border and a background tint on the same element.
- A border is earned by content that is either (a) genuinely tabular data,
  or (b) a discrete unit the user selects or acts on (a plan card, a
  candidate card). A border is never used just to mark "this is a section."

## 4. Surface philosophy

Two surface levels exist, full stop: the page background (`--it-bg`) and one
raised surface (`--it-surface`) for interactive/selectable units — a card,
a modal, an input. No surface-on-surface-on-surface nesting (a bordered box
inside a bordered box inside a card). If content needs to feel grouped but
isn't a selectable unit, use a heading and spacing — not a background tint.

## 5. Accent color philosophy

**One accent, everywhere: the existing deep blue (`--it-primary`).** Not
purple — see the note above this doc in-conversation for why. Rules:

- Used for: the primary action button, and the single most important state
  indicator on a screen (the plan you're on, the item you selected).
- Never decorative. No accent-colored icons "for flair," no gradients, no
  more than one element carrying accent emphasis per screen.
- If in doubt, use ink (white → slate-300 → slate-500), not accent.

## 6. Shadow philosophy

Shadows exist for exactly one job: real elevation — something floating
above the page (a dropdown, modal, popover, toast). A static card sitting
in the page flow gets a border or nothing, never a shadow. Shadow-as-decoration
is the fastest way to make a calm interface feel busy.

## 7. Icon usage

lucide-react only, stroke-width 1.75–1.8, consistent size within a context.
Icons are functional wayfinding — navigation, status, actions — not
decorative filler next to every label. An icon earns its place only if it
measurably speeds recognition (nav items, status chips, empty states).
Settings labels, table headers, and stat labels don't need one.

## 8. Empty state style

No illustrations. One calm sentence in muted ink explaining the state,
optionally one primary action beneath it. Left-aligned, not centered in a
box. It should read like a sentence, not a poster.

## 9. Table style

Reserved for genuinely tabular data — candidate lists, admin lists — never
for decision surfaces (plans, settings, comparisons). When used:

- No vertical rules between columns, ever.
- One hairline horizontal rule between rows.
- Header row: muted uppercase micro-label, not bolded or backgrounded.
- Row hover: a faint background tint, not a border.

## 10. Card philosophy

A card is reserved for something the user selects or acts on as a discrete
unit — a plan, a candidate, a project. It is never used purely to hold "a
fact" (a status word, a single number). One hairline border, no shadow,
generous internal padding (24px+). At most one card per screen carries
accent emphasis (the current/selected one).

## 11. Button hierarchy

Exactly three levels, never more than one Primary visible at once per
section:

1. **Primary** — solid accent fill. The one next action.
2. **Secondary** — hairline border, ink text. Alternate actions.
3. **Tertiary / link** — text only, underline on hover. Low-emphasis
   actions ("Manage in PayPal").

## 12. Form layout

Label above input, 8px gap, consistent input height (40px). Helper/error
text below the field at 13px. Single column by default; two columns only
for genuinely paired short fields.

## 13. Information density

Prefer fewer, larger, well-labeled facts over many small ones. If a screen
has more than ~5–7 distinct facts competing for attention, group them under
headings or cut them — don't shrink text to make more things fit. Density
is the opposite of "calm."

## 14. Motion philosophy

Motion is a courtesy, not a feature. 120–180ms ease-out for hover/state
transitions only. No entrance animation on load for app screens (that
technique belongs to the marketing site, already used there tastefully —
the app itself should feel instantly present). Nothing that shifts layout.

## 15. Status color usage

Exactly four semantic colors, reserved and never reused for anything else:
success (green), warning (amber), danger (red), info (muted blue-gray).
They represent real state only — an actual limit reached, an actual error —
never decoration, and never used for the same job as the brand accent
(marking "current/selected").

---

## Applying this doc

When a screen is reviewed against this system, the questions are always:

1. Does every container earn its border?
2. Does every color have exactly one job?
3. Could this box become a heading and some spacing instead?
4. Is there more than one Primary button visible?
5. Would removing this element lose information, or just lose noise?

First page built against this system: **Settings → Plan and billing**
(`app/(dashboard)/settings/billing/page.tsx`). Treat it as the reference
implementation for card philosophy, accent usage, and the summary-block
pattern (typographic account summary instead of stat-tile grids).
