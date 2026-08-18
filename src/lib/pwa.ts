/// <reference types="vite-plugin-pwa/client" />

/**
 * Single guarded registrar for the app-shell service worker.
 * Never registers in dev, in an iframe, in Lovable previews, or with ?sw=off.
 */

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  if (new URL(window.location.href).searchParams.get("sw") === "off") return true;

  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  if (h === "lovableproject.com" || h.endsWith(".lovableproject.com")) return true;
  if (h === "lovableproject-dev.com" || h.endsWith(".lovableproject-dev.com")) return true;
  if (h === "beta.lovable.dev" || h.endsWith(".beta.lovable.dev")) return true;
  return false;
}

async function unregisterAppSW() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(
    regs
      .filter((r) => (r.active ?? r.waiting ?? r.installing)?.scriptURL.endsWith(SW_URL))
      .map((r) => r.unregister()),
  );
}

export type UpdateHandlers = {
  onNeedRefresh: (applyUpdate: () => void) => void;
  onOfflineReady: () => void;
};

export async function setupPWA(handlers: UpdateHandlers) {
  if (isRefusedContext()) {
    void unregisterAppSW();
    return;
  }
  if (!("serviceWorker" in navigator)) return;

  const { registerSW } = await import("virtual:pwa-register");
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => handlers.onNeedRefresh(() => void updateSW(true)),
    onOfflineReady: () => handlers.onOfflineReady(),
  });
}
