// Auth state shell — session/token plumbing lands here when the auth
// integration is implemented (via integration playbook). Shape is final;
// implementation is stubbed.
import React, { createContext, useContext, useMemo, useState } from "react";

import type { User } from "@/src/types/models";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Shell: skeleton phase treats every session as unauthenticated;
  // onboarding/auth screens will drive this in a later phase.
  const [status] = useState<AuthStatus>("unauthenticated");
  const [user] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      signIn: async () => {
        throw new Error("Auth not implemented yet (skeleton phase)");
      },
      signOut: async () => {},
    }),
    [status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
