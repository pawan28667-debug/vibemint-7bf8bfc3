import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageSquare, Share2, Bookmark } from "lucide-react";
import { HueTile, Monogram } from "@/components/vibe/primitives";
import { shorts, creatorById } from "@/lib/mock-data";

export const Route = createFileRoute("/shorts")({
  head: () => ({
    meta: [
      { title: "Shorts — VibeConnect" },
      { name: "description", content: "A vertical feed of short videos from VibeConnect creators." },
      { property: "og:title", content: "Shorts — VibeConnect" },
      { property: "og:description", content: "Swipe through short videos from creators you follow." },
    ],
  }),
  component: Shorts,
});

function Shorts() {
  return (
    <div className="no-scrollbar h-[calc(100dvh-7.5rem)] snap-y snap-mandatory overflow-y-auto">
      {shorts.map((s) => {
        const c = creatorById(s.creatorId);
        return (
          <section key={s.id} className="relative h-full snap-start p-3">
            <HueTile hue={s.hue} className="h-full" label={s.title}>
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 bg-linear-to-t from-background/85 to-transparent p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Monogram name={c.name} hue={c.hue} size={32} />
                    <span className="truncate text-sm font-medium">{c.handle}</span>
                    <button className="rounded-full border border-primary/60 px-2.5 py-1 text-[11px] text-primary">
                      Follow
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{s.title}</p>
                </div>
                <div className="flex flex-col items-center gap-4 text-foreground/90">
                  <Action icon={Heart} label={s.likes} />
                  <Action icon={MessageSquare} label={s.comments} />
                  <Action icon={Share2} label="Share" />
                  <Action icon={Bookmark} label="Save" />
                </div>
              </div>
            </HueTile>
          </section>
        );
      })}
    </div>
  );
}

function Action({ icon: Icon, label }: { icon: typeof Heart; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 text-[11px]">
      <Icon className="size-6" />
      {label}
    </button>
  );
}
