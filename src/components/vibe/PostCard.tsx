import { Link } from "@tanstack/react-router";
import { Heart, MessageSquare, Play, Send } from "lucide-react";
import { Monogram, HueTile } from "@/components/vibe/primitives";
import { formatDuration, timeAgo } from "@/lib/media";
import type { FeedPost } from "@/lib/data";
import { cn } from "@/lib/utils";

export function PostCard({
  post,
  urls,
  liked,
  onLike,
}: {
  post: FeedPost;
  urls: Record<string, string>;
  liked: boolean;
  onLike: () => void;
}) {
  const author = post.profiles;
  const poster = post.thumb_path ? urls[post.thumb_path] : undefined;
  const media = urls[post.media_path];
  const hue = author?.hue ?? 42;

  return (
    <article className="surface-card overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <Monogram name={author?.display_name || author?.handle || "V"} hue={hue} size={34} />
        <div className="min-w-0 flex-1">
          <Link
            to="/u/$handle"
            params={{ handle: author?.handle ?? "" }}
            className="truncate text-sm font-medium hover:underline"
          >
            {author?.display_name || author?.handle}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            @{author?.handle} · {timeAgo(post.created_at)}
          </p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
          {post.category}
        </span>
      </div>

      {post.kind === "video" ? (
        media ? (
          <video
            className="w-full bg-black"
            src={media}
            poster={poster}
            controls
            preload="none"
            playsInline
          />
        ) : (
          <HueTile hue={hue} className="aspect-video rounded-none" label={post.caption}>
            <span className="absolute inset-0 grid place-items-center">
              <Play className="size-6" />
            </span>
          </HueTile>
        )
      ) : media ? (
        <img
          src={media}
          alt={post.caption || "Photo post"}
          loading="lazy"
          className="max-h-[70vh] w-full bg-surface-2 object-cover"
        />
      ) : (
        <HueTile hue={hue} className="aspect-4/5 rounded-none" label={post.caption} />
      )}

      <div className="flex items-center gap-4 px-3 pt-3 text-muted-foreground">
        <button
          onClick={onLike}
          className={cn("inline-flex items-center gap-1.5 text-xs hover:text-foreground", liked && "text-primary")}
          aria-pressed={liked}
        >
          <Heart className={cn("size-4", liked && "fill-current")} /> {post.like_count}
        </button>
        <Link
          to="/post/$postId"
          params={{ postId: post.id }}
          className="inline-flex items-center gap-1.5 text-xs hover:text-foreground"
        >
          <MessageSquare className="size-4" /> {post.comment_count}
        </Link>
        {post.kind === "video" && post.duration_seconds ? (
          <span className="text-xs">{formatDuration(post.duration_seconds)}</span>
        ) : null}
        <Link to="/messages" className="ml-auto inline-flex items-center gap-1.5 text-xs text-secure">
          <Send className="size-3.5" /> Share privately
        </Link>
      </div>

      {post.caption && <p className="px-3 pb-3 pt-2 text-sm">{post.caption}</p>}
    </article>
  );
}
