import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  GitBranch,
  Lock,
  MessagesSquare,
  Plus,
  Send,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { Monogram } from "@/components/vibe/primitives";
import { ChainNodeCard, ChainStatusPill, ChainTreeView, contributionMeta } from "@/components/vibe/chain-ui";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/media";
import {
  CONTRIBUTION_TYPES,
  buildChainTree,
  useAddNode,
  useChain,
  useChainNodes,
  useChainParticipants,
  useChainRoom,
  useChainTasks,
  useDeleteNode,
  useJoinChain,
  useMyChainVotes,
  useSendRoomMessage,
  useToggleChainVote,
  useUpdateChain,
  type ContributionType,
  type ChainNode,
} from "@/lib/chains";

export const Route = createFileRoute("/chain/$chainId")({
  head: () => ({
    meta: [
      { title: "Vibe Chain — VibeTabe" },
      {
        name: "description",
        content: "Follow a Vibe Chain from the original idea through responses, remixes and collaboration to the final result.",
      },
      { property: "og:title", content: "Vibe Chain — VibeTabe" },
      { property: "og:description", content: "Built by the VibeTabe community." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChainPage,
});

type Tab = "chain" | "room" | "project" | "credits";

function ChainPage() {
  const { chainId } = useParams({ from: "/chain/$chainId" });
  const { user } = useAuth();

  const { data: chain, isLoading } = useChain(chainId);
  const { data: nodes } = useChainNodes(chainId);
  const { data: participants } = useChainParticipants(chainId);
  const { data: votes } = useMyChainVotes(chainId);
  const room = useChainRoom(chainId);
  const tasks = useChainTasks(chainId);

  const addNode = useAddNode(chainId);
  const deleteNode = useDeleteNode(chainId);
  const toggleVote = useToggleChainVote(chainId);
  const sendRoom = useSendRoomMessage(chainId);
  const join = useJoinChain(chainId);
  const updateChain = useUpdateChain(chainId);

  const [tab, setTab] = useState<Tab>("chain");
  const [composerOpen, setComposerOpen] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [remixOf, setRemixOf] = useState<{ id: string; authorId: string } | null>(null);
  const [contribution, setContribution] = useState<ContributionType>("response");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [roomDraft, setRoomDraft] = useState("");
  const [taskDraft, setTaskDraft] = useState("");
  const [resultDraft, setResultDraft] = useState("");

  const tree = useMemo(() => buildChainTree(nodes ?? []), [nodes]);
  const topNode = useMemo<ChainNode | null>(
    () => (nodes ?? []).reduce<ChainNode | null>((best, n) => (!best || n.vote_count > best.vote_count ? n : best), null),
    [nodes],
  );
  const isOwner = !!user && !!chain && chain.starter_id === user.id;
  const canContribute = !!user && !!chain && chain.status !== "complete" && chain.status !== "archived";

  if (isLoading) return <p className="px-4 py-8 text-sm text-muted-foreground">Loading chain…</p>;
  if (!chain)
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">This chain is private or no longer available.</p>
        <Link to="/chains" className="mt-3 inline-block text-sm text-primary">
          Browse Vibe Chains
        </Link>
      </div>
    );

  const openComposer = (opts: { parentId?: string | null; remix?: { id: string; authorId: string } | null; type?: ContributionType }) => {
    setParentId(opts.parentId ?? null);
    setRemixOf(opts.remix ?? null);
    setContribution(opts.type ?? (opts.remix ? "remix" : "response"));
    setComposerOpen(true);
  };

  return (
    <div className="px-4 py-4">
      <Link to="/chains" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> All chains
      </Link>

      <header className="surface-card gradient-dusk relative overflow-hidden p-4">
        <div className="jaali pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <div className="flex items-start gap-3">
            <Monogram name={chain.profiles?.display_name || chain.profiles?.handle || "V"} hue={chain.profiles?.hue ?? 42} size={38} />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl leading-snug">{chain.title}</h1>
              <p className="truncate text-xs text-muted-foreground">
                Chain Starter @{chain.profiles?.handle} · {chain.type} · {timeAgo(chain.created_at)}
              </p>
            </div>
            <ChainStatusPill chain={chain} />
          </div>

          {chain.description && <p className="mt-3 text-sm">{chain.description}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GitBranch className="size-3" /> {chain.node_count} contributions
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" /> {chain.participant_count} people
            </span>
            <span className="inline-flex items-center gap-1">
              <Trophy className="size-3" /> {chain.vote_count} votes
            </span>
            {chain.visibility !== "public" && (
              <span className="inline-flex items-center gap-1 text-secure">
                <Lock className="size-3" /> access-controlled
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {canContribute && (
              <button
                onClick={() => openComposer({})}
                className="inline-flex items-center gap-1.5 rounded-full gradient-marigold px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <Plus className="size-3.5" /> Contribute
              </button>
            )}
            {user && !isOwner && (
              <button
                onClick={() => join.mutate()}
                className="rounded-full border border-border px-4 py-2 text-sm"
              >
                Join collaboration
              </button>
            )}
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm"
            >
              <Share2 className="size-3.5" /> Share
            </button>
          </div>
        </div>
      </header>

      <nav className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {([
          ["chain", "Chain"],
          ["room", "Vibe Room"],
          ["project", "Project"],
          ["credits", "Credits"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium " +
              (tab === key ? "gradient-marigold text-primary-foreground" : "bg-secondary text-secondary-foreground")
            }
          >
            {label}
          </button>
        ))}
      </nav>

      {composerOpen && (
        <section className="surface-card mt-4 p-4">
          <p className="text-sm font-medium">How does this contribute?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONTRIBUTION_TYPES.map((t) => {
              const Icon = contributionMeta[t].icon;
              return (
                <button
                  key={t}
                  onClick={() => setContribution(t)}
                  className={
                    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs " +
                    (contribution === t ? "gradient-marigold text-primary-foreground" : "bg-secondary text-secondary-foreground")
                  }
                >
                  <Icon className="size-3" /> {contributionMeta[t].label}
                </button>
              );
            })}
          </div>
          {remixOf && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Remixing an existing contribution — the original creator stays credited automatically.
            </p>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Add your response, idea, design note or result…"
            className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Optional link (video, design, repo…)"
            className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
          <div className="mt-3 flex gap-2">
            <button
              disabled={addNode.isPending || !body.trim()}
              onClick={() =>
                addNode.mutate(
                  {
                    contribution,
                    body: body.trim(),
                    parentId,
                    linkUrl: linkUrl.trim() || null,
                    remixOfNodeId: remixOf?.id ?? null,
                    originalAuthorId: remixOf?.authorId ?? null,
                  },
                  {
                    onSuccess: () => {
                      setBody("");
                      setLinkUrl("");
                      setComposerOpen(false);
                      setRemixOf(null);
                      setParentId(null);
                    },
                  },
                )
              }
              className="rounded-full gradient-marigold px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {addNode.isPending ? "Publishing…" : "Publish contribution"}
            </button>
            <button onClick={() => setComposerOpen(false)} className="rounded-full border border-border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
          {addNode.error && <p className="mt-2 text-xs text-destructive">{(addNode.error as Error).message}</p>}
        </section>
      )}

      {tab === "chain" && (
        <section className="mt-5">
          <div className="rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
            Original → Response → Remix → Idea → Design → Collaboration → Result
          </div>

          {(nodes ?? []).length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No contributions yet. Be the first branch of this chain.
            </p>
          ) : (
            <div className="mt-4">
              <ChainTreeView
                tree={tree}
                render={(node, depth) => (
                  <ChainNodeCard
                    node={node}
                    depth={depth}
                    voted={votes?.has(node.id) ?? false}
                    canInteract={!!user}
                    highlight={!!topNode && topNode.id === node.id && node.vote_count > 0}
                    onVote={() => toggleVote.mutate({ nodeId: node.id, voted: votes?.has(node.id) ?? false })}
                    onReply={() => openComposer({ parentId: node.id })}
                    onRemix={() => openComposer({ parentId: node.id, remix: { id: node.id, authorId: node.author_id } })}
                    {...(user && (node.author_id === user.id || isOwner)
                      ? { onDelete: () => deleteNode.mutate(node.id) }
                      : {})}
                  />
                )}
              />
            </div>
          )}

          {isOwner && chain.status !== "complete" && (
            <div className="surface-card mt-6 p-4">
              <p className="text-sm font-medium">Chain controls</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateChain.mutate({ voting_open: !chain.voting_open, status: chain.voting_open ? "active" : "voting" })}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs"
                >
                  {chain.voting_open ? "Close voting" : "Open voting"}
                </button>
                <button
                  onClick={() => updateChain.mutate({ status: "building" })}
                  className="rounded-full border border-border px-3.5 py-1.5 text-xs"
                >
                  Move to building
                </button>
              </div>
              <textarea
                value={resultDraft}
                onChange={(e) => setResultDraft(e.target.value)}
                rows={3}
                placeholder="Final result summary (shown on the public result page)"
                className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
              />
              <button
                onClick={() => updateChain.mutate({ status: "complete", result_summary: resultDraft.trim() })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full gradient-marigold px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                <CheckCircle2 className="size-3.5" /> Mark chain complete
              </button>
            </div>
          )}

          {chain.status === "complete" && (
            <div className="surface-card mt-6 p-4">
              <p className="inline-flex items-center gap-2 font-display text-lg">
                <Trophy className="size-4 text-secure" /> Chain complete
              </p>
              {chain.result_summary && <p className="mt-2 text-sm">{chain.result_summary}</p>}
              <p className="mt-3 text-xs text-muted-foreground">Built by the VibeTabe community.</p>
            </div>
          )}
        </section>
      )}

      {tab === "room" && (
        <section className="mt-5">
          <div className="rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
            <MessagesSquare className="mr-1 inline size-3" /> Vibe Room is the shared workspace for this chain. It is
            visible to everyone who can see the chain — unlike your private chats, it is not end-to-end encrypted.
          </div>

          <div className="mt-4 space-y-3">
            {(room.data ?? []).map((m) => (
              <div key={m.id} className="flex gap-2">
                <Monogram name={m.profiles?.display_name || m.profiles?.handle || "V"} hue={m.profiles?.hue ?? 42} size={28} />
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">
                    @{m.profiles?.handle} · {timeAgo(m.created_at)}
                  </p>
                  <p className="text-sm">{m.body}</p>
                </div>
              </div>
            ))}
            {(room.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No room messages yet.</p>
            )}
          </div>

          {canContribute && (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = roomDraft.trim();
                if (!value) return;
                sendRoom.mutate(value, { onSuccess: () => setRoomDraft("") });
              }}
            >
              <input
                value={roomDraft}
                onChange={(e) => setRoomDraft(e.target.value)}
                placeholder="Message the collaborators"
                className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
              />
              <button className="rounded-full gradient-marigold px-4 text-sm font-medium text-primary-foreground">
                <Send className="size-4" />
              </button>
            </form>
          )}
        </section>
      )}

      {tab === "project" && (
        <section className="mt-5">
          <p className="text-sm font-medium">Vibe Project</p>
          <p className="text-xs text-muted-foreground">Lightweight milestones so the chain can actually ship.</p>

          <ul className="mt-4 space-y-2">
            {tasks.tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={t.done}
                  disabled={!canContribute}
                  onChange={() => tasks.toggle.mutate({ id: t.id, done: !t.done })}
                  className="size-4 accent-current"
                />
                <span className={"text-sm " + (t.done ? "text-muted-foreground line-through" : "")}>{t.title}</span>
              </li>
            ))}
            {tasks.tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
          </ul>

          {canContribute && (
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = taskDraft.trim();
                if (!value) return;
                tasks.add.mutate(value, { onSuccess: () => setTaskDraft("") });
              }}
            >
              <input
                value={taskDraft}
                onChange={(e) => setTaskDraft(e.target.value)}
                placeholder="Add a milestone or task"
                className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
              />
              <button className="rounded-full gradient-marigold px-4 text-sm font-medium text-primary-foreground">Add</button>
            </form>
          )}
        </section>
      )}

      {tab === "credits" && (
        <section className="mt-5">
          <p className="font-display text-lg">Built by</p>
          <ul className="mt-3 space-y-2">
            {(participants ?? []).map((p) => (
              <li key={p.user_id} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
                <Monogram name={p.profiles?.display_name || p.profiles?.handle || "V"} hue={p.profiles?.hue ?? 42} size={30} />
                <div className="min-w-0">
                  <Link to="/u/$handle" params={{ handle: p.profiles?.handle ?? "" }} className="truncate text-sm hover:underline">
                    {p.profiles?.display_name || p.profiles?.handle}
                  </Link>
                  <p className="text-[11px] capitalize text-muted-foreground">{p.role}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Built by the VibeTabe community.</p>
        </section>
      )}
    </div>
  );
}
