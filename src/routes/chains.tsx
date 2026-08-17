import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GitBranch, Plus, Search } from "lucide-react";
import { ChainCard } from "@/components/vibe/chain-ui";
import { useChains, type ChainFilter } from "@/lib/chains";

export const Route = createFileRoute("/chains")({
  head: () => ({
    meta: [
      { title: "Vibe Chains — discover collaborations on VibeTabe" },
      {
        name: "description",
        content:
          "Browse trending, active and completed Vibe Chains: ideas that grew into responses, remixes, collaborations and finished projects.",
      },
      { property: "og:title", content: "Vibe Chains — VibeTabe" },
      {
        property: "og:description",
        content: "Turn content into conversations, collaborations and creations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChainsPage,
});

const filters: { key: ChainFilter; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "active", label: "Active" },
  { key: "almost", label: "Almost complete" },
  { key: "challenges", label: "Challenges" },
  { key: "collaborations", label: "Collaborations" },
  { key: "projects", label: "Projects" },
  { key: "questions", label: "Questions" },
  { key: "ideas", label: "Ideas" },
  { key: "complete", label: "Completed" },
];

function ChainsPage() {
  const [filter, setFilter] = useState<ChainFilter>("trending");
  const [term, setTerm] = useState("");
  const chains = useChains(filter, term);

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl">Vibe Chains</h1>
        <Link
          to="/chains/new"
          className="ml-auto inline-flex items-center gap-1.5 rounded-full gradient-marigold px-3.5 py-2 text-xs font-medium text-primary-foreground"
        >
          <Plus className="size-3.5" /> Start a chain
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Content → Response → Remix → Collaboration → Result.
      </p>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search chains"
          className="w-full rounded-full border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
        />
      </label>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors " +
              (filter === f.key ? "gradient-marigold text-primary-foreground" : "bg-secondary text-secondary-foreground")
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {chains.isLoading ? (
          [0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-2" />)
        ) : (chains.data ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <GitBranch className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No chains here yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start one and let the community respond, remix and build with you.
            </p>
            <Link
              to="/chains/new"
              className="mt-4 inline-block rounded-full gradient-marigold px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              Start a Vibe Chain
            </Link>
          </div>
        ) : (
          (chains.data ?? []).map((c) => <ChainCard key={c.id} chain={c} />)
        )}
      </div>
    </div>
  );
}
