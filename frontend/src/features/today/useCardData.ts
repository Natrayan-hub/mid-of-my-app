// Per-card data hook: loading / error / offline-with-cache states.
// Offline-first behavior for this screen: every successful fetch is cached
// (storage KV); on network failure the cache is served with `offline: true`
// (stale-stamped in the UI). The full sync engine replaces this later.
import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "@/src/api/client";
import { storage } from "@/src/utils/storage";

export interface CardData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  offline: boolean;
  refetch: () => Promise<void>;
  /** Optimistic local mutation — updates state + cache without a fetch. */
  mutate: (updater: (current: T | null) => T | null) => void;
}

export function useCardData<T>(cacheKey: string, fetcher: () => Promise<T>): CardData<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const key = `lifeos.cache.${cacheKey}`;

  const load = useCallback(async () => {
    setError(null);
    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      setOffline(false);
      storage.setItem(key, JSON.stringify(fresh));
    } catch (e) {
      const isNetwork = e instanceof ApiError && e.code === "NETWORK_ERROR";
      const cachedRaw = await storage.getItem<string>(key, "");
      if (isNetwork && cachedRaw) {
        try {
          setData(JSON.parse(cachedRaw) as T);
          setOffline(true);
        } catch {
          setError("Couldn't load");
        }
      } else {
        setError(
          isNetwork ? "You're offline" : e instanceof ApiError ? e.message : "Couldn't load",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = useCallback(
    (updater: (current: T | null) => T | null) => {
      setData((current) => {
        const next = updater(current);
        if (next !== null) storage.setItem(key, JSON.stringify(next));
        return next;
      });
    },
    [key],
  );

  return { data, loading, error, offline, refetch: load, mutate };
}
