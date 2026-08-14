import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  Home,
  Compass,
  Plus,
  MessageCircle,
  User,
  Search,
  ShieldCheck,
  Image,
  Video,
  Clapperboard,
  Radio,
  PenLine,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const createOptions = [
  { label: "Upload Photo", icon: Image, note: "Public, followers or encrypted" },
  { label: "Upload Video", icon: Video, note: "Long-form, up to 4K" },
  { label: "Create Short", icon: Clapperboard, note: "Vertical, under 60s" },
  { label: "Go Live", icon: Radio, note: "Public broadcast" },
  { label: "Create Post", icon: PenLine, note: "Text & links for your community" },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg gradient-marigold font-display text-primary-foreground">
            V
          </span>
          <span className="font-display text-lg tracking-wide">VibeConnect</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/explore"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-5" />
          </Link>
          <Link
            to="/privacy"
            className="grid size-9 place-items-center rounded-full text-secure transition-colors hover:bg-secure/12"
            aria-label="Privacy centre"
          >
            <ShieldCheck className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-background/70 backdrop-blur-sm">
          <button
            className="absolute inset-0"
            aria-label="Close create menu"
            onClick={() => setSheetOpen(false)}
          />
          <div className="relative z-10 mb-24 w-full max-w-md px-4">
            <div className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="font-display text-base">Create</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
              <ul>
                {createOptions.map((o) => (
                  <li key={o.label}>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary"
                    >
                      <span className="grid size-9 place-items-center rounded-lg bg-secondary text-primary">
                        <o.icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{o.label}</span>
                        <span className="block text-xs text-muted-foreground">{o.note}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-3xl grid-cols-5 items-center px-2">
          {tabs.slice(0, 2).map((t) => (
            <NavItem key={t.to} {...t} active={pathname === t.to} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => setSheetOpen(true)}
              className="-mt-5 grid size-12 place-items-center rounded-2xl gradient-marigold text-primary-foreground shadow-[var(--shadow-glow)]"
              aria-label="Create"
            >
              <Plus className="size-6" />
            </button>
          </div>
          {tabs.slice(2).map((t) => (
            <NavItem key={t.to} {...t} active={pathname.startsWith(t.to)} />
          ))}
        </div>
      </nav>
    </>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className={cn("size-5", active && "drop-shadow-[0_0_10px_oklch(0.76_0.17_62_/_0.5)]")} />
      {label}
    </Link>
  );
}
