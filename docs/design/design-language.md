# The IntelligencesTest Design Language — "Graphite & Ivory"

This document defines the product's visual identity. It supersedes the
palette section of `design-system.md`; every other rule there (spacing,
borders, cards, tables, density) remains in force and is restated here where
it interacts with the new language.

## Why a language, not a theme

IntelligencesTest sells judgment: evidence an HR Director trusts enough to
hire on. The interface must read like the tool of a serious practice — a
document you'd sign, not a dashboard you'd demo. Three decisions carry that:

1. **Temperature.** Cool blue-black is the default tint of every generated
   React dashboard. We move the entire neutral scale to **warm graphite** —
   gray with a faint paper warmth — and set text in **soft ivory**, not
   white. The product stops looking like software about software and starts
   looking like print.
2. **Voice.** UI text is Geist (quiet, technical). But the moments where the
   product *speaks* — the morning brief, the report verdict — are set in an
   editorial serif. That register shift is the personality: an analyst's
   memo inside an instrument panel.
3. **Structure.** The chrome reads as an operating system: navigation is
   grouped into named areas of work, not a flat list of pages.

## 1. Color philosophy

Neutrals do 95% of the work; hue is reserved for meaning.

### Neutral ramp (warm graphite)

| Token | Value | Role |
|---|---|---|
| `--it-sidebar` | `#131211` | Chrome — deepest tone |
| `--it-bg` | `#171614` | Page |
| `--it-surface` | `#1D1C19` | Card / input |
| `--it-surface-raised` | `#232220` | Popover / hover |
| `--it-border` | `#302E29` | Strong border (controls) |
| `--it-hairline` | `rgba(242,239,230,0.08)` | Default border |

### Ink ramp (soft ivory)

| Token | Value | Role |
|---|---|---|
| `--it-text` | `#F1EEE6` | Primary ink |
| `--it-muted` | `#A8A497` | Secondary |
| `--it-faint` | `#787468` | Tertiary / labels |

Tailwind's `white` and `slate-*` utilities are **redefined at the theme
level** to this warm scale, so the language holds everywhere by default —
a hardcoded `text-slate-300` can no longer break temperature.

### Accent

One accent: **ink indigo** `#50618F` (hover `#5C6EA0`, tint `#A6B2CF`).
Desaturated enough to never read "bright blue dashboard"; present enough to
mark the one interactive emphasis per screen. Used for: primary buttons, the
selected state, focus rings. Never decorative.

### Status

Four semantics only, all muted and warmed: success sage `#4F8467`, warning
ochre `#A8873D`, danger clay `#A65B50`, info slate `#6E7F94`. They mean real
state — never emphasis, never decoration.

## 2. Typography philosophy

Two registers:

- **Instrument** (Geist Sans): all UI. Weight is binary — 600 leads, 400
  follows. Sizes per the closed scale in `design-system.md`.
- **Editorial** (`.font-editorial`, ui-serif/Georgia): reserved for the
  product's voice — the dashboard greeting, and the executive report's
  verdict + key message (headline and pull-quote of one document). One
  editorial *moment* per screen. It is the signature; overuse kills it.

Numbers are always `tabular-nums`. Tracking tightens as size grows
(−0.015em at 32px+).

## 3. Spacing & grid philosophy

Base-4 scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. One content container:
**1200px**, centered, `p-6 lg:p-8` shell padding. Two-column work screens
split ~2:1 with a 300px minimum rail. Section rhythm within a page: 32–48px
between major zones; whitespace is the structural material, never boxes.

## 4. Surface philosophy

Two levels in flow: page and one raised surface. Elevation above the page
(menus, modals) may shadow; nothing in-flow ever does. Micro-contrast over
borders: adjacent zones separate by one ramp step before they earn a
hairline.

## 5. Sidebar philosophy

The sidebar is the OS chrome: deepest tone, hairline seam, 256px. Navigation
is **grouped into named areas** — Overview (dashboard, inbox), Pipeline
(projects, candidates, assessments), Insight (reports), and Workspace
(settings) — with 10px uppercase kickers. Active state is a quiet ivory
fill, not a colored rail. Collapsed, groups separate with hairlines.

## 6. Card philosophy

A card = a discrete unit the user acts on. Hairline border, `rounded-xl`,
24px padding, no shadow, no min-heights. Facts never get boxes; headings and
spacing group them.

## 7. Table philosophy

Tables are typography: hairline rows, no vertical rules, muted uppercase
micro-label headers, hover = one ramp-step tint. Density target ~48–56px per
row; the scannable signal (status, next action) aligns to one edge.

## 8. Icon philosophy

lucide, 1.75–1.8 stroke, functional wayfinding only (nav, status, actions).
No icon-in-tinted-circle decorations, no icon per stat.

## 9. Motion philosophy

None on load. 120–180ms ease on hover/state. Nothing moves that the user
didn't cause.

## 10. Status-color philosophy

A status hue appears exactly once per row/card — on the dot or the text,
never both plus a ring plus a fill. Cleared/zero states render in faint ink,
not green: the absence of work is calm, not a celebration.

## 11. Empty-state philosophy

One calm sentence in muted ink, left-aligned, optionally one action. No
illustrations, no centered poster boxes.

## 12. Loading philosophy

Every screen has a skeleton that mirrors its real layout exactly (no jump on
stream-in), built from `--it-border` / `--it-border-soft` pulses. Spinners
only inside buttons.

## 13. What is rejected, permanently

Entrance animations · gradient hover reveals · color-coded quick actions ·
score rings and gauges as decoration · icon badges per card · neon, AI
purple, bright dashboard blue · more than one accent · shadows on in-flow
cards · centered poster empty states.

---

**Test for every future screen:** would this hold up printed on paper as a
consulting deliverable? Graphite paper, ivory ink, one indigo signature,
a serif where the product renders a verdict. If an element wouldn't survive
print, it's decoration — remove it.
