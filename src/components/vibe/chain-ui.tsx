import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Flag,
  GitBranch,
  Lightbulb,
  Link2,
  MessageSquare,
  Palette,
  Shuffle,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react";
import { Monogram } from "@/components/vibe/primitives";
import { timeAgo } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Chain, ChainNode, ChainTree, ContributionType } from "@/lib/chains";

export const contributionMeta: Record<ContributionType, { label: string; icon: typeof Lightbulb; hue: string }> = {
  response: { label: "Response", icon: MessageSquare, hue: "text-primary" },
  remix: { label: "Remix", icon: Shuffle, hue: "text-accent-foreground" },
  idea: { label: "Idea", icon: Lightbulb, hue: "text-primary" },
  improvement: { label: "Improvement", icon: Wand2, hue: "text-secure" },
  question: { label: "Question", icon: CircleDot, hue: "text-muted-foreground" },
  design: { label: "Design", icon: Palette, hue: "text-primary" },
  collaboration: { label: "Collaboration", icon: Users, hue: "text-secure" },
  result: { label: "Result", icon: Flag, hue: "text-secure" },
};

export function ChainBadge({ chainId, title }: { chainId: string; title?: string }) {
  return (
    <Link
      to="/chain/$chainId"
      params={{ chainId }}
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
    >
      <GitBranch className="size-3 shrink-0" />
      <span className="truncate">{title ? `Part of “${title}”` : "Part of a Vibe Chain"}</span>
    </Link>
  );
}

export function ChainStatusPill({ chain }: { chain: Pick<Chain, "status" | "visibility"> }) {
  const tone =
    chain.status === "complete"
      ? "border-secure/40 bg-secure/10 text-secure"
      : chain.status === "voting"
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-border bg-secondary text-muted-foreground";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] capitalize", tone)}>
      {chain.status} · {chain.visibility}
    </span>
  );
}

export function ChainCard({ chain }: { chain: Chain }) {
  return (
    <Link to="/chain/$chainId" params={{ chainId: chain.id }} className="surface-card block p-4 transition-transform active:scale-[0.99]">
      <div className="flex items-start gap-3">
        <Monogram name={chain.profiles?.display_name || chain.profiles?.handle || "V"} hue={chain.profiles?.hue ?? 42} size={34} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base leading-tight">{chain.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            @{chain.profiles?.handle} · {chain.type} · {timeAgo(chain.created_at)}
          </p>
        </div>
        <ChainStatusPill chain={chain} />
      </div>
      {chain.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{chain.description}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <GitBranch className="size-3" /> {chain.node_count} contributions
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="size-3" /> {chain.participant_count} people
        </span>
        <span className="inline-flex items-center gap-1">
          <TrendingUp className="size-3" /> {chain.vote_count} votes
        </span>
        {chain.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-secondary px-2 py-0.5">
            #{t}
          </span>
        ))}
      </div>
    </Link>
  );
}

export function ChainNodeCard({
  node,
  depth,
  voted,
  canInteract,
  onVote,
  onReply,
  onRemix,
  onDelete,
  highlight,
}: {
  node: ChainNode;
  depth: number;
  voted: boolean;
  canInteract: boolean;
  onVote: () => void;
  onReply: () => void;
  onRemix: () => void;
  onDelete?: () => void;
  highlight?: boolean;
}) {
  const meta = contributionMeta[node.contribution];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "surface-card p-3",
        highlight && "ring-1 ring-primary/60",
      )}
      style={{ marginLeft: Math.min(depth, 4) * 12 }}
    >
      <div className="flex items-center gap-2">
        <Monogram name={node.profiles?.display_name || node.profiles?.handle || "V"} hue={node.profiles?.hue ?? 42} size={28} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{node.profiles?.display_name || node.profiles?.handle}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            @{node.profiles?.handle} · {timeAgo(node.created_at)}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px]", meta.hue)}>
          <Icon className="size-3" /> {meta.label}
        </span>
      </div>

      {node.body && <p className="mt-2 whitespace-pre-wrap text-sm">{node.body}</p>}

      {node.remix_of_node_id && (
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
          <Shuffle className="size-3" /> Remix — original creator credited
        </p>
      )}

      {node.link_url && (
        <a
          href={node.link_url}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Link2 className="size-3" /> Attached link <ArrowUpRight className="size-3" />
        </a>
      )}

      {node.post_id && (
        <Link
          to="/post/$postId"
          params={{ postId: node.post_id }}
          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Sparkles className="size-3" /> Open attached post
        </Link>
      )}

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        <button
          onClick={onVote}
          disabled={!canInteract}
          className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-foreground disabled:opacity-50", voted && "bg-primary/10 text-primary")}
        >
          <TrendingUp className="size-3" /> {node.vote_count}
        </button>
        <button onClick={onReply} className="hover:text-foreground">
          Respond
        </button>
        <button onClick={onRemix} className="hover:text-foreground">
          Remix
        </button>
        {onDelete && (
          <button onClick={onDelete} className="ml-auto inline-flex items-center gap-1 text-destructive/80 hover:text-destructive">
            <Trash2 className="size-3" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

/** Vertical branch timeline. Children collapse by default beyond the first level, so huge chains stay light. */
export function ChainTreeView({
  tree,
  depth = 0,
  render,
}: {
  tree: ChainTree[];
  depth?: number;
  render: (node: ChainNode, depth: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      {tree.map((branch) => (
        <ChainBranch key={branch.node.id} branch={branch} depth={depth} render={render} />
      ))}
    </div>
  );
}

function ChainBranch({
  branch,
  depth,
  render,
}: {
  branch: ChainTree;
  depth: number;
  render: (node: ChainNode, depth: number) => React.ReactNode;
}) {
  const [open, setOpen] = useState(depth < 1);
  const count = branch.children.length;

  return (
    <div className="relative">
      <div className="relative pl-3">
        <span
          aria-hidden
          className="absolute left-0 top-4 h-[calc(100%-1rem)] w-px bg-border"
          style={{ display: depth === 0 ? "none" : "block" }}
        />
        {render(branch.node, depth)}
      </div>

      {count > 0 && (
        <div className="mt-2 pl-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            {count} branch{count > 1 ? "es" : ""}
          </button>
          {open && (
            <div className="mt-2 space-y-3 border-l border-border pl-2">
              <ChainTreeView tree={branch.children} depth={depth + 1} render={render} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
