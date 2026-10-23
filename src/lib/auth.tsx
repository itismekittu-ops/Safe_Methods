import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithFacebook: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      // Intercept email confirmation and OAuth tokens that land on the root URL hash
      if (event === "SIGNED_IN" && newSession && typeof window !== "undefined") {
        if (window.location.hash.includes("access_token=")) {
          const destination = newSession.user.email === "info@safemethods.org" ? "/admin/quotes" : "/account";
          window.location.replace(destination);
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://safemethods.com";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${origin}/account`,
      },
    });
    if (error) {
      const message = /already|registered|exists/i.test(error.message)
        ? "Check your email to finish setting up your account."
        : "We couldn't complete your signup. Please check your details and try again.";
      return { error: message };
    }
    if (data.user && !data.session) {
      return { error: null, needsEmailConfirmation: true };
    }
    return { error: null, needsEmailConfirmation: false };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: "Incorrect email or password.", user: null };
    return { error: null, user: data.user };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://safemethods.com";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/account` },
    });
    if (error) return { error: "We couldn't start sign-in. Please try again." };
    return { error: null };
  }, []);

  const signInWithFacebook = useCallback(async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://safemethods.com";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${origin}/account` },
    });
    if (error) return { error: "We couldn't start sign-in. Please try again." };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    sessionStorage.removeItem("safebot_session_token");
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://safemethods.com";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    if (error) return { error: null };
    return { error: null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: "We couldn't update your password. Please try again." };
    return { error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}