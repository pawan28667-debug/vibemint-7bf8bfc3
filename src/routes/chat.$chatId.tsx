import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Lock, Send, ShieldCheck } from "lucide-react";
import { Monogram } from "@/components/vibe/primitives";
import { useAuth } from "@/lib/auth";
import { useConversation, useMessages, useSendMessage } from "@/lib/messaging";

export const Route = createFileRoute("/chat/$chatId")({
  head: () => ({
    meta: [
      { title: "Encrypted chat — VibeConnect" },
      { name: "description", content: "An end-to-end encrypted conversation on VibeConnect." },
      { property: "og:title", content: "Encrypted chat — VibeConnect" },
      { property: "og:description", content: "Messages are decrypted only on your devices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { chatId } = useParams({ from: "/chat/$chatId" });
  const { user, deviceId } = useAuth();
  const conversation = useConversation(chatId);
  const messages = useMessages(chatId);
  const send = useSendMessage(chatId);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const list = messages.data ?? [];
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [list.length]);

  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="font-display text-xl">Sign in to open this chat</h1>
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

  const other = conversation.data?.other ?? null;

  function submit() {
    const body = draft.trim();
    if (!body || !other) return;
    setDraft("");
    send.mutate({ body, otherUserId: other.id });
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <header className="sticky top-14 z-20 flex items-center gap-3 border-b border-border/70 bg-background/90 px-3 py-2.5 backdrop-blur-xl">
        <Link to="/messages" className="grid size-9 place-items-center rounded-full hover:bg-secondary" aria-label="Back">
          <ArrowLeft className="size-4" />
        </Link>
        <Monogram name={other?.display_name || other?.handle || "V"} hue={other?.hue ?? 42} size={36} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{other?.display_name || other?.handle || "Conversation"}</p>
          <p className="flex items-center gap-1 text-[11px] text-secure">
            <Lock className="size-3" /> End-to-end encrypted
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-2 px-3 py-4">
        {messages.isLoading ? (
          <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
        ) : list.length === 0 ? (
          <p className="mx-auto max-w-xs rounded-xl bg-secure/8 p-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            <ShieldCheck className="mx-auto mb-1 size-4 text-secure" />
            No messages yet. Everything you send here is encrypted on this device before it leaves.
          </p>
        ) : (
          list.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm " +
                    (mine ? "gradient-marigold text-primary-foreground" : "bg-surface-2 text-foreground") +
                    (m.ok ? "" : " italic opacity-70")
                  }
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={"mt-1 text-[10px] " + (mine ? "text-primary-foreground/75" : "text-muted-foreground")}>
                    {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-16 border-t border-border/70 bg-background/95 p-3 backdrop-blur-xl">
        {!deviceId && (
          <p className="mb-2 text-center text-[11px] text-muted-foreground">Setting up encryption keys on this device…</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            rows={1}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Encrypted message"
            className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/60"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || !deviceId || send.isPending}
            className="grid size-10 shrink-0 place-items-center rounded-full gradient-marigold text-primary-foreground disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        </div>
        {send.error && <p className="mt-2 text-center text-[11px] text-destructive">{(send.error as Error).message}</p>}
      </div>
    </div>
  );
}
