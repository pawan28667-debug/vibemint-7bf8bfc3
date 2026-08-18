import { useEffect, useState } from "react";
import { Download, RefreshCw, X } from "lucide-react";
import { setupPWA } from "@/lib/pwa";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Handles offline-ready state, the auto-update refresh prompt, and the install prompt. */
export function PWAUpdater() {
  const [apply, setApply] = useState<(() => void) | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissedInstall, setDismissedInstall] = useState(false);

  useEffect(() => {
    void setupPWA({
      onNeedRefresh: (applyUpdate) => setApply(() => applyUpdate),
      onOfflineReady: () => {},
    });

    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (localStorage.getItem("vt-install-dismissed") === "1") return;
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (apply) {
    return (
      <div className="fixed inset-x-0 bottom-20 z-[60] mx-auto w-full max-w-md px-4">
        <div className="surface-card flex items-center gap-3 p-3">
          <RefreshCw className="size-4 shrink-0 text-primary" />
          <p className="flex-1 text-xs">A new version of VibeTabe is ready.</p>
          <button
            onClick={apply}
            className="rounded-full gradient-marigold px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!installEvent || dismissedInstall) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-[60] mx-auto w-full max-w-md px-4">
      <div className="surface-card flex items-center gap-3 p-3">
        <Download className="size-4 shrink-0 text-primary" />
        <p className="flex-1 text-xs">Install VibeTabe for a full-screen, offline-ready app.</p>
        <button
          onClick={() => {
            void installEvent.prompt();
            setInstallEvent(null);
          }}
          className="rounded-full gradient-marigold px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          Install
        </button>
        <button
          aria-label="Dismiss install prompt"
          onClick={() => {
            localStorage.setItem("vt-install-dismissed", "1");
            setDismissedInstall(true);
          }}
          className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
