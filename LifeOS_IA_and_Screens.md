# LifeOS — Information Architecture & Screen-by-Screen Specification

**Product:** LifeOS — Personal Life Command Center
**Version:** 1.0 (companion to `LifeOS_PRD.md`)
**Audience:** UX designers (wireframing) & engineers (navigation scaffolding, Expo Router)
**Platforms:** iOS & Android (React Native / Expo, file-based routing via `expo-router`)

---

# Part A — Information Architecture

## A.1 Primary Navigation Model

**Bottom tab bar with 5 tabs + a centered floating Quick-Add button, layered with stack navigation inside each tab and modals/bottom-sheets for input flows.**

| Decision | Choice | Rationale |
|---|---|---|
| Primary nav | **Bottom tab bar (5 tabs)** | LifeOS has 4–5 co-equal, high-frequency domains (Today, Tasks, Health, Docs). Tabs give one-tap, thumb-reachable switching — critical for a "glanceable" app opened 4+ times/day. |
| Global create | **Center Quick-Add FAB** (raised button in the tab bar) | Task/doc/log creation is the highest-frequency action and must be reachable from anywhere in ≤1 tap. Opens a bottom sheet, preserving context. |
| Within-tab depth | **Stack navigation** (push/pop with back button) | Detail screens (task detail, document viewer, metric detail) are linear drill-downs from lists. |
| Input flows | **Bottom sheets & modals** | Quick-add, filters, and short forms keep the underlying content visible (contextual input principle). Multi-step flows (onboarding, automation builder) use full-screen modals. |
| Settings & low-frequency areas | **"More" tab → stack** | Integrations, automations, privacy, backup, and profile are important but not daily-frequency; nesting them under a fifth tab avoids tab overload and keeps IA discoverable (no hidden drawer). |
| Not chosen: drawer | — | Drawers hide navigation and hurt discoverability/glanceability; they conflict with one-handed use. |

**Tab order (left → right):** `Today` · `Tasks` · `[＋ Quick Add]` · `Health` · `Docs` · `More`

> Social/Instagram (P1) surfaces as a Today card + a screen reachable from Today and More; it does not earn a tab in v1.x. If usage data justifies it later, it can replace a lower-traffic tab position.

## A.2 Full App Hierarchy (Screen Tree)

```text
LifeOS (root)
│
├── (auth / first-run — outside tabs)
│   ├── S0  Splash / Session check
│   ├── S1  Welcome & Value Carousel
│   ├── S2  Sign Up / Log In (managed auth)
│   ├── S3  Permissions & Data Choices (health, calendar, notifications, camera/photos)
│   ├── S4  Integration Quick-Connect (optional: Health, Calendar)
│   └── S5  Personalization (wake time, focus areas, AI opt-in) → lands on Today
│
├── Tab 1: TODAY
│   ├── S6  Today Dashboard (home)
│   │   ├── → any domain screen via card deep-link
│   │   └── S7  AI Suggestion Detail / Action sheet (bottom sheet)
│   ├── S8  Notifications Center (bell icon in top bar)
│   └── S9  Weekly Recap / Insights (P1; card → full screen)
│
├── Tab 2: TASKS
│   ├── S10 Task Lists (Today / Upcoming / Someday + Projects)
│   ├── S11 Task Detail (edit, subtasks, reminders)
│   ├── S12 New/Edit Task (bottom sheet; NL quick-add)
│   └── S13 Project / List Detail
│
├── Center: QUICK ADD (global bottom sheet, not a screen route)
│   ├── → New Task (S12)
│   ├── → Scan Document (S18 camera flow)
│   ├── → Manual Health Log (S16)
│   └── → New Calendar Event (P1)
│
├── Tab 3: HEALTH
│   ├── S14 Health Summary Dashboard
│   ├── S15 Metric Detail (steps / sleep / HR / workouts / weight)
│   ├── S16 Manual Log (water, mood, weight — bottom sheet)
│   └── S17 Readiness Explainer (bottom sheet: "how this was computed")
│
├── Tab 4: DOCS
│   ├── S18 Documents Home (search + categories + recent)
│   ├── S19 Document Capture Flow (camera → crop → OCR review → save; full-screen modal)
│   ├── S20 Document Detail / Viewer
│   ├── S21 Category / Album View
│   └── S22 Photo Backup (P1: albums, backup status)
│
├── Tab 5: MORE
│   ├── S23 More Hub (profile header + menu)
│   ├── S24 Profile & Account
│   ├── S25 General Settings (theme, units, language, app lock)
│   ├── S26 Integrations & Connected Accounts
│   │   └── S27 Integration Detail (scopes, last sync, disconnect)
│   ├── S28 Automations List (P1)
│   │   ├── S29 Automation Builder (trigger → condition → action)
│   │   └── S30 Automation Run History
│   ├── S31 Social / Instagram Stats (P1)
│   ├── S32 Cloud Sync & Backup Settings
│   ├── S33 Privacy Center
│   │   ├── S34 Per-Domain Data Controls (local vs. cloud toggles)
│   │   ├── S35 AI Memory ("What LifeOS remembers")
│   │   └── S36 Export / Delete My Data
│   ├── S37 Notification Preferences
│   └── S38 Help & About (support, policies, version)
```

## A.3 Navigation Flows (How Users Move)

**Cold start (returning user):**
`Splash (S0) → biometric lock (if enabled) → Today (S6)`

**First run:**
`S0 → S1 Welcome → S2 Auth → S3 Permissions → S4 Quick-Connect → S5 Personalize → S6 Today (pre-populated, never empty)`

**Core daily loop (the "2-second answer"):**
`Open app → Today (S6) → glance cards → (optional) tap card → domain screen → back → done`

**Cross-domain deep-link examples:**
| From | Action | To |
|---|---|---|
| Today: health snapshot card | tap | Health Summary (S14) |
| Today: "3 tasks due" card | tap | Tasks list, Today section (S10) |
| Today: AI suggestion "move your run" | accept | Confirmation sheet (S7) → task/calendar updated → toast on Today |
| Today: "receipt uploaded" card | tap | Document Detail (S20) |
| Health metric card (S14) | tap | Metric Detail (S15) |
| Docs search result (S18) | tap | Document Detail (S20) |
| Any screen | tab bar `＋` | Quick-Add sheet → S12/S16/S19 |
| Push notification / local reminder | tap | Deep-link to the relevant screen (task, document, suggestion) |
| More → Integrations (S26) | connect | OAuth/system permission flow → back with success state |

**Back behavior:** Every pushed screen has a top-left back chevron; Android hardware back mirrors it. Modals/sheets dismiss with swipe-down + explicit close. Tabs preserve their own stack state (switching tabs never loses your place).

## A.4 Global Elements (Appear Across Screens)

