import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Monogram } from "@/components/vibe/primitives";
import { PostCard } from "@/components/vibe/PostCard";
import { useAddComment, useComments, useMyLikes, usePost, useToggleLike } from "@/lib/data";
import { useSignedUrls, timeAgo } from "@/lib/media";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/post/$postId")({
  head: () => ({
    meta: [
      { title: "Post — VibeConnect" },
      { name: "description", content: "A public photo or video post on VibeConnect, with comments." },
      { property: "og:title", content: "Post — VibeConnect" },
      { property: "og:description", content: "Watch, like and comment on public VibeConnect posts." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { postId } = useParams({ from: "/post/$postId" });
  const { user } = useAuth();
  const { data: post, isLoading } = usePost(postId);
  const { data: comments } = useComments(postId);
  const { data: likes } = useMyLikes();
  const toggleLike = useToggleLike();
  const addComment = useAddComment(postId);
  const [draft, setDraft] = useState("");
  const { data: urls } = useSignedUrls([post?.media_path, post?.thumb_path]);

  return (
    <div className="px-4 py-4">
      <Link to="/" className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
        <ArrowLeft className="size-4" /> Back to feed
      </Link>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !post && <p className="text-sm text-muted-foreground">This post is not available.</p>}

      {post && (
        <PostCard
          post={post}
          urls={urls ?? {}}
          liked={likes?.has(post.id) ?? false}
          onLike={() => toggleLike.mutate({ postId: post.id, liked: likes?.has(post.id) ?? false })}
        />
      )}

      <section className="mt-6">
        <h2 className="font-display text-lg">Comments</h2>
        {user ? (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const body = draft.trim();
              if (!body) return;
              addComment.mutate(body, { onSuccess: () => setDraft("") });
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a public comment"
              className="flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
            />
            <button className="rounded-full gradient-marigold px-4 text-sm font-medium text-primary-foreground">
              Post
            </button>
          </form>
        ) : (
          <Link to="/auth" search={{ next: `/post/${postId}` }} className="mt-3 inline-block text-sm text-primary">
            Sign in to comment
          </Link>
        )}

        <ul className="mt-4 space-y-4">
          {(comments ?? []).map((c) => (
            <li key={c.id} className="flex gap-3">
              <Monogram name={c.profiles?.display_name ?? "V"} hue={c.profiles?.hue ?? 42} size={32} />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  @{c.profiles?.handle} · {timeAgo(c.created_at)}
                </p>
                <p className="text-sm">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
        {comments?.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No comments yet.</p>
        )}
      </section>
    </div>
  );
}
