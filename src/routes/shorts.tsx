import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageSquare, Send, Play } from "lucide-react";
import { HueTile, Monogram } from "@/components/vibe/primitives";
import { useFeed, useMyLikes, useToggleLike } from "@/lib/data";
import { useSignedUrls } from "@/lib/media";

export const Route = createFileRoute("/shorts")({
  head: () => ({
    meta: [
      { title: "Shorts — VibeConnect" },
      { name: "description", content: "Short vertical videos from creators across VibeConnect." },
      { property: "og:title", content: "Shorts — VibeConnect" },
      { property: "og:description", content: "Quick vertical videos, then take the chat private." },
    ],
  }),
  component: Shorts,
});

function Shorts() {
  const feed = useFeed({ kind: "video" });
  const shorts = (feed.data ?? []).filter((p) => (p.duration_seconds ?? 0) <= 90);
  const urls = useSignedUrls(shorts.flatMap((p) => [p.media_path, p.thumb_path])).data ?? {};
  const likes = useMyLikes().data ?? new Set<string>();
  const toggle = useToggleLike();

  if (feed.isLoading) {
    return <div className="m-4 h-[70dvh] animate-pulse rounded-xl bg-surface-2" />;
  }

  if (shorts.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <h1 className="font-display text-xl">No shorts yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Upload a vertical video under 90 seconds.</p>
        <Link
          to="/upload"
          className="mt-5 inline-block rounded-full gradient-marigold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Create a short
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-8.5rem)] snap-y snap-mandatory overflow-y-auto">
      {shorts.map((s) => {
        const media = urls[s.media_path];
        const poster = s.thumb_path ? urls[s.thumb_path] : undefined;
        const liked = likes.has(s.id);
        return (
          <section key={s.id} className="relative flex h-full snap-start items-center justify-center bg-black">
            {media ? (
              <video
                src={media}
                poster={poster}
                controls
                playsInline
                preload="none"
                className="max-h-full w-full object-contain"
              />
            ) : (
              <HueTile hue={s.profiles?.hue ?? 42} className="size-full rounded-none" label={s.caption}>
                <span className="absolute inset-0 grid place-items-center">
                  <Play className="size-8" />
                </span>
              </HueTile>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="pointer-events-auto flex items-center gap-2">
                <Monogram name={s.profiles?.display_name || s.profiles?.handle || "V"} hue={s.profiles?.hue ?? 42} size={32} />
                <Link
                  to="/u/$handle"
                  params={{ handle: s.profiles?.handle ?? "" }}
                  className="text-sm font-medium text-white"
                >
                  {s.profiles?.display_name || s.profiles?.handle}
                </Link>
              </div>
              <p className="pointer-events-auto mt-2 line-clamp-2 text-sm text-white/90">{s.caption}</p>
            </div>

            <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4 text-white">
              <button
                onClick={() => toggle.mutate({ postId: s.id, liked })}
                className="flex flex-col items-center text-[11px]"
                aria-pressed={liked}
              >
                <Heart className={"size-6 " + (liked ? "fill-current text-primary" : "")} />
                {s.like_count}
              </button>
              <Link to="/post/$postId" params={{ postId: s.id }} className="flex flex-col items-center text-[11px]">
                <MessageSquare className="size-6" />
                {s.comment_count}
              </Link>
              <Link to="/messages" className="flex flex-col items-center text-[11px] text-secure">
                <Send className="size-6" />
                Private
              </Link>
            </div>
          </section>
        );
      })}
    </div>
  );
}