| Element | Where | Behavior |
|---|---|---|
| **Top bar** | All tab-root screens | Left: screen title (large title style). Right: context actions + bell (notifications) on Today; search on Docs/Tasks. Collapses on scroll. |
| **Bottom tab bar** | All top-level screens | 5 tabs + raised center `＋`. Hidden inside full-screen modals (capture flow, onboarding, doc viewer). Badges: Tasks (overdue count), More (attention needed, e.g., expired token). |
| **Quick-Add `＋`** | Global (tab bar center) | Opens bottom sheet with 4 actions: Task, Scan Document, Health Log, Event (P1). Long-press = instant NL task input. |
| **Search** | Docs (primary), Tasks | Persistent search bar at top; Docs search is full-text (OCR index). |
| **Notifications bell** | Today top bar | Badge with unread count → Notifications Center (S8). |
| **Profile access** | More tab header (avatar) | Avatar also shown on Today greeting; tapping goes to Profile (S24). |
| **Offline banner** | Global | Thin persistent banner "Offline — changes will sync" when disconnected. |
| **Sync status** | Docs, Backup settings, Integrations | Small cloud icon: synced / syncing / error. |
| **AI suggestion chips** | Today, Tasks, Health | Consistent visual language: card/chip with sparkle icon + one-line "based on…" reason + Accept / Dismiss. |
| **Toasts / snackbars** | Global | Confirmation of actions with Undo where reversible (task complete, doc delete). |
| **Biometric lock overlay** | App open / Vault access | Face ID / fingerprint gate when enabled. |

---

# Part B — Screen-by-Screen Specification

> Conventions: **Local** = on-device DB/cache (offline-first). **Cloud** = LifeOS backend (`/api/*`) + object storage. **Integration** = third-party source (Health, Calendar, Garmin, Instagram, Notion). All screens support light/dark themes, dynamic type, and screen-reader labels.

---

## S1 — Welcome & Value Carousel

**Purpose:** Communicate the "life command center" promise in <30 seconds and route to sign-up.

**Entry points:** First app launch (after Splash S0); logged-out state.

**Layout & key components (top → bottom):**
1. Full-bleed illustration area (3–4 swipeable slides: Today glance, unified health+tasks, private document vault, "your data, your rules").
2. Page dots indicator.
3. Headline + one-line subcopy per slide.
4. Primary button: **Get Started** → S2.
5. Text link: **I already have an account** → S2 (login mode).

**Data shown:** Static marketing content (bundled). No user data.

**User actions:**
| Action | Result |
|---|---|
| Swipe slides | Advance carousel |
| Get Started | → S2 (sign-up mode) |
| Log in link | → S2 (login mode) |

**States:**
| State | Behavior |
|---|---|
| Empty | N/A (static) |
| Loading | None (bundled assets) |
| Error | N/A |
| Offline | Fully functional; auth on next screen will require connectivity |

**AI / automation touchpoints:** None (one slide *describes* the private AI assistant).

---

## S2 — Sign Up / Log In

**Purpose:** Create or access the account via the managed auth integration.

**Entry points:** S1 buttons; session expiry from anywhere; logout.

**Layout & key components:**
1. Logo + tagline.
2. Social login button (managed auth — e.g., Google).
3. Divider ("or").
4. Email + password fields (mode toggle: sign up ⇄ log in), inline validation.
5. Primary button (Create account / Log in).
6. Forgot password link (login mode).
7. Legal footer: Terms & Privacy Policy links.

**Data shown:** None besides form state. On success: session tokens stored in OS secure storage.

**User actions:**
| Action | Result |
|---|---|
| Social login | OAuth flow → success → S3 (new) or S6 Today (returning) |
| Submit email form | Account created / session started → same routing |
| Forgot password | Reset flow (email) |
| Toggle mode | Switch sign-up ⇄ log-in |

**States:**
| State | Behavior |
|---|---|
| Loading | Button spinner; form disabled during submit |
| Error | Inline field errors; banner for auth failures ("wrong password", "network") |
| Offline | Blocking notice: "You need a connection to sign in"; retry button |

**AI / automation touchpoints:** None.

---

## S3 — Permissions & Data Choices

**Purpose:** Contextually request OS permissions and set initial privacy posture — one card per permission, each skippable.

**Entry points:** After first sign-up (S2); re-entered later from Integrations (S26) or Privacy Center (S33) when a feature needs an ungranted permission.

**Layout & key components:**
1. Progress indicator ("Step 2 of 4").
2. Sequential permission cards, each with: icon, benefit-first title ("See your sleep and steps on Today"), one-line explanation, **Allow** and **Not now** buttons:
   - Health (HealthKit / Health Connect)
   - Calendar (read)
   - Notifications (reminders & suggestions)
   - Camera & Photos (document scanning) — may be deferred to first scan
3. Reassurance footer: "Read-only by default. Change anytime in Privacy Center."

**Data shown:** Permission status per item (granted / denied / not asked) from OS.

**User actions:**
| Action | Result |
|---|---|
| Allow | Shows pre-permission explainer → triggers native OS prompt; card marks granted/denied |
| Not now | Skips; feature degrades gracefully; card re-offered contextually later |
| Continue | → S4 |

**States:**
| State | Behavior |
|---|---|
| Denied (canAskAgain=false) | Card shows "Open Settings" button (`Linking.openSettings()`) instead of Allow |
| Loading | Brief spinner while checking existing statuses |
| Error | Per-card retry |
| Offline | Fully functional (OS permissions are local) |

**AI / automation touchpoints:** None yet; AI opt-in comes in S5.

---

## S4 — Integration Quick-Connect

**Purpose:** Optionally connect Health and Calendar now so Today isn't empty on first open.

**Entry points:** After S3; also linked from Today empty-state cards.

**Layout & key components:**
1. Title: "Connect your life (optional)".
2. Connection rows: Apple Health / Google Health Connect, Google/Apple Calendar — each with logo, one-line data-direction disclosure ("Reads steps, sleep, workouts"), **Connect** button, connected checkmark state.
3. "More integrations later" hint (Garmin, Instagram, Notion — greyed, "Coming soon" / P1 gate).
4. **Skip for now** text button.
5. Primary: **Continue** → S5.

**Data shown:** Connection status per integration (Cloud + OS); scopes summary (static config).

**User actions:**
| Action | Result |
|---|---|
| Connect Health | OS permission / OAuth → first sync kicks off in background |
| Connect Calendar | OAuth → read-only sync |
| Skip / Continue | → S5 |

**States:**
| State | Behavior |
|---|---|
| Loading | Row-level spinner during OAuth/sync handshake |
| Error | Row-level error chip with Retry |
| Offline | Rows disabled with "Requires connection" note; Skip still works |
| Empty | N/A |

**AI / automation touchpoints:** None.

---

## S5 — Personalization

**Purpose:** Seed AI memory and Today layout with 3 quick questions; capture AI opt-in.

**Entry points:** After S4 (last onboarding step).

**Layout & key components:**
1. "When does your day usually start?" — time chips (6:00 / 6:30 / 7:00 / custom).
2. "What matters most right now?" — multi-select chips (Fitness, Focus & tasks, Documents in order, Family schedule, Creator growth).
3. **AI assistant opt-in card:** toggle "Enable smart suggestions" + link "How AI uses your data" (→ static explainer sheet). Off = fully usable, no model calls.
4. Primary: **Take me to Today** → S6.

**Data shown:** Selections (written to Local + Cloud profile; seeds AI Memory S35).

**User actions:** Select chips; toggle AI; finish → S6 with a celebratory first-run Today.

**States:**
| State | Behavior |
|---|---|
| Loading | Save spinner on finish |
| Error | Retry save; selections cached locally so nothing is lost |
| Offline | Saves locally, queues cloud sync |

**AI / automation touchpoints:** This screen **creates** the first AI memory entries (wake time, focus areas) — each later visible/editable in S35.

