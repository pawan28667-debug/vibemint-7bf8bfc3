import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exportPublicKey, getIdentityKeyPair, safetyNumber, setStoredDeviceId, getStoredDeviceId } from "@/lib/e2ee";

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  hue: number;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  deviceId: string | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  session: null,
  user: null,
  profile: null,
  deviceId: null,
  signOut: async () => {},
});

/** Publishes this browser's public identity key so others can encrypt to it. */
async function ensureDeviceRegistered(userId: string): Promise<string | null> {
  try {
    const identity = await getIdentityKeyPair();
    const identityPub = await exportPublicKey(identity.publicKey);
    const stored = await getStoredDeviceId();

    if (stored) {
      const { data } = await supabase
        .from("devices")
        .select("id, identity_pub")
        .eq("id", stored)
        .eq("user_id", userId)
        .maybeSingle();
      if (data && data.identity_pub === identityPub) {
        await supabase.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("id", stored);
        return stored;
      }
    }

    const { data: existing } = await supabase
      .from("devices")
      .select("id")
      .eq("user_id", userId)
      .eq("identity_pub", identityPub)
      .maybeSingle();

    if (existing) {
      await setStoredDeviceId(existing.id);
      return existing.id;
    }

    const { data, error } = await supabase
      .from("devices")
      .insert({
        user_id: userId,
        label: navigator.userAgent.includes("Mobile") ? "Mobile browser" : "Desktop browser",
        identity_pub: identityPub,
        safety_number: await safetyNumber(identityPub),
      })
      .select("id")
      .single();
    if (error || !data) return null;
    await setStoredDeviceId(data.id);
    return data.id;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async (next: Session | null) => {
      if (!active) return;
      setSession(next);
      if (!next?.user) {
        setProfile(null);
        setDeviceId(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url, hue")
        .eq("id", next.user.id)
        .maybeSingle();
      if (!active) return;
      setProfile(data ?? null);
      setLoading(false);
      const id = await ensureDeviceRegistered(next.user.id);
      if (active) setDeviceId(id);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void load(next);
        if (event !== "SIGNED_OUT") void queryClient.invalidateQueries();
        else queryClient.clear();
      } else if (event === "INITIAL_SESSION") {
        void load(next);
      }
    });

    void supabase.auth.getSession().then(({ data }) => load(data.session));

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [queryClient]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      profile,
      deviceId,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile, deviceId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
