import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Monogram } from "@/components/vibe/primitives";
import { PostCard } from "@/components/vibe/PostCard";
import { useFeed, useMyLikes, useProfileByHandle, useSubscriberCount, useSubscription, useToggleLike } from "@/lib/data";
import { useSignedUrls } from "@/lib/media";
import { useAuth } from "@/lib/auth";
import { useStartConversation } from "@/lib/messaging";

export const Route = createFileRoute("/u/$handle")({
  head: () => ({
    meta: [
      { title: "Creator — VibeConnect" },
      { name: "description", content: "A VibeConnect creator profile with their public photos and videos." },
      { property: "og:title", content: "Creator — VibeConnect" },
      { property: "og:description", content: "Watch public posts and subscribe to VibeConnect creators." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatorPage,
});

function CreatorPage() {
  const { handle } = useParams({ from: "/u/$handle" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfileByHandle(handle);
  const { data: posts } = useFeed({ authorId: profile?.id });
  const { data: likes } = useMyLikes();
  const toggleLike = useToggleLike();
  const { subscribed, toggle } = useSubscription(profile?.id);
  const { data: subscribers } = useSubscriberCount(profile?.id);
  const startChat = useStartConversation();
  const { data: urls } = useSignedUrls((posts ?? []).flatMap((p) => [p.media_path, p.thumb_path]));

  if (!profile) return <p className="px-4 py-6 text-sm text-muted-foreground">Loading profile…</p>;

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-4">
        <Monogram name={profile.display_name || profile.handle} hue={profile.hue} size={64} />
        <div className="min-w-0">
          <h1 className="font-display text-xl">{profile.display_name || profile.handle}</h1>
          <p className="text-xs text-muted-foreground">
            @{profile.handle} · {subscribers ?? 0} subscribers
          </p>
        </div>
      </div>
      {profile.bio && <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>}

      {user && user.id !== profile.id && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => toggle.mutate()}
            className={
              "rounded-full px-4 py-2 text-sm font-medium " +
              (subscribed ? "bg-secondary text-secondary-foreground" : "gradient-marigold text-primary-foreground")
            }
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
          <button
            onClick={() =>
              startChat.mutate(profile.id, {
                onSuccess: (id) => navigate({ to: "/chat/$chatId", params: { chatId: id } }),
              })
            }
            className="rounded-full border border-secure/40 px-4 py-2 text-sm font-medium text-secure"
          >
            Message privately
          </button>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {(posts ?? []).map((p) => (
          <PostCard
            key={p.id}
            post={p}
            urls={urls ?? {}}
            liked={likes?.has(p.id) ?? false}
            onLike={() => toggleLike.mutate({ postId: p.id, liked: likes?.has(p.id) ?? false })}
          />
        ))}
        {posts?.length === 0 && <p className="text-sm text-muted-foreground">No public posts yet.</p>}
      </div>
    </div>
  );
}