---

## S6 — Today Dashboard (Home) ⭐

**Purpose:** The 2-second answer to "what matters right now" — a time-of-day-aware, card-based digest of all domains.

**Entry points:** Default screen on every app open; Today tab; deep-link target from notifications.

**Layout & key components (top → bottom):**
| # | Component | Notes |
|---|---|---|
| 1 | Top bar | Greeting ("Good morning, Priya") + date; avatar (→ S24); bell with badge (→ S8) |
| 2 | Context strip | Weather chip + readiness chip (tap → S17 explainer) |
| 3 | **AI suggestion card(s)** | Max 2 visible; sparkle icon, suggestion text, "based on…" reason, **Accept** / **Dismiss**; tap → S7 sheet |
| 4 | **Up next (Calendar)** | Next 3 events, time + title + location; conflict warning icon; tap → event detail sheet; header link → full agenda |
| 5 | **Top tasks** | Top 3 by urgency/calendar fit; checkbox to complete inline; tap → S11; header link → S10 |
| 6 | **Health snapshot** | Sleep, steps, active energy mini-tiles with trend arrows; tap → S14 |
| 7 | **Docs & reminders** | Recent capture / "warranty expiring" / backup status; tap → S20/S18 |
| 8 | **Social snapshot** (P1) | Follower delta + engagement; tap → S31 |
| 9 | **Evening variant** | After ~6pm cards reorder: tomorrow's agenda prep, reflection prompt, "plan tomorrow" CTA |
| 10 | Pull-to-refresh | Re-syncs all connected sources |

**Data shown:**
| Data | Source |
|---|---|
| Greeting, layout prefs | Local profile / AI memory |
| Weather | Cloud (weather API via backend) |
| Events | Calendar integration (cached locally) |
| Tasks | Local (offline-first), synced to Cloud |
| Health tiles | Health integration (HealthKit/Health Connect/Garmin), cached |
| Doc reminders, backup status | Local + Cloud object storage status |
| Social | Instagram Graph API via backend (P1) |
| Suggestions | Cloud AI service (opt-in), reasons attached |

**User actions:**
| Action | Result |
|---|---|
| Tap any card | Deep-link to domain screen |
| Complete task inline | Optimistic check-off + undo toast |
| Accept suggestion | → S7 confirmation → executes (e.g., reschedules task) → success toast |
| Dismiss suggestion | Removed; feeds AI memory (negative signal) |
| Pull-to-refresh | Sync all; per-card skeletons |
| Tap bell / avatar | → S8 / S24 |
| `＋` | Quick-Add sheet |

**States:**
| State | Behavior |
|---|---|
| Empty (zero integrations) | Never blank: shows local tasks, manual-log prompts, and "Connect" cards per domain (→ S4/S26) |
| Loading | Per-card skeleton loaders; cached content shows instantly (<500 ms target) |
| Error | Per-card error state with retry ("Couldn't reach Calendar"); rest of screen unaffected |
| Offline | Serves cached cards + offline banner; task actions queue |

**AI / automation touchpoints:**
- Primary AI surface: suggestion cards with explainable reasons (§6.2 PRD), rate-limited, never auto-executed.
- Card ordering personalized by AI memory (time-of-day + learned routines).
- Automation results (P1) appear as passive info cards ("Moved your run to 6pm — automation 'Sleep guard'") with link to S30 run history.

---

## S7 — AI Suggestion Detail / Action Sheet

**Purpose:** Show a suggestion's full reasoning and confirm/adjust the proposed action before it executes.

**Entry points:** Tap or Accept on a suggestion card (S6, S10, S14); suggestion push notification.

**Layout & key components (bottom sheet):**
1. Suggestion statement ("Move 7:00 run → 6:00pm?").
2. **"Based on" panel:** data sources used (sleep 5h20m from Health; free 6pm slot from Calendar) — each row tappable to its source screen.
3. Proposed change preview (before → after).
4. Adjust control where applicable (time picker).
5. Buttons: **Confirm** · **Adjust** · **Dismiss** · overflow: "Don't suggest this again" / "Why am I seeing this?"

**Data shown:** Suggestion payload + provenance (Cloud AI service); affected entity (Local/Integration).

**User actions:**
| Action | Result |
|---|---|
| Confirm | Executes change (task/calendar update), toast with Undo, sheet closes |
| Adjust | Edits parameters then confirms |
| Dismiss / Don't suggest again | Closes; writes preference to AI memory (S35) |

**States:**
| State | Behavior |
|---|---|
| Loading | Skeleton for provenance panel |
| Error | "Couldn't apply — try again"; original data untouched |
| Offline | Local-only actions (task changes) execute & queue; integration writes disabled with note |
| Empty | N/A |

**AI / automation touchpoints:** This *is* the AI consent surface — enforces explainability + confirmation guardrails (§6.4). "Don't suggest again" is an AI-memory write.

---

## S8 — Notifications Center

**Purpose:** In-app history of everything LifeOS notified or wants attention for, grouped and actionable.

**Entry points:** Bell icon on Today; tapping a push notification (opens relevant item, marks read here).

**Layout & key components:**
1. Top bar: "Notifications" + "Mark all read".
2. Filter chips: All · Suggestions · Reminders · Sync/Backup · System.
3. Grouped list (Today / Yesterday / Earlier); each row: icon, title, one-line body, timestamp, unread dot; swipe to dismiss.
4. Inline actions on suggestion rows (Accept / Dismiss).

**Data shown:** Notification log (Local, mirrored to Cloud); badge counts.

**User actions:** Tap row → deep-link to source (task, doc, suggestion S7, integration error S27); swipe dismiss; mark all read; link to Notification Preferences (S37) in overflow.

**States:**
| State | Behavior |
|---|---|
| Empty | Illustration + "You're all caught up" |
| Loading | List skeleton |
| Error | Retry banner |
| Offline | Shows cached log fully |

**AI / automation touchpoints:** Suggestion and automation-run notifications land here with their "based on…" reason preserved; rate-limiting keeps volume calm (calm-technology principle).

---

## S9 — Weekly Recap / Insights (P1)

**Purpose:** Weekly cross-domain digest — the recurring "aha" moment (sleep vs. productivity, spending from receipts, social vs. activity).

**Entry points:** Today recap card (Sunday/Monday); notification; More → (optional entry).

**Layout & key components:**
1. Hero card: week dates + headline insight ("You completed 34 tasks — best on 7h+ sleep days").
2. Section cards with mini-charts: Productivity, Health trends, Documents/spending, Social growth (if connected).
3. Correlation callouts (AI-generated, each with "based on" footnote).
4. Share button (image export, privacy-safe: user picks which sections).
5. "See last weeks" history list.

**Data shown:** Aggregations computed on Cloud from synced Local + Integration data; cached after generation.

**User actions:** Scroll; tap section → domain screen; share; open history.

**States:**
| State | Behavior |
|---|---|
| Empty | "Your first recap arrives Sunday" + what it will include |
| Loading | Card skeletons |
| Error | Retry generate |
| Offline | Shows last cached recap; banner "showing last generated" |

**AI / automation touchpoints:** Entire screen is AI-composed narrative + correlations; every claim carries a data citation; opt-out honored (recap becomes plain stats without AI narrative).

---

## S10 — Task Lists (Tasks Tab Root)

