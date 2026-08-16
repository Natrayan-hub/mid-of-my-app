# LifeOS — Technical Foundation: Data Models, API, Sync & Security

**Product:** LifeOS — Personal Life Command Center
**Version:** 1.0 (companion to `LifeOS_PRD.md` and `LifeOS_IA_and_Screens.md`)
**Audience:** Backend & mobile engineers
**Stack assumption:** React Native / Expo client (iOS + Android) · FastAPI backend · MongoDB (document DB) · Managed object storage for files · Managed auth integration

---

## Table of Contents

- [Part A — Data Models](#part-a--data-models)
- [Part B — API Design](#part-b--api-design)
- [Part C — Cloud Sync Logic](#part-c--cloud-sync-logic)
- [Part D — Security Implementation](#part-d--security-implementation)

---

# Part A — Data Models

## A.0 Conventions

- **IDs:** UUIDv4 strings, generated **client-side** for syncable entities (enables offline creation without ID collisions). Field name: `id` (PK).
- **Timestamps:** ISO-8601 UTC strings. Every syncable entity carries `created_at`, `updated_at`, `deleted_at` (soft delete, nullable).
- **Sync metadata:** Every syncable entity carries `version` (int, monotonic per-record), `device_id` (last writer), and `sync_state` (client-only: `synced | pending | conflict`).
- **Sensitivity flags:** 🔴 = sensitive → field-level encryption at rest (cloud) + on-device encrypted store. 🟠 = confidential (encrypted at rest via DB/disk encryption, standard handling). Unmarked = normal.
- **Storage class per entity:**
  - **L** = Local only by default (never leaves device unless user opts in via Data Controls S34)
  - **C** = Cloud only (server-owned)
  - **S** = Synced (local-first, replicated to cloud when domain sync is enabled)

## A.1 Entity Catalog & Storage Class

| Entity | Storage | Default sync | User can change? (S34) |
|---|---|---|---|
| User | C | — | No (required for account) |
| Profile | S | On | No (small, non-sensitive) |
| Device | C | — | No |
| Task, Project | S | On | Yes → local-only |
| HealthEntry (manual logs) | S | On | Yes → local-only |
| HealthCache (integration data) | **L** | **Off** | Yes → opt-in cloud |
| Document, DocumentPage | S (files in object storage) | On | Yes → local-only, per-item override |
| PhotoBackup (P1) | S (files in object storage) | Off until enabled | Yes |
| SocialStat (P1) | C (server-fetched) | Pulled to client cache | N/A |
| Automation, AutomationRun (P1) | C (+ local mirror) | Pulled | N/A |
| Integration (connection record) | C | Status pulled | N/A |
| IntegrationToken | C (server-only, never sent to client) | Never | N/A |
| AIMemoryEntry | S | On | Yes → local-only or off |
| Suggestion | C (pushed to client) | Pulled | N/A |
| NotificationItem | S | On | No |
| Preference (settings) | S | On | No |
| SyncRecord (oplog) | L + C | — | N/A |
| AuditLog | C | — | N/A |
| ExportJob / DeletionJob | C | — | N/A |

## A.2 Entity-Relationship Overview

```text
User (1)───(1) Profile
  │ ├──(N) Device
  │ ├──(N) Project ──(N) Task ──(N) Task (subtasks, self-ref parent_task_id)
  │ ├──(N) HealthEntry            [manual logs]
  │ ├──(N) HealthCache            [local-only integration data]
  │ ├──(N) Document ──(N) DocumentPage
  │ ├──(N) PhotoBackup
  │ ├──(N) Integration ──(1) IntegrationToken
  │ │        └──(N) SocialStat    [via Instagram integration]
  │ ├──(N) Automation ──(N) AutomationRun
  │ ├──(N) AIMemoryEntry
  │ ├──(N) Suggestion ──(0..1) AIMemoryEntry  [dismissal writes memory]
  │ ├──(N) NotificationItem
  │ ├──(1) Preference
  │ ├──(N) SyncRecord             [per-device oplog cursor]
  │ ├──(N) AuditLog
  │ └──(N) ExportJob / DeletionJob

Many-to-many:
  Task ⇄ Tag        (tags embedded as string[] — Mongo idiom, no join table)
  Document ⇄ Tag    (same)
  Automation → depends on → Integration (dependency list for disconnect warnings, S27)
```

## A.3 Schemas

### User `(C)`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | |
| email 🟠 | string | ✅ | — | Unique index |
| auth_provider | enum `password\|google` | ✅ | — | Managed auth integration |
| password_hash 🔴 | string | ⬜ | null | bcrypt; null for social-only |
| email_verified | bool | ✅ | false | |
| plan | enum `free\|plus` | ✅ | `free` | |
| plan_renews_at | datetime | ⬜ | null | |
| status | enum `active\|deletion_pending\|deleted` | ✅ | `active` | |
| mfa_enabled | bool | ✅ | false | P1 |
| created_at / updated_at | datetime | ✅ | now | |

**Relations:** 1–1 Profile, 1–N everything else.

### Profile `(S)`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | = user_id |
| user_id (FK) | uuid | ✅ | — | |
| display_name | string | ✅ | from auth | |
| avatar_url | string | ⬜ | null | Object storage URL |
| wake_time | string `HH:MM` | ⬜ | `06:30` | From onboarding S5 |
| focus_areas | string[] | ⬜ | `[]` | `fitness, tasks, documents, family, creator` |
| units | enum `metric\|imperial` | ✅ | locale-based | |
| theme | enum `system\|light\|dark` | ✅ | `system` | |
| ai_enabled | bool | ✅ | false | Master AI opt-in |
| timezone | string (IANA) | ✅ | device | |

### Device `(C)`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | Generated at install |
| user_id (FK) | uuid | ✅ | — | |
| platform | enum `ios\|android` | ✅ | — | |
| app_version | string | ✅ | — | |
| push_token 🟠 | string | ⬜ | null | |
| last_seen_at | datetime | ✅ | now | |
| revoked | bool | ✅ | false | Session revocation (S24 active sessions) |

### Project `(S)`

| Field | Type | Req | Default |
|---|---|---|---|
| id (PK) | uuid | ✅ | — |
| user_id (FK) | uuid | ✅ | — |
| name | string | ✅ | — |
| color | string hex | ✅ | `#6C5CE7` |
| sort_order | float | ✅ | append |
| archived | bool | ✅ | false |
| version / timestamps / deleted_at | — | ✅ | per §A.0 |

**Relations:** 1–N Task.

### Task `(S)`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | Client-generated |
| user_id (FK) | uuid | ✅ | — | |
| project_id (FK) | uuid | ⬜ | null | |
| parent_task_id (FK) | uuid | ⬜ | null | Subtask self-reference |
| title | string ≤500 | ✅ | — | |
| notes | string | ⬜ | null | |
| due_at | datetime | ⬜ | null | |
| all_day | bool | ✅ | true | |
| reminder_at | datetime | ⬜ | null | Schedules local notification |
| recurrence | RRULE string | ⬜ | null | e.g. `FREQ=WEEKLY;BYDAY=MO` |
| priority | int 0–3 | ✅ | 0 | 3 = highest |
| tags | string[] | ⬜ | `[]` | |
| bucket | enum `today\|upcoming\|someday` | ✅ | derived | Manual override allowed |
| sort_order | float | ✅ | append | Drag-reorder |
| completed_at | datetime | ⬜ | null | |
| source | enum `user\|automation\|suggestion` | ✅ | `user` | Badge in S10/S11 |
| source_ref_id | uuid | ⬜ | null | Automation/Suggestion id |
| version / timestamps / deleted_at / device_id | — | ✅ | §A.0 | |

**Indexes:** `(user_id, bucket, completed_at)`, `(user_id, due_at)`, `(user_id, project_id)`.

### HealthEntry `(S)` — manual logs

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | |
| user_id (FK) | uuid | ✅ | — | |
| type | enum `water\|mood\|weight` | ✅ | — | |
| value 🔴 | number | ✅ | — | ml / 1–5 / kg |
| note 🔴 | string | ⬜ | null | Mood note |
| logged_at | datetime | ✅ | now | |
| version / timestamps / deleted_at | — | ✅ | §A.0 | |

### HealthCache `(L — local-only by default)` — integration data

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id (FK) | uuid | ✅ | |
| metric 🔴 | enum `steps\|sleep\|heart_rate\|active_energy\|workout\|weight\|recovery\|stress` | ✅ | |
| value 🔴 | number | ✅ | |
| unit | string | ✅ | |
| start_at / end_at | datetime | ✅ | Sample window |
| source | enum `apple_health\|health_connect\|garmin` | ✅ | |
| readiness_input | bool | default true | Used in readiness calc |

> Stored in the device's encrypted SQLite. Uploaded to cloud **only** if user opts in via S34 (needed for cross-domain recap correlations, which are otherwise computed on-device or degraded — disclosed in S34).

### Document `(S)` + DocumentPage

**Document**

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | |
| user_id (FK) | uuid | ✅ | — | |
| title | string | ✅ | OCR-suggested | |
| category | enum `id\|finance\|medical\|warranty\|travel\|other` | ✅ | `other` | AI-suggested, user-editable |
| tags | string[] | ⬜ | `[]` | |
| detected_fields 🔴 | object | ⬜ | `{}` | `{date, amount, currency, vendor, expiry_date}` |
| ocr_text 🔴 | string | ⬜ | null | Full extracted text (search index source) |
| expiry_reminder_task_id | uuid | ⬜ | null | Link to created Task |
| storage_policy | enum `cloud\|local_only` | ✅ | domain default | **Per-item override (S20)** |
| size_bytes | int | ✅ | — | |
| version / timestamps / deleted_at | — | ✅ | §A.0 | Soft-delete = 30-day trash |

**DocumentPage** (1–N under Document)

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| document_id (FK) | uuid | ✅ | |
| page_number | int | ✅ | |
| object_key 🔴 | string | ✅ | Object-storage key of encrypted file |
| thumb_object_key | string | ✅ | Thumbnail key |
| local_path | string | client-only | Encrypted local copy |
| ocr_status | enum `pending\|done\|failed` | ✅ | |

### PhotoBackup `(S, P1)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id (FK) | uuid | ✅ | |
| device_asset_id | string | ✅ | OS photo-library ID |
| album | string | ⬜ | |
| object_key 🔴 | string | ⬜ | Null until uploaded |
| taken_at | datetime | ✅ | |
| size_bytes | int | ✅ | |
| on_device_tags | string[] | client-only | Face/scene tags — **never uploaded** |
| status | enum `queued\|uploaded\|failed` | ✅ | |

### Integration `(C)`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | |
| user_id (FK) | uuid | ✅ | — | |
| provider | enum `apple_health\|health_connect\|google_calendar\|apple_calendar\|garmin\|instagram\|notion\|alexa` | ✅ | — | |
| status | enum `connected\|error\|expired\|disconnected` | ✅ | — | |
| scopes | string[] | ✅ | — | Granular per S27 (e.g. `health.steps.read`) |
| direction | enum `read\|write\|two_way` | ✅ | `read` | Write requires explicit opt-in |
| last_sync_at | datetime | ⬜ | null | |
| last_error | string | ⬜ | null | Shown in S26/S27 |
| external_account 🟠 | string | ⬜ | null | e.g. `@zoe.creates` |

> Apple Health / Health Connect are **device-side** integrations: the Integration record exists for UI/status, but data flows OS → app locally; the server never talks to Apple/Google Health.

### IntegrationToken `(C, server-only)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| integration_id (FK) | uuid | ✅ | 1–1 |
| access_token 🔴 | string | ✅ | Envelope-encrypted (see §D.3) |
| refresh_token 🔴 | string | ⬜ | Envelope-encrypted |
| expires_at | datetime | ⬜ | |
| token_key_id | string | ✅ | KMS key reference for rotation |

> **Never serialized to any API response. Never sent to the client.**

### SocialStat `(C, P1)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id (FK) | uuid | ✅ | |
| integration_id (FK) | uuid | ✅ | |
| captured_on | date | ✅ | Daily snapshot; unique `(user_id, captured_on)` |
| followers | int | ✅ | |
| reach | int | ✅ | |
| engagement_rate | float | ✅ | |
| top_posts | object[] | ⬜ | `{media_id, thumb_url, likes, comments, reach}` |

### Automation `(C, P1)` + AutomationRun

**Automation**

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | |
| user_id (FK) | uuid | ✅ | — | |
| name | string | ✅ | — | |
| enabled | bool | ✅ | **false** | Saved disabled; user flips on (S29) |
| trigger | object | ✅ | — | `{type: "health.sleep.below", params: {hours: 6}}` |
| conditions | object[] | ⬜ | `[]` | `[{field, op, value, join: "and"}]` |
| actions | object[] | ✅ | — | `[{type: "task.reschedule", params: {...}}]` |
| depends_on_integrations | string[] | ✅ | derived | For S27 disconnect warnings |
| origin | enum `user\|ai_suggested` | ✅ | `user` | |
| exec_locus | enum `device\|server` | ✅ | derived | Local triggers (health) run on device |

**AutomationRun**

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| automation_id (FK) | uuid | ✅ | |
| ran_at | datetime | ✅ | |
| status | enum `success\|failed\|skipped` | ✅ | |
| trigger_evidence 🔴 | object | ✅ | `{metric: "sleep", value: "5h20m"}` — S30 transparency |
| changes | object[] | ✅ | Before/after for Undo |
| reversible | bool | ✅ | |
| reverted_at | datetime | ⬜ | |

### AIMemoryEntry `(S)`

| Field | Type | Req | Default | Notes |
|---|---|---|---|---|
| id (PK) | uuid | ✅ | — | |
| user_id (FK) | uuid | ✅ | — | |
| domain | enum `routine\|preference\|dismissal` | ✅ | — | Grouping in S35 |
| statement 🔴 | string | ✅ | — | Plain sentence: "Prefers morning workouts" |
| structured 🔴 | object | ✅ | — | `{key: "workout_time_pref", value: "morning", confidence: 0.86}` |
| provenance | object | ✅ | — | `{source: "learned\|onboarding\|user_added", evidence: "12 rescheduled tasks"}` |
| author | enum `system\|user` | ✅ | `system` | |
| version / timestamps / deleted_at | — | ✅ | §A.0 | Fully editable/deletable (S35) |

### Suggestion `(C)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id (FK) | uuid | ✅ | |
| kind | enum `reschedule_task\|schedule_gap\|reminder\|recipe\|insight` | ✅ | |
| text | string | ✅ | Rendered on card |
| reason | string | ✅ | "based on…" (guardrail §6.4) |
| sources | object[] | ✅ | `[{type: "health.sleep", value: "5h20m"}]` — S7 provenance panel |
| proposed_action | object | ⬜ | Executable payload |
| status | enum `pending\|accepted\|dismissed\|expired` | ✅ | |
| expires_at | datetime | ✅ | Suggestions are ephemeral |

### NotificationItem `(S)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id (FK) | uuid | ✅ | |
| category | enum `suggestion\|reminder\|sync\|system` | ✅ | S8 filters |
| title / body | string | ✅ | |
| deeplink | string | ✅ | e.g. `lifeos://tasks/{id}` |
| read_at | datetime | ⬜ | |
| created_at | datetime | ✅ | |

### Preference `(S)` — settings singleton per user

| Field | Type | Req | Default |
|---|---|---|---|
| id (PK) | uuid = user_id | ✅ | — |
| notif_prefs | object | ✅ | sane defaults (S37: per-group toggles, quiet hours, suggestions/day cap 3) |
| sync_prefs | object | ✅ | `{wifi_only: false, background: true}` |
| **data_controls** | object | ✅ | `{tasks: "cloud", documents: "cloud", health_cache: "local", ai_memory: "cloud", photos: "off"}` — **the S34 policy source of truth** |
| app_lock | object | ✅ | `{enabled: false, scope: "vault", auto_lock_min: 5}` |
| today_cards | object[] | ✅ | Card visibility + pin order (S25) |

### SyncRecord `(L + C)` — oplog & cursors

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id | uuid | ✅ | |
| device_id | uuid | ✅ | |
| entity_type | string | ✅ | `task`, `document`, … |
| entity_id | uuid | ✅ | |
| op | enum `create\|update\|delete` | ✅ | |
| version | int | ✅ | Record version after op |
| server_seq | int (cloud) | ✅ | Global per-user monotonic sequence — the pull cursor |
| payload_hash | string | ✅ | Integrity check |
| created_at | datetime | ✅ | |

### AuditLog `(C, append-only)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id | uuid | ✅ | |
| event | string | ✅ | `auth.login`, `auth.failed`, `token.refresh`, `integration.connect`, `data.export`, `data.delete`, `scope.change`, `automation.run`, `ai.memory.cleared` |
| actor | enum `user\|system\|automation` | ✅ | |
| ip 🟠 / device_id | string | ⬜ | |
| meta | object | ⬜ | Never contains payload content |
| created_at | datetime | ✅ | Immutable; 12-month retention |

### ExportJob / DeletionJob `(C)`

| Field | Type | Req | Notes |
|---|---|---|---|
| id (PK) | uuid | ✅ | |
| user_id | uuid | ✅ | |
| type | enum `export\|delete` | ✅ | |
| status | enum `queued\|running\|ready\|done\|failed` | ✅ | |
| artifact_key 🔴 | string | ⬜ | Signed, expiring export ZIP (7-day TTL) |
| scheduled_purge_at | datetime | ⬜ | Deletion cascade deadline (≤30 days, §8.4 PRD) |

---

# Part B — API Design

## B.0 Style & Global Conventions

**REST over GraphQL.** Rationale: the client's dominant pattern is *bulk delta sync* (one endpoint) plus simple per-entity CRUD; GraphQL's flexible querying adds server complexity, cache-invalidation difficulty, and a larger attack surface without benefit for a single first-party client. REST + a dedicated `/sync` endpoint is simpler, cacheable, and easier to rate-limit per route.

| Convention | Value |
|---|---|
| Base URL | `https://api.lifeos.app/api/v1` (all routes prefixed `/api`; version in path) |
| Auth | `Authorization: Bearer <access_jwt>` on all routes except `/auth/*` |
| Content type | JSON; file upload/download via signed object-storage URLs (never through the API body) |
| Idempotency | Client-generated UUIDs make create idempotent; mutating non-CRUD calls accept `Idempotency-Key` header |
| Pagination | Cursor-based: `?cursor=<opaque>&limit=50` (max 200) → response `{items, next_cursor}` |
| Errors | Uniform envelope, correct HTTP status |

**Error envelope:**

```json
{ "error": { "code": "TASK_NOT_FOUND", "message": "Task does not exist", "retryable": false } }
```

| HTTP | Codes used |
|---|---|
| 400 | `VALIDATION_ERROR` |
| 401 | `TOKEN_EXPIRED`, `TOKEN_INVALID` |
| 403 | `FORBIDDEN`, `PLAN_LIMIT` (free-tier gates), `SCOPE_DENIED` |
| 404 | `*_NOT_FOUND` |
| 409 | `VERSION_CONFLICT` (sync), `DUPLICATE` |
| 410 | `CURSOR_EXPIRED` (sync reset needed) |
| 429 | `RATE_LIMITED` (+ `Retry-After` header) |
| 5xx | `INTERNAL`, `INTEGRATION_UPSTREAM_ERROR` |

**Rate limiting** (per user, token-bucket; per-IP on `/auth/*`):

| Route group | Limit |
|---|---|
| `/auth/*` | 10/min per IP + progressive lockout on failures |
| `/sync` | 60/min |
| CRUD routes | 240/min |
| `/ai/*` | 30/min + daily suggestion cap from Preference |
| Integration sync triggers | 6/min (upstream-API aware) |

**Versioning:** URL major version (`/v1`). Additive changes are non-breaking (clients ignore unknown fields). Breaking changes → `/v2` with ≥6-month dual-running; client sends `X-App-Version` so the server can gate/deprecate gracefully.

## B.1 Auth

| # | Method & Path | Purpose | Auth |
|---|---|---|---|
| 1 | `POST /auth/register` | Email/password sign-up | — |
| 2 | `POST /auth/login` | Email/password login | — |
| 3 | `POST /auth/social` | Social login (managed auth code exchange) | — |
| 4 | `POST /auth/refresh` | Rotate access token | Refresh token |
| 5 | `POST /auth/logout` | Revoke refresh token + device | Bearer |
| 6 | `POST /auth/password/forgot` → `POST /auth/password/reset` | Reset flow | — |
| 7 | `GET /auth/sessions` / `DELETE /auth/sessions/{device_id}` | List/revoke devices (S24) | Bearer |

**`POST /auth/login`** — request/response:

```json
// request
{ "email": "priya@example.com", "password": "•••", "device": { "id": "uuid", "platform": "ios", "app_version": "1.0.0" } }

// 200 response
{
  "access_token": "eyJ...",           // JWT, 15 min TTL
  "refresh_token": "rt_...",          // opaque, 30 days, rotating, stored in SecureStore
  "expires_in": 900,
  "user": { "id": "…", "email": "…", "plan": "free" }
}
```

Errors: `401 AUTH_INVALID_CREDENTIALS`, `423 AUTH_LOCKED` (brute-force lockout), `429 RATE_LIMITED`.

> Auth is implemented via the platform's managed auth integration playbook — never hand-rolled crypto.

## B.2 Users & Profile

| # | Method & Path | Purpose | Notes |
|---|---|---|---|
| 1 | `GET /me` | User + profile + plan | |
| 2 | `PATCH /me/profile` | Update profile fields | Body: any Profile subset |
| 3 | `PUT /me/preferences` | Full Preference upsert (incl. `data_controls`) | Server enforces §C.4 on change |
| 4 | `GET /me/preferences` | Fetch preferences | |
| 5 | `POST /me/avatar` | Get signed upload URL for avatar | → `{upload_url, object_key}` |
| 6 | `POST /me/export` | Start ExportJob (GDPR) | 202 → `{job_id}` |
| 7 | `GET /me/export/{job_id}` | Poll job → signed download URL when `ready` | |
| 8 | `DELETE /me` | Start DeletionJob (right to be forgotten) | Requires recent re-auth (`X-Reauth` token) |

## B.3 Tasks & Projects

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `GET /tasks?bucket=today&project_id=&completed=false&cursor=` | List (paginated) — used for cold restore; day-to-day reads are local |
| 2 | `POST /tasks` | Create (idempotent by client `id`) |
| 3 | `PATCH /tasks/{id}` | Update (must send `version` → 409 on conflict) |
| 4 | `DELETE /tasks/{id}` | Soft delete |
| 5 | `POST /tasks/{id}/complete` / `POST /tasks/{id}/reopen` | Complete toggle with `completed_at` |
| 6 | `GET/POST/PATCH/DELETE /projects` | Project CRUD (same pattern) |

**`PATCH /tasks/{id}`:**

```json
// request
{ "version": 4, "due_at": "2026-06-12T18:00:00Z", "priority": 2 }
// 200 → full updated task with "version": 5
// 409 → { "error": { "code": "VERSION_CONFLICT" }, "server_record": { ...v6... } }
```

## B.4 Health

| # | Method & Path | Purpose | Notes |
|---|---|---|---|
| 1 | `POST /health/entries` | Create manual log (water/mood/weight) | Syncable entity |
| 2 | `GET /health/entries?type=&from=&to=&cursor=` | List manual logs | |
| 3 | `PATCH /health/entries/{id}` / `DELETE …` | Edit/delete manual logs | |
| 4 | `POST /health/cache/opt-in` | Enable cloud upload of HealthCache (S34) | Audit-logged scope change |
| 5 | `PUT /health/cache/batch` | Bulk upload cached samples (only if opted in) | ≤1000 samples/call |
| 6 | `GET /health/summary?date=` | Server-side summary for recap (only from opted-in data) | Otherwise client computes locally |

> Steps/sleep/HR ingestion from HealthKit / Health Connect happens **on-device** (OS APIs); there are deliberately no server endpoints for it unless the user opts in (#4–5). Garmin is server-side — see B.8.

## B.5 Documents & Photos

File bytes never travel through the API — signed URLs only.

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `POST /documents` | Create doc shell → returns per-page signed upload URLs |
| 2 | `POST /documents/{id}/pages/{n}/uploaded` | Confirm page upload → enqueues OCR |
| 3 | `GET /documents/{id}` | Metadata + signed, short-lived download/thumb URLs |
| 4 | `GET /documents?category=&q=&cursor=` | List/search (`q` = full-text over `ocr_text`, title, tags) |
| 5 | `PATCH /documents/{id}` | Edit title/category/tags/detected_fields/`storage_policy` |
| 6 | `DELETE /documents/{id}` | Soft delete (30-day trash) → `POST /documents/{id}/restore` |
| 7 | `GET /documents/{id}/ocr` | OCR status/result (`pending\|done\|failed`) |
| 8 | `POST /photos/batch` (P1) | Register photo batch → signed upload URLs |
| 9 | `GET /storage/usage` | `{used_bytes, quota_bytes}` for S32 meter |

**`POST /documents`:**

```json
// request
{ "id": "client-uuid", "title": "Car insurance 2026", "category": "finance", "pages": 3, "storage_policy": "cloud" }
// 201 response
{ "id": "…", "upload_urls": [ { "page": 1, "url": "https://storage…sig=…", "expires_in": 900 }, … ] }
```

If `storage_policy: "local_only"` → **400 VALIDATION_ERROR**: local-only docs must never call this endpoint (client-enforced too; see §C.4).

## B.6 Social (P1)

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `GET /social/instagram/stats?range=7d\|30d` | Daily snapshots + deltas |
| 2 | `GET /social/instagram/posts/top?range=` | Best-performing posts |
| 3 | `POST /social/instagram/refresh` | Force upstream refresh (rate-limited 6/min, respects Graph API quotas) |
| 4 | `GET /social/insights` | Cross-domain correlations (requires health cloud opt-in; else `403 SCOPE_DENIED` with explanation) |

## B.7 Automations (P1)

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `GET /automations` | List with last-run status |
| 2 | `POST /automations` | Create (always `enabled: false` initially — server-enforced) |
| 3 | `PATCH /automations/{id}` | Edit / enable / disable (kill-switch) |
| 4 | `DELETE /automations/{id}` | Delete |
| 5 | `POST /automations/{id}/test` | Dry run → `{would_do: [...]}` (S29 test button) |
| 6 | `GET /automations/runs?automation_id=&status=&cursor=` | Run history (S30) |
| 7 | `POST /automations/runs/{run_id}/revert` | Undo reversible run |
| 8 | `POST /automations/draft` | NL → draft rule (AI): `{"prompt": "remind me 11 months after big receipts"}` → unsaved Automation JSON for review |

## B.8 Integrations

**Connect flow (server-mediated OAuth, e.g., Garmin / Instagram / Notion / Google Calendar):**

```text
1. Client:  POST /integrations/{provider}/connect  → { "authorize_url": "https://…state=…" }
2. Client opens authorize_url in system browser (ASWebAuthenticationSession / Custom Tabs)
3. Provider redirects → GET /integrations/{provider}/callback?code=&state=   (server endpoint)
4. Server exchanges code → stores IntegrationToken (encrypted, server-only) → deep-links app: lifeos://integrations/success
5. Client:  GET /integrations  → row shows "connected"
```

| # | Method & Path | Purpose | Notes |
|---|---|---|---|
| 1 | `GET /integrations` | All connections + status + last_sync + scopes | S26 |
| 2 | `POST /integrations/{provider}/connect` | Begin OAuth → `authorize_url` with `state` (CSRF) + PKCE | |
| 3 | `GET /integrations/{provider}/callback` | OAuth redirect target (server) | Validates `state` |
| 4 | `PATCH /integrations/{id}/scopes` | Granular scope toggles (S27) | Audit-logged |
| 5 | `POST /integrations/{id}/sync` | Manual "Sync now" | 202; rate-limited |
| 6 | `GET /integrations/{id}/log` | Last 10 sync runs (S27) | |
| 7 | `DELETE /integrations/{id}?purge_data=true\|false` | Disconnect; optionally purge imported data | Revokes upstream token where API allows |
| 8 | `POST /integrations/device-status` | Client reports device-side integration state (Apple Health / Health Connect granted metrics) | Keeps S26 UI truthful |

**Token refresh handling (server-side, invisible to client):**
- Background scheduler refreshes tokens expiring within 24 h using the encrypted `refresh_token`.
- On upstream `invalid_grant` → Integration.status = `expired`, NotificationItem created ("Reconnect Garmin"), badge on More tab.
- All refreshes audit-logged (`token.refresh`), tokens re-encrypted with current KMS key.

**Provider notes:**

| Provider | Mechanism | Data pulled | Cadence |
|---|---|---|---|
| Apple Health / Health Connect | On-device OS APIs (no server) | steps, sleep, HR, workouts, energy, weight | On app open + OS background delivery |
| Google/Apple Calendar | Server OAuth (Google) / on-device EventKit (Apple) | events, availability | Poll 15 min + push channel (Google) |
| Garmin Connect | Server OAuth + Garmin push/webhook | activity, recovery, stress, VO2 | Webhook + daily backfill |
| Instagram Graph API | Server OAuth (Business/Creator) | followers, reach, engagement, media insights | Daily snapshot + manual refresh |
| Notion | Server OAuth | DB rows ⇄ tasks | 15 min poll, two-way (P1) |
| Alexa (P2) | Alexa skill + account linking (OAuth from Alexa side) | voice-added tasks in; briefing out | Event-driven |

## B.9 Sync

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `POST /sync` | **The** delta-sync endpoint: push local ops, pull server ops (see Part C for payload) |
| 2 | `GET /sync/manifest` | Full state summary `{entity_type: {count, max_seq}}` — restore & drift detection |
| 3 | `POST /sync/bootstrap` | Full restore stream for new device (paginated by entity type) |

## B.10 AI & Preferences (AI Memory, Suggestions)

All routes 403 `SCOPE_DENIED` if `profile.ai_enabled = false`.

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `GET /ai/suggestions?status=pending` | Today's suggestion cards |
| 2 | `POST /ai/suggestions/{id}/accept` | Execute `proposed_action` (server applies, returns changed entities) |
| 3 | `POST /ai/suggestions/{id}/dismiss` | Dismiss (+ optional `{"never_again": true}` → writes AIMemoryEntry) |
| 4 | `GET /ai/memory` | List memory entries (S35) |
| 5 | `POST /ai/memory` | User-authored entry |
| 6 | `PATCH /ai/memory/{id}` / `DELETE /ai/memory/{id}` | Edit/delete |
| 7 | `DELETE /ai/memory` | Clear all (double-confirmed client-side; audit-logged) |
| 8 | `POST /ai/assistant/query` (P1) | Conversational query → answer + `sources[]` citations |
| 9 | `GET /ai/recap?week=2026-W23` (P1) | Weekly recap payload (S9) |

**LLM usage:** server-side only, via the managed universal LLM key per integration playbook. Before any model call: PII minimization pipeline strips names/emails/exact locations; only aggregates and category-level facts are sent. No user data used for training.

## B.11 Notifications

| # | Method & Path | Purpose |
|---|---|---|
| 1 | `GET /notifications?category=&cursor=` | Notification Center list (S8) |
| 2 | `POST /notifications/read` | Mark read `{ids: []}` or `{all: true}` |
| 3 | `PUT /me/devices/{id}/push-token` | Register push token |

---

# Part C — Cloud Sync Logic

## C.1 Architecture: Offline-First with Local Store + Oplog Delta Sync

**Choice:** every syncable domain reads/writes an on-device **encrypted SQLite** database first; a background **sync engine** exchanges deltas with the server via `POST /sync`.

**Why (vs. online-first or full-state sync):**
1. PRD NFRs demand offline-first (§7.2) and <100 ms task feedback — only local-first delivers this.
2. Privacy principle: local-first is the *technical enforcement* of "your data lives on your device unless you opt in."
3. Delta (oplog) sync minimizes bandwidth/battery vs. full-state diffs and gives a natural audit/undo trail.
4. Client-generated UUIDs + per-record versions make offline creation and idempotent retries trivial.

```text
┌────────────── Device ──────────────┐        ┌────────────── Cloud ──────────────┐
│ UI ── optimistic writes            │        │  /sync endpoint                    │
│  │                                 │        │   │                                │
│  ▼                                 │ push   │   ▼                                │
│ Encrypted SQLite ── outbox (ops) ──┼───────▶│ validate → policy gate → apply     │
│        ▲                           │        │   │            (S34 data_controls) │
│        │      pull (server_seq >   │ pull   │   ▼                                │
│ apply ─┴──────── cursor) ◀─────────┼────────│ per-user oplog (server_seq)        │
│ Sync status → UI (banner/icons)    │        │ MongoDB + Object Storage           │
└────────────────────────────────────┘        └────────────────────────────────────┘
```

## C.2 Sync Flow

**Triggers:**

| Trigger | Behavior |
|---|---|
| Local mutation | Debounced push (2 s) if online |
| App foreground | Full sync cycle |
| Connectivity restored | Drain outbox, then pull |
| Push notification (silent) | Pull-only ("another device changed X") |
| Background task (OS-permitting) | Periodic cycle, ~15 min |
| Pull-to-refresh (Today/S6) | Full cycle + integration sync triggers |
| Wi-Fi-only pref | File uploads deferred to Wi-Fi; metadata ops still sync on cellular |

**What is pushed vs. pulled:**

| Direction | Content |
|---|---|
| Push (device → cloud) | Outbox ops for syncable entities (tasks, projects, manual health entries, document metadata, AI memory, preferences, notification read-state) + file uploads via signed URLs |
| Pull (cloud → device) | Server oplog entries with `server_seq > last_cursor` (includes changes from other devices, server-side automations, accepted suggestions, integration-derived records like SocialStat snapshots) |
| Never synced | HealthCache (unless opted in), `on_device_tags`, local file paths, anything `storage_policy: local_only` |

**Delta tracking:** every server-applied op gets a per-user monotonic `server_seq`. Each device stores one cursor. Deltas = "everything after my cursor." If a cursor is older than oplog retention (90 days) → `410 CURSOR_EXPIRED` → client runs `/sync/bootstrap` re-baseline.

**`POST /sync` payload:**

```json
// request
{
  "device_id": "uuid",
  "cursor": 48210,
  "push": [
    { "entity_type": "task", "entity_id": "uuid", "op": "update", "version": 4,
      "data": { "title": "Call dentist", "due_at": "2026-06-12T09:00:00Z" } }
  ]
}

// 200 response
{
  "results": [ { "entity_id": "uuid", "status": "applied", "new_version": 5, "server_seq": 48221 } ],
  "pull": [
    { "server_seq": 48215, "entity_type": "suggestion", "op": "create", "data": { … } }
  ],
  "next_cursor": 48221,
  "has_more": false
}
```

Per-op result `status`: `applied | conflict | rejected_policy | invalid`.

## C.3 Conflict Resolution (per data type)

Detection: push carries the record `version` the client last saw; server compares with current. Mismatch = conflict.

| Data type | Strategy | Why |
|---|---|---|
| Task / Project **scalar fields** (title, due, priority) | **Field-level merge, then LWW per field** (by `updated_at` of the field-touch, tracked in op payload) | Two devices editing *different* fields shouldn't clobber each other; same-field edits are rare and LWW is intuitive |
| Task **completion** | **Completion wins** over concurrent edit | Losing a completion is the worst-feeling data loss |
| Task **deletion** vs. edit | **Edit wins, delete rescinded** (soft-delete restored) | Recoverable beats destructive |
| Subtasks / checklist | Per-item merge (items are separate records) | Natural CRDT-ish behavior |
| Document metadata | Field-level merge; `detected_fields` = LWW whole-object | OCR re-runs replace atomically |
| Document file pages | **Immutable** — pages never edited, only added/deleted | No content conflicts possible |
| Manual HealthEntry | **Append-only, no conflicts** (edits LWW; entries are independent) | Time-series semantics |
| AIMemoryEntry | **User edit always beats system write**; system-vs-system LWW | User control guardrail (§6.4) |
| Preference / data_controls | LWW whole-object, but **privacy downgrades (cloud→local) always win** regardless of timestamp | Fail toward privacy |
| Notification read-state | Max(read_at) wins | Monotonic |

Unresolvable same-field conflicts keep **both**: server value applied, losing value stored in `conflict_shadow` on-device; the UI shows a subtle "task updated on another device — review" only for meaningful losses (title/notes), never for trivial fields.

## C.4 Privacy-Gated Sync (S34 enforcement)

`Preference.data_controls` is enforced **on both sides**:

1. **Client (first gate):** the sync engine's outbox filter drops ops for any domain set `local`/`off` and any Document with `storage_policy: local_only`. Such records physically never serialize into a request.
2. **Server (second gate):** `/sync` and upload-URL endpoints re-check the user's stored `data_controls`; violating ops return `rejected_policy` and are audit-logged (defense against buggy/rogue clients).
3. **Downgrade flow (cloud → local-only):** client asks user "delete already-uploaded copies?" → if yes, `POST /me/preferences` change + server purge job deletes the domain's cloud records/objects (30-day cascade incl. backups) → completion notification. If no, existing cloud copies remain but no new data flows.
4. **Per-item override:** Document `storage_policy: local_only` flips at S20 → same purge choice for that item.
5. **HealthCache opt-in** is an explicit, separate consent (`POST /health/cache/opt-in`) — never bundled with another toggle.

## C.5 Retry, Failure Handling & User-Visible Status

**Retry policy:**

| Failure | Handling |
|---|---|
| Network / 5xx / timeout | Exponential backoff 2s → 4s → 8s → … cap 5 min, with jitter; outbox preserved (SQLite-durable across restarts) |
| 429 | Honor `Retry-After` |
| 401 TOKEN_EXPIRED | Pause sync → refresh token → resume; refresh failure → re-auth screen, **outbox retained** |
| `invalid` op (validation) | Dead-letter the op locally, keep record usable, surface in sync log; never blocks the queue |
| `rejected_policy` | Drop op, reconcile local policy flags |
| File upload interrupted | Chunked/resumable upload against signed URL; per-page confirm (`/pages/{n}/uploaded`) means partial docs resume, not restart |
| 410 CURSOR_EXPIRED | Automatic `/sync/bootstrap` re-baseline (local unsynced ops replayed after) |

**User-visible status (ties to IA spec):**

| Surface | Shows |
|---|---|
| Global offline banner | "Offline — changes will sync" |
| Docs/Backup cloud icon | synced ✓ / syncing ⟳ / error ⚠ |
| S32 status hero | Last successful backup, queue count ("18 items waiting"), failed-items list with per-item retry + reason |
| Per-item chip | "Upload failed — retry" on document thumbnails |
| Notification | Only if backup failing > 48 h (calm-technology: no nagging) |

---

# Part D — Security Implementation

## D.1 Authentication & Authorization

**Method:** OAuth 2.0-style token pair via the managed auth integration (social login + email/password with bcrypt, cost ≥ 12).

| Aspect | Implementation |
|---|---|
| Access token | JWT, **15 min TTL**, claims: `sub` (user_id), `dev` (device_id), `plan`, `iat/exp`, `jti`. Signed RS256; public key rotated (see D.3) |
| Refresh token | Opaque 256-bit random, **30-day TTL, rotating**: every refresh issues a new one and invalidates the old (`token_family` tracking). Reuse of a rotated token = theft signal → revoke entire family, force re-auth, audit `auth.token_reuse` |
| Client storage | Both tokens in **Expo SecureStore** (iOS Keychain / Android Keystore) — never AsyncStorage, never logged |
| Session revocation | Per-device via `DELETE /auth/sessions/{device_id}` (S24); server checks `Device.revoked` on refresh |
| Brute force | Per-account + per-IP counters; progressive delays → 15-min lockout after 8 failures; audit `auth.failed` |
| Biometric app lock | Client-side gate (Face ID / fingerprint via `expo-local-authentication`) wrapping app open and Vault; independent of server session |
| Re-auth for dangerous ops | Account deletion, data-control purges, email change require fresh auth ≤5 min old (`X-Reauth` short-lived token from password/biometric re-check) |

**Authorization model:** single-tenant per user — every query is scoped `user_id = jwt.sub` at the repository layer (enforced centrally, not per-handler). Roles:

| Role | Scope |
|---|---|
| `user` | Own data only |
| `system` | Internal workers (sync appliers, automation engine, token refresher) — service tokens, least-privilege per worker |
| `admin` (ops) | No content access; metadata-only support tooling; all access audit-logged |

Plan gating (`free` vs `plus`) enforced server-side: integration count, storage quota, AI suggestion volume → `403 PLAN_LIMIT`.

## D.2 Encryption

| Layer | Mechanism |
|---|---|
| In transit | TLS 1.2+ (TLS 1.3 preferred) client↔server and server↔providers; HSTS; **certificate pinning** in the mobile client for `api.lifeos.app` (with remote pin-rotation escape hatch) |
| Cloud DB at rest | Full-disk/volume encryption + **field-level AES-256-GCM** for 🔴 fields (`ocr_text`, `detected_fields`, health values, AI memory statements, token blobs) via envelope encryption (D.3) |
| Object storage | Server-side AES-256 for all objects; document/photo objects additionally client-encrypted when in the Vault tier (below) |
| On-device DB | SQLCipher (AES-256) SQLite; key held in Keychain/Keystore |
| On-device files | Cached documents/photos in app-private storage, encrypted with a device file key; excluded from OS cloud backups (`NSFileProtectionComplete` / `allowBackup=false` for the data dir) |
| Secrets | Server env/secret store only; nothing sensitive in the client bundle |

**End-to-end encryption — Vault tier (P1):**
- Scope: user-designated highest-sensitivity documents ("Vault" items, S20 toggle + biometric gate).
- Client generates a **Vault master key** (256-bit) from which per-file keys derive (HKDF). Files encrypted client-side (AES-256-GCM) **before** upload; server stores ciphertext + wrapped file keys and **cannot decrypt** (no OCR/search server-side for Vault items — disclosed in UI; on-device OCR only).
- Key escrow/recovery: Vault master key wrapped by (a) device Keystore and (b) a user **recovery code** (24-word, shown once, user-confirmed). Losing both = unrecoverable — stated plainly (PRD open question resolved toward user-held keys).

## D.3 Key Management

| Key | Generated | Stored | Rotated |
|---|---|---|---|
| TLS certs | CA | Load balancer | Auto (ACME), 90 days |
| JWT signing keypair | KMS | KMS (private never exported) | 90 days; JWKS endpoint serves current+previous public keys |
| KMS root/master key | Cloud KMS (HSM-backed) | KMS | Annual, automatic re-wrap |
| **Data-encryption keys (DEKs)** | Server, per table-domain per ~10k-record shard | Stored **wrapped** by KMS key alongside data (`token_key_id` pattern) | On demand + annual: re-wrap only (cheap), full re-encrypt on compromise |
| Integration token keys | Same envelope scheme, dedicated key domain | — | 90 days re-wrap |
| Device SQLCipher key | On device, `SecureStore` random 256-bit at first run | Keychain/Keystore (hardware-backed where available) | Re-keyed on app-lock enable/disable |
| Vault master key (P1) | On device | Keystore + user recovery code | User-initiated re-key (re-encrypts wrapped file keys only) |

Envelope pattern: `ciphertext = AES-GCM(DEK, data)`; `stored_DEK = KMS.wrap(DEK)`. Compromise blast radius is bounded per key domain; rotation never requires bulk data rewrites except on actual compromise.

## D.4 Integration Security

| Control | Implementation |
|---|---|
| Token storage | `IntegrationToken` server-only, envelope-encrypted, dedicated key domain; **no API path ever returns tokens**; serializer denylist enforced by schema tests |
| OAuth flow | Authorization-code + **PKCE**; `state` = signed nonce (CSRF); redirect URIs allow-listed; system browser (never WebView) on device |
| Scopes | Request **minimum** scopes per provider; granular per-metric toggles (S27) mapped to provider scopes where supported, else filtered at ingestion |
| Direction | Read-only by default; any write scope (Calendar events, Notion push) is a separate consent + separate token grant where the provider allows |
| Revocation | Disconnect calls the provider's revoke endpoint (where available) **and** deletes the token row; optional imported-data purge; audit `integration.disconnect` |
| Upstream calls | Server-side only (client never holds provider tokens); egress allow-list; per-provider circuit breakers and quota-aware schedulers |
| Webhooks (Garmin) | Signature verification, replay protection (timestamp + nonce), dedicated ingress path |

## D.5 Privacy & Compliance Enforcement

| Requirement | Technical enforcement |
|---|---|
| Local-vs-cloud control | Dual-gate sync policy (§C.4): client outbox filter + server policy re-check + purge jobs; `data_controls` changes audit-logged |
| Data minimization to AI | PII-redaction pipeline before any LLM call (names/emails/locations stripped; aggregates only); prompts and completions not retained beyond request lifetime; no training on user data |
| GDPR export (Art. 20) | `POST /me/export` → async job → portable JSON + files ZIP → signed URL, 7-day TTL, single-user access, audit-logged |
| GDPR deletion (Art. 17) | `DELETE /me` → status `deletion_pending` → immediate: sessions revoked, tokens revoked upstream, API access blocked → cascade job purges DB rows, object storage, search indexes, **and backup snapshots within 30 days** → completion email → AuditLog retains only anonymized deletion event |
| Consent records | Every opt-in (AI, health cloud, write-scopes) stored with timestamp + version of consent copy shown |
| Retention | Oplog 90 days; audit log 12 months; export artifacts 7 days; soft-deleted items 30 days |
| Store compliance | iOS Privacy Nutrition Labels / Play Data Safety generated from the `data_controls` schema (single source of truth) |
| Audit logging | Append-only `AuditLog` (§A.3) for auth, token, scope, export/delete, automation-run, memory-clear events; **never logs payload content**; user-visible slices power S27 sync log and S30 run history |

## D.6 Threat Model & Mitigations

| # | Threat | Vector | Mitigation |
|---|---|---|---|
| 1 | Access-token theft | Device malware, leaked logs | 15-min TTL; tokens only in SecureStore; no tokens in logs/crash reports (scrubber); `jti` denylist for emergency revocation |
| 2 | Refresh-token theft/replay | Backup extraction, MITM | Rotating refresh tokens with family-reuse detection → full family revoke + forced re-auth + user notification |
| 3 | MITM / TLS downgrade | Hostile Wi-Fi, proxy | TLS 1.2+ only, HSTS, certificate pinning in app |
| 4 | Data leakage via sync | Bug ships local-only data | Dual-gate policy (client filter + server reject + audit); schema-level `local_only` serializer tests in CI |
| 5 | Provider-token compromise | DB breach | Envelope encryption with dedicated KMS domain; tokens useless without KMS; scoped read-only grants limit blast radius |
| 6 | Account takeover (credential stuffing) | Reused passwords | Rate limits, progressive lockout, breach-password check at registration, optional 2FA (P1), new-device login notification |
| 7 | Stolen/lost device | Physical access | Biometric app lock, hardware-backed keys, encrypted local DB/files, remote session revoke (S24), OS-backup exclusion |
| 8 | Object-storage URL leakage | Shared/sniffed signed URL | Short-lived (15 min) signed URLs, single-object scope, content-disposition lock; Vault items additionally E2E-encrypted |
| 9 | IDOR / cross-tenant access | Handler bug | Central repository-layer `user_id` scoping (not per-endpoint); authz tests per route in CI |
| 10 | Prompt injection / AI data exfiltration | Malicious content in OCR text or Notion data reaching LLM | Input sanitization, PII pre-redaction, AI output constrained to typed `proposed_action` schema (never free-form execution), all actions require user confirmation (§6.4) |
| 11 | Automation abuse / runaway rules | Buggy or malicious recipe | Server-validated action allow-list, per-automation rate caps, kill-switch, dry-run, reversible actions with undo, run audit (S30) |
| 12 | Webhook spoofing (Garmin) | Forged callbacks | Signature verification + replay protection |
| 13 | Insider access | Ops personnel | Admin role has no content access; field-level encryption means DB reads yield ciphertext; all admin actions audit-logged |
| 14 | Dependency/supply chain | Compromised package | Lockfiles, dependency scanning in CI, minimal base images, periodic third-party security review before GA (PRD §8.5) |

---

## Appendix — MVP Implementation Cut

| In v1.0 | Deferred |
|---|---|
| All Part A entities except SocialStat, Automation(+Run), PhotoBackup | P1 entities |
| API groups B.1–B.5, B.8 (Health/Calendar only), B.9, B.10 (#1–7), B.11 | B.6, B.7, B.10 #8–9 |
| Full Part C sync engine | Multi-device real-time (push-triggered pull is enough for v1) |
| D.1, D.2 (except Vault E2E), D.3, D.4, D.5 | Vault E2E + 2FA (P1), EU residency (P2) |

*End of Technical Foundation — ready for backend scaffolding and mobile sync-engine implementation.*
