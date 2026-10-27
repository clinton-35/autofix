"use client";

import { useRef, useState } from "react";
import { uploadImage, type Bucket } from "@/lib/upload";

export default function ImageField({
  bucket,
  initialUrl,
  name = "image_url",
}: {
  bucket: Bucket;
  initialUrl?: string | null;
  name?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const r = await uploadImage(bucket, file);
      setUrl(r.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Preview"
          className="mb-3 aspect-[4/3] w-full max-w-xs bg-black/5 object-cover"
        />
      ) : (
        <div className="mb-3 flex aspect-[4/3] w-full max-w-xs items-center justify-center bg-black/5 text-xs uppercase tracking-widest text-charcoal/40">
          No image
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="border border-charcoal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors hover:bg-charcoal hover:text-white disabled:opacity-50"
        >
          {busy ? "Uploading..." : url ? "Replace image" : "Upload image"}
        </button>
        {url && !busy && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-xs font-semibold uppercase tracking-widest text-brand underline underline-offset-4"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-brand">
          {error}
        </p>
      )}
      <p className="mt-2 text-xs text-charcoal/50">
        Wait for the preview to appear before saving.
      </p>
    </div>
  );
}