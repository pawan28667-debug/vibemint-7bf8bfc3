import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const CHAIN_TYPES = [
  "discussion",
  "challenge",
  "collaboration",
  "remix",
  "question",
  "project",
  "idea",
  "open",
] as const;
export type ChainType = (typeof CHAIN_TYPES)[number];

export const CONTRIBUTION_TYPES = [
  "response",
  "remix",
  "idea",
  "improvement",
  "question",
  "design",
  "collaboration",
  "result",
] as const;
export type ContributionType = (typeof CONTRIBUTION_TYPES)[number];

export const VISIBILITIES = ["public", "followers", "invite", "private"] as const;
export type ChainVisibility = (typeof VISIBILITIES)[number];

export type ChainStatus = "active" | "voting" | "building" | "complete" | "archived";

export type ChainAuthor = {
  id: string;
  handle: string;
  display_name: string;
  hue: number;
};

export type Chain = {
  id: string;
  starter_id: string;
  title: string;
  description: string;
  type: ChainType;
  category: string;
  tags: string[];
  visibility: ChainVisibility;
  status: ChainStatus;
  voting_open: boolean;
  deadline: string | null;
  rules: string;
  result_summary: string;
  root_post_id: string | null;
  node_count: number;
  participant_count: number;
  vote_count: number;
  last_activity_at: string;
  completed_at: string | null;
  created_at: string;
  profiles: ChainAuthor | null;
};

export type ChainNode = {
  id: string;
  chain_id: string;
  parent_id: string | null;
  author_id: string;
  contribution: ContributionType;
  body: string;
  post_id: string | null;
  link_url: string | null;
  remix_of_node_id: string | null;
  original_author_id: string | null;
  is_pinned: boolean;
  vote_count: number;
  created_at: string;
  profiles: ChainAuthor | null;
};

const CHAIN_SELECT =
  "id, starter_id, title, description, type, category, tags, visibility, status, voting_open, deadline, rules, result_summary, root_post_id, node_count, participant_count, vote_count, last_activity_at, completed_at, created_at, profiles!vibe_chains_starter_profile_fkey(id, handle, display_name, hue)";

const NODE_SELECT =
  "id, chain_id, parent_id, author_id, contribution, body, post_id, link_url, remix_of_node_id, original_author_id, is_pinned, vote_count, created_at, profiles!vcn_author_profile_fkey(id, handle, display_name, hue)";

export type ChainFilter =
  | "trending"
  | "new"
  | "active"
  | "almost"
  | "challenges"
  | "collaborations"
  | "projects"
  | "questions"
  | "ideas"
  | "complete";

export function useChains(filter: ChainFilter = "trending", search = "", limit = 30) {
  return useQuery({
    queryKey: ["chains", filter, search, limit],
    queryFn: async () => {
      let q = supabase.from("vibe_chains").select(CHAIN_SELECT).limit(limit);

      switch (filter) {
        case "new":
          q = q.order("created_at", { ascending: false });
          break;
        case "active":
          q = q.eq("status", "active").order("last_activity_at", { ascending: false });
          break;
        case "almost":
          q = q.eq("status", "building").order("node_count", { ascending: false });
          break;
        case "challenges":
          q = q.eq("type", "challenge").order("last_activity_at", { ascending: false });
          break;
        case "collaborations":
          q = q.eq("type", "collaboration").order("last_activity_at", { ascending: false });
          break;
        case "projects":
          q = q.eq("type", "project").order("last_activity_at", { ascending: false });
          break;
        case "questions":
          q = q.eq("type", "question").order("last_activity_at", { ascending: false });
          break;
        case "ideas":
          q = q.eq("type", "idea").order("last_activity_at", { ascending: false });
          break;
        case "complete":
          q = q.eq("status", "complete").order("completed_at", { ascending: false });
          break;
        default:
          q = q.order("vote_count", { ascending: false }).order("node_count", { ascending: false });
      }

      if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as Chain[];
    },
  });
}

