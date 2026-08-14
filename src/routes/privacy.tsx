import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Smartphone, Laptop, Tablet, KeyRound, Ban, Download, Trash2 } from "lucide-react";
import { SectionHeading } from "@/components/vibe/primitives";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Centre — VibeConnect" },
      {
        name: "description",
        content:
          "See your encryption status, devices, permissions and data controls in one place.",
      },
      { property: "og:title", content: "Privacy Centre — VibeConnect" },
      {
        property: "og:description",
        content: "How VibeConnect protects private conversations, in plain language.",
      },
    ],
  }),
  component: Privacy,
});

const devices = [
  { name: "Pixel 9 · this device", icon: Smartphone, since: "Active now", verified: true },
  { name: "MacBook Air", icon: Laptop, since: "Last active 2h ago", verified: true },
  { name: "iPad mini", icon: Tablet, since: "Last active 6 days ago", verified: false },
];

const permissions = [
  { label: "Who can message me", value: "People I follow" },
  { label: "Who can add me to groups", value: "My contacts" },
  { label: "Who can follow me", value: "Everyone" },
  { label: "Who can comment", value: "Subscribers" },
  { label: "Who can mention me", value: "People I follow" },
  { label: "Who can see my activity", value: "Nobody" },
];

function Privacy() {
  return (
    <div className="space-y-8 px-4 py-5">
      <section className="surface-card gradient-dusk p-5">
        <ShieldCheck className="size-6 text-secure" />
        <h1 className="mt-3 font-display text-2xl">Privacy Centre</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your private messages are encrypted on your device and decrypted only on authorised
          recipient devices. Public videos and photos are protected in transit and at rest, but they
          are not end-to-end encrypted — that's how discovery works.
        </p>
      </section>

      <section>
        <SectionHeading title="Devices" />
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
          {devices.map((d) => (
            <li key={d.name} className="flex items-center gap-3 p-3">
              <span className="grid size-9 place-items-center rounded-lg bg-secondary text-foreground">
                <d.icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.since}</p>
              </div>
              <span
                className={
                  "rounded-full px-2 py-0.5 text-[11px] " +
                  (d.verified ? "bg-secure/12 text-secure" : "bg-secondary text-muted-foreground")
                }
              >
                {d.verified ? "Verified" : "Verify"}
              </span>
            </li>
          ))}
        </ul>
        <button className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium">
          <KeyRound className="size-4 text-primary" /> View security code
        </button>
      </section>

      <section>
        <SectionHeading title="Permissions" />
        <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
          {permissions.map((p) => (
            <li key={p.label} className="flex items-center justify-between gap-3 p-3">
              <span className="text-sm">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading title="Your data" />
        <div className="grid gap-2">
          <Row icon={Ban} label="Blocked accounts" note="3 accounts" />
          <Row icon={Download} label="Download your data" note="Public content & metadata" />
          <Row icon={Trash2} label="Delete account" note="Permanent" danger />
        </div>
      </section>

      <p className="pb-4 text-[11px] leading-relaxed text-muted-foreground">
        VibeConnect avoids marketing language about encryption. Before launch, the cryptographic
        design should be documented and reviewed by an independent security auditor.
      </p>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  note,
  danger,
}: {
  icon: typeof Ban;
  label: string;
  note: string;
  danger?: boolean;
}) {
  return (
    <button className="flex items-center gap-3 rounded-xl bg-surface p-3 text-left">
      <Icon className={"size-4 " + (danger ? "text-destructive" : "text-muted-foreground")} />
      <span className="flex-1 text-sm">{label}</span>
      <span className="text-xs text-muted-foreground">{note}</span>
    </button>
  );
}
