// Real auth state: bootstraps the session from secure storage, exposes
// sign-up/sign-in/sign-out, the user's profile, and the onboarding-complete
// flag that drives new-vs-returning routing in the root layout.
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";

import { ApiError, REFRESH_TOKEN_KEY, setOnUnauthorized } from "@/src/api/client";
import {
  fetchMe, loginAccount, logoutAccount, Me, registerAccount,
} from "@/src/api/auth";
import { storage } from "@/src/utils/storage";
import type { Profile, User } from "@/src/types/models";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

const ONBOARDING_KEY = "lifeos.onboarding.complete";
const ME_CACHE_KEY = "lifeos.cache.me";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  profile: Profile | null;
  onboardingComplete: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setProfile: (profile: Profile) => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const applyMe = useCallback((me: Me) => {
    setUser(me.user);
    setProfileState(me.profile);
    storage.setItem(ME_CACHE_KEY, JSON.stringify(me));
  }, []);

  // Bootstrap: returning users with a valid (or refreshable) session skip
  // onboarding; everyone else lands on Welcome.
  useEffect(() => {
    (async () => {
      const [refreshToken, onboarded] = await Promise.all([
        storage.secureGet<string>(REFRESH_TOKEN_KEY, ""),
        storage.getItem<boolean>(ONBOARDING_KEY, false),
      ]);
      setOnboardingComplete(!!onboarded);
      if (!refreshToken) {
        setStatus("unauthenticated");
        return;
      }
      try {
        const me = await fetchMe(); // client auto-rotates expired access tokens
        applyMe(me);
        setStatus("authenticated");
      } catch (e) {
        if (e instanceof ApiError && e.code === "NETWORK_ERROR") {
          // Offline with a stored session: stay signed in on cached identity.
          const cached = await storage.getItem<string>(ME_CACHE_KEY, "");
          if (cached) {
            try {
              applyMe(JSON.parse(cached) as Me);
            } catch { /* corrupt cache — identity loads on reconnect */ }
          }
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      }
    })();
  }, [applyMe]);

  const signOut = useCallback(async () => {
    await logoutAccount();
    await storage.removeItem(ONBOARDING_KEY);
    await storage.removeItem(ME_CACHE_KEY);
    setUser(null);
    setProfileState(null);
    setOnboardingComplete(false);
    setStatus("unauthenticated");
  }, []);

  // Unrecoverable 401 anywhere in the app → clean sign-out.
  useEffect(() => {
    setOnUnauthorized(() => {
      signOut();
    });
    return () => setOnUnauthorized(null);
  }, [signOut]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      await registerAccount(email, password);
      const me = await fetchMe();
      applyMe(me);
      setStatus("authenticated");
      // onboardingComplete stays false → flow continues to privacy step.
    },
    [applyMe],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      await loginAccount(email, password);
      const me = await fetchMe();
      applyMe(me);
      // Returning account → straight to the app.
      await storage.setItem(ONBOARDING_KEY, true);
      setOnboardingComplete(true);
      setStatus("authenticated");
    },
    [applyMe],
  );

  const completeOnboarding = useCallback(async () => {
    await storage.setItem(ONBOARDING_KEY, true);
    setOnboardingComplete(true);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await fetchMe();
    applyMe(me);
  }, [applyMe]);

  const setProfile = useCallback((next: Profile) => {
    setProfileState(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status, user, profile, onboardingComplete,
      signUp, signIn, signOut, completeOnboarding, setProfile, refreshMe,
    }),
    [status, user, profile, onboardingComplete,
     signUp, signIn, signOut, completeOnboarding, setProfile, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
