import type { ReactNode } from "react";
import { Lock, ShieldCheck, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/** Deterministic tinted surface used in place of real media until uploads exist. */
export function HueTile({
  hue,
  className,
  children,
  label,
}: {
  hue: number;
  className?: string;
  children?: ReactNode;
  label?: string;
}) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-xl jaali", className)}
      style={{
        backgroundImage: `linear-gradient(145deg, oklch(0.42 0.11 ${hue}), oklch(0.24 0.05 ${hue + 30}))`,
      }}
      aria-label={label}
      role={label ? "img" : undefined}
    >
      {children}
    </div>
  );
}

export function Monogram({
  name,
  hue,
  size = 40,
}: {
  name: string;
  hue: number;
  size?: number;
}) {
  const initials = name
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display text-sm"
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(140deg, oklch(0.55 0.13 ${hue}), oklch(0.32 0.07 ${hue + 24}))`,
        color: "var(--foreground)",
        fontSize: size * 0.36,
      }}
    >
      {initials || "V"}
    </span>
  );
}

export function EncryptedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secure/12 px-2 py-0.5 text-[11px] font-medium text-secure">
      <Lock className="size-3" aria-hidden />
      {compact ? "Encrypted" : "End-to-end encrypted"}
    </span>
  );
}

export function VisibilityChip({ visibility }: { visibility: "public" | "followers" | "private" }) {
  const map = {
    public: { icon: Globe, text: "Public", cls: "bg-muted text-muted-foreground" },
    followers: { icon: Users, text: "Followers", cls: "bg-indigo/20 text-foreground" },
    private: { icon: ShieldCheck, text: "Private · encrypted", cls: "bg-secure/12 text-secure" },
  } as const;
  const { icon: Icon, text, cls } = map[visibility];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>
      <Icon className="size-3" aria-hidden />
      {text}
    </span>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="font-display text-lg text-foreground">{title}</h2>
      {action}
    </div>
  );
}
