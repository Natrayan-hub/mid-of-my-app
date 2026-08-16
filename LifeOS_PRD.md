# LifeOS — Product Requirements Document (PRD)

**Product:** LifeOS — A Personal Life Command Center
**Version:** 1.0 (Draft for build kickoff)
**Owner:** Product / Design / Architecture / AI / Security working group
**Status:** Ready for engineering review
**Platforms:** iOS & Android (React Native / Expo), with a companion cloud backend

---

## Table of Contents

1. [Vision & Positioning](#1-vision--positioning)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Users & Personas](#3-target-users--personas)
4. [Core Features](#4-core-features)
5. [Integrations](#5-integrations)
6. [AI Capabilities](#6-ai-capabilities)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Security & Privacy](#8-security--privacy)
9. [Success Metrics](#9-success-metrics)
10. [MVP Scope & Roadmap](#10-mvp-scope--roadmap)
11. [Appendix](#11-appendix)

---

## 1. Vision & Positioning

### 1.1 What LifeOS Is

**LifeOS is a personal life command center** — a single mobile app that unifies the fragments of a person's digital and physical life into one calm, glanceable, intelligent surface. It pulls together health data, tasks, documents, photos, social presence, and calendar into a **"Today" home screen** that answers one question the moment you open it: *"What matters right now?"*

LifeOS is not another to-do app, not another health tracker, and not another cloud drive. It is the **connective layer** that sits above all of them — reading from the tools you already use, learning your routines, and quietly automating the busywork of being a person.

### 1.2 Who It's For

People who feel **"tool fatigue"** — juggling 8–15 apps to run their lives (one for steps, one for tasks, one for receipts, one for calendar, one for notes) and losing the big picture in the process. Primarily digitally-literate adults aged 25–45 who value both **productivity and privacy**, and who want intelligence without surveillance.

### 1.3 The Core Problem

> Modern life is **fragmented across silos**. Your health lives in Apple/Google Health, your tasks in Todoist/Notion, your documents in Drive, your memories in Photos, your schedule in Calendar, your presence on Instagram. No single place shows the **whole picture**, and no assistant reasons **across** these silos. The cognitive overhead of context-switching is the tax people pay every day.

LifeOS eliminates that tax by being the **aggregation + intelligence + automation** layer.

### 1.4 How It's Different

| Existing Category | Example Apps | Their Limit | LifeOS Difference |
|---|---|---|---|
| Task managers | Todoist, Things, TickTick | Tasks only; no health/context | Tasks live next to health, calendar, and AI context |
| Health trackers | Apple Health, Fitbit, Garmin | Health only; passive dashboards | Health informs tasks & suggestions ("You slept 5h — I moved your 7am run") |
| Note/second-brain | Notion, Obsidian | Manual, high-effort | Auto-populated; AI does the organizing |
| Cloud storage | Drive, iCloud, Dropbox | Dumb file buckets | Documents + photos with OCR, tagging, and smart retrieval |
| Life dashboards | Life360, generic widgets | Shallow, single-domain | Cross-domain reasoning + privacy-first design |

**Positioning statement:**
> *For overwhelmed multi-app jugglers, LifeOS is the private, AI-powered command center that unifies health, tasks, documents, and daily life into one glanceable "Today" — so you spend less time managing your life and more time living it. Unlike single-purpose apps, LifeOS reasons across everything and keeps you in control of your data.*

### 1.5 Product Principles

1. **Glanceable first** — the most important thing should be visible in under 2 seconds.
2. **Privacy is a feature, not a footnote** — local-first, user-owned data, transparent AI.
3. **Aggregate, don't replace** — meet users where their data already lives.
4. **Calm technology** — reduce notifications and cognitive load, never add to it.
5. **AI as a quiet assistant** — suggests, never overrides; explains its reasoning.

---

## 2. Goals & Objectives

### 2.1 Product Goals

| Goal | Description | Measure of Success |
|---|---|---|
| Unify life data | Aggregate ≥5 data domains (health, tasks, calendar, docs, social) | ≥3 domains connected per active user within 30 days |
| Glanceable Today | Deliver a home screen users check daily | ≥4 Today-screen opens per DAU |
| Trustworthy AI | Provide useful, explainable suggestions | ≥40% of AI suggestions accepted or actioned |
| Reduce app-switching | Replace ≥3 daily-use apps | Self-reported "apps replaced" ≥3 in survey |

### 2.2 User Goals

| User Goal | How LifeOS Delivers |
|---|---|
| "See everything in one place" | Today screen aggregating all connected domains |
| "Stop forgetting things" | Unified tasks + smart reminders tied to context |
| "Keep my important docs safe & findable" | Encrypted document/photo backup with OCR search |
| "Understand my habits" | Health + routine insights over time |
| "Not be spied on" | Local-first storage, explicit data controls, no ad model |

### 2.3 Business Goals

| Business Goal | Target (measurable) | Horizon |
|---|---|---|
| Acquisition | 50,000 installs | 6 months post-launch |
| Activation | ≥45% of installs complete onboarding + connect 1 integration | Ongoing |
| Monetization | ≥6% free-to-premium conversion | 12 months |
| Retention | ≥30% Day-30 retention | 6 months |
| Unit economics | LTV\:CAC ≥ 3:1 | 12 months |
| NPS | ≥40 | 12 months |

**Monetization model:** Freemium subscription (**LifeOS Plus**). Free tier: core Today screen, tasks, 2 integrations, 2 GB backup. Plus tier (~$6.99/mo): unlimited integrations, unlimited AI suggestions, advanced automations, 200 GB encrypted backup, family sharing. **No advertising, no data selling** — ever (this is a positioning pillar, not just a policy).

---

## 3. Target Users & Personas

### Persona 1 — "The Optimizing Professional" (Priya, 31)

| Attribute | Detail |
|---|---|
| Role | Product marketing manager, urban, iPhone + Apple Watch |
| Tech comfort | High |
| Apps today | Apple Health, Todoist, Google Calendar, Notion, Instagram, Gmail |
| **Needs** | A single morning briefing; tasks that adapt to her calendar; health trends that don't require opening 3 apps |
| **Frustrations** | "I have data everywhere but insight nowhere." Constant context-switching; duplicate reminders across apps |
| **Use cases** | Morning Today check; auto-reschedule workouts around meetings; weekly health/productivity recap |
| Success looks like | Opens LifeOS instead of 5 apps each morning |

### Persona 2 — "The Busy Parent & Household CFO" (Marcus, 42)

| Attribute | Detail |
|---|---|
| Role | Operations lead, two kids, Android + Garmin |
| Tech comfort | Medium |
| Apps today | Google Calendar, Google Drive, Google Fit, banking apps, camera roll |
| **Needs** | Keep receipts/warranties/medical docs findable; shared family schedule; reminders that actually surface at the right time |
| **Frustrations** | Loses important documents in photo roll; forgets renewals & appointments; too many notifications |
| **Use cases** | Snap-and-file a receipt with OCR; "show me the car insurance doc"; family calendar overlay on Today |
| Success looks like | Finds any document in <10 seconds; never misses a renewal |

### Persona 3 — "The Creator & Quantified-Self Enthusiast" (Zoe, 26)

| Attribute | Detail |
|---|---|
| Role | Freelance content creator, iPhone, tracks everything |
| Tech comfort | Very high |
| Apps today | Instagram, Notion, Apple Health, Garmin, Google Calendar |
| **Needs** | Instagram growth stats next to her wellbeing; correlations between sleep/energy and output; automation of repetitive posting/tracking tasks |
| **Frustrations** | Instagram native analytics are shallow; burnout from always-on hustle; no view that ties creative output to health |
| **Use cases** | Daily follower/engagement snapshot; "your best-performing posts happen after 7+ hours sleep"; automated content-task templates |
| Success looks like | Grows audience while protecting wellbeing, guided by cross-domain insight |

---

## 4. Core Features

Features are grouped by area. Each includes **what it does** and **why it matters**. Priority tags: **P0** (MVP), **P1** (fast-follow), **P2** (later).

### 4.1 The "Today" At-a-Glance Home (P0)

**What it does:** The default landing screen. A vertically-scrolling, card-based digest personalized to the moment of day. Cards include: greeting + weather, next 3 calendar events, top 3 tasks, health snapshot (sleep, steps, readiness), AI suggestions, document/photo reminders, and social snapshot. Cards reorder by relevance (morning = sleep + agenda; evening = tomorrow prep + reflection).

**Why it matters:** This is the product's soul — the 2-second answer to "what matters now." It's the reason users open the app daily and the surface where every other domain proves its value.

**Key requirements:**
- Pull-to-refresh; skeleton loaders; graceful empty states per card.
- Time-of-day awareness (morning / midday / evening layouts).
- Every card deep-links to its domain.
- Fully functional with zero integrations connected (uses local tasks + manual entries) so first-run isn't empty.

### 4.2 Health Tracking (P0 core, P1 depth)

**What it does:** Aggregates health metrics from Apple Health / Google Health / Garmin: steps, sleep, heart rate, workouts, active energy, weight. Presents a health dashboard with trends (7/30/90-day), a daily "readiness" summary, and manual logging (water, mood, weight) for users without wearables.

**Why it matters:** Health context makes every other feature smarter (e.g., reschedule a workout after poor sleep) and is a top daily-open driver.

**Key requirements:** Read-only ingestion by default; charts via `victory-native`/`react-native-gifted-charts`; trend deltas; permission-gated per contract.

### 4.3 Tasks & Productivity (P0)

**What it does:** A first-class, native task system: quick-add, due dates, priorities, recurring tasks, projects/lists, subtasks, and natural-language add ("gym tomorrow 7am"). Two-way sync with external managers (Todoist/Notion) in later phases; standalone in MVP. Tasks surface on Today by urgency + calendar fit.

**Why it matters:** Tasks are the highest-frequency interaction and the anchor that makes LifeOS "sticky" even before integrations are connected.

**Key requirements:** Offline-first CRUD; local reminders/notifications; drag-to-reorder; swipe-to-complete; sections (Today / Upcoming / Someday).

### 4.4 Documents & Photo Backup (P0 for docs, P1 for advanced)

**What it does:** Secure capture and backup of important documents and photos. Snap a document → auto-crop → **OCR** → auto-tag (category, date, amount, vendor) → encrypted cloud backup. Search by content ("car insurance," "March receipt"). Photo backup with albums and on-device face/scene tagging (privacy-preserving).

**Why it matters:** Solves the "I lost the important paper in my camera roll" pain and creates a durable data moat (the more you store, the harder to leave).

**Key requirements:** Store files via **Emergent Managed Object Storage** (never base64 in DB); OCR pipeline; encryption at rest; full-text search index; thumbnail generation; document categories (ID, finance, medical, warranty, travel).

### 4.5 Social / Instagram Stats (P1)

**What it does:** Connects Instagram (via official Graph API for Business/Creator accounts) to show follower count, reach, engagement rate, best-performing posts, and daily deltas — surfaced as a Today card and a dedicated dashboard. Cross-references with health/routine data for wellbeing-aware creator insights.

**Why it matters:** Differentiates for the creator persona and enables unique cross-domain insights ("posts after good sleep perform 22% better") no single-domain tool offers.

**Key requirements:** Official API only (no scraping); read-only metrics; token refresh handling; graceful degradation if account type unsupported.

### 4.6 Calendar & Schedule (P0)

**What it does:** Read (P0) then two-way (P1) sync with Google/Apple Calendar. Unified agenda on Today; conflict detection; travel-time awareness; family/shared calendar overlay.

**Why it matters:** Calendar is the backbone that lets tasks and health be scheduled intelligently.

### 4.7 Smart Automations (P1)

**What it does:** User-configurable and AI-suggested "recipes" (IFTTT-style) that act across domains. Examples:
- "If sleep < 6h, move morning workout to evening and notify me."
- "When I snap a receipt over $200, tag it 'warranty' and remind me in 11 months."
- "Every Sunday 6pm, generate next week's task plan from my calendar."

**Why it matters:** Automations turn LifeOS from a dashboard into an active assistant — the step-change in perceived value and retention.

**Key requirements:** Rule builder (trigger → condition → action); AI-suggested recipes; run history/log; always user-approvable; kill-switch per automation.

### 4.8 Insights & Weekly Recap (P1)

**What it does:** A weekly digest correlating domains: productivity vs. sleep, spending patterns from receipts, social growth vs. activity. Delivered in-app + optional email.

**Why it matters:** Creates a recurring "aha" moment and a shareable artifact that drives word-of-mouth.

### 4.9 Feature Priority Summary

| Feature | Priority | MVP? |
|---|---|---|
| Today at-a-glance | P0 | ✅ |
| Tasks & productivity | P0 | ✅ |
| Health tracking (read) | P0 | ✅ |
| Documents backup + OCR | P0 | ✅ |
| Calendar (read) | P0 | ✅ |
| Cloud sync & backup | P0 | ✅ |
| AI smart suggestions (basic) | P0 | ✅ |
| Photo backup (advanced) | P1 | ❌ |
| Instagram stats | P1 | ❌ |
| Smart automations | P1 | ❌ |
| Weekly insights | P1 | ❌ |
| Two-way calendar/task sync | P1 | ❌ |
| Garmin / Alexa / Notion | P1–P2 | ❌ |
| Family sharing | P2 | ❌ |

---

## 5. Integrations

LifeOS's value scales with connections. All integrations are **user-authorized (OAuth or platform permission)**, **revocable in-app**, and **transparent about data direction**.

### 5.1 Cloud Sync & Backup

- **Approach:** Encrypted cloud sync of LifeOS-owned data (tasks, documents, photos, settings, AI memory) so users can restore on a new device and (later) sync across devices.
- **Storage:** Files/photos via **Emergent Managed Object Storage**; structured data in the managed database; encryption keys per §8.
- **Conflict resolution:** Last-write-wins for simple fields; per-item merge for tasks/notes; offline queue that syncs on reconnect.

### 5.2 Third-Party Integrations & Data Flow

| Integration | Data In (→ LifeOS) | Data Out (LifeOS →) | Direction | Phase |
|---|---|---|---|---|
| **Apple Health / Google Health** | Steps, sleep, HR, workouts, energy, weight | Optional: workout/mindfulness sessions logged in LifeOS | In (P0), Out (P2) | P0 |
| **Google Calendar / Apple Calendar** | Events, availability | Events created from LifeOS tasks | In (P0), 2-way (P1) | P0 |
| **Garmin Connect** | Advanced activity, recovery, stress, VO2 | — | In only | P1 |
| **Instagram (Graph API)** | Follower/engagement/reach metrics, post insights | — | In only | P1 |
| **Notion** | Databases/pages as tasks/notes | Tasks/notes pushed to Notion DB | 2-way | P1 |
| **Amazon Alexa** | Voice-added tasks/reminders | Today briefing, reminders (voice) | 2-way | P2 |
| **Email (Resend, outbound)** | — | Weekly recap, security alerts | Out only | P1 |
| **Google Drive / iCloud (import)** | Existing docs for backup/OCR | — | In only | P2 |

### 5.3 Integration Requirements

- Central **Connections** screen: connect/disconnect, last-sync time, data-direction disclosure, and per-integration data scope.
- Token storage encrypted; automatic refresh; clear error states when a token expires.
- **Read-only by default.** Any write-back (calendar events, Notion) requires explicit opt-in.
- Rate-limit-aware sync scheduling; background sync where OS permits.
- Every integration degrades gracefully — the app is fully usable with none connected.

> **Note:** All third-party integrations must be implemented via the platform's integration playbook process; official APIs only (no scraping, e.g., Instagram must use the Graph API for Business/Creator accounts).

---

## 6. AI Capabilities

The LifeOS AI is a **quiet, explainable assistant** — it reasons across domains to reduce effort, and it is explicit about what it will and won't do.

### 6.1 AI Memory (Preferences & Routines)

**What it does:** Builds a private, structured profile of the user's preferences and routines from their behavior and explicit input — e.g., "prefers workouts in the morning," "reviews tasks Sunday evening," "receipts over $200 matter," "wakes ~6:30am." This memory personalizes the Today screen, suggestions, and automations.

**What it does NOT do:** It does not build an advertising profile, does not share memory with third parties, and does not persist raw content it doesn't need. Memory is **viewable, editable, and deletable** by the user (a "What LifeOS remembers about you" screen).

### 6.2 Smart Suggestions

**What it does:** Context-aware, actionable nudges surfaced on Today, each with a one-line **reason**:
- "You slept 5h 20m — want me to move your 7am run to 6pm? *(based on your sleep)*"
- "3 tasks are overdue and you have a free block at 2pm. Schedule them? *(based on your calendar)*"
- "You usually pay rent around the 1st — reminder set. *(based on past receipts)*"

Suggestions are **always dismissible**, **never auto-executed** without confirmation (unless the user has explicitly enabled a specific automation), and rate-limited to avoid nagging.

### 6.3 Assistant Behavior (Conversational — P1)

**What it does:** A natural-language surface to query across domains: *"What's my day look like?"*, *"Find my passport scan,"* *"How did I sleep this week?"*, *"Add "call dentist" for tomorrow morning."* Answers cite which data they used.

**What it does NOT do:** It does not take irreversible actions (delete data, send money, post publicly) without explicit confirmation. It does not fabricate data — if it lacks a connection, it says so and offers to connect.

### 6.4 AI Design Guardrails

| Principle | Implementation |
|---|---|
| Explainability | Every suggestion shows its "based on…" source |
| Consent | AI features are opt-in; can be fully disabled |
| Confirmation | Actions require user approval; automations are explicitly enabled |
| Transparency | Editable AI memory; visible run history |
| Privacy | PII minimized before any model call; on-device processing where feasible; no training on user data without opt-in |
| No hallucinated data | AI never invents metrics; missing data is stated plainly |

**Implementation note:** LLM features use the managed universal LLM key via the integration playbook. Model selection (e.g., a capable general model for reasoning/summaries) is confirmed with the user during setup; sensitive fields are redacted/minimized before prompts.

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target |
|---|---|
| Cold start to interactive Today | < 2.5 s on mid-tier devices |
| Today card render (cached) | < 500 ms |
| Task create/complete feedback | < 100 ms (optimistic UI) |
| Scroll performance | Sustained 60 fps (use Reanimated, FlatList virtualization) |
| API p95 latency (backend) | < 400 ms |
| Document OCR (client-visible) | < 5 s per page, async with progress |

### 7.2 Offline Behavior

- **Offline-first for LifeOS-owned data** (tasks, notes, cached health/calendar, recently viewed docs).
- All reads served from local cache; writes queued and synced on reconnect with conflict handling.
- Clear offline indicator; no destructive failures when disconnected.

### 7.3 Scalability

- Backend stateless and horizontally scalable; database indexed for per-user query patterns.
- Object storage for all media (no blobs in DB).
- Designed to support 1M+ users; sync and AI workloads queued/rate-limited.

### 7.4 Reliability

| Aspect | Target |
|---|---|
| Backend uptime | 99.9% |
| Data durability (backups) | 99.999999999% (object storage tier) |
| Sync success rate | > 99.5% eventual consistency |
| Crash-free sessions | > 99.5% |
| Backup restore | Verified restore path; periodic restore tests |

### 7.5 Accessibility

- WCAG 2.1 AA intent: dynamic type / font scaling, ≥4.5:1 contrast, full screen-reader labels (`accessibilityLabel`) on all interactive elements.
- Minimum touch targets 44pt (iOS) / 48dp (Android).
- Reduced-motion support; no color-only status signaling.
- Full light/dark theme support.

---

## 8. Security & Privacy

> **Privacy is a design principle, not a feature bolt-on.** LifeOS's competitive moat is trust: we minimize data, we never sell it, and users own it.

### 8.1 Local vs. Cloud Data Control

- **Local-first by default.** Sensitive data (documents, health, AI memory) lives on-device and is only synced to cloud if the user enables **encrypted cloud backup**.
- **Granular controls:** per-domain toggle for what syncs to cloud (e.g., keep documents local-only while syncing tasks).
- **Data export & deletion:** one-tap export (portable format) and full account+data deletion ("right to be forgotten"), honored end-to-end including backups.

### 8.2 Encryption

| Layer | Mechanism |
|---|---|
| In transit | TLS 1.2+ for all client↔server and server↔integration traffic |
| At rest (server/DB) | AES-256 encryption at rest |
| At rest (files/photos) | Encrypted object storage |
| On-device | OS secure storage (Keychain/Keystore) for tokens & keys via the platform secure-storage util |
| Sensitive fields | Field-level encryption for documents/health; **E2E encryption** for the most sensitive vault items (roadmap P1) with user-held keys |

- Secrets/keys via environment/secret store — never hardcoded, never in the client bundle.

### 8.3 Authentication

- Primary: secure account auth (managed auth integration — social login and/or email) implemented via the auth integration playbook (never hand-rolled).
- Device-level biometric lock (Face ID / fingerprint) to open the app and to access the sensitive **Vault**.
- Session tokens: short-lived access + refresh, encrypted at rest; auto-logout on token compromise signals.
- Optional: 2FA for account access (P1).

### 8.4 Compliance

| Area | Commitment |
|---|---|
| **GDPR** | Lawful basis via explicit consent; data minimization; DSAR support (access, export, deletion, rectification); DPA with subprocessors; EU data residency option (P2) |
| **CCPA/CPRA** | No sale of personal data; opt-out not needed because we don't sell; disclosure of categories collected |
| **HIPAA-aware** | Health data handled with heightened safeguards; not a covered entity, but health data treated as sensitive per above |
| **Platform policies** | Apple HealthKit / Google Health Connect usage rules; Instagram Graph API terms; app store data-disclosure labels |
| **Transparency** | Plain-language privacy policy; in-app "Privacy Center" showing what's stored, where, and how to control it |
| **Retention** | Data retained only while account active; deletion cascades to backups within a defined window (e.g., 30 days) |

### 8.5 Security Practices

- Least-privilege OAuth scopes; PII minimized before any LLM call.
- Audit logging for security-relevant events; rate limiting & abuse protection on auth endpoints.
- Regular dependency scanning; periodic third-party security review before GA.

---

## 9. Success Metrics

### 9.1 North Star

**Daily "Today" opens per active user** — the truest signal that LifeOS has become the daily command center. Target: **≥4/day** among DAU.

### 9.2 Engagement

| KPI | Target |
|---|---|
| DAU / MAU (stickiness) | ≥ 35% |
| Avg. sessions/day | ≥ 3 |
| Integrations connected/user | ≥ 3 within 30 days |
| AI suggestion acceptance rate | ≥ 40% |
| Tasks created/active user/week | ≥ 10 |

### 9.3 Retention

| KPI | Target |
|---|---|
| Day-1 retention | ≥ 55% |
| Day-7 retention | ≥ 40% |
| Day-30 retention | ≥ 30% |
| 6-month retention | ≥ 20% |

### 9.4 Satisfaction & Growth

| KPI | Target |
|---|---|
| NPS | ≥ 40 |
| App store rating | ≥ 4.5★ |
| Free→Plus conversion | ≥ 6% |
| Organic/referral share of installs | ≥ 30% |
| Support ticket rate | < 2% of MAU |

### 9.5 Trust Metrics (unique to LifeOS)

| KPI | Target |
|---|---|
| % users who open Privacy Center | Tracked (higher = trust engagement) |
| Data-deletion request completion time | < 30 days, 100% honored |
| Security incidents | 0 material breaches |

---

## 10. MVP Scope & Roadmap

### 10.1 MVP (v1.0) — "The Command Center Core"

**Theme:** Prove the Today screen + tasks + one health source + document backup deliver daily value, privately.

**In scope:**
- **Today at-a-glance** home (time-of-day aware, card-based).
- **Tasks & productivity** (full offline CRUD, reminders, NL quick-add).
- **Health tracking (read-only)** from Apple Health / Google Health + manual logging.
- **Calendar (read-only)** from Google/Apple Calendar.
- **Documents backup + OCR + search** (encrypted, object storage).
- **Cloud sync & backup** with restore.
- **Basic AI smart suggestions** with explainability + editable AI memory.
- **Auth + biometric lock**, Privacy Center, data export/delete.
- Light/dark themes, accessibility baseline.

**Explicitly out of MVP:** Instagram stats, Garmin/Alexa/Notion, smart automations engine, conversational assistant, two-way sync, photo advanced tagging, family sharing.

**MVP success gate:** ≥40% Day-7 retention and ≥3 Today-opens/day in beta cohort before broad launch.

### 10.2 Roadmap

| Phase | Timeframe | Highlights |
|---|---|---|
| **v1.0 — MVP** | Launch | Today, Tasks, Health (read), Calendar (read), Docs+OCR, Cloud backup, Basic AI, Privacy Center |
| **v1.1 — Intelligence** | +6–8 wks | Conversational assistant, weekly insights/recap email, richer AI suggestions, advanced photo tagging |
| **v1.2 — Automations** | +8–12 wks | Smart automations engine (recipes), two-way calendar & task (Notion) sync |
| **v1.3 — Connected Life** | +12–16 wks | Instagram stats, Garmin integration, E2E-encrypted Vault, 2FA |
| **v2.0 — Household & Voice** | +6 mo | Family/shared spaces, Alexa voice, Drive/iCloud import, EU data residency, cross-device real-time sync |

### 10.3 Release Criteria (each phase)

- All P0 flows pass end-to-end testing (automated + manual).
- Security review passed for any new data flow / integration.
- Accessibility audit passed.
- Crash-free sessions > 99.5% in beta.
- Privacy disclosures & store labels updated.

---

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|---|---|
| **Today** | The at-a-glance home screen aggregating all domains |
| **AI Memory** | User-viewable/editable store of preferences & routines |
| **Automation / Recipe** | Trigger→condition→action rule spanning domains |
| **Vault** | Highest-sensitivity, biometric-locked, (roadmap) E2E-encrypted store |
| **Connection** | An authorized third-party integration |
| **Readiness** | Daily health summary derived from sleep/HR/activity |

### 11.2 Key Assumptions & Open Questions

- **Assumption:** Users will connect at least one health source and calendar; MVP still delivers value without them.
- **Assumption:** Instagram integration limited to Business/Creator accounts (Graph API constraint).
- **Open:** Final LLM model selection and on-device vs. cloud inference split.
- **Open:** E2E encryption UX for key recovery (avoid catastrophic lockout).
- **Open:** Exact free-tier limits (storage/integrations) pending pricing tests.

### 11.3 Out of Scope (v1–v2)

- Native desktop/web app (mobile-first).
- Financial account aggregation / banking (documents/receipts only).
- Third-party developer platform / public automation marketplace.
- Ad-supported tier (never).

---

*End of PRD — LifeOS v1.0. Ready for engineering, design, and security review.*
