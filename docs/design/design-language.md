# The IntelligencesTest Design Language — Light Enterprise

This document defines the product's visual identity. It supersedes the
palette sections of `design-system.md` and replaces the earlier
"Graphite & Ivory" dark direction (kept in git history), which taught us the
structural rules but was rejected in browser review: HR software earns trust
in daylight. Reference register: Stripe Dashboard, Ashby, Linear, Mercury,
Notion admin, modern Microsoft 365 admin — principles, never pixels.

## The premise

The interface disappears behind the work. Calm, trustworthy, analytical,
spacious. Nothing announces itself; the recruiter's data is the only thing
with presence. Every rule below serves that.

## 1. Color

Neutrals do 95% of the work; hue appears only as the single action accent
and the four status semantics.

| Token | Value | Role |
|---|---|---|
| `--it-bg` | `#F8FAFC` | Page |
| `--it-sidebar` / `--it-surface` | `#FFFFFF` | Chrome and cards |
| `--it-hairline` | `#E5E7EB` | Default border |
| `--it-border` | `#D1D5DB` | Strong border (controls) |
| `--it-text` | `#111827` | Primary ink |
| `--it-muted` | `#6B7280` | Secondary |
| `--it-faint` | `#9CA3AF` | Tertiary / labels |
| `--it-primary` | `#4F46E5` | Primary actions ONLY (hover `#4338CA`) |
| `--it-link` | `#4338CA` | Text links |
| `--it-success/warning/danger` | `#16A34A` / `#D97706` / `#DC2626` | Real state only |
| `--it-info` | `#4A7096` | Neutral-informational state |

Banned: gradients, glows, AI purple, decorative shadows, more than one
accent, color as decoration.

**Slate is an emphasis scale, not a lightness scale.** Tailwind's `slate-*`
is remapped in `@theme`: `slate-100` = high-emphasis ink, `slate-900` =
recessed near-white — preserving the *meaning* of thousands of legacy
classes across theme changes. New code uses `--it-*` tokens, never slate.

## 2. Elevation

Exactly two levels. In-flow cards: hairline border + a 1px ambient shadow
(`0 1px 2px rgba(16,24,40,0.04)`) — the Stripe register, felt not seen.
True elevation (menus, modals, the sticky decision bar): a real but soft
shadow. Nothing else casts.

## 3. Typography

Two registers. **Instrument** (Geist): all UI; weight is binary (600/400);
page titles 30px/38px, −0.01em; numbers always `tabular-nums`.
**Editorial** (`.font-editorial`, ui-serif): the product's voice — the
dashboard greeting and the executive report's verdict + key message. One
editorial moment per screen.

Tables read as documents: hairline rows, no vertical rules, muted uppercase
micro-label headers, generous row padding (py-4/py-5), hover = 2–3% ink tint.

## 4. Space

Base-4 scale. Shell padding `p-6 sm:p-8 lg:p-12`; one 1200px container;
`space-y-8` between page zones. Whitespace is the structural material —
when a screen feels busy, remove containers before shrinking content.
Reduce visual density, never information density.

## 5. Chrome

White sidebar with a hairline seam, 256px, navigation grouped into named
areas (Overview / Pipeline / Insight / Settings) with 10px uppercase
kickers. Active item: 5% ink fill + full-ink text. The top bar is
translucent page-tone with blur. The chrome should feel like the OS the
work happens inside.

## 6. Cards, facts, and boxes

A card is a discrete unit the user acts on — never a frame around a fact.
`rounded-xl`, 24px padding, no min-heights. Facts are typography: label in
muted, value in ink, grouped by spacing and headings.

## 7. Interaction states

Hovers are ink tints (`gray-900/[0.02–0.06]`), never color washes. Focus is
a 2px `--it-primary` ring. Primary buttons: accent fill, white text, 1px
shadow. Secondary: white fill, `--it-border`, ink text. Tertiary: link
color, underline on hover. One primary action per section.

## 8. Status

A status hue appears once per row/card (dot or text, never both plus ring
plus fill). Chip text uses the dark shade of the hue (`#B45309`, `#15803D`,
`#B91C1C`) on a 6–8% tint. Zero/cleared states are faint ink, not green.

## 9. Empty, loading, motion

Empty: one calm muted sentence, left-aligned, optionally one action.
Loading: skeletons mirroring the real layout (`--it-border` /
`--it-border-soft` pulses); spinners only inside buttons. Motion: none on
load; 120–180ms ease on state changes only.

## 10. What is rejected, permanently

Entrance animations · glassmorphism · gradient reveals · glows ·
color-coded widget grids · score rings as decoration · icon-in-circle
badges · neon and AI purple · dark-mode-by-default for HR workflows ·
anything that would make an HR Director think "another React dashboard."

---

**Known exclusion:** `app/api/**` (PDF renderer) and `app/reports/print/**`
(its preview, pinned to literal colors) intentionally retain the legacy PDF
brand until a dedicated PDF refresh brings the exported document into this
language.

**Test for every screen:** print it on paper. White paper, ink text, one
indigo signature, statuses as restrained annotations. If an element
wouldn't survive on paper, it's decoration — remove it.
