import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Play, Upload } from "lucide-react";
import { HueTile, SectionHeading } from "@/components/vibe/primitives";
import { PostCard } from "@/components/vibe/PostCard";
import { useFeed, useMyLikes, useToggleLike } from "@/lib/data";
import { useSignedUrls, formatDuration } from "@/lib/media";

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
  const feed = useFeed();
  const shorts = useFeed({ kind: "video" });
  const posts = feed.data ?? [];
  const shortList = (shorts.data ?? []).filter((p) => (p.duration_seconds ?? 0) <= 90).slice(0, 8);

  const urls =
    useSignedUrls([
      ...posts.flatMap((p) => [p.media_path, p.thumb_path]),
      ...shortList.map((p) => p.thumb_path),
    ]).data ?? {};

  const likes = useMyLikes().data ?? new Set<string>();
  const toggle = useToggleLike();

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
              to="/upload"
              className="inline-flex items-center gap-2 rounded-full gradient-marigold px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <Upload className="size-3.5" /> Upload
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

      {shortList.length > 0 && (
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
            {shortList.map((s) => {
              const thumb = s.thumb_path ? urls[s.thumb_path] : undefined;
              return (
                <Link key={s.id} to="/shorts" className="w-32 shrink-0">
                  {thumb ? (
                    <div className="relative aspect-9/16 overflow-hidden rounded-xl bg-surface-2">
                      <img src={thumb} alt={s.caption || "Short"} loading="lazy" className="size-full object-cover" />
                      <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-[11px] leading-tight">
                        {s.caption}
                      </span>
                    </div>
                  ) : (
                    <HueTile hue={s.profiles?.hue ?? 42} className="aspect-9/16" label={s.caption}>
                      <span className="absolute inset-0 grid place-items-center">
                        <Play className="size-5" />
                      </span>
                      <span className="absolute bottom-2 left-2 right-2 line-clamp-2 text-[11px] leading-tight">
                        {s.caption}
                      </span>
                    </HueTile>
                  )}
                  {s.duration_seconds ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">{formatDuration(s.duration_seconds)}</p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <SectionHeading title="Recommended for you" />
        {feed.isLoading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-surface-2" />
            ))}
          </div>
        ) : feed.error ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            The feed didn't load. Pull down or refresh to try again.
          </p>
        ) : posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Be the first to post a photo or video to the public feed.
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-block rounded-full gradient-marigold px-4 py-2 text-xs font-medium text-primary-foreground"
            >
              Upload something
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                urls={urls}
                liked={likes.has(p.id)}
                onLike={() => toggle.mutate({ postId: p.id, liked: likes.has(p.id) })}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
