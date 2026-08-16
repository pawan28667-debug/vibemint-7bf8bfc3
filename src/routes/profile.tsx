import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, Lock, Upload, LogOut, Play } from "lucide-react";
import { HueTile, Monogram } from "@/components/vibe/primitives";
import { useAuth } from "@/lib/auth";
import { useFeed, useSubscriberCount } from "@/lib/data";
import { useSignedUrls, formatDuration } from "@/lib/media";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your channel — VibeConnect" },
      {
        name: "description",
        content: "Your VibeConnect channel: videos, photos, subscribers and creator stats.",
      },
      { property: "og:title", content: "Your channel — VibeConnect" },
      { property: "og:description", content: "Build an audience without giving up your privacy." },
    ],
  }),
  component: Profile,
});

const tabs = ["Videos", "Photos", "About"] as const;

function Profile() {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Videos");
  const feed = useFeed({ authorId: user?.id });
  const subscribers = useSubscriberCount(user?.id);

  const posts = feed.data ?? [];
  const urls = useSignedUrls(posts.flatMap((p) => [p.thumb_path, p.media_path])).data ?? {};

  if (!user || !profile) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="font-display text-xl">Your channel awaits</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to post, subscribe and chat privately.</p>
        <Link
          to="/auth"
          search={{ next: "/profile" }}
          className="mt-5 inline-block rounded-full gradient-marigold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const videos = posts.filter((p) => p.kind === "video");
  const photos = posts.filter((p) => p.kind === "photo");
  const shown = tab === "Videos" ? videos : tab === "Photos" ? photos : [];
  const totalLikes = posts.reduce((n, p) => n + p.like_count, 0);

  return (
    <div className="pb-4">
      <HueTile hue={profile.hue} className="h-28 rounded-none" />
      <div className="-mt-8 px-4">
        <Monogram name={profile.display_name || profile.handle} hue={profile.hue} size={72} />
        <div className="mt-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl">{profile.display_name || profile.handle}</h1>
            <p className="text-xs text-muted-foreground">
              @{profile.handle} · {subscribers.data ?? 0} subscribers · {posts.length} uploads
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/privacy" className="grid size-9 place-items-center rounded-full bg-secondary" aria-label="Settings">
              <Settings className="size-4" />
            </Link>
            <button
              onClick={() => void signOut()}
              className="grid size-9 place-items-center rounded-full bg-secondary"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {profile.bio && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Uploads" value={String(posts.length)} />
          <Stat label="Likes" value={totalLikes.toLocaleString("en-IN")} />
          <Stat label="Subscribers" value={String(subscribers.data ?? 0)} />
        </div>

        <div className="mt-3 flex gap-2">
          <Link
            to="/upload"
            className="flex-1 rounded-full gradient-marigold px-4 py-2 text-center text-sm font-medium text-primary-foreground"
          >
            <Upload className="mr-1.5 inline size-4" /> Upload
          </Link>
          <Link to="/messages" className="rounded-full border border-secure/40 px-4 py-2 text-sm font-medium text-secure">
            <Lock className="mr-1.5 inline size-3.5" /> Chats
          </Link>
        </div>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto border-b border-border pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium " +
                (tab === t ? "gradient-marigold text-primary-foreground" : "bg-secondary text-secondary-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "About" ? (
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {profile.bio || "No bio yet."} Public posts on this channel are stored securely and served over signed
            CDN URLs — they are not end-to-end encrypted. Private conversations are.
          </p>
        ) : shown.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No {tab.toLowerCase()} yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {shown.map((p) => {
              const image = p.thumb_path ? urls[p.thumb_path] : p.kind === "photo" ? urls[p.media_path] : undefined;
              return (
                <Link key={p.id} to="/post/$postId" params={{ postId: p.id }}>
                  <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-surface-2">
                    {image ? (
                      <img src={image} alt={p.caption || "Post"} loading="lazy" className="size-full object-cover" />
                    ) : (
                      <HueTile hue={profile.hue} className="size-full rounded-none" label={p.caption} />
                    )}
                    {p.kind === "video" && (
                      <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-background/80 px-1.5 py-0.5 text-[11px]">
                        <Play className="size-3" /> {formatDuration(p.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-snug">{p.caption}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="font-display text-base">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
