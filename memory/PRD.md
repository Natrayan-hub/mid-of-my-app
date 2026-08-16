# LifeOS — Product & Build Memory

## Product
LifeOS — personal life command center (iOS + Android, Expo). Unifies tasks, health,
calendar, documents (OCR), social stats into a "Today" dashboard with private,
explainable AI. Full specs in:
- `/app/LifeOS_PRD.md` — product requirements
- `/app/LifeOS_IA_and_Screens.md` — navigation model + 38 screen specs (S0–S38)
- `/app/LifeOS_Technical_Foundation.md` — data models, API design, sync, security
- `/app/LifeOS_Design_System.md` — tokens, components, motion

## Build order agreed with user
One real screen per prompt: **Today dashboard next**, then onboarding, health,
tasks, documents, then the rest. Keep everything aligned with the four spec docs —
do not invent new tokens/models/endpoints.

## Stack
- Mobile: Expo SDK 54 + expo-router (file-based), TypeScript, Feather icons
  (@expo/vector-icons), Inter fonts bundled in `assets/fonts` (expo-font).
- Backend: FastAPI + Motor/MongoDB, all routes under `/api`.
- No new packages added in skeleton phase.

## Completed — Phase 1: Setup & Navigation Skeleton (verified)
Backend (`/app/backend`):
- `core/config.py` (env settings), `core/db.py` (Motor client, collection handles,
  `ensure_indexes()` on startup)
- `models/` — Pydantic entities per Tech Foundation Part A: base (SyncableModel),
  user (User/Profile/Device), task (Task/Project), health (HealthEntry/
  HealthCacheSample), document (Document/DocumentPage), integration
  (Integration/IntegrationToken — token excluded from serialization),
  ai (AIMemoryEntry/Suggestion), notification, preference (DataControls),
  system (SyncOp/AuditLogEntry/Job)
- `routes/__init__.py` (api_router aggregator) + `routes/meta.py`
  (GET /api/ + GET /api/health with db ping) — both verified via curl
- `server.py` rewritten as thin entrypoint.

Frontend (`/app/frontend`):
- `src/theme/tokens.ts` — full light/dark design tokens (colors, type w/ Inter,
  space, radius, layout, motion, elevation). RULE: no raw hex outside tokens.
- `src/theme/index.tsx` — ThemeProvider (system|light|dark, persisted via storage
  key `lifeos.theme.mode`) + useTheme().
- `src/types/models.ts` — TS entity types mirroring backend models + sync protocol.
- `src/api/client.ts` — typed fetch wrapper (`api.get/post/patch/put/del`), error
  envelope → ApiError, bearer token from secure storage.
  Token keys: `lifeos.auth.access_token` / `lifeos.auth.refresh_token`.
- `src/providers/AuthProvider.tsx` (shell, unauthenticated) and
  `src/providers/SyncProvider.tsx` (shell, idle).
- `src/components/` — TopBar (large-title), TabBar (custom 5 tabs + raised center
  Quick-Add FAB), QuickAddSheet (modal bottom sheet, 4 actions stubbed),
  StubScreen.
- Routes: `app/_layout.tsx` (SafeArea > Theme > Auth > Sync > Stack, Inter+icon
  fonts, StatusBar by scheme); `app/(tabs)/_layout.tsx` (Tabs + custom tabBar +
  QuickAdd state); stubs: `(tabs)/index` (Today), `tasks/`, `health/`, `docs/`,
  `more/` (each tab dir has its own Stack _layout for future sub-screens).
  `more/index` has a temporary theme-mode segmented control (graduates to S25).
- Deleted old `app/index.tsx`.

Verified via screenshot automation: all 5 tabs navigable, quick-add opens/closes,
light + dark themes apply globally, backend health OK.

## Auth
No auth implemented yet (AuthProvider is a shell). No test credentials exist yet.
When auth is built: use integration_expert playbook first; update
`/app/memory/test_credentials.md`.

## Notes / gotchas
- `app/+html.tsx` exists (web shell) — leave as is.
- Icon fonts load from CDN in Expo Go via `src/hooks/use-icon-fonts.ts` — don't remove.
- Protected: metro.config.js, .env URLs, EXPO_PACKAGER_* vars.
- Design doc says lucide-style icons — using Feather (Lucide's predecessor,
  already bundled) to avoid extra deps.

## Next
- Phase 2: Today dashboard (S6) — real screen (user will prompt).
- Later: onboarding (S1–S5), health, tasks, documents, more-hub screens.
