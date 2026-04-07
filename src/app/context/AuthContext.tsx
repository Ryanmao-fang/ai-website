import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { apiClient } from "@/lib/api";

type AuthState = {
  userId: string | null;
  email: string | null;
  isPro: boolean;
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
    membershipEndsAt: null,
    accessToken: null,
    loading: true,
  });

  const refreshMe = async () => {
    if (!state.accessToken) {
      return;
    }
    try {
      const result = await apiClient.getMe(state.accessToken);
      setState((prev) => ({
        ...prev,
        isPro: Boolean(result?.membership?.isPro),
        membershipEndsAt: result?.membership?.endAt || null,
      }));
    } catch (_error) {
      setState((prev) => ({ ...prev, isPro: false, membershipEndsAt: null }));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
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

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setState({
          userId: null,
          email: null,
          isPro: false,
          membershipEndsAt: null,
          accessToken: null,
          loading: false,
        });
        return;
      }

      setState({
        userId: session.user.id,
        email: session.user.email || null,
        isPro: false,
        membershipEndsAt: null,
        accessToken: session.access_token,
        loading: false,
      });
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (state.accessToken) {
      refreshMe();
    }
  }, [state.accessToken]);

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
    [state]
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
