import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GitBranch, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { CHAIN_TYPES, VISIBILITIES, useCreateChain, type ChainType, type ChainVisibility } from "@/lib/chains";

export const Route = createFileRoute("/chains/new")({
  head: () => ({
    meta: [
      { title: "Start a Vibe Chain — VibeTabe" },
      {
        name: "description",
        content: "Start a Vibe Chain: post an idea, challenge or project and let people respond, remix and build it with you.",
      },
      { property: "og:title", content: "Start a Vibe Chain — VibeTabe" },
      { property: "og:description", content: "Turn one idea into a collaborative chain." },
    ],
  }),
  component: NewChain,
});

const categories = ["General", "Tech", "Music", "Travel", "Food", "Art", "Learning", "Everyday"] as const;

const visibilityCopy: Record<ChainVisibility, string> = {
  public: "Anyone can see and contribute",
  followers: "Only your subscribers can see it",
  invite: "Only people you add can see it",
  private: "Only participants can see it",
};

function NewChain() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const create = useCreateChain();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChainType>("discussion");
  const [category, setCategory] = useState<string>("General");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<ChainVisibility>("public");
  const [rules, setRules] = useState("");

  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">Sign in to start a Vibe Chain.</p>
        <Link to="/auth" search={{ next: "/chains/new" }} className="mt-3 inline-block text-sm text-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <h1 className="inline-flex items-center gap-2 font-display text-2xl">
        <GitBranch className="size-5 text-primary" /> Start a Vibe Chain
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You become the Chain Starter. Others respond, remix and build on it.
      </p>

      <form
        className="mt-5 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          create.mutate(
            {
              title: title.trim(),
              description: description.trim(),
              type,
              category,
              tags: tags
                .split(",")
                .map((t) => t.trim().replace(/^#/, ""))
                .filter(Boolean)
                .slice(0, 8),
              visibility,
              rules: rules.trim(),
            },
            { onSuccess: (chainId) => void navigate({ to: "/chain/$chainId", params: { chainId } }) },
          );
        }}
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="I'm building an AI startup…"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1200}
            placeholder="What are you exploring, and what kind of help do you want?"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Chain type</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {CHAIN_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize " +
                  (type === t ? "gradient-marigold text-primary-foreground" : "bg-secondary text-secondary-foreground")
                }
              >
                {t === "open" ? "Open-ended" : t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  "rounded-full px-3 py-1.5 text-xs " +
                  (category === c ? "bg-primary/15 text-primary" : "bg-secondary text-secondary-foreground")
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="ai, startup, design"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Visibility</label>
          <div className="mt-2 grid gap-2">
            {VISIBILITIES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm " +
                  (visibility === v ? "border-primary/50 bg-primary/10" : "border-border bg-surface")
                }
              >
                {v === "public" ? <GitBranch className="size-4" /> : <Lock className="size-4 text-secure" />}
                <span className="capitalize">{v}</span>
                <span className="ml-auto text-[11px] text-muted-foreground">{visibilityCopy[v]}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Non-public chains are hidden from search engines and public feeds. Chain content is protected by access
            rules on the server — it is not end-to-end encrypted like your private messages.
          </p>
        </div>

        {(type === "challenge" || type === "project") && (
          <div>
            <label className="text-xs font-medium text-muted-foreground">Rules</label>
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/60"
              placeholder="How should people contribute? Deadlines, formats, judging…"
            />
          </div>
        )}

        {create.error && <p className="text-xs text-destructive">{(create.error as Error).message}</p>}

        <button
          disabled={create.isPending || !title.trim()}
          className="w-full rounded-full gradient-marigold py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {create.isPending ? "Starting…" : "Start the chain"}
        </button>
      </form>
    </div>
  );
}
