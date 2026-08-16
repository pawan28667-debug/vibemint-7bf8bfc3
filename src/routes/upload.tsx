import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Image as ImageIcon, Video, UploadCloud, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { extractVideoThumbnail, imageDimensions, uploadMedia } from "@/lib/media";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload — VibeConnect" },
      {
        name: "description",
        content: "Publish a public photo or video to your VibeConnect channel with CDN thumbnails.",
      },
      { property: "og:title", content: "Upload — VibeConnect" },
      { property: "og:description", content: "Share publicly, keep your conversations private." },
    ],
  }),
  component: UploadPage,
});

const categories = ["Tech", "Music", "Travel", "Food", "Art", "Learning", "Everyday"] as const;

function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<string>("Everyday");
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  const kind: "photo" | "video" | null = file
    ? file.type.startsWith("video")
      ? "video"
      : "photo"
    : null;

  const publish = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to upload");
      if (!file || !kind) throw new Error("Choose a photo or video first");

      const extension = (file.name.split(".").pop() || (kind === "video" ? "mp4" : "jpg")).toLowerCase();
      setProgress("Uploading media…");
      const mediaPath = await uploadMedia(user.id, file, extension);

      let thumbPath: string | null = null;
      let width: number | null = null;
      let height: number | null = null;
      let duration: number | null = null;

      if (kind === "video") {
        setProgress("Making a thumbnail…");
        const thumb = await extractVideoThumbnail(file);
        if (thumb) {
          thumbPath = await uploadMedia(user.id, thumb.blob, "jpg");
          width = thumb.width;
          height = thumb.height;
          duration = thumb.duration;
        }
      } else {
        const dims = await imageDimensions(file);
        width = dims.width || null;
        height = dims.height || null;
      }

      setProgress("Publishing…");
      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          kind,
          caption: caption.trim(),
          category,
          media_path: mediaPath,
          thumb_path: thumbPath,
          duration_seconds: duration,
          width,
          height,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (postId) => {
      setProgress(null);
      void qc.invalidateQueries({ queryKey: ["feed"] });
      void navigate({ to: "/post/$postId", params: { postId } });
    },
    onError: () => setProgress(null),
  });

  function pick(selected: File | null) {
    setFile(selected);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="font-display text-xl">Sign in to upload</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your uploads live on your channel and stay tied to your account.
        </p>
        <Link
          to="/auth"
          className="mt-5 inline-block rounded-full gradient-marigold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      <h1 className="font-display text-2xl">Upload</h1>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Globe className="size-3.5" /> Public post — discoverable and searchable. Not end-to-end encrypted.
      </p>

      <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
        <UploadCloud className="size-6 text-primary" />
        <span className="text-sm font-medium">{file ? file.name : "Choose a photo or video"}</span>
        <span className="text-xs text-muted-foreground">JPG, PNG, WebP, MP4 or WebM</span>
        <input
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
      </label>

      {preview && kind === "photo" && (
        <img src={preview} alt="Selected photo preview" className="mt-4 max-h-80 w-full rounded-xl object-cover" />
      )}
      {preview && kind === "video" && (
        <video src={preview} controls playsInline className="mt-4 max-h-80 w-full rounded-xl bg-black" />
      )}

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs text-muted-foreground">Caption</span>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          maxLength={600}
          placeholder="Say something about this post"
          className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-ring/60"
        />
      </label>

      <div className="mt-3">
        <span className="mb-2 block text-xs text-muted-foreground">Category</span>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors " +
                (category === c
                  ? "gradient-marigold text-primary-foreground"
                  : "bg-secondary text-secondary-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        disabled={!file || publish.isPending}
        onClick={() => publish.mutate()}
        className="mt-5 w-full rounded-full gradient-marigold px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {publish.isPending ? (progress ?? "Publishing…") : "Publish post"}
      </button>

      {publish.error && (
        <p className="mt-3 text-center text-xs text-destructive">
          {(publish.error as Error).message}
        </p>
      )}

      <div className="mt-6 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ImageIcon className="size-3.5" /> Photos keep their dimensions
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Video className="size-3.5" /> Videos get a poster frame
        </span>
      </div>
    </div>
  );
}
