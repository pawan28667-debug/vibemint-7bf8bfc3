import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Lock, Paperclip, Mic, Send, Play, Timer } from "lucide-react";
import { Monogram, HueTile } from "@/components/vibe/primitives";
import { threads } from "@/lib/mock-data";

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

type Msg =
  | { id: string; mine: boolean; kind: "text"; body: string; time: string; read?: boolean }
  | { id: string; mine: boolean; kind: "video"; title: string; stamp: string; time: string }
  | { id: string; mine: boolean; kind: "voice"; seconds: number; time: string };

const seed: Msg[] = [
  { id: "m1", mine: false, kind: "text", body: "Did you watch the encryption explainer?", time: "09:02" },
  {
    id: "m2",
    mine: true,
    kind: "video",
    title: "How end-to-end encryption actually works",
    stamp: "04:32",
    time: "09:04",
  },
  { id: "m3", mine: true, kind: "text", body: "This bit at 04:32 is the whole idea.", time: "09:04", read: true },
  { id: "m4", mine: false, kind: "voice", seconds: 12, time: "09:11" },
];

function Chat() {
  const { chatId } = useParams({ from: "/chat/$chatId" });
  const thread = threads.find((t) => t.id === chatId) ?? threads[0]!;
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [draft, setDraft] = useState("");

  function send() {
    const body = draft.trim();
    if (!body) return;
    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        mine: true,
        kind: "text",
        body,
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5">
        <Link to="/messages" className="grid size-9 place-items-center rounded-full hover:bg-secondary">
          <ArrowLeft className="size-5" />
        </Link>
        <Monogram name={thread.name} hue={thread.hue} size={38} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{thread.name}</p>
          <p className="flex items-center gap-1 text-[11px] text-secure">
            <Lock className="size-3" /> End-to-end encrypted
          </p>
        </div>
        <button className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
          <Timer className="size-3" /> 7 days
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        <p className="mx-auto max-w-xs rounded-lg bg-secure/8 px-3 py-2 text-center text-[11px] leading-relaxed text-muted-foreground">
          Messages here are encrypted on your device and decrypted only by the people in this chat.
          Disappearing messages don't prevent screenshots or photos of the screen.
        </p>

        {messages.map((m) => (
          <div key={m.id} className={m.mine ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                "max-w-[78%] rounded-2xl px-3 py-2 text-sm " +
                (m.mine
                  ? "rounded-br-sm bg-primary/90 text-primary-foreground"
                  : "rounded-bl-sm bg-surface-2 text-foreground")
              }
            >
              {m.kind === "text" && <p className="whitespace-pre-wrap">{m.body}</p>}

              {m.kind === "video" && (
                <div className="w-56">
                  <HueTile hue={42} className="aspect-video" label={m.title}>
                    <span className="absolute inset-0 grid place-items-center">
                      <Play className="size-6" />
                    </span>
                  </HueTile>
                  <p className="mt-1.5 line-clamp-2 text-xs">{m.title}</p>
                  <button className="mt-1 text-xs underline underline-offset-2">
                    Jump to {m.stamp}
                  </button>
                </div>
              )}

              {m.kind === "voice" && (
                <div className="flex w-44 items-center gap-2">
                  <Play className="size-4 shrink-0" />
                  <span className="flex h-6 flex-1 items-center gap-0.5">
                    {Array.from({ length: 22 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-0.5 rounded-full bg-current opacity-70"
                        style={{ height: `${20 + ((i * 37) % 70)}%` }}
                      />
                    ))}
                  </span>
                  <span className="text-[11px]">0:{String(m.seconds).padStart(2, "0")}</span>
                </div>
              )}

              <p className="mt-1 text-right text-[10px] opacity-70">
                {m.time}
                {m.mine && (m.kind === "text" && m.read ? " · Read" : " · Sent")}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2.5">
        <button className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary" aria-label="Attach">
          <Paperclip className="size-5" />
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Encrypted message"
          className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/60"
        />
        {draft.trim() ? (
          <button
            onClick={send}
            className="grid size-10 place-items-center rounded-full gradient-marigold text-primary-foreground"
            aria-label="Send"
          >
            <Send className="size-4" />
          </button>
        ) : (
          <button
            className="grid size-10 place-items-center rounded-full bg-secondary text-foreground"
            aria-label="Record voice message"
          >
            <Mic className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