**Purpose:** The full task system — organized by Today / Upcoming / Someday and projects.

**Entry points:** Tasks tab; Today "top tasks" header link; notification deep-links.

**Layout & key components:**
1. Top bar: "Tasks" + search icon + overflow (sort, show completed).
2. Segmented control: **Today · Upcoming · Someday**.
3. AI suggestion chip row (contextual, e.g., "Schedule 3 overdue tasks into your 2pm gap?") — max 1.
4. Task list (FlatList, virtualized): each row = checkbox, title, due chip (red if overdue), priority flag, project dot, subtask count; **swipe right = complete, swipe left = snooze/delete**; drag handle to reorder.
5. Section: Projects/Lists (horizontal chips or collapsed section) → S13.
6. Completed (collapsed accordion at bottom).

**Data shown:** Tasks, projects, reminders — **Local first** (offline-first CRUD), synced to Cloud; calendar-fit ranking uses cached Calendar data.

**User actions:**
| Action | Result |
|---|---|
| Tap task | → S11 detail |
| Check / swipe complete | Optimistic complete + undo toast |
| Swipe snooze | Date picker sheet |
| Drag reorder | Persist manual order |
| `＋` (global) or list "+" | → S12 new-task sheet |
| Search | Filter-as-you-type overlay |
| Segment switch | Today ⇄ Upcoming ⇄ Someday |

**States:**
| State | Behavior |
|---|---|
| Empty | Per-segment friendly empty ("Nothing for today 🎉") + "Add a task" CTA |
| Loading | Instant from local DB; sync spinner subtle in top bar |
| Error | Sync-error chip (data still usable locally) |
| Offline | 100% functional; changes queue; offline banner |

**AI / automation touchpoints:** Task-scheduling suggestions (calendar-gap fitting); NL parsing on quick-add; automation-created tasks show a small robot/recipe badge linking to S30.

---

## S11 — Task Detail

**Purpose:** View and edit everything about one task.

**Entry points:** Task rows (S10, S6); reminder notification tap.

**Layout & key components:**
1. Top bar: back, overflow (duplicate, share, delete).
2. Large checkbox + editable title.
3. Property rows: due date & time, reminder, recurrence, priority, project/list, tags.
4. Subtasks checklist (+ add subtask inline).
5. Notes field (multiline).
6. Activity footer: created/completed timestamps; "created by automation X" if applicable.

**Data shown:** Single task record (Local, synced to Cloud).

**User actions:** Edit any field (auto-save); complete; delete (confirm + undo toast); duplicate; convert subtask→task; set reminder (schedules local notification).

**States:**
| State | Behavior |
|---|---|
| Loading | Instant (local) |
| Error | Save-conflict resolution: last-write-wins with toast |
| Offline | Fully editable; queued sync |
| Empty | N/A |

**AI / automation touchpoints:** "Suggest a time" chip next to due date (finds calendar gap, with reason); recurring-pattern detection ("You add 'water plants' weekly — make it recurring?").

---

## S12 — New / Edit Task (Quick-Add Sheet)

**Purpose:** Frictionless task capture, including natural-language entry.

**Entry points:** Global `＋` → Task; "+" in S10/S13; long-press `＋` (instant NL mode).

**Layout & key components (bottom sheet, keyboard-aware):**
1. Autofocused text field with NL parsing ("gym tomorrow 7am !p1 #fitness").
2. Live parse chips below the field (date, time, priority, project) — tap to edit/remove.
3. Shortcut row: calendar icon (date picker), flag (priority), folder (project), bell (reminder).
4. **Add** button (returns to sheet for rapid multi-add) · **Add & open** secondary.

**Data shown:** Parse preview; recent projects. Written to Local, queued to Cloud.

**User actions:** Type + submit; adjust chips; multi-add; swipe down to cancel (drafts kept if text present).

**States:**
| State | Behavior |
|---|---|
| Error | Parse failure = plain task with raw text (never blocks) |
| Offline | Fully functional |
| Loading/Empty | N/A |