export function useChain(chainId?: string) {
  return useQuery({
    queryKey: ["chain", chainId],
    enabled: !!chainId,
    queryFn: async () => {
      const { data, error } = await supabase.from("vibe_chains").select(CHAIN_SELECT).eq("id", chainId!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Chain | null;
    },
  });
}

/** Loads chain nodes page by page — chains can grow large, so never fetch everything. */
export function useChainNodes(chainId?: string, limit = 120) {
  return useQuery({
    queryKey: ["chain-nodes", chainId, limit],
    enabled: !!chainId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vibe_chain_nodes")
        .select(NODE_SELECT)
        .eq("chain_id", chainId!)
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as ChainNode[];
    },
  });
}

export function useChainParticipants(chainId?: string) {
  return useQuery({
    queryKey: ["chain-participants", chainId],
    enabled: !!chainId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vibe_chain_participants")
        .select("user_id, role, joined_at, profiles!vcp_user_profile_fkey(id, handle, display_name, hue)")
        .eq("chain_id", chainId!)
        .order("joined_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as {
        user_id: string;
        role: "owner" | "moderator" | "editor" | "contributor";
        joined_at: string;
        profiles: ChainAuthor | null;
      }[];
    },
  });
}

export function useCreateChain() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      type: ChainType;
      category: string;
      tags: string[];
      visibility: ChainVisibility;
      rules?: string;
      deadline?: string | null;
      rootPostId?: string | null;
    }) => {
      if (!user) throw new Error("Sign in to start a Vibe Chain");
      const { data, error } = await supabase
        .from("vibe_chains")
        .insert({
          starter_id: user.id,
          title: input.title,
          description: input.description,
          type: input.type,
          category: input.category,
          tags: input.tags,
          visibility: input.visibility,
          rules: input.rules ?? "",
          deadline: input.deadline ?? null,
          root_post_id: input.rootPostId ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id as string;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chains"] }),
  });
}

export function useUpdateChain(chainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Pick<Chain, "title" | "description" | "visibility" | "status" | "voting_open" | "result_summary" | "rules" | "category">>) => {
      const { error } = await supabase
        .from("vibe_chains")
        .update({ ...patch, ...(patch.status === "complete" ? { completed_at: new Date().toISOString() } : {}) })
        .eq("id", chainId);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chain", chainId] });
      void qc.invalidateQueries({ queryKey: ["chains"] });
    },
  });
}

export function useAddNode(chainId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      contribution: ContributionType;
      body: string;
      parentId?: string | null;
      postId?: string | null;
      linkUrl?: string | null;
      remixOfNodeId?: string | null;
      originalAuthorId?: string | null;
    }) => {
      if (!user) throw new Error("Sign in to contribute");
      const { error } = await supabase.from("vibe_chain_nodes").insert({
        chain_id: chainId,
        author_id: user.id,
        parent_id: input.parentId ?? null,
        contribution: input.contribution,
        body: input.body,
        post_id: input.postId ?? null,
        link_url: input.linkUrl ?? null,
        remix_of_node_id: input.remixOfNodeId ?? null,
        original_author_id: input.originalAuthorId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chain-nodes", chainId] });
      void qc.invalidateQueries({ queryKey: ["chain", chainId] });
      void qc.invalidateQueries({ queryKey: ["chain-participants", chainId] });
    },
  });
}

export function useDeleteNode(chainId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (nodeId: string) => {
      const { error } = await supabase.from("vibe_chain_nodes").delete().eq("id", nodeId);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chain-nodes", chainId] });
      void qc.invalidateQueries({ queryKey: ["chain", chainId] });
    },
  });
}

export function useMyChainVotes(chainId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chain-votes", chainId, user?.id],
    enabled: !!chainId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vibe_chain_votes")
        .select("node_id")
        .eq("chain_id", chainId!)
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.node_id));
    },
  });
}

