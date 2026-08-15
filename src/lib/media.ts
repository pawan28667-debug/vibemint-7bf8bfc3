import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";
const SIGN_SECONDS = 60 * 60;

/**
 * Signed CDN URLs for stored media. Storage serves these through the CDN edge,
 * and thumbnails are requested at a transformed width so feeds stay light.
 */
export function useSignedUrls(paths: (string | null | undefined)[]) {
  const clean = Array.from(new Set(paths.filter((p): p is string => !!p))).sort();

  return useQuery({
    queryKey: ["signed-urls", clean],
    enabled: clean.length > 0,
    staleTime: (SIGN_SECONDS - 300) * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(clean, SIGN_SECONDS);
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
      }
      return map;
    },
  });
}

export async function uploadMedia(userId: string, file: Blob, extension: string): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Grabs a poster frame from a video file in the browser so feeds have thumbnails. */
export function extractVideoThumbnail(
  file: File,
): Promise<{ blob: Blob; width: number; height: number; duration: number } | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    const fail = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };

    video.onerror = fail;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 1) / 3);
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1280 / (video.videoWidth || 1280));
        canvas.width = Math.round((video.videoWidth || 1280) * scale);
        canvas.height = Math.round((video.videoHeight || 720) * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return fail();
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            const duration = Math.round(video.duration || 0);
            const width = canvas.width;
            const height = canvas.height;
            URL.revokeObjectURL(video.src);
            resolve(blob ? { blob, width, height, duration } : null);
          },
          "image/jpeg",
          0.82,
        );
      } catch {
        fail();
      }
    };
  });
}

export function imageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = URL.createObjectURL(file);
  });
}

export function formatDuration(seconds?: number | null) {
  if (!seconds || seconds < 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
