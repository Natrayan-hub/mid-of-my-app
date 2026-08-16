# LifeOS — Visual Design System

**Product:** LifeOS — Personal Life Command Center
**Version:** 1.0 (companion to `LifeOS_PRD.md`, `LifeOS_IA_and_Screens.md`, `LifeOS_Technical_Foundation.md`)
**Audience:** Product designers (component library) & mobile engineers (styled reusable components, React Native / Expo)
**Token naming:** dot-notation (`color.primary.default`) → maps 1:1 to a TS theme object (`colors.primary.default`) consumable by `StyleSheet.create()`.

---

## Table of Contents

- [Part A — Design Principles & Direction](#part-a--design-principles--direction)
- [Part B — Color System](#part-b--color-system)
- [Part C — Typography](#part-c--typography)
- [Part D — Spacing, Layout & Grid](#part-d--spacing-layout--grid)
- [Part E — Core Components](#part-e--core-components)
- [Part F — Iconography & Imagery](#part-f--iconography--imagery)
- [Part G — Motion & Interaction](#part-g--motion--interaction)
- [Appendix — Token Export Shape](#appendix--token-export-shape)

---

# Part A — Design Principles & Direction

## A.1 Design Philosophy

LifeOS is a **calm command center**. The user opens it 4+ times a day for a 2-second answer — the interface must feel like a quiet, well-organized desk, not a dashboard cockpit. Every visual decision serves three jobs:

1. **Clarity** — one glance, one answer. Strong hierarchy, generous whitespace, one accent at a time.
2. **Focus** — color is *earned*: the UI is predominantly neutral, and saturated color appears only where meaning lives (actions, status, AI). Nothing competes with the content.
3. **Trust** — privacy and intelligence are visualized honestly: locks, provenance chips, and sync states use a consistent, sober language. No dark patterns, no visual noise, no gamified confetti-by-default.

## A.2 Mood & Aesthetic

**"Calm precision"** — soft-neutral surfaces, a single confident indigo, airy spacing, quiet depth (hairlines + subtle shadow instead of heavy elevation), rounded but not bubbly geometry.

| Mood word | How it manifests |
|---|---|
| Calm | Warm-tinted neutrals, low-saturation backgrounds, restrained motion, max 2 accent moments per screen |
| Precise | 8-pt rhythm everywhere, tabular numerals for data, hairline borders, aligned baselines |
| Trustworthy | Consistent status colors, explicit lock/provenance iconography, honest empty/error states |
| Quietly intelligent | AI has its **own** identifiable color (iris) + sparkle glyph — always recognizable, never disguised as regular UI |

**Rationale:** competitors either look clinical (health apps) or busy (productivity dashboards). "Calm precision" positions LifeOS as the *anti-noise* app, laddering directly to PRD principles "glanceable first" and "calm technology."

## A.3 Accessibility as a First-Class Principle

| Rule | Requirement |
|---|---|
| Contrast | All text/background pairs ≥ **4.5:1** (AA); large text (≥ 20 px semibold) ≥ 3:1; non-text UI (borders of inputs, icons conveying state) ≥ 3:1 |
| Touch targets | ≥ 44 × 44 pt (iOS) / 48 × 48 dp (Android); visual element may be smaller, hit-slop makes up the difference |
| Text scaling | All type tokens support OS Dynamic Type / font scaling up to 200%; layouts use flex + `numberOfLines` fallbacks, never fixed heights on text containers |
| Color independence | Status is never color-only — always paired with icon + label (e.g., sync error = ⚠ icon + "Retry") |
| Motion | All animations respect OS reduce-motion → cross-fade fallback (see Part G) |
| Screen readers | Every interactive component defines `accessibilityLabel`, `accessibilityRole`, `accessibilityState` in its spec |

---

# Part B — Color System

## B.1 Brand Palette

Primary is **Indigo** (focus, intelligence, night-and-day neutrality — works in both themes). Secondary is **Teal** (health/vitality). AI gets a distinct **Iris** violet so intelligence is always visually attributable.

### Core ramps (reference scale, light-theme anchored)

| Ramp | 50 | 100 | 300 | 500 (base) | 600 | 700 | 900 |
|---|---|---|---|---|---|---|---|
| Indigo (primary) | `#EEF0FE` | `#DCE0FD` | `#9AA5F4` | `#4F5DE8` | `#3F4BD1` | `#3239A8` | `#1E2260` |
| Teal (secondary) | `#E6F7F5` | `#C6EEE9` | `#5FCEC2` | `#0FA396` | `#0C877D` | `#0A6B63` | `#063E3A` |
| Iris (AI accent) | `#F3EFFE` | `#E5DCFD` | `#B49AF4` | `#7C5CE8` | `#6A4BD1` | `#5439A8` | `#302060` |
| Amber (warning) | `#FEF5E7` | `#FDE8C8` | `#F5C165` | `#D97E06` | `#B56905` | `#8F5304` | `#523003` |
| Green (success) | `#E9F7EE` | `#CFEEDC` | `#6FCF97` | `#1B9C57` | `#168149` | `#12663A` | `#0A3B22` |
| Red (error/destructive) | `#FDEEEE` | `#FAD7D7` | `#F09393` | `#D93F3F` | `#B93030` | `#8F2525` | `#521515` |
| Blue (info) | `#EAF3FE` | `#D0E4FC` | `#7FB5F5` | `#1E74D9` | `#1961B6` | `#144D8F` | `#0B2C52` |

## B.2 Semantic Tokens — Light & Dark

### Backgrounds & surfaces

| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.bg.canvas` | `#F7F7F5` | `#0F1013` | App background behind everything (warm off-white / near-black) |
| `color.surface.default` | `#FFFFFF` | `#1A1C21` | Cards, sheets, list containers |
| `color.surface.raised` | `#FFFFFF` | `#22252C` | Elevated cards, floating sheets, popovers (dark uses lighter surface instead of shadow) |
| `color.surface.sunken` | `#EFEFEC` | `#141519` | Inset areas: search fields, segmented control track, progress tracks |
| `color.surface.inverse` | `#22252C` | `#F2F2F0` | Toasts, tooltips |
| `color.surface.primarySubtle` | `#EEF0FE` | `#232649` | Selected states, primary-tinted chips |
| `color.surface.aiSubtle` | `#F3EFFE` | `#2A2347` | AI suggestion cards/chips background |
| `color.overlay.scrim` | `#0F1013 @ 40%` | `#000000 @ 60%` | Behind modals/sheets |

### Text

| Token | Light | Dark | Usage | Contrast vs. its surface |
|---|---|---|---|---|
| `color.text.primary` | `#1B1D22` | `#F2F2F0` | Headings, body | 15.6:1 / 15.2:1 ✅ |
| `color.text.secondary` | `#565B66` | `#A7ACB8` | Supporting copy, metadata | 7.0:1 / 7.4:1 ✅ |
| `color.text.tertiary` | `#71767F` | `#828792` | Timestamps, placeholders (min-size 13px) | 4.9:1 / 4.6:1 ✅ |
| `color.text.disabled` | `#A3A7AE` | `#5A5E68` | Disabled labels (exempt from AA) | — |
| `color.text.onPrimary` | `#FFFFFF` | `#FFFFFF` | Text on `color.primary.default` | 6.3:1 / 4.9:1 ✅ |
| `color.text.link` | `#3F4BD1` | `#9AA5F4` | Inline links, tertiary buttons | 6.5:1 / 6.9:1 ✅ |
| `color.text.onInverse` | `#F2F2F0` | `#1B1D22` | Toast text | ✅ |

### Interactive & semantic

| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.primary.default` | `#4F5DE8` | `#7A86F0` | Primary buttons, active tab, selection controls "on" |
| `color.primary.pressed` | `#3F4BD1` | `#8F99F3` | Pressed primary |
| `color.primary.subtleText` | `#3239A8` | `#B6BDF8` | Text/icons on `surface.primarySubtle` (7.2:1 ✅) |
| `color.secondary.default` | `#0FA396` | `#3FBFB2` | Health domain accents, rings, health chart series |
| `color.ai.default` | `#7C5CE8` | `#A18BF2` | Sparkle icon, AI chip border, suggestion accents |
| `color.ai.onSubtle` | `#5439A8` | `#CBBDF8` | Text on `surface.aiSubtle` (7.6:1 ✅) |
| `color.success.default` | `#1B9C57` | `#4EC583` | Success icons/borders; sync ✓ |
| `color.success.text` | `#12663A` | `#7ADCA4` | Text on success-subtle bg (6.8:1 ✅) |
| `color.success.subtleBg` | `#E9F7EE` | `#12331F` | Success banners/chips |
| `color.warning.default` | `#D97E06` | `#F0A93C` | Warning icons; token-expiry badges |
| `color.warning.text` | `#8F5304` | `#F5C165` | Text on warning-subtle (5.9:1 ✅) |
| `color.warning.subtleBg` | `#FEF5E7` | `#3A2A0D` | Warning banners |
| `color.error.default` | `#D93F3F` | `#F07575` | Error icons/borders; destructive buttons |
| `color.error.text` | `#B93030` | `#F09393` | Error text on surfaces (5.0:1 / 6.2:1 ✅) |
| `color.error.subtleBg` | `#FDEEEE` | `#3A1414` | Error banners, destructive-subtle |
| `color.info.default` | `#1E74D9` | `#5CA3EE` | Info banners, offline banner icon |
| `color.info.subtleBg` | `#EAF3FE` | `#0E2A47` | Info banner bg |

### Borders & misc

| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.border.default` | `#E3E3DF` | `#2E323B` | Hairline card/list dividers |
| `color.border.strong` | `#C8C9C4` | `#454A56` | Input borders, ≥3:1 non-text contrast ✅ |
| `color.border.focus` | `#4F5DE8` | `#7A86F0` | 2px focus ring (keyboard/switch access) |
| `color.chart.grid` | `#ECECE9` | `#262A31` | Chart gridlines |
| `color.chart.series1..5` | indigo 500 / teal 500 / iris 500 / amber 500 / blue 500 | 300-level equivalents | Ordered categorical series |
| `color.privacy.local` | `#565B66` | `#A7ACB8` | 📱 "local-only" badges (deliberately neutral = calm) |
| `color.privacy.cloud` | `#1E74D9` | `#5CA3EE` | ☁️ synced badges |

## B.3 Usage Rules

1. **One primary action per screen** — only one `color.primary.default` filled element visible at a time.
2. **AI is always iris** — any AI-generated content (suggestion cards, insight banners, NL-parse chips) uses `surface.aiSubtle` + `ai.*`; regular UI never borrows iris. This is the visual honesty contract.
3. **Semantic colors only for semantics** — never use red/green/amber decoratively.
4. **Teal = health domain** — health rings, sparklines, readiness. Indigo elsewhere.
5. **Dark theme raises with lightness, not shadow** — surfaces get lighter as they elevate; shadows near-disabled.
6. **Subtle backgrounds always pair with their `*.text` token** — never place `*.default` colored text on `*.subtleBg` without checking the listed ratio.

---

# Part C — Typography

## C.1 Type Family

**Inter** (variable), loaded via `expo-font`; fallback `System` (SF Pro / Roboto).

**Justification:** Inter is designed for UI screens (tall x-height, open apertures → legible at 13px metadata sizes), has **tabular numerals** (`tnum`) — essential for health stats, deltas, and timers that must not jitter — supports variable weights (single file, small bundle), and renders identically on iOS and Android, eliminating cross-platform baseline drift that system-font mixing causes. System fonts remain the fallback so Dynamic Type behavior is never blocked.

- Numeric data (charts, stats, timers): enable `fontVariant: ['tabular-nums']`.

## C.2 Type Scale

Base 16px, ~1.25 modular-ish scale tuned to 4-pt line-height grid.

| Token | Size / Line-height | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| `type.display` | 34 / 40 | 700 | −0.4 | Big numbers (readiness score, follower count), onboarding heroes |
| `type.h1` | 28 / 34 | 700 | −0.3 | Screen large titles ("Today", "Health") |
| `type.h2` | 22 / 28 | 600 | −0.2 | Card group headers, sheet titles |
| `type.h3` | 18 / 24 | 600 | −0.1 | Card titles, section headers |
| `type.h4` | 16 / 22 | 600 | 0 | List-item titles, emphasized rows |
| `type.body` | 16 / 24 | 400 | 0 | Default reading text, notes |
| `type.bodySm` | 14 / 20 | 400 | 0 | Secondary copy, suggestion reasons |
| `type.label` | 14 / 18 | 500 | +0.1 | Buttons, tabs, chips, input labels |
| `type.labelSm` | 12 / 16 | 500 | +0.2 | Tab-bar labels, tiny chips, badges |
| `type.caption` | 12 / 16 | 400 | +0.1 | Timestamps, provenance ("based on…"), legal |
| `type.mono` | 14 / 20 | 500 (tabular) | 0 | Stat values in rows, sync counts |

## C.3 Usage Guidance

| Style | Rules |
|---|---|
| `display` | Max one per screen; always paired with a `caption` context line beneath |
| `h1` | Collapses to `h3` size in condensed top bar on scroll |
| `body` | Line length target ≤ ~34 characters at default scale on 390pt-wide screens (achieved by card padding) |
| `caption` | Never below 12px; tertiary color allowed only ≥13px — at 12px use `text.secondary` |
| Weights | 400/500/600/700 only; never faux-bold; emphasis inside body = 600, never underline (underline is reserved for nothing — links are colored + labeled) |
| Scaling | All tokens use `allowFontScaling`; `display`/`h1` cap at 1.4× to protect layouts, everything else scales to 2.0× |

---

# Part D — Spacing, Layout & Grid

## D.1 Spacing Scale (4/8-pt)

| Token | Value | Typical use |
|---|---|---|
| `space.2xs` | 4 | Icon-to-label gap, chip inner padding |
| `space.xs` | 8 | Inside-card vertical rhythm, small gaps |
| `space.sm` | 12 | List-item vertical padding, chip gaps |
| `space.md` | 16 | **Screen margins**, card padding, default gap |
| `space.lg` | 24 | Between card groups / sections |
| `space.xl` | 32 | Section breaks, empty-state padding |
| `space.2xl` | 48 | Hero spacing, onboarding |
| `space.3xl` | 64 | Rare — splash/empty hero top offset |

## D.2 Layout Grid

| Token | Value | Notes |
|---|---|---|
| `layout.margin` | 16 | Horizontal screen margin (all screens) |
| `layout.gutter` | 12 | Gap between grid cells (metric grid, doc grid) |
| `layout.columns` | 4 (phones) / 8 (≥ 600dp tablets, foldables) | Content spans full width by default; grids use 2-up cells on phones |
| `layout.maxContentWidth` | 640 | Content column caps and centers on tablets |
| `layout.tabBarHeight` | 64 + safe-area | Bottom tab bar |
| `layout.topBarHeight` | 56 (condensed) / 96 (large-title) | Collapsing header |
| `layout.sheetTopRadiusZone` | 24 | Grabber area on sheets |
| `layout.minTouch` | 44 | Enforced hit-slop minimum |

## D.3 Radius, Elevation, Borders

### Corner radius

| Token | Value | Usage |
|---|---|---|
| `radius.xs` | 6 | Chips inner elements, checkboxes |
| `radius.sm` | 10 | Buttons, inputs, chips |
| `radius.md` | 14 | Cards, list containers |
| `radius.lg` | 20 | Bottom sheets (top corners), modals |
| `radius.full` | 999 | Pills, avatars, FAB, progress dots |

### Elevation (quiet depth — hairline first, shadow second)

| Token | Light theme | Dark theme | Usage |
|---|---|---|---|
| `elevation.0` | none; hairline `border.default` | surface color step only | Flat cards, list containers |
| `elevation.1` | y2 blur8 `#1B1D22 @ 6%` | `surface.raised` + no shadow | Raised cards (Today cards), popovers |
| `elevation.2` | y6 blur16 `#1B1D22 @ 10%` | `surface.raised` + y2 blur8 black 30% | Sheets, FAB, toasts |
| `elevation.3` | y12 blur28 `#1B1D22 @ 14%` | + scrim | Modals/dialogs |

### Borders

| Token | Value | Usage |
|---|---|---|
| `border.hairline` | 1 (`StyleSheet.hairlineWidth` where crisp) `color.border.default` | Dividers, card edges |
| `border.input` | 1.5 `color.border.strong` | Inputs at rest |
| `border.focus` | 2 `color.border.focus` | Focus ring (offset 2) |
| `border.ai` | 1 `color.ai.default @ 40%` | AI suggestion card edge |

---

# Part E — Core Components

> All components define: anatomy → variants → states → sizing. States apply consistently: **default · pressed (mobile "hover") · focused · disabled · error/destructive · loading**. Pressed = 96% scale + darkened/lightened fill (tokens noted). All interactive components: `accessibilityRole` + label + state.

## E.1 Buttons

**Anatomy:** container (radius `radius.sm`) · optional leading icon (20) · label (`type.label`) · optional trailing spinner.

| Variant | Fill / border | Label | Use |
|---|---|---|---|
| **Primary** | `color.primary.default` | `text.onPrimary` | The one main action per screen |
| **Secondary** | transparent + `border.strong` 1.5 | `text.primary` | Coequal/alternate actions |
| **Tertiary** | none | `color.text.link` | Inline actions ("See all"), sheet cancels |
| **Destructive** | `color.error.default` fill (confirm contexts) or tertiary red text | `#FFFFFF` / `error.text` | Delete/disconnect |
| **AI** | `surface.aiSubtle` + `border.ai` | `color.ai.onSubtle` + sparkle icon | Accept-suggestion actions only |
| **Icon button** | none or `surface.sunken` circle | icon `text.secondary` | Top-bar actions; 44×44 hit area |
| **FAB (Quick-Add ＋)** | `color.primary.default`, `radius.full`, `elevation.2`, 56×56 | icon `onPrimary` 28 | Raised center of tab bar only |

**Sizes:** `lg` 52h (primary CTAs, onboarding) · `md` 44h (default) · `sm` 36h (inline, chips-adjacent).

**States:**

| State | Treatment |
|---|---|
| Pressed | Fill → `primary.pressed` (or 8% overlay for outline/tertiary); scale 0.97 |
| Focused | `border.focus` ring |
| Disabled | Fill `surface.sunken`, label `text.disabled`; outline variants at 40% opacity |
| Loading | Label swaps to spinner (same width preserved — no layout shift); disabled semantics |

## E.2 Inputs & Form Fields

**Text field anatomy:** label (`type.label`, `text.secondary`) above · container 52h, `radius.sm`, `surface.default`, `border.input` · optional leading icon · placeholder `text.tertiary` · trailing affordance (clear ×, visibility eye) · helper/error line (`type.caption`) below.

| State | Treatment |
|---|---|
| Default | `border.strong` |
| Focused | `border.focus` 2px + label tint primary |
| Error | Border + helper text `color.error.default/text` + error icon (never color-only) |
| Disabled | `surface.sunken`, text disabled |

**Other controls:**

| Control | Spec |
|---|---|
| **Search field** | 44h, `surface.sunken`, `radius.full`, leading search icon, no border; cancel tertiary button appears on focus |
| **Dropdown / select** | Field look + chevron-down; opens **bottom sheet** with radio list (never inline popover on mobile) |
| **Toggle/switch** | Track 32×20 `radius.full`: off `border.strong` fill; on `color.primary.default`; thumb white, 150ms slide; privacy-critical toggles (S34) add confirm-sheet before committing off→on cloud changes |
| **Checkbox** | 22×22 `radius.xs`; checked = primary fill + white check; task checkbox variant = 24 circle, check animates with 200ms draw + subtle haptic |
| **Radio** | 22 circle, 8 dot primary |
| **Date/time picker** | Native pickers (iOS wheel / Material) launched from field row; result rendered as removable chip in quick-add |
| **Chips (filter/parse)** | 32h pill, `surface.sunken`; selected = `surface.primarySubtle` + `primary.subtleText`; AI-parse chips use ai tokens + tap-to-edit |
| **Stepper** (water log) | 44h segmented − / value (`type.mono`) / +; long-press auto-repeats |
| **Slider** (suggestions/day cap) | Track 4h `surface.sunken`, fill primary, thumb 24 with value bubble on drag |
| **Segmented control** | Track `surface.sunken` `radius.sm` 40h; active segment `surface.default` + `elevation.1` + `text.primary`; inactive `text.secondary` |

## E.3 Cards

**Base card:** `surface.default`, `radius.md`, padding `space.md`, `elevation.0` (hairline) — lists/settings containers.
**Raised card:** `elevation.1` — all **Today cards**.

**Today card anatomy (the signature component):**

```text
┌──────────────────────────────────────┐
│ ◦ Domain icon+label (labelSm, sec.)  │ ← header row: icon 16, "TASKS", trailing "See all" tertiary
│ Title / content zone                 │ ← h3/h4 + rows, max ~3 items
│ [inline actions or mini-viz]         │
│ caption row (timestamp / provenance) │ ← optional
└──────────────────────────────────────┘
```

| Variant | Differences |
|---|---|
| **AI suggestion card** | `surface.aiSubtle` bg, `border.ai`, sparkle 16 in header, reason line `caption` italic-free ("based on your sleep"), footer buttons: AI-accept + tertiary Dismiss |
| **Metric card** (health grid) | 2-up grid cell, big value `display`-scaled-down (24/30 700 tabular) + unit `caption`, teal sparkline 32h, trend delta chip (▲ success / ▼ neutral-or-warning per metric semantics) |
| **Connect/empty card** | Dashed `border.strong` 1.5, centered icon + one-liner + secondary button |
| **Status hero** (backup S32, readiness S14) | Full-width, leading status glyph 32, headline `h2`, progress bar 6h `radius.full` |
| **Info/automation card** | Leading robot/recipe icon, neutral surface, tertiary "View history" |

**States:** pressed (whole-card tap) = 4% overlay + scale 0.99; loading = skeleton variant (see E.9); per-card error = compact error row w/ retry inside the card frame (screen never breaks).

## E.4 Navigation

**Bottom tab bar:** height `layout.tabBarHeight`, `surface.default`, top hairline; 5 slots + raised FAB center.

| Element | Spec |
|---|---|
| Tab item | Icon 24 (outline inactive → filled active) + `labelSm`; active `color.primary.default`, inactive `text.secondary`; 150ms cross-fade + 1.06 icon spring |
| Badges | 16 pill `color.error.default` white `labelSm` count (Tasks overdue); dot 8 `warning.default` (More attention) |
| FAB | See E.1; long-press opens instant NL task input |

**Top app bar:** large-title pattern — `h1` + subtitle `caption` at rest; collapses on scroll to 56h centered `h3` with fade; background `bg.canvas` → gains hairline when content scrolls under.

| Element | Spec |
|---|---|
| Back | Chevron-left 24 icon button, left edge, min 44 hit; label omitted (title provides context); Android hardware back mirrors |
| Actions | Max 2 icon buttons right (bell, search, overflow) |
| Contextual/select mode | Bar swaps to count + bulk actions, close × left |

**Sheets & modal nav:** sheets show 36×4 grabber (`border.strong`, `radius.full`) centered top `space.xs`; full-screen modals (capture, automation builder) use × close left + title + optional Save right.

## E.5 Lists & List Items

**Container:** grouped card (`surface.default`, `radius.md`) with internal hairline dividers inset by leading-content width; or edge-to-edge on dense screens (notifications).

**Row anatomy:** leading (icon 24 / checkbox / avatar 36 / thumb 48) · content (title `h4`, subtitle `bodySm` `text.secondary`, metadata `caption`) · trailing (chevron / value `mono` / switch / status dot 8) · min height 52 (single-line) / 64 (two-line) / 76 (thumb rows).

| Row variant | Notes |
|---|---|
| **Task row** | Circle checkbox · title (strikethrough + `text.tertiary` on complete, 200ms) · due chip (error-subtle when overdue) · priority flag · project dot 8 · drag handle in edit mode |
| **Settings row** | Icon in 32 `radius.xs` tinted container (à la iOS), title, trailing switch/chevron/value |
| **Integration row** | Logo 32, name + last-sync `caption`, status dot (success/syncing pulse/error) + direction tag chip "Read-only" |
| **Notification row** | Category icon, title 600-weight when unread + unread dot primary 8, relative time `caption` |
| **Document grid cell** | Thumb `radius.sm` 1:1.3, title 1-line, category chip + date `caption`; lock badge 14 bottom-right of thumb for local-only/Vault |

**Interactions:** swipe-right reveal = success-fill complete action; swipe-left = snooze (`warning`) / delete (`error`); rows pressed = 4% overlay; long-press = multi-select with leading checkboxes sliding in (150ms).

## E.6 Charts / Data Visualization

Principles: **data-ink first** — no chart borders, no legends when one series, direct labeling.

| Token/element | Spec |
|---|---|
| Grid | `color.chart.grid` horizontal-only, 3–4 lines, no verticals |
| Axis labels | `caption` `text.tertiary`; y-axis right-aligned inside plot; x-axis abbreviated (M T W…) |
| Line series | 2.5w round caps; area fill = series color @ 8% gradient-to-transparent; health = teal, social = indigo, comparisons via `chart.series*` order |
| Bars | `radius.xs` tops, 60% column width; today's bar full color, others @ 55% |
| Average line | 1w dashed `text.tertiary` + inline "avg 7 432" `caption` |
| Sparkline (cards) | 32h, no axes/grid, endpoint dot 4 |
| Tap-to-inspect | Vertical hairline + dot + floating value pill (`surface.inverse`, `mono`); scrub with haptic ticks at points |
| Rings (readiness) | 8w track `surface.sunken`, progress teal, value `display` centered |
| Deltas | Always icon+text: "▲ 12%" `success.text` / "▼ 8%" `text.secondary` (down ≠ automatically bad for e.g. resting HR — semantics per metric) |
| Empty plot | Grid + ghost dashed line + "No data yet" `caption` centered |

## E.7 Modals, Sheets & Dialogs

| Component | Spec |
|---|---|
| **Bottom sheet** (default input surface: quick-add, logs, S7, pickers) | `surface.raised`, top `radius.lg`, grabber, `elevation.2`, scrim; detents: content-height / 90%; keyboard-aware (input pinned above keyboard); swipe-down dismiss with velocity threshold; drafts preserved on accidental dismiss |
| **Full-screen modal** (capture S19, builder S29, onboarding) | Slides up 300ms; own top bar (× / title / action); tab bar hidden |
| **Alert dialog** (confirms only — deletes, disconnects, purges) | 320w max centered card `radius.lg` `elevation.3`; title `h3`, body `bodySm`, buttons right-aligned: tertiary cancel + primary/destructive confirm; destructive confirms may require typed text ("DELETE") per security spec |
| **Confirmation pattern** | Reversible actions → **no dialog**, use toast+Undo; irreversible → dialog. Never both |

## E.8 Toasts, Snackbars & Status Indicators

| Component | Spec |
|---|---|
| **Toast/snackbar** | Bottom, above tab bar `space.md`; `surface.inverse`, `radius.sm`, `elevation.2`; icon + `bodySm` `text.onInverse` + optional Undo tertiary (light-tinted); auto-dismiss 4s (8s with action); one at a time, queued; slide+fade in 200ms |
| **Offline banner** | Top, below status bar: `info.subtleBg`, icon + "Offline — changes will sync" `labelSm`; persistent, non-blocking |
| **Sync status glyph** | 16–20 cloud icon: ✓ `success.default` / rotating ⟳ `text.secondary` (1.2s spin) / ⚠ `error.default` + always adjacent label or accessible label |
| **Progress bar** | 6h `radius.full`, track `surface.sunken`, fill primary (backup) or teal (health goals); indeterminate = 30% segment sweeping 1.4s |
| **Badges** | Count pill (E.4); "Plus" plan badge = `surface.primarySubtle` + `primary.subtleText` `labelSm` pill |
| **Privacy badges** | 📱 "On device" (`privacy.local`) / ☁️ "Synced" (`privacy.cloud`) / 🔒 Vault (`text.primary` lock) — chip form, `labelSm`, shown on documents & data-control rows |

## E.9 Empty, Loading & Error States

| State | Pattern |
|---|---|
| **Empty** | Centered in content zone: spot illustration 96 (Part F style) · title `h3` · one-line `bodySm` `text.secondary` · single CTA (secondary button, or primary if it's the screen's core action, e.g., "Scan your first document"). Tone: warm, capable, never guilt ("Nothing for today 🎉") |
| **Loading — skeleton** | Shape-matched skeletons per component (card, row, chart): `surface.sunken` blocks, shimmer sweep 1.2s @ 6% white/black overlay; radius matches real component; never spinners for content areas |
| **Loading — inline** | Spinners only inside buttons and pull-to-refresh (native control tinted primary) |
| **Error — per-card/inline** | Compact row inside the component frame: ⚠ 16 `error.default` + `bodySm` message + tertiary Retry; sibling content unaffected (per IA spec: Today never fully breaks) |
| **Error — full screen** (only when the screen has no cache) | Empty-state layout with error illustration + Retry secondary button + "Check connection" caption |
| **Offline data** | Cached content shown at full fidelity + "as of 9:02" `caption` stamp; queued-changes count chip where relevant (S32) |

---

# Part F — Iconography & Imagery

## F.1 Icons

| Property | Spec |
|---|---|
| Style | **Outline, 1.75px stroke**, rounded caps/joins (Lucide-compatible set — `lucide-react-native`); active/selected states use the filled twin |
| Grid | 24×24 keylines, 2px internal padding; optical centering over mathematical |
| Sizes | `icon.sm` 16 (inline, chips, captions) · `icon.md` 20 (buttons, inputs) · `icon.lg` 24 (rows, tabs, top bar) · `icon.xl` 32 (settings tints, status heroes) |
| Color | Inherit text color of context (`text.secondary` default, `text.primary` emphasized, semantic where semantic) |
| Domain glyph set | Today=sun/home, Tasks=check-circle, Health=heart-pulse, Docs=file-text, More=grid; AI=sparkles (iris only); privacy=lock/smartphone/cloud |
| Rules | Never mix stroke weights; never recolor multi-tone; every meaningful icon has an accessible label; decorative icons `accessibilityElementsHidden` |

## F.2 Imagery & Illustration

| Type | Treatment |
|---|---|
| **Document thumbnails** | `radius.sm`, hairline border, aspect 1:1.3; local-only/Vault items overlay a 14 lock badge (bottom-right, `surface.inverse` circle); loading = blurhash placeholder → progressive full-res |
| **Photos** | `radius.sm` in grids, edge-to-edge in viewer (radius 0); dark scrim gradient behind overlaid controls |
| **Avatars** | `radius.full`, 28 (top bar) / 36 (rows) / 64 (profile); fallback = initials on `surface.primarySubtle` + `primary.subtleText` |
| **Empty-state illustrations** | Flat 2-tone spot style: `border.strong`-weight outlines + one fill from `surface.primarySubtle`/`aiSubtle`; no faces/mascots (calm, not cute); 96–128 sizes; dark-theme variants swap fills to dark subtle surfaces |
| **Integration logos** | Full-color official marks inside 32 `radius.xs` neutral container — never recolored (brand-guideline safe) |
| **Onboarding art** | Same illustration language, larger compositions; abstract "life threads converging" motif in indigo/teal/iris |

---

# Part G — Motion & Interaction

## G.1 Motion Principles

Calm = **fast, small, purposeful**. Motion confirms causality (you did → this happened) and orientation (where things come from), never decorates. Implemented with `react-native-reanimated`; all durations halve visual complexity under OS reduce-motion → simple 120ms cross-fades.

## G.2 Motion Tokens

| Token | Value | Usage |
|---|---|---|
| `motion.duration.instant` | 100ms | Pressed states, checkbox ticks |
| `motion.duration.fast` | 150ms | Chips, toggles, tab cross-fade |
| `motion.duration.base` | 200ms | Toasts, card state changes, list row swipes settling |
| `motion.duration.slow` | 300ms | Screen pushes, sheet open, modal slide |
| `motion.duration.deliberate` | 450ms | Success ring draw, readiness ring fill, onboarding transitions |
| `motion.easing.standard` | cubic-bezier(0.2, 0, 0, 1) | Most transitions (decelerate-dominant) |
| `motion.easing.exit` | cubic-bezier(0.4, 0, 1, 1) | Dismissals, deletes |
| `motion.easing.spring` | spring(damping 18, stiffness 220) | FAB, tab icon pop, sheet snap, drag-release |
| `motion.stagger.list` | 30ms/item, max 8 items | First-load card/list entrance (fade + 8px rise) |

## G.3 Key Interaction Specs

| Interaction | Spec |
|---|---|
| **Screen push/pop** | Platform-native: iOS edge-swipe parallax slide; Android fade-through + 4% scale; 300ms `standard` |
| **Tab switch** | No slide — 150ms cross-fade; active icon outline→fill morph + 1.06 spring; preserves scroll position per tab |
| **Sheet open/close** | Slide-up 300ms `spring` snap to detent; scrim fades in parallel; close follows finger velocity |
| **Quick-Add FAB** | Press: 0.92 scale down → spring back; opens sheet with actions staggered 30ms |
| **Task complete** | Checkbox draw 200ms + light haptic; row holds 800ms (undo window awareness) then collapses height 200ms `exit`; toast slides up |
| **Pull-to-refresh** | Native control tinted primary; on completion cards that changed flash a 400ms `surface.primarySubtle` fade ("what's new" cue) |
| **AI suggestion accept** | Card border pulses iris once (300ms) → morphs into confirmation toast; dismissed card exits with 200ms fade + height collapse |
| **Sync feedback** | Syncing glyph rotates 1.2s linear; success = rotate-stop + tick draw 200ms; failure = 2× 4px horizontal shake + ⚠ swap |
| **Skeleton→content** | 150ms cross-fade, never pop-in; staggered per `motion.stagger.list` |
| **Chart entrance** | Line draws left→right 450ms `deliberate` on first view only; subsequent visits static (calm) |
| **Destructive** | No dramatic motion — dialog appears 200ms fade+scale-from-0.96; deleted rows collapse with `exit` easing |
| **Haptics** | Light: complete, toggle, chip select · Medium: suggestion accept, capture shutter · Success notification: backup restored · Never for errors alone (pair with visual) |

---

# Appendix — Token Export Shape

Tokens ship as a typed TS module consumed by all components:

```ts
// src/theme/tokens.ts (excerpt)
export const light = {
  color: {
    bg: { canvas: '#F7F7F5' },
    surface: { default: '#FFFFFF', raised: '#FFFFFF', sunken: '#EFEFEC',
               primarySubtle: '#EEF0FE', aiSubtle: '#F3EFFE', inverse: '#22252C' },
    text: { primary: '#1B1D22', secondary: '#565B66', tertiary: '#71767F',
            disabled: '#A3A7AE', onPrimary: '#FFFFFF', link: '#3F4BD1' },
    primary: { default: '#4F5DE8', pressed: '#3F4BD1', subtleText: '#3239A8' },
    ai: { default: '#7C5CE8', onSubtle: '#5439A8' },
    // …semantic, border, chart, privacy
  },
  space: { '2xs': 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 },
  radius: { xs: 6, sm: 10, md: 14, lg: 20, full: 999 },
  type: {
    h1: { fontSize: 28, lineHeight: 34, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
    body: { fontSize: 16, lineHeight: 24, fontFamily: 'Inter_400Regular' },
    // …
  },
  motion: { duration: { instant: 100, fast: 150, base: 200, slow: 300, deliberate: 450 } },
} as const;

export const dark: typeof light = { /* dark values per Part B tables */ };
```

Theme switching: a `ThemeProvider` resolves `system|light|dark` from Preference (S25) and exposes `useTheme()`; components never import raw hex — **tokens only** (lint rule: no hex literals outside `tokens.ts`).

---

*End of Design System — ready for component-library build and token export to code.*