export function useToggleChainVote(chainId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ nodeId, voted }: { nodeId: string; voted: boolean }) => {
      if (!user) throw new Error("Sign in to vote");
      if (voted) {
        const { error } = await supabase
          .from("vibe_chain_votes")
          .delete()
          .eq("node_id", nodeId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("vibe_chain_votes")
          .insert({ chain_id: chainId, node_id: nodeId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chain-votes", chainId] });
      void qc.invalidateQueries({ queryKey: ["chain-nodes", chainId] });
    },
  });
}

/** Vibe Room: collaborative conversation around one chain (not private messaging, not encrypted). */
export function useChainRoom(chainId?: string) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["chain-room", chainId],
    enabled: !!chainId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vibe_chain_messages")
        .select("id, body, created_at, user_id, profiles!vcm_user_profile_fkey(id, handle, display_name, hue)")
        .eq("chain_id", chainId!)
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return ((data ?? []) as unknown as {
        id: string;
        body: string;
        created_at: string;
        user_id: string;
        profiles: ChainAuthor | null;
      }[]).reverse();
    },
  });

  useEffect(() => {
    if (!chainId) return;
    const channel = supabase
      .channel(`room-${chainId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "vibe_chain_messages", filter: `chain_id=eq.${chainId}` },
        () => void qc.invalidateQueries({ queryKey: ["chain-room", chainId] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [chainId, qc]);

  return query;
}

export function useSendRoomMessage(chainId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      if (!user) throw new Error("Sign in to join the room");
      const { error } = await supabase.from("vibe_chain_messages").insert({ chain_id: chainId, user_id: user.id, body });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chain-room", chainId] }),
  });
}

export function useChainTasks(chainId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["chain-tasks", chainId],
    enabled: !!chainId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vibe_chain_tasks")
        .select("id, title, done, due_date, assignee_id, created_at")
        .eq("chain_id", chainId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async (title: string) => {
      if (!user || !chainId) throw new Error("Sign in first");
      const { error } = await supabase
        .from("vibe_chain_tasks")
        .insert({ chain_id: chainId, title, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chain-tasks", chainId] }),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("vibe_chain_tasks").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chain-tasks", chainId] }),
  });

  return { tasks: query.data ?? [], isLoading: query.isLoading, add, toggle };
}

export function useJoinChain(chainId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to join");
      const { error } = await supabase
        .from("vibe_chain_participants")
        .insert({ chain_id: chainId, user_id: user.id, role: "contributor" });
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["chain-participants", chainId] }),
  });
}

/** Chains a person started plus the ones they contributed to — powers the profile section. */
export function useProfileChains(userId?: string) {
  return useQuery({
    queryKey: ["profile-chains", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [started, joined] = await Promise.all([
        supabase.from("vibe_chains").select(CHAIN_SELECT).eq("starter_id", userId!).order("created_at", { ascending: false }).limit(20),
        supabase
          .from("vibe_chain_nodes")
          .select("id, contribution, created_at, chain_id, vote_count, vibe_chains(id, title, status)")
          .eq("author_id", userId!)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (started.error) throw started.error;
      if (joined.error) throw joined.error;
      return {
        started: (started.data ?? []) as unknown as Chain[],
        contributions: (joined.data ?? []) as unknown as {
          id: string;
          contribution: ContributionType;
          created_at: string;
          chain_id: string;
          vote_count: number;
          vibe_chains: { id: string; title: string; status: ChainStatus } | null;
        }[],
      };
    },
  });
}

/** Reputation from real contribution signals only — never followers, never purchasable. */
export function chainReputation(input: { started: number; contributions: number; votes: number; completed: number }) {
  return input.started * 5 + input.contributions * 3 + input.votes * 2 + input.completed * 15;
}

export type ChainTree = { node: ChainNode; children: ChainTree[] };

export function buildChainTree(nodes: ChainNode[]): ChainTree[] {
  const map = new Map<string, ChainTree>();
  nodes.forEach((n) => map.set(n.id, { node: n, children: [] }));
  const roots: ChainTree[] = [];
  nodes.forEach((n) => {
    const entry = map.get(n.id)!;
    const parent = n.parent_id ? map.get(n.parent_id) : undefined;
    if (parent) parent.children.push(entry);
    else roots.push(entry);
  });
  return roots;
}
