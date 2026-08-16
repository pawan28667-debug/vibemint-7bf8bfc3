import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Heart, MessageSquare, UserPlus, Lock, BellOff } from "lucide-react";
import { Monogram } from "@/components/vibe/primitives";
import { useAuth } from "@/lib/auth";
import { useMarkNotificationsRead, useNotifications, type NotificationRow } from "@/lib/data";
import { timeAgo } from "@/lib/media";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — VibeConnect" },
      {
        name: "description",
        content: "Likes, comments, new subscribers and encrypted message alerts — without leaking content.",
      },
      { property: "og:title", content: "Notifications — VibeConnect" },
      { property: "og:description", content: "Message alerts never include message content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Notifications,
});

function label(n: NotificationRow) {
  const who = n.profiles?.display_name || (n.profiles?.handle ? `@${n.profiles.handle}` : "Someone");
  switch (n.type) {
    case "like":
      return `${who} liked your post`;
    case "comment":
      return `${who} commented on your post`;
    case "subscription":
      return `${who} subscribed to your channel`;
    default:
      return "New encrypted message";
  }
}

function icon(type: NotificationRow["type"]) {
  if (type === "like") return Heart;
  if (type === "comment") return MessageSquare;
  if (type === "subscription") return UserPlus;
  return Lock;
}

function Notifications() {
  const { user } = useAuth();
  const query = useNotifications();
  const markRead = useMarkNotificationsRead();

  const rows = query.data ?? [];
  const unread = rows.filter((r) => !r.read_at).length;

  useEffect(() => {
    if (unread > 0) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unread > 0]);

  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="font-display text-xl">Sign in to see notifications</h1>
        <Link
          to="/auth"
          search={{ next: "/notifications" }}
          className="mt-5 inline-block rounded-full gradient-marigold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Notifications</h1>
        <Link to="/privacy" className="text-xs text-primary">
          Preferences
        </Link>
      </div>

      {query.isLoading ? (
        <div className="h-32 animate-pulse rounded-xl bg-surface-2" />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <BellOff className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Nothing new</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Likes, comments, subscribers and message alerts will appear here.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
          {rows.map((n) => {
            const Icon = icon(n.type);
            const inner = (
              <div className="flex items-center gap-3 p-3">
                <Monogram name={n.profiles?.display_name || n.profiles?.handle || "V"} hue={n.profiles?.hue ?? 42} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{label(n)}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                </div>
                <Icon className={"size-4 " + (n.type === "message" ? "text-secure" : "text-muted-foreground")} />
              </div>
            );
            if (n.type === "message" && n.conversation_id) {
              return (
                <li key={n.id}>
                  <Link to="/chat/$chatId" params={{ chatId: n.conversation_id }}>
                    {inner}
                  </Link>
                </li>
              );
            }
            if (n.post_id) {
              return (
                <li key={n.id}>
                  <Link to="/post/$postId" params={{ postId: n.post_id }}>
                    {inner}
                  </Link>
                </li>
              );
            }
            return <li key={n.id}>{inner}</li>;
          })}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-secure/8 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Lock className="mt-0.5 size-4 shrink-0 text-secure" />
        Message notifications carry no content — only that a conversation has activity.
      </p>
    </div>
  );
}
