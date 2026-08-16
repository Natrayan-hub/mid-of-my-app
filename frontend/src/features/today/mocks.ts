// ⚠️ MOCK DATA — clearly-marked placeholders flowing through the REAL model
// shapes (HealthCacheSample, Suggestion, SocialStat-like). When the actual
// integrations connect (HealthKit/Health Connect, Instagram Graph API, AI
// suggestion service), these functions are replaced by real sources and the
// UI needs zero changes.
//
// Privacy note: health samples model the LOCAL-ONLY HealthCache (S34 —
// integration health data never leaves the device by default), which is why
// they are generated on-device here rather than fetched from the backend.
import type { HealthCacheSample, Suggestion } from "@/src/types/models";

const DEMO_USER_ID = "demo-user";

function iso(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

export interface HealthSnapshot {
  sleep: HealthCacheSample;
  steps: HealthCacheSample;
  activeEnergy: HealthCacheSample;
  /** 7-day average deltas, % (positive = up vs. avg) */
  trends: { sleep: number; steps: number; activeEnergy: number };
}

export function getMockHealthSnapshot(): HealthSnapshot {
  const base = {
    user_id: DEMO_USER_ID,
    source: "apple_health" as const,
    readiness_input: true,
  };
  return {
    sleep: {
      ...base, id: "mock-sleep", metric: "sleep", value: 6.4, unit: "h",
      start_at: iso(14), end_at: iso(7),
    },
    steps: {
      ...base, id: "mock-steps", metric: "steps", value: 5240, unit: "steps",
      start_at: iso(7), end_at: iso(0),
    },
    activeEnergy: {
      ...base, id: "mock-energy", metric: "active_energy", value: 320, unit: "kcal",
      start_at: iso(7), end_at: iso(0),
    },
    trends: { sleep: -12, steps: 8, activeEnergy: 5 },
  };
}

// SocialStat shape (Technical Foundation §A.3) — MOCK until Instagram
// Graph API integration (P1) is connected.
export interface SocialSnapshot {
  captured_on: string;
  followers: number;
  followers_delta: number;
  reach: number;
  engagement_rate: number;
}

export function getMockSocialSnapshot(): SocialSnapshot {
  return {
    captured_on: new Date().toISOString().slice(0, 10),
    followers: 12480,
    followers_delta: 36,
    reach: 8900,
    engagement_rate: 4.7,
  };
}

// Placeholder suggestion engine — same Suggestion shape the real AI service
// (GET /ai/suggestions) returns, including the explainability guardrails
// (reason + sources, §6.4). Swap `getPlaceholderSuggestion` for the API call
// once /ai routes exist.
export function getPlaceholderSuggestion(health: HealthSnapshot): Suggestion | null {
  if (health.sleep.value >= 7) return null;
  const h = Math.floor(health.sleep.value);
  const m = Math.round((health.sleep.value - h) * 60);
  return {
    id: "placeholder-sleep-suggestion",
    user_id: DEMO_USER_ID,
    kind: "reschedule_task",
    text: `You slept ${h}h ${m}m — consider an easier morning and moving focus work to the afternoon.`,
    reason: "Based on your sleep (sample data)",
    sources: [{ type: "health.sleep", value: `${h}h ${m}m` }],
    proposed_action: null,
    status: "pending",
    expires_at: null,
  };
}
