// Sync status shell — the offline-first sync engine (outbox + oplog pull,
// Technical Foundation Part C) plugs in here. UI surfaces (offline banner,
// cloud glyphs, S32) read this context.
import React, { createContext, useContext, useMemo, useState } from "react";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

interface SyncContextValue {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status] = useState<SyncStatus>("idle");
  const [pendingCount] = useState(0);
  const [lastSyncedAt] = useState<string | null>(null);

  const value = useMemo<SyncContextValue>(
    () => ({ status, pendingCount, lastSyncedAt }),
    [status, pendingCount, lastSyncedAt],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync must be used within SyncProvider");
  return ctx;
}
