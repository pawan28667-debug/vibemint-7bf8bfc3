import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { openSealed, sealTo } from "@/lib/e2ee";

export type ConversationRow = {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  other: { id: string; handle: string; display_name: string; hue: number } | null;
};

export type DecryptedMessage = {
  id: string;
  envelopeId: string;
  senderId: string;
  createdAt: string;
  body: string;
  ok: boolean;
};

export function useConversations() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, user_a, user_b, last_message_at")
        .order("last_message_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      const otherIds = rows.map((r) => (r.user_a === user!.id ? r.user_b : r.user_a));
      if (otherIds.length === 0) return [] as ConversationRow[];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, handle, display_name, hue")
        .in("id", otherIds);
      const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({
        ...r,
        other: byId.get(r.user_a === user!.id ? r.user_b : r.user_a) ?? null,
      })) as ConversationRow[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`conversations-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        void qc.invalidateQueries({ queryKey: ["conversations", user.id] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  return query;
}

export function useStartConversation() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Sign in to start a chat");
      if (otherUserId === user.id) throw new Error("You cannot message yourself");
      const [a, b] = [user.id, otherUserId].sort();
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_a", a!)
        .eq("user_b", b!)
        .maybeSingle();
      if (existing) return existing.id;
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_a: a!, user_b: b! })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useConversation(conversationId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversation", conversationId, user?.id],
    enabled: !!user && !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, user_a, user_b")
        .eq("id", conversationId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const otherId = data.user_a === user!.id ? data.user_b : data.user_a;
      const { data: other } = await supabase
        .from("profiles")
        .select("id, handle, display_name, hue")
        .eq("id", otherId)
        .maybeSingle();
      return { ...data, other };
    },
  });
}

/** Loads the ciphertext addressed to this device and decrypts it locally. */
export function useMessages(conversationId: string) {
  const { user, deviceId } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId, deviceId],
    enabled: !!user && !!deviceId && !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, envelope_id, sender_id, ephemeral_pub, ciphertext, iv, created_at")
        .eq("conversation_id", conversationId)
        .eq("recipient_device_id", deviceId!)
        .order("created_at", { ascending: true })
        .limit(300);
      if (error) throw error;

      const out: DecryptedMessage[] = [];
      for (const row of data ?? []) {
        try {
          const body = await openSealed({
            ephemeral_pub: row.ephemeral_pub,
            ciphertext: row.ciphertext,
            iv: row.iv,
          });
          out.push({
            id: row.id,
            envelopeId: row.envelope_id,
            senderId: row.sender_id,
            createdAt: row.created_at,
            body,
            ok: true,
          });
        } catch {
          out.push({
            id: row.id,
            envelopeId: row.envelope_id,
            senderId: row.sender_id,
            createdAt: row.created_at,
            body: "This message can't be decrypted on this device.",
            ok: false,
          });
        }
      }
      return out;
    },
  });

  useEffect(() => {
    if (!conversationId || !deviceId) return;
    const channel = supabase
      .channel(`messages-${conversationId}-${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void qc.invalidateQueries({ queryKey: ["messages", conversationId, deviceId] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, deviceId, qc]);

  return query;
}

export function useSendMessage(conversationId: string) {
  const { user, deviceId } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ body, otherUserId }: { body: string; otherUserId: string }) => {
      if (!user || !deviceId) throw new Error("This device is not set up for encryption yet");

      const { data: devices, error } = await supabase
        .from("devices")
        .select("id, user_id, identity_pub")
        .in("user_id", [user.id, otherUserId]);
      if (error) throw error;
      if (!devices || devices.length === 0) throw new Error("No devices to encrypt to");

      const envelopeId = crypto.randomUUID();
      const rows = [];
      for (const device of devices) {
        const sealed = await sealTo(device.identity_pub, body);
        rows.push({
          conversation_id: conversationId,
          envelope_id: envelopeId,
          sender_id: user.id,
          sender_device_id: deviceId,
          recipient_device_id: device.id,
          ephemeral_pub: sealed.ephemeral_pub,
          ciphertext: sealed.ciphertext,
          iv: sealed.iv,
        });
      }

      const { error: insertError } = await supabase.from("messages").insert(rows);
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      void qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMyDevices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-devices", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("id, label, safety_number, created_at, last_seen_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}
