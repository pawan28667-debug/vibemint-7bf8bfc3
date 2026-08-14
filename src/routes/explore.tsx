import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Play } from "lucide-react";
import { HueTile, Monogram, SectionHeading } from "@/components/vibe/primitives";
import { videos, photos, creators, communities, creatorById } from "@/lib/mock-data";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — VibeConnect" },
      {
        name: "description",
        content:
          "Search public videos, photos, creators and communities. Private chats are never indexed.",
      },
      { property: "og:title", content: "Explore — VibeConnect" },
      {
        property: "og:description",
        content: "Public discovery only — encrypted conversations stay off the index.",
      },
    ],
  }),
  component: Explore,
});

const categories = ["All", "Technology", "Craft", "Food", "Photography", "Music", "Business"];

function Explore() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const publicVideos = useMemo(
    () =>
      videos
        .filter((v) => v.visibility === "public")
        .filter((v) => (category === "All" ? true : v.category === category))
        .filter((v) => v.title.toLowerCase().includes(query.toLowerCase())),
    [query, category],
  );

  return (
    <div className="space-y-8 px-4 py-5">
      <div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search public videos, photos, creators"
            className="w-full rounded-full border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
          />
        </label>
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          Search covers public content only. Encrypted chats are searched on your device.
        </p>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors " +
              (category === c
                ? "gradient-marigold text-primary-foreground"
                : "bg-secondary text-secondary-foreground")
            }
          >
            {c}
          </button>
        ))}
      </div>

      <section>
        <SectionHeading title="Videos" />
        {publicVideos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nothing matches that yet. Try another term or category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {publicVideos.map((v) => (
              <article key={v.id}>
                <HueTile hue={v.hue} className="aspect-video" label={v.title}>
                  <span className="absolute inset-0 grid place-items-center">
                    <Play className="size-6 text-foreground/80" />
                  </span>
                </HueTile>
                <h3 className="mt-2 line-clamp-2 text-xs font-medium leading-snug">{v.title}</h3>
                <p className="text-[11px] text-muted-foreground">{creatorById(v.creatorId).name}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeading title="Photos" />
        <div className="grid grid-cols-3 gap-2">
          {photos
            .filter((p) => p.visibility === "public")
            .map((p) => (
              <HueTile key={p.id} hue={p.hue} className="aspect-square" label={p.caption} />
            ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Creators" />
        <div className="space-y-2">
          {creators.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl bg-surface p-3">
              <Monogram name={c.name} hue={c.hue} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.handle} · {c.subscribers} subscribers
                </p>
              </div>
              <button className="rounded-full border border-primary/50 px-3 py-1.5 text-xs font-medium text-primary">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Communities" />
        <div className="grid grid-cols-2 gap-3">
          {communities.map((g) => (
            <div key={g.id} className="surface-card p-3">
              <HueTile hue={g.hue} className="mb-3 h-16" />
              <p className="text-sm font-medium">{g.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {g.topic} · {g.members}
              </p>
              <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                {g.privacy}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
