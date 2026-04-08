import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";
import type { MembershipTier } from "@/lib/membershipTier";

type AuthState = {
  userId: string | null;
  email: string | null;
  isPro: boolean;
  membershipTier: MembershipTier;
  membershipEndsAt: string | null;
  accessToken: string | null;
  loading: boolean;
};

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userId: null,
    email: null,
    isPro: false,
    membershipTier: "free",
    membershipEndsAt: null,
    accessToken: null,
    loading: true,
  });

  const accessTokenRef = useRef<string | null>(null);
  useEffect(() => {
    accessTokenRef.current = state.accessToken;
  }, [state.accessToken]);

  const refreshMe = useCallback(async () => {
    const token = accessTokenRef.current;
    if (!token) {
      return;
    }
    try {
      const result = await apiClient.getMe(token);
      const tier = (result?.membership?.tier as MembershipTier) || "free";
      setState((prev) => ({
        ...prev,
        isPro: Boolean(result?.membership?.isPro),
        membershipTier: ["free", "standard", "pro"].includes(tier) ? tier : "free",
        membershipEndsAt: result?.membership?.endAt || null,
      }));
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (401 === status) {
        setState((prev) => ({
          ...prev,
          isPro: false,
          membershipTier: "free",
          membershipEndsAt: null,
        }));
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      setState((prev) => ({
        ...prev,
        userId: session.user.id,
        email: session.user.email || null,
        accessToken: session.access_token,
        loading: false,
      }));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setState({
          userId: null,
          email: null,
          isPro: false,
          membershipTier: "free",
          membershipEndsAt: null,
          accessToken: null,
          loading: false,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        userId: session.user.id,
        email: session.user.email || null,
        accessToken: session.access_token,
        loading: false,
      }));
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.accessToken) {
      void refreshMe();
    }
  }, [state.accessToken, refreshMe]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw error;
    }
    return { needEmailConfirm: !data.session };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const contextValue = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      refreshMe,
    }),
    [state, refreshMe]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
