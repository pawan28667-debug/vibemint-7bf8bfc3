import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, Lock, ShieldCheck } from "lucide-react";
import { Monogram, EncryptedBadge } from "@/components/vibe/primitives";
import { threads } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — VibeConnect" },
      {
        name: "description",
        content: "End-to-end encrypted one-to-one and group conversations on VibeConnect.",
      },
      { property: "og:title", content: "Messages — VibeConnect" },
      { property: "og:description", content: "Private conversations, encrypted on your device." },
    ],
  }),
  component: Messages,
});

const filters = ["Chats", "Groups", "Communities"] as const;

function Messages() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("Chats");
  const [query, setQuery] = useState("");

  const list = threads
    .filter((t) => (filter === "Groups" ? t.kind === "group" : true))
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Messages</h1>
        <EncryptedBadge compact />
      </div>

      <label className="relative mb-3 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations on this device"
          className="w-full rounded-full border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
        />
      </label>

      <div className="mb-4 flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors " +
              (filter === f
                ? "gradient-marigold text-primary-foreground"
                : "bg-secondary text-secondary-foreground")
            }
          >
            {f}
          </button>
        ))}
      </div>

      {filter === "Communities" ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <Users className="mx-auto mb-2 size-6 text-muted-foreground" />
          <p className="text-sm font-medium">No community chats yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Join a community from Explore to start talking.
          </p>
          <Link
            to="/explore"
            className="mt-4 inline-block rounded-full gradient-marigold px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            Browse communities
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
          {list.map((t) => (
            <li key={t.id}>
              <Link to="/chat/$chatId" params={{ chatId: t.id }} className="flex items-center gap-3 p-3">
                <Monogram name={t.name} hue={t.hue} size={46} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    {t.kind === "group" && (
                      <span className="text-[11px] text-muted-foreground">· {t.members}</span>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Lock className="size-3 shrink-0 text-secure" />
                    {t.preview}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-muted-foreground">{t.time}</span>
                  {t.unread > 0 && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                      {t.unread}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-secure/8 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secure" />
        Message previews are intentionally generic. Conversation search runs on this device only —
        the server never holds readable message text.
      </p>
    </div>
  );
}
