import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Play } from "lucide-react";
import { HueTile, Monogram, SectionHeading } from "@/components/vibe/primitives";
import { useFeed, usePeopleSearch } from "@/lib/data";
import { useSignedUrls, formatDuration } from "@/lib/media";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore — VibeConnect" },
      {
        name: "description",
        content: "Search public videos, photos and creators across VibeConnect.",
      },
      { property: "og:title", content: "Explore — VibeConnect" },
      { property: "og:description", content: "Discover public content and the people behind it." },
    ],
  }),
  component: Explore,
});

const categories = ["All", "Tech", "Music", "Travel", "Food", "Art", "Learning", "Everyday"] as const;

function Explore() {
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>("All");

  const feed = useFeed({ search: term, category });
  const people = usePeopleSearch(term);
  const posts = feed.data ?? [];
  const urls = useSignedUrls(posts.flatMap((p) => [p.thumb_path, p.kind === "photo" ? p.media_path : null])).data ?? {};

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl">Explore</h1>

      <label className="relative mt-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search public posts and creators"
          className="w-full rounded-full border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
        />
      </label>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
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

      {term && (people.data ?? []).length > 0 && (
        <section className="mt-6">
          <SectionHeading title="People" />
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {(people.data ?? []).map((p) => (
              <Link
                key={p.id}
                to="/u/$handle"
                params={{ handle: p.handle }}
                className="w-28 shrink-0 rounded-xl bg-surface p-3 text-center"
              >
                <Monogram name={p.display_name || p.handle} hue={p.hue} size={48} />
                <span className="mt-2 block truncate text-xs font-medium">{p.display_name || p.handle}</span>
                <span className="block truncate text-[11px] text-muted-foreground">@{p.handle}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <SectionHeading title={term ? "Results" : "Trending now"} />
        {feed.isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-4/5 animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nothing matches that yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((p) => {
              const image = p.thumb_path ? urls[p.thumb_path] : p.kind === "photo" ? urls[p.media_path] : undefined;
              return (
                <Link key={p.id} to="/post/$postId" params={{ postId: p.id }} className="block">
                  <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-2">
                    {image ? (
                      <img src={image} alt={p.caption || "Post"} loading="lazy" className="size-full object-cover" />
                    ) : (
                      <HueTile hue={p.profiles?.hue ?? 42} className="size-full rounded-none" label={p.caption} />
                    )}
                    {p.kind === "video" && (
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 text-[11px]">
                        <Play className="size-3" /> {formatDuration(p.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug">{p.caption}</p>
                  <p className="text-[11px] text-muted-foreground">@{p.profiles?.handle}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
