import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Lock, ShieldCheck, PenSquare } from "lucide-react";
import { Monogram, EncryptedBadge } from "@/components/vibe/primitives";
import { useConversations, useStartConversation } from "@/lib/messaging";
import { usePeopleSearch } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/media";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — VibeConnect" },
      {
        name: "description",
        content: "End-to-end encrypted one-to-one conversations on VibeConnect.",
      },
      { property: "og:title", content: "Messages — VibeConnect" },
      { property: "og:description", content: "Private conversations, encrypted on your device." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const conversations = useConversations();
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const people = usePeopleSearch(query);
  const start = useStartConversation();

  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="font-display text-xl">Sign in for encrypted chats</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your device generates its own keys — the server only ever stores ciphertext.
        </p>
        <Link
          to="/auth"
          search={{ next: "/messages" }}
          className="mt-5 inline-block rounded-full gradient-marigold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const list = (conversations.data ?? []).filter((c) =>
    composing
      ? true
      : (c.other?.display_name ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (c.other?.handle ?? "").toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl">Messages</h1>
        <div className="flex items-center gap-2">
          <EncryptedBadge compact />
          <button
            onClick={() => setComposing((v) => !v)}
            className="grid size-9 place-items-center rounded-full bg-secondary"
            aria-label="New chat"
          >
            <PenSquare className="size-4" />
          </button>
        </div>
      </div>

      <label className="relative mb-4 block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={composing ? "Search people by name or handle" : "Search conversations on this device"}
          className="w-full rounded-full border border-border bg-surface py-3 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
        />
      </label>

      {composing ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
          {(people.data ?? [])
            .filter((p) => p.id !== user.id)
            .map((p) => (
              <li key={p.id}>
                <button
                  onClick={() =>
                    start.mutate(p.id, {
                      onSuccess: (chatId) => void navigate({ to: "/chat/$chatId", params: { chatId } }),
                    })
                  }
                  className="flex w-full items-center gap-3 p-3 text-left hover:bg-secondary/60"
                >
                  <Monogram name={p.display_name || p.handle} hue={p.hue} size={42} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{p.display_name || p.handle}</span>
                    <span className="block truncate text-xs text-muted-foreground">@{p.handle}</span>
                  </span>
                </button>
              </li>
            ))}
          {(people.data ?? []).length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">No people found.</li>
          )}
        </ul>
      ) : conversations.isLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-surface-2" />
      ) : list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No conversations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Start an encrypted chat with someone you follow.
          </p>
          <button
            onClick={() => setComposing(true)}
            className="mt-4 rounded-full gradient-marigold px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            New chat
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
          {list.map((c) => (
            <li key={c.id}>
              <Link to="/chat/$chatId" params={{ chatId: c.id }} className="flex items-center gap-3 p-3">
                <Monogram name={c.other?.display_name || c.other?.handle || "V"} hue={c.other?.hue ?? 42} size={46} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.other?.display_name || c.other?.handle}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Lock className="size-3 shrink-0 text-secure" />
                    Encrypted message
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">{timeAgo(c.last_message_at)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-secure/8 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-secure" />
        Message previews are intentionally generic. Conversation content is decrypted on this device only —
        the server never holds readable message text.
      </p>
    </div>
  );
}