**AI / automation touchpoints:** NL parsing (on-device rules first, AI-assisted parse if opted in); learned defaults from AI memory (e.g., "gym" tasks auto-suggest #fitness project).

---

## S13 — Project / List Detail

**Purpose:** All tasks within one project/list, with its own progress overview.

**Entry points:** Project chips/section in S10; project row on S11.

**Layout & key components:** Header (name, color, progress ring, % complete) → task list (same row spec as S10) → completed accordion → overflow (rename, color, archive, delete).

**Data shown:** Project + member tasks (Local/Cloud).

**User actions:** Same task interactions as S10; project rename/color/archive; add task pre-tagged to project.

**States:** Same as S10; empty = "No tasks in this project yet" + add CTA.

**AI / automation touchpoints:** "Break it down" chip on large/vague projects (AI-suggested subtasks, user approves each).

---

## S14 — Health Summary Dashboard (Health Tab Root)

**Purpose:** Unified daily health picture + trends from all connected sources and manual logs.

**Entry points:** Health tab; Today health snapshot card; readiness chip.

**Layout & key components:**
1. Top bar: "Health" + date scrubber (‹ today ›) + overflow (sources, units).
2. **Readiness hero card:** score/summary ("Good recovery") + contributing factors; tap → S17.
3. Metric grid (2-col cards): Steps, Sleep, Heart rate, Active energy, Workouts, Weight — each: today's value, sparkline, trend delta vs. 7-day avg; tap → S15.
4. Manual-log strip: Water · Mood · Weight quick buttons → S16 sheet.
5. Source footer: "Data from Apple Health · Garmin — last synced 9:02" → S26.

**Data shown:**
| Data | Source |
|---|---|
| Steps/sleep/HR/energy/workouts/weight | Health integration(s), cached Local |
| Garmin recovery/stress (P1) | Garmin Connect via backend |
| Water/mood/manual weight | Local (synced Cloud) |
| Readiness | Computed (on-device from cached metrics) |

**User actions:** Tap metric → S15; date scrub; quick log → S16; pull-to-refresh (re-query health source); manage sources → S26.

**States:**
| State | Behavior |
|---|---|
| Empty (no source) | Hero replaced by connect card ("See your sleep & steps here") + manual logging still available |
| Loading | Card skeletons; cached values render instantly |
| Error | Per-source error chip ("Health permission revoked — fix") → S26/S3 |
| Offline | Cached metrics with "as of" timestamp |

**AI / automation touchpoints:** Readiness-driven suggestions surface here and on Today ("Low readiness — lighter day?"); anomaly notes ("Resting HR up 8% this week") with data citation; never diagnostic language (wellbeing framing only).

---

## S15 — Metric Detail

**Purpose:** Deep dive on one metric with 7/30/90-day trends and history.

**Entry points:** Metric cards on S14; Today health tile long-press; recap links (S9).

**Layout & key components:**
1. Top bar: metric name + range selector (**7d · 30d · 90d**).
2. Large chart (line/bar, `victory-native` / gifted-charts): average line, min/max markers, tap-to-inspect tooltip.
3. Stat row: average · best · worst · trend delta.
4. History list (daily entries, source icon per row).
5. Context note ("Sleep counted from 11:24pm–5:44am · Apple Health").
6. For manual metrics (weight/water/mood): "+ Log entry" button → S16.

**Data shown:** Time-series from Health integration cache + manual logs (Local/Cloud).

**User actions:** Switch range; inspect points; log manual entry; edit/delete manual entries (swipe); share chart snapshot (optional).

**States:**
| State | Behavior |
|---|---|
| Empty | "No {metric} data yet" + connect or log CTA |
| Loading | Chart skeleton |
| Error | Retry chip |
| Offline | Cached series; entry logging works offline |

**AI / automation touchpoints:** Inline insight banner per range ("You sleep 46 min longer on weekends — based on 30d of sleep data"); dismissible; only when opted in.

---

## S16 — Manual Health Log (Bottom Sheet)

**Purpose:** Fast logging of water, mood, or weight for users without wearables (and alongside them).

**Entry points:** Quick-log strip (S14); metric detail (S15); global `＋` → Health Log.

**Layout & key components:** Segmented type selector (Water · Mood · Weight) → type-specific input (water: +250ml steppers; mood: 5-emoji scale + optional note; weight: numeric pad + unit) → timestamp row (defaults now, editable) → **Save**.

**Data shown:** Today's running total for the type (Local).

**User actions:** Log & save (haptic + toast); edit timestamp; cancel.

**States:** Offline = fully functional (local write); error = retry save; loading/empty = N/A.

**AI / automation touchpoints:** Streak nudge ("5-day water streak"); learned reminder suggestion ("You usually log mood at 9pm — want a reminder?") → creates a notification rule on confirm.

---

## S17 — Readiness Explainer (Bottom Sheet)

**Purpose:** Transparency for the daily readiness summary — how it was computed.

**Entry points:** Readiness hero (S14); readiness chip on Today.

**Layout & key components:** Readiness value + label → factor breakdown rows (Sleep duration ↑, Resting HR →, Yesterday's strain ↓) each with value + weight indicator → plain-language method note → disclaimer ("wellbeing guidance, not medical advice").

**Data shown:** Computed factors from cached health metrics (Local computation).

**User actions:** Tap factor → S15 for that metric; close.

**States:** Insufficient data = "Need ~3 days of sleep data for readiness"; offline = works from cache.

**AI / automation touchpoints:** This is an explainability surface (guardrail §6.4); optional suggestion at bottom ("Adapt today's plan to low readiness?" → S7).

---

## S18 — Documents Home (Docs Tab Root)

**Purpose:** Find any important document in <10 seconds; entry to capture and categories.

**Entry points:** Docs tab; Today doc card; search deep-links.

**Layout & key components:**
1. Top bar: "Documents" + sync-status cloud icon (→ S32) + overflow.
2. **Search bar** (persistent): full-text over OCR content, titles, tags ("car insurance", "March receipt"); recent searches beneath on focus.
3. **Scan / Add row:** big **📷 Scan document** button (→ S19) + **Import** (file/photo picker).
4. Category grid: ID · Finance · Medical · Warranty · Travel · Other — with counts (→ S21).
5. Recent documents (horizontal thumbnails → S20).
6. Reminders strip: expiring items ("Passport expires in 60 days").
7. Photo Backup entry card (P1 → S22).

**Data shown:**
| Data | Source |
|---|---|
| Thumbnails, metadata, tags | Local index + Cloud |
| Files | Emergent Managed Object Storage (encrypted), thumbnails cached |
| OCR text index | Cloud-built, synced snippet index local for offline search |
| Backup status | Cloud |

**User actions:** Search; scan (→ S19); import; open doc (→ S20); open category (→ S21); act on expiry reminders (renew task → creates task in S10).

**States:**
| State | Behavior |
|---|---|
| Empty | Onboarding illustration: "Snap your first document" + big scan CTA + sample categories |
| Loading | Thumbnail skeletons |
| Error | Upload-failed chip per item with retry; search fallback to local index |
| Offline | Search local index + cached thumbnails; scanning works (upload queues); banner shows queued count |

**AI / automation touchpoints:** Auto-tagging results surface here (category badges); smart reminders (warranty/renewal detection from OCR dates/amounts); automation badge on auto-filed docs (P1).

---

## S19 — Document Capture Flow (Full-Screen Modal)

**Purpose:** Snap → auto-crop → OCR → review & tag → encrypted save. The doc-capture "magic moment."

**Entry points:** Scan button (S18); global `＋` → Scan Document; camera quick action.

**Layout & key components (steps):**
| Step | Contents |
|---|---|
| 1. Camera | Live viewfinder with document edge-detection overlay; shutter; flash toggle; multi-page counter; gallery-import shortcut. Contextual camera-permission ask on first use (per permissions contract). |
| 2. Crop/adjust | Auto-detected crop handles; rotate; retake; add page |
| 3. Processing | Progress ("Reading text… 2 of 3 pages"), cancellable; runs async — user may background it |
| 4. Review & save | Extracted title (editable), detected fields (date, amount, vendor — editable chips), category picker (AI pre-selected), tags, storage note ("Encrypted · synced to cloud" or "Local only" per S34 setting), **Save** |

**Data shown:** Camera frames (device); OCR output (Cloud pipeline; on-device fallback where feasible); suggested category/tags (AI).

**User actions:** Capture pages; crop; edit extracted fields; change category; save (→ S20 with success toast); cancel (confirm-discard).

**States:**
| State | Behavior |
|---|---|
| Permission denied | Benefit explainer + request; if blocked, "Open Settings" button; import-from-gallery remains available |
| Loading | Step-3 progress with per-page status |
| Error | OCR failure → save image anyway with manual title ("You can retry OCR later") |
| Offline | Capture + crop fully work; OCR & upload queue with clear "will process when online" note |

**AI / automation touchpoints:** OCR field extraction + auto-categorization (always editable = human-in-the-loop); receipt-amount rules can trigger automations (P1: ">$200 → warranty reminder in 11 months") with visible confirmation.

---

## S20 — Document Detail / Viewer

**Purpose:** View a document full-screen with its metadata, OCR text, and actions.

**Entry points:** Any document thumbnail/row (S18, S21, S6, search results).

**Layout & key components:**
1. Full-screen viewer (pinch-zoom, page swipe for multi-page).
2. Slide-up metadata panel: title, category, tags, captured date, detected fields (amount/vendor/expiry), storage location (local-only vs. cloud-synced with lock icon), file size.
3. OCR text tab (selectable/copyable text).
4. Action bar: Share (with privacy warning) · Set reminder · Edit fields · Move category · Delete.

**Data shown:** Full-res file (Object Storage, cached after first view); metadata + OCR (Local/Cloud).

**User actions:** Zoom/browse; edit metadata; copy text; share/export; set expiry reminder (→ task/notification); move; delete (confirm + 30-day trash note); toggle "keep local only" for this item.

**States:**
| State | Behavior |
|---|---|
| Loading | Blurhash/thumbnail → full-res progressive load |
| Error | "Couldn't load file" + retry (metadata still shown) |
| Offline | Cached docs open fully; uncached show thumbnail + "available online" note |
| Empty | N/A |

**AI / automation touchpoints:** "Detected: expiry 12 Mar 2027 — remind you?" chip; related-document suggestions ("3 other receipts from this vendor").

---

## S21 — Category / Album View

**Purpose:** Browse one category (or photo album) with sort/filter.

**Entry points:** Category grid (S18); category chip on S20.

**Layout & key components:** Header (category name, count, total size) → sort/filter row (date, amount, name) → grid/list toggle → document grid (thumbnail, title, date, amount if finance) → multi-select mode (long-press) with bulk actions (move, delete, export).

**Data shown:** Filtered doc index (Local/Cloud).

**User actions:** Open doc; sort/filter; bulk select & act; add to category via scan shortcut.

**States:** Empty = "No {category} docs yet" + scan CTA; others same as S18.

**AI / automation touchpoints:** Category-level insight (Finance: "You've filed $432 of receipts this month"); miscategorization fix suggestions.

---

## S22 — Photo Backup (P1)

**Purpose:** Manage private photo backup: albums, backup progress, and on-device tagging.

**Entry points:** Docs home card (S18); Backup settings (S32).

**Layout & key components:** Backup status hero (X of Y backed up, progress bar, "backed up over Wi-Fi only" note) → albums grid → recent photos grid → settings shortcut (quality, Wi-Fi-only, which albums).

**Data shown:** Device photo library (permission-gated); backup manifest (Cloud); files in Object Storage; face/scene tags computed **on-device** (privacy-preserving per PRD).

**User actions:** Enable/pause backup; choose albums; open photo viewer; free-up-space action (P2).

**States:** Permission denied → explainer + Open Settings; offline → paused with clear resume note; empty → enable-backup onboarding card; error → per-item retry queue.

**AI / automation touchpoints:** On-device scene/face grouping for search ("passport", "whiteboard"); backup automations ("auto-back-up screenshots to Documents?" suggestion).

---

## S23 — More Hub (More Tab Root)

**Purpose:** Gateway to profile, settings, integrations, automations, privacy, and backup.

**Entry points:** More tab.

**Layout & key components:**
1. Profile header card: avatar, name, email, plan badge (Free / **Plus**) → S24; "Upgrade" pill if Free.
2. Menu groups (icon + label + chevron; attention badges where relevant):
   - **Connections:** Integrations (S26) · Automations (S28, P1) · Social stats (S31, P1)
   - **Data:** Cloud Sync & Backup (S32) · Privacy Center (S33)
   - **App:** General Settings (S25) · Notifications (S37)
   - **Support:** Help & About (S38)
3. Footer: version, logout.

**Data shown:** Profile (Cloud), plan status, per-item badges (e.g., integration token expired).

**User actions:** Navigate to any sub-screen; upgrade CTA (paywall sheet); logout (confirm).

**States:** Offline = fully navigable (cached profile); badge sync may be stale.

**AI / automation touchpoints:** Attention badge if an automation failed or AI memory has pending review items.

---

## S24 — Profile & Account

**Purpose:** Manage identity, plan, and account security.

**Entry points:** More header; Today avatar.

**Layout & key components:** Avatar (editable, uploads to Object Storage) → name/email fields → plan section (current plan, manage/upgrade, restore purchases) → security section (change password, 2FA (P1), active sessions) → danger zone (log out, delete account → S36 flow).

**Data shown:** Account record (Cloud, via auth integration); subscription state.

**User actions:** Edit profile; manage subscription; change password; enable 2FA; logout; start account deletion.

**States:** Offline = read-only with banner; error = field-level retry; loading = form skeleton.

**AI / automation touchpoints:** None (deliberately — account surfaces stay plain).

---

## S25 — General Settings

**Purpose:** App-level preferences.

**Entry points:** More menu.

**Layout & key components (grouped list):**
| Group | Settings |
|---|---|
| Appearance | Theme (System/Light/Dark), text size note (follows OS), reduce motion |
| Units & formats | Metric/imperial, 12/24h, week start day, language |
| App lock | Biometric lock toggle (Face ID/fingerprint), auto-lock timing, lock Vault only vs. whole app |
| Today | Time-of-day layout toggle, card visibility manager (show/hide + reorder cards) |
| Advanced | Clear local cache, diagnostics toggle |

**Data shown:** Settings store (Local, synced Cloud).

**User actions:** Toggle/select; biometric enable triggers OS biometric enrollment check; card manager = drag list.

**States:** Offline = fully functional; biometric unavailable state shows why ("No Face ID enrolled — Open Settings").

**AI / automation touchpoints:** Card manager shows which cards AI reorders dynamically vs. pinned by user.

---

## S26 — Integrations & Connected Accounts

**Purpose:** Central hub to connect, monitor, and disconnect every integration — with transparent data direction.

**Entry points:** More menu; connect CTAs across the app; error deep-links (expired tokens).

**Layout & key components:**
1. Top bar: "Integrations".
2. **Connected** section: rows per integration — logo, name, status dot (● synced / ● syncing / ● error), last-sync time, data-direction tag ("Read-only") → S27.
3. **Available** section: Apple/Google Health, Google/Apple Calendar, Garmin (P1), Instagram (P1), Notion (P1), Alexa (P2) — each with one-line value prop + **Connect**.
4. Free-tier note if at 2-integration limit → upgrade pill.
5. Footer link: "How integrations handle your data" (→ Privacy explainer).

**Data shown:** Connection registry (Cloud): status, scopes, last sync, error details; token health.

**User actions:**
| Action | Result |
|---|---|
| Connect | Pre-permission/benefit sheet → OAuth or OS permission → success row |
| Tap connected row | → S27 detail |
| Retry errored sync | Manual re-sync |
| Upgrade | Paywall sheet |

**States:**
| State | Behavior |
|---|---|
| Empty (none connected) | "LifeOS works best connected" hero + Available list |
| Loading | Row status spinners |
| Error | Row-level: "Reconnect needed — token expired" with fix CTA |
| Offline | Cached statuses (stale-marked); connect disabled |

**AI / automation touchpoints:** Suggestion row ("You log workouts manually — connect Garmin to automate this") based on usage patterns.

---

## S27 — Integration Detail

**Purpose:** Full transparency and control for one connection.

**Entry points:** Rows on S26; error notifications.

**Layout & key components:** Header (logo, name, connected-as account) → **Data scope panel:** exactly what's read/written, per data type with toggles where granular (e.g., Health: steps ✓ sleep ✓ heart rate ✗) → sync section (last sync, frequency, Sync now button, sync log of last 10 runs) → data-direction disclosure ("LifeOS reads… LifeOS never posts…") → **Disconnect** (destructive, confirm sheet: keep vs. delete already-imported data).

**Data shown:** Connection record, scope config, sync log (Cloud).

**User actions:** Toggle granular scopes; sync now; disconnect (choose data retention); reauthorize on expiry.

**States:** Error = prominent reconnect banner; offline = read-only view; loading = panel skeletons.

**AI / automation touchpoints:** Lists which automations/suggestions depend on this connection ("Disconnecting disables 'Sleep guard' automation") — dependency warning before disconnect.

---

## S28 — Automations List (P1)

**Purpose:** See, enable/disable, and manage all automation recipes.

**Entry points:** More menu; automation badges on tasks/docs; suggestion "turn this into an automation".

**Layout & key components:**
1. Top bar: "Automations" + "+ New" → S29.
2. **AI-suggested recipes** carousel (pre-built, one-tap review → opens S29 pre-filled): "Sleep guard", "Receipt warranty tracker", "Sunday planner".
3. My automations list: each row = name, trigger→action summary line, enabled switch, last-run status (✓ 7:02am / ⚠ failed), tap → S29 (edit) ; swipe → delete.
4. Footer link: Run history (S30).

**Data shown:** Automation definitions + run status (Cloud; evaluated server-side and on-device for local triggers).

**User actions:** Toggle enable (kill-switch per PRD); create/edit/delete; open run history; adopt suggested recipe (always lands in editor for review — never auto-enabled).

**States:**
| State | Behavior |
|---|---|
| Empty | Explainer hero ("Let LifeOS handle the busywork") + suggested recipes |
| Loading | Row skeletons |
| Error | Failed-run badge with reason → S30 |
| Offline | View + toggle queue; editor disabled for cloud-trigger recipes with note |

**AI / automation touchpoints:** This is the automation control center; AI proposes recipes from observed patterns (each shows the pattern evidence: "You've moved your run after short sleep 4 times").

---

## S29 — Automation Builder (P1)

**Purpose:** Build or edit a recipe: **Trigger → Condition → Action**, always user-approved.

**Entry points:** "+ New" or row tap on S28; "make this an automation" suggestions.

**Layout & key components (full-screen, stepped form):**
1. Name field (auto-suggested).
2. **Trigger picker:** domain-grouped (Health: sleep below X; Docs: receipt over $X; Time: every Sunday 6pm; Calendar: event added…).
3. **Condition rows (optional):** and/or logic, simple comparators.
4. **Action picker:** move/create task, set reminder, tag document, send notification, adjust Today card…
5. Live sentence preview: "**If** sleep < 6h, **then** move morning workout to evening **and** notify me."
6. Test-run button (dry run with sample data → shows what would happen).
7. Save (starts **enabled=off** by default; user flips on in S28 or via toggle here).

**Data shown:** Available triggers/actions filtered by connected integrations (greyed with "Connect Garmin to use this").

**User actions:** Compose; test; save; delete (edit mode).

**States:** Validation errors inline (incomplete rule can't save); offline = local-trigger recipes editable, cloud ones blocked with note.

**AI / automation touchpoints:** NL creation bar at top ("describe it: 'remind me 11 months after big receipts'" → AI drafts the rule for review); dependency hints from AI memory.

---

## S30 — Automation Run History (P1)

**Purpose:** Audit log of every automation execution — trust through transparency.

**Entry points:** S28 footer; failed-run badges; Today automation info cards.

**Layout & key components:** Filter chips (All / per-automation / Failed) → chronological list: timestamp, automation name, what happened ("Moved 'Morning run' → 6pm"), trigger evidence ("sleep 5h 20m"), status; tap row → detail sheet with before/after and **Undo** (where reversible).

**Data shown:** Run log (Cloud, cached).

**User actions:** Inspect runs; undo reversible actions; jump to automation editor; report issue.

**States:** Empty = "No runs yet"; offline = cached log; error = retry load.

**AI / automation touchpoints:** The transparency guardrail surface (§6.4 "visible run history").

---

## S31 — Social / Instagram Stats (P1)

**Purpose:** Instagram growth & engagement dashboard with wellbeing-aware creator insights.

**Entry points:** Today social card; More menu; post-connect success from S26.

**Layout & key components:**
1. Account header: @handle, avatar, account type (Business/Creator), last-refresh time.
2. Hero stat row: Followers (+delta today), Reach, Engagement rate — with 7/30-day toggle.
3. Growth chart (followers over time).
4. **Best-performing posts** grid: thumbnail, likes/comments/reach; tap → post metrics sheet.
5. **Cross-domain insight card:** "Posts published after 7h+ sleep get 22% more engagement *(based on Health + Instagram, 30d)*".
6. Footer: manage connection → S27.

**Data shown:** Instagram Graph API metrics via backend (read-only, cached); health correlations computed on Cloud from both sources.

**User actions:** Toggle ranges; inspect posts; refresh; open connection settings; share insight card (optional).

**States:**
| State | Behavior |
|---|---|
| Not connected | Connect hero with account-type requirement note ("Business/Creator accounts only") |
| Unsupported account | Graceful explanation + link to convert account type |
| Loading | Stat skeletons |
| Error (token/rate limit) | Reconnect banner / "showing cached data from 9:00am" |
| Offline | Cached stats, stale-stamped |

**AI / automation touchpoints:** Cross-domain correlation insights (the differentiator); posting-time suggestions; burnout-aware nudge ("Big week of posting + poor sleep — schedule a rest day?").

---

## S32 — Cloud Sync & Backup Settings

**Purpose:** Control what syncs to cloud, monitor backup health, and restore.

**Entry points:** More menu; sync-status icons (Docs, Today); onboarding follow-up prompt.

**Layout & key components:**
1. **Status hero:** overall state (✅ Backed up · ⟳ Syncing 12 items · ⚠ 3 failed), last successful backup time, storage meter (used / plan quota, upgrade pill near limit).
2. **What syncs** list (mirrors S34, quick view): Tasks ✓ · Documents ✓ · Photos (P1) · Health cache ✗ · AI memory ✓ — each row links to S34 for the full control.
3. Sync options: Wi-Fi only toggle, background sync toggle.
4. **Restore** section: "Restore from backup" (device-change flow: pick snapshot → confirm → progress).
5. Advanced: sync log, retry failed items, pause sync.

**Data shown:** Sync engine state (Local queue + Cloud manifest); storage usage (Cloud).

**User actions:** Toggle options; retry failures; run restore (guarded, confirm); manage storage (view largest items); upgrade.

**States:**
| State | Behavior |
|---|---|
| Never backed up | Setup hero: "Protect your data — enable encrypted backup" |
| Loading | Status shimmer |
| Error | Failed-items list with per-item retry + reason |
| Offline | Shows queue ("18 items waiting for connection"); all toggles work locally |

**AI / automation touchpoints:** None by design (backup stays deterministic); only a plain reminder if backup has been failing >48h.

---

## S33 — Privacy Center

**Purpose:** The trust hub — plain-language view of what LifeOS stores, where, and every control to change it.

**Entry points:** More menu; onboarding footer links; privacy links throughout the app.

**Layout & key components:**
1. Header: "Your data, your rules."
2. **At-a-glance panel:** counts per domain with location badges ("Documents: 128 — 📱 local + ☁️ encrypted cloud", "Health: 90 days — 📱 local only").
3. Menu rows: **Data Controls** (→ S34) · **AI Memory** (→ S35) · **Export / Delete** (→ S36).
4. Policy panel: "What we never do" (no ads, no selling, no training without opt-in) + link to plain-language policy.
5. Permissions summary: OS permissions status with fix links (→ S3 pattern / Open Settings).

**Data shown:** Storage inventory summary (Local + Cloud manifest); permission states (OS); policy content (bundled/CMS).

**User actions:** Navigate to sub-controls; review policies; fix permissions.

**States:** Offline = fully viewable from cache; loading = panel skeleton.

**AI / automation touchpoints:** Entry to AI Memory (S35); AI master toggle mirrored here ("Smart suggestions: On — manage").

---

## S34 — Per-Domain Data Controls (Local vs. Cloud)

**Purpose:** Granular, per-domain choice of where data lives — the PRD's local-first promise made tangible.

**Entry points:** Privacy Center (S33); "what syncs" rows in S32; storage note in doc capture (S19).

**Layout & key components:**
Per-domain control cards:

| Domain | Control | Notes shown to user |
|---|---|---|
| Tasks | Local only ⇄ Local + Cloud sync | "Cloud enables restore & multi-device" |
| Documents | Local only ⇄ Encrypted cloud backup | Per-item override exists in S20 |
| Photos (P1) | Backup on/off + album selection | Wi-Fi-only inherited from S32 |
| Health cache | Local only (fixed) ⇄ optional cloud | Default local-only, explicit opt-in |
| AI memory | Local + cloud ⇄ local only ⇄ off | "Off deletes memory — confirm" |
| Settings/profile | Cloud (required for account) | Explained, not toggleable |

Each card: current location badge, toggle, consequence text ("Turning off cloud keeps existing backups until you delete them — delete now?").

**Data shown:** Current sync policy per domain (Local settings + Cloud manifest).

**User actions:** Toggle per domain (confirmation sheets for downgrades, with option to purge already-uploaded data); jump to S36 for full deletion.

**States:** Offline = toggles queue with "applies when online" note for cloud-side purges; error = per-toggle retry.

**AI / automation touchpoints:** Changing AI-memory storage directly governs AI behavior; turning health cloud off shows which cloud insights (recap correlations) will degrade — honest tradeoff disclosure.

---

## S35 — AI Memory ("What LifeOS Remembers About You")

**Purpose:** View, edit, and delete every AI memory entry — the transparency centerpiece.

**Entry points:** Privacy Center; "Don't suggest again" flows (S7); Settings mentions of AI.

**Layout & key components:**
1. Master toggle: Smart suggestions On/Off (Off = no model calls; explains what still works).
2. Search/filter bar (by domain).
3. Memory list, grouped by domain (Routines · Preferences · Dismissals): each entry = plain sentence ("Prefers workouts in the morning"), source ("learned from 12 rescheduled tasks" or "you told us in onboarding"), date, and per-entry actions: ✏️ edit · 🗑 delete.
4. "+ Add a preference" (user-authored memory).
5. Footer: "Clear all memory" (destructive, double-confirm).

**Data shown:** Structured memory store (Local, optionally synced per S34).

**User actions:** Toggle AI; edit/delete/add entries (edits take effect on next suggestion cycle); clear all.

**States:**
| State | Behavior |
|---|---|
| Empty / AI off | "LifeOS hasn't learned anything yet" or "Suggestions are off" explainer |
| Loading | List skeleton |
| Error | Retry |
| Offline | Fully editable locally |

**AI / automation touchpoints:** This screen *is* the AI-memory guardrail (§6.1, §6.4): viewable, editable, deletable, with provenance per entry.

---

## S36 — Export / Delete My Data

**Purpose:** One-tap portable export and full right-to-be-forgotten deletion.

**Entry points:** Privacy Center; Profile danger zone (S24).

**Layout & key components:**
1. **Export section:** "Export everything" button → format note (portable JSON + files ZIP) → progress → download/share sheet when ready; history of past exports.
2. **Delete section:** clear consequence list (account, cloud backups, memory — "deletion cascades to backups within 30 days") → typed confirmation ("DELETE") → re-auth (password/biometric) → final confirm → logged out with completion email promise.

**Data shown:** Export job status (Cloud); deletion policy copy.

**User actions:** Start export (async, notified when ready); download; start deletion (guarded, reversible for 0 days once confirmed — stated plainly).

**States:** Export in-progress = status card, can leave screen; error = retry job; offline = both actions blocked with clear note (server-side operations).

**AI / automation touchpoints:** Deletion explicitly includes AI memory and suggestion history (listed in the consequence list).

---

## S37 — Notification Preferences

**Purpose:** Fine-grained control over every notification class — calm technology enforced.

**Entry points:** More menu; Notifications Center overflow (S8); "too many?" link on any notification.

**Layout & key components (grouped toggles):**
| Group | Controls |
|---|---|
| Task reminders | On/off, default reminder offset |
| AI suggestions | On/off, max per day slider (1–5), quiet hours |
| Health nudges | On/off (streaks, readiness alerts) |
| Backup & sync | Failures only / all / off |
| Weekly recap | In-app only / +push / +email |
| System & security | Always on (explained, not toggleable) |

Quiet-hours picker (start/end) applies globally. OS-permission status banner at top if notifications denied ("Enable in Settings" per permissions contract).

**Data shown:** Preference store (Local/Cloud); OS notification permission state.

**User actions:** Toggle groups; set quiet hours; set daily suggestion cap; fix OS permission.

**States:** OS denied = banner + Open Settings; offline = fully functional (local prefs, synced later).

**AI / automation touchpoints:** The suggestion rate-limit is user-controlled here (backs §6.2 "rate-limited to avoid nagging"); automation notifications inherit per-automation settings from S28.

---

## S38 — Help & About

**Purpose:** Support, docs, legal, and app info.

**Entry points:** More menu.

**Layout & key components:** FAQ list (searchable) → Contact support (email composer with optional diagnostics attach — user-consented) → What's new (release notes) → Legal (Terms, Privacy Policy, licenses) → App version + build.

**Data shown:** Static/CMS content; app metadata.

**User actions:** Browse FAQ; contact support; read legal docs.

**States:** Offline = cached FAQ; contact requires connection (queued draft note).

**AI / automation touchpoints:** Optional FAQ search assist (P2); none in v1.

---

# Appendix

## Screen → Route Mapping (Expo Router scaffold hint)

```text
app/
├── (auth)/
│   ├── welcome.tsx          # S1
│   ├── login.tsx            # S2
│   ├── permissions.tsx      # S3
│   ├── connect.tsx          # S4
│   └── personalize.tsx      # S5
├── (tabs)/
│   ├── _layout.tsx          # tab bar + center Quick-Add
│   ├── index.tsx            # S6 Today
│   ├── tasks/
│   │   ├── index.tsx        # S10
│   │   ├── [taskId].tsx     # S11
│   │   └── project/[id].tsx # S13
│   ├── health/
│   │   ├── index.tsx        # S14
│   │   └── metric/[type].tsx# S15
│   ├── docs/
│   │   ├── index.tsx        # S18
│   │   ├── [docId].tsx      # S20
│   │   ├── category/[c].tsx # S21
│   │   └── photos.tsx       # S22 (P1)
│   └── more/
│       ├── index.tsx        # S23
│       ├── profile.tsx      # S24
│       ├── settings.tsx     # S25
│       ├── integrations/    # S26, S27
│       ├── automations/     # S28–S30 (P1)
│       ├── social.tsx       # S31 (P1)
│       ├── backup.tsx       # S32
│       ├── privacy/         # S33–S36
│       ├── notifications-prefs.tsx # S37
│       └── help.tsx         # S38
├── notifications.tsx        # S8 (modal/push target)
├── recap.tsx                # S9 (P1)
├── capture.tsx              # S19 (full-screen modal)
└── sheets (non-route components): Quick-Add, S7, S12, S16, S17
```

## MVP Screen Cut (matches PRD §10.1)

| In MVP (v1.0) | Deferred |
|---|---|
| S0–S6, S7 (basic), S8, S10–S21, S23–S27, S32–S38 | S9 Recap, S22 Photos, S28–S30 Automations, S31 Social (all P1); Alexa/Drive import (P2) |

---

*End of IA & Screen Specification — ready for wireframing and navigation scaffolding.*
