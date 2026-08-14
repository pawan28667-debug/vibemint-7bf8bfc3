import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, BarChart3, Lock } from "lucide-react";
import { HueTile, Monogram, VisibilityChip } from "@/components/vibe/primitives";
import { videos, photos, shorts, creators } from "@/lib/mock-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your channel — VibeConnect" },
      {
        name: "description",
        content: "Your VibeConnect channel: videos, photos, shorts and creator stats.",
      },
      { property: "og:title", content: "Your channel — VibeConnect" },
      { property: "og:description", content: "Build an audience without giving up your privacy." },
    ],
  }),
  component: Profile,
});

const tabs = ["Videos", "Photos", "Shorts", "About"] as const;

function Profile() {
  const me = creators[0]!;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Videos");

  return (
    <div className="pb-4">
      <HueTile hue={me.hue} className="h-28 rounded-none" />
      <div className="-mt-8 px-4">
        <Monogram name={me.name} hue={me.hue} size={72} />
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl">{me.name}</h1>
            <p className="text-xs text-muted-foreground">
              {me.handle} · {me.subscribers} subscribers · 42 uploads
            </p>
          </div>
          <Link
            to="/privacy"
            className="grid size-9 place-items-center rounded-full bg-secondary"
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Link>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Explaining how technology actually works, without the hand-waving. Bengaluru.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Views (28d)" value="1.4M" />
          <Stat label="Watch time" value="61.2K h" />
          <Stat label="New subs" value="+8,204" />
        </div>

        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-full gradient-marigold px-4 py-2 text-sm font-medium text-primary-foreground">
            <BarChart3 className="mr-1.5 inline size-4" /> Creator Studio
          </button>
          <Link
            to="/messages"
            className="rounded-full border border-secure/40 px-4 py-2 text-sm font-medium text-secure"
          >
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
                (tab === t ? "bg-secondary text-foreground" : "text-muted-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "Videos" && (
            <div className="space-y-3">
              {videos.map((v) => (
                <div key={v.id} className="flex gap-3">
                  <HueTile hue={v.hue} className="h-16 w-28 shrink-0" label={v.title} />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {v.views} · {v.age}
                    </p>
                    <div className="mt-1">
                      <VisibilityChip visibility={v.visibility} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Photos" && (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <HueTile key={p.id} hue={p.hue} className="aspect-square" label={p.caption} />
              ))}
            </div>
          )}

          {tab === "Shorts" && (
            <div className="grid grid-cols-3 gap-2">
              {shorts.map((s) => (
                <HueTile key={s.id} hue={s.hue} className="aspect-9/16" label={s.title} />
              ))}
            </div>
          )}

          {tab === "About" && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Joined March 2024 · Bengaluru, India</p>
              <p>
                Public uploads are discoverable and searchable. Private uploads and chats are
                encrypted on-device before they ever reach VibeConnect.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="font-display text-lg">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
