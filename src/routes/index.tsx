import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ThumbsUp, MessageSquare, Share2, Bookmark, Lock } from "lucide-react";
import { HueTile, Monogram, SectionHeading, VisibilityChip } from "@/components/vibe/primitives";
import { videos, photos, shorts, creatorById } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeConnect — Watch. Share. Connect. Privately." },
      {
        name: "description",
        content:
          "Discover videos and photos, build an audience, and talk privately in end-to-end encrypted chats.",
      },
      { property: "og:title", content: "VibeConnect — Watch. Share. Connect. Privately." },
      {
        property: "og:description",
        content: "Public when you want to share. Private when you need to talk.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const feed = videos.filter((v) => v.visibility === "public");

  return (
    <div className="space-y-8 px-4 py-5">
      <section className="surface-card gradient-dusk relative overflow-hidden p-5">
        <div className="jaali pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Watch. Share. Connect.</p>
          <h1 className="mt-2 max-w-sm font-display text-2xl leading-snug">
            Public when you want to share. Private when you need to talk.
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/explore"
              className="rounded-full gradient-marigold px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Explore feed
            </Link>
            <Link
              to="/messages"
              className="inline-flex items-center gap-2 rounded-full border border-secure/40 px-4 py-2 text-sm font-medium text-secure"
            >
              <Lock className="size-3.5" /> Encrypted chats
            </Link>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          title="Shorts"
          action={
            <Link to="/shorts" className="text-xs text-primary">
              See all
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {shorts.map((s) => (
            <Link key={s.id} to="/shorts" className="w-32 shrink-0">
              <HueTile hue={s.hue} className="aspect-9/16" label={s.title}>
                <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-[11px] leading-tight text-foreground/90">
                  {s.title}
                </span>
              </HueTile>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading title="Recommended for you" />
        <div className="space-y-6">
          {feed.map((v) => {
            const c = creatorById(v.creatorId);
            return (
              <article key={v.id}>
                <HueTile hue={v.hue} className="aspect-video" label={v.title}>
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-12 place-items-center rounded-full bg-background/50 backdrop-blur">
                      <Play className="size-5 text-foreground" />
                    </span>
                  </span>
                  <span className="absolute bottom-2 right-2 rounded bg-background/80 px-1.5 py-0.5 text-[11px]">
                    {v.duration}
                  </span>
                </HueTile>
                <div className="mt-3 flex gap-3">
                  <Monogram name={c.name} hue={c.hue} />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.name} · {v.views} · {v.age}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                      <button className="inline-flex items-center gap-1.5 text-xs hover:text-foreground">
                        <ThumbsUp className="size-4" /> 12K
                      </button>
                      <button className="inline-flex items-center gap-1.5 text-xs hover:text-foreground">
                        <MessageSquare className="size-4" /> 486
                      </button>
                      <Link
                        to="/messages"
                        className="inline-flex items-center gap-1.5 text-xs text-secure"
                      >
                        <Share2 className="size-4" /> Share privately
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeading title="From your photo feed" />
        <div className="space-y-5">
          {photos.slice(0, 3).map((p) => {
            const c = creatorById(p.creatorId);
            return (
              <article key={p.id} className="surface-card overflow-hidden">
                <div className="flex items-center gap-3 p-3">
                  <Monogram name={c.name} hue={c.hue} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.handle}</p>
                  </div>
                  <VisibilityChip visibility={p.visibility} />
                </div>
                <HueTile hue={p.hue} className="aspect-4/5 rounded-none" label={p.caption}>
                  {p.frames > 1 && (
                    <span className="absolute right-2 top-2 rounded-full bg-background/70 px-2 py-0.5 text-[11px]">
                      1/{p.frames}
                    </span>
                  )}
                </HueTile>
                <div className="flex items-center gap-4 p-3 text-muted-foreground">
                  <button className="inline-flex items-center gap-1.5 text-xs hover:text-foreground">
                    <ThumbsUp className="size-4" /> {p.likes.toLocaleString("en-IN")}
                  </button>
                  <button className="inline-flex items-center gap-1.5 text-xs hover:text-foreground">
                    <MessageSquare className="size-4" /> {p.comments}
                  </button>
                  <button className="ml-auto hover:text-foreground" aria-label="Save">
                    <Bookmark className="size-4" />
                  </button>
                </div>
                <p className="px-3 pb-3 text-sm">{p.caption}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
