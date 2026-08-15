import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type FeedAuthor = {
  id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  hue: number;
};

export type FeedPost = {
  id: string;
  author_id: string;
  kind: "photo" | "video";
  caption: string;
  category: string;
  media_path: string;
  thumb_path: string | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles: FeedAuthor | null;
};

const POST_SELECT =
  "id, author_id, kind, caption, category, media_path, thumb_path, duration_seconds, width, height, like_count, comment_count, created_at, profiles!posts_author_id_fkey(id, handle, display_name, avatar_url, hue)";

export function useFeed(options: { kind?: "photo" | "video"; authorId?: string | undefined; search?: string; category?: string } = {}) {
  const { kind, authorId, search, category } = options;
  return useQuery({
    queryKey: ["feed", kind ?? "all", authorId ?? "all", search ?? "", category ?? "All"],
    queryFn: async () => {
      let q = supabase.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(50);
      if (kind) q = q.eq("kind", kind);
      if (authorId) q = q.eq("author_id", authorId);
      if (category && category !== "All") q = q.eq("category", category);
      if (search) q = q.ilike("caption", `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as FeedPost[];
    },
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select(POST_SELECT).eq("id", postId).maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as FeedPost | null;
    },
  });
}

export function useMyLikes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-likes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("likes").select("post_id").eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.post_id));
    },
  });
}

export function useToggleLike() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (!user) throw new Error("Sign in to like posts");
      if (liked) {
        const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["my-likes"] });
      void qc.invalidateQueries({ queryKey: ["post"] });
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id, profiles!comments_user_id_fkey(handle, display_name, hue)")
        .eq("post_id", postId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        body: string;
        created_at: string;
        user_id: string;
        profiles: { handle: string; display_name: string; hue: number } | null;
      }[];
    },
  });
}

export function useAddComment(postId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error("Sign in to comment");
      const { error } = await supabase.from("comments").insert({ post_id: postId, user_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["comments", postId] });
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void qc.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useSubscription(creatorId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["subscription", user?.id, creatorId],
    enabled: !!user && !!creatorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("creator_id")
        .eq("subscriber_id", user!.id)
        .eq("creator_id", creatorId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user || !creatorId) throw new Error("Sign in to subscribe");
      if (query.data) {
        const { error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("subscriber_id", user.id)
          .eq("creator_id", creatorId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("subscriptions")
          .insert({ subscriber_id: user.id, creator_id: creatorId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["subscription"] });
      void qc.invalidateQueries({ queryKey: ["subscriber-count", creatorId] });
    },
  });

  return { subscribed: query.data ?? false, toggle };
}

export function useSubscriberCount(creatorId?: string) {
  return useQuery({
    queryKey: ["subscriber-count", creatorId],
    enabled: !!creatorId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("creator_id", creatorId!);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export type NotificationRow = {
  id: string;
  type: "like" | "comment" | "subscription" | "message";
  actor_id: string | null;
  post_id: string | null;
  conversation_id: string | null;
  read_at: string | null;
  created_at: string;
  profiles: { handle: string; display_name: string; hue: number } | null;
};

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, type, actor_id, post_id, conversation_id, read_at, created_at, profiles!notifications_actor_id_fkey(handle, display_name, hue)",
        )
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as unknown as NotificationRow[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          void qc.invalidateQueries({ queryKey: ["notifications", user.id] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  return query;
}

export function useMarkNotificationsRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useNotificationPrefs() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["notification-prefs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_prefs")
        .select("likes, comments, subscriptions, messages, show_previews")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (patch: Partial<Record<"likes" | "comments" | "subscriptions" | "messages" | "show_previews", boolean>>) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("notification_prefs")
        .upsert({ user_id: user.id, ...patch }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notification-prefs"] }),
  });

  return { prefs: query.data, update };
}

export function useProfileByHandle(handle?: string) {
  return useQuery({
    queryKey: ["profile-handle", handle],
    enabled: !!handle,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url, hue")
        .eq("handle", handle!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function usePeopleSearch(term: string) {
  return useQuery({
    queryKey: ["people", term],
    queryFn: async () => {
      let q = supabase.from("profiles").select("id, handle, display_name, avatar_url, hue").limit(20);
      if (term) q = q.or(`handle.ilike.%${term}%,display_name.ilike.%${term}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}
