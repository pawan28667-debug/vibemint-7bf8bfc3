import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Smartphone, Lock, Globe } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useMyDevices } from "@/lib/messaging";
import { useNotificationPrefs } from "@/lib/data";
import { timeAgo } from "@/lib/media";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Centre — VibeConnect" },
      {
        name: "description",
        content: "Manage your encryption devices, safety numbers and notification privacy on VibeConnect.",
      },
      { property: "og:title", content: "Privacy Centre — VibeConnect" },
      { property: "og:description", content: "Privacy as a technical property, not a marketing claim." },
    ],
  }),
  component: Privacy,
});

const prefKeys = [
  { key: "likes", label: "Likes on your posts" },
  { key: "comments", label: "Comments on your posts" },
  { key: "subscriptions", label: "New subscribers" },
  { key: "messages", label: "Incoming encrypted messages" },
  { key: "show_previews", label: "Show sender name in message alerts" },
] as const;

function Privacy() {
  const { user, deviceId } = useAuth();
  const devices = useMyDevices();
  const { prefs, update } = useNotificationPrefs();

  return (
    <div className="space-y-6 px-4 py-5">
      <div>
        <h1 className="font-display text-2xl">Privacy Centre</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What is encrypted, what is public, and which devices can read your chats.
        </p>
      </div>

      <section className="surface-card p-4">
        <h2 className="flex items-center gap-2 font-display text-base">
          <ShieldCheck className="size-4 text-secure" /> How your data is protected
        </h2>
        <ul className="mt-3 space-y-3 text-sm">
          <li className="flex gap-2">
            <Lock className="mt-0.5 size-4 shrink-0 text-secure" />
            <span>
              <strong>Private chats</strong> are end-to-end encrypted with per-device ECDH keys and AES-256-GCM.
              Your private key never leaves this browser, and the server only stores ciphertext.
            </span>
          </li>
          <li className="flex gap-2">
            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <span>
              <strong>Public posts</strong> are encrypted in transit and at rest and served through signed CDN URLs —
              but they are discoverable, so they are <em>not</em> end-to-end encrypted.
            </span>
          </li>
        </ul>
      </section>

      {!user ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">Sign in to manage devices</p>
          <Link
            to="/auth"
            search={{ next: "/privacy" }}
            className="mt-4 inline-block rounded-full gradient-marigold px-4 py-2 text-xs font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-display text-lg">Your devices</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
              {(devices.data ?? []).map((d) => (
                <li key={d.id} className="flex items-start gap-3 p-3">
                  <Smartphone className="mt-0.5 size-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {d.label}
                      {d.id === deviceId && <span className="ml-2 text-[11px] text-secure">This device</span>}
                    </p>
                    <p className="mt-0.5 break-all font-mono text-[11px] text-muted-foreground">
                      Safety number {d.safety_number}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Last seen {d.last_seen_at ? timeAgo(d.last_seen_at) : timeAgo(d.created_at)}
                    </p>
                  </div>
                </li>
              ))}
              {(devices.data ?? []).length === 0 && (
                <li className="p-6 text-center text-sm text-muted-foreground">
                  Registering this device's encryption keys…
                </li>
              )}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Compare safety numbers with a contact out of band to verify there is no one in the middle.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-display text-lg">Notifications</h2>
            <ul className="divide-y divide-border overflow-hidden rounded-xl bg-surface">
              {prefKeys.map(({ key, label }) => {
                const on = prefs ? (prefs[key] as boolean) : true;
                return (
                  <li key={key} className="flex items-center justify-between gap-3 p-3">
                    <span className="text-sm">{label}</span>
                    <button
                      role="switch"
                      aria-checked={on}
                      aria-label={label}
                      onClick={() => update.mutate({ [key]: !on })}
                      className={
                        "relative h-6 w-11 shrink-0 rounded-full transition-colors " +
                        (on ? "bg-primary" : "bg-secondary")
                      }
                    >
                      <span
                        className={
                          "absolute top-0.5 size-5 rounded-full bg-background transition-all " +
                          (on ? "left-[22px]" : "left-0.5")
                        }
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Message notifications never contain message text — the server cannot read it.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
