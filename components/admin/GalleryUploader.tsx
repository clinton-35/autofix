"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addGalleryImage } from "@/app/admin/(protected)/gallery/actions";
import { uploadImage } from "@/lib/upload";

export default function GalleryUploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setBusy(true);
    setError("");
    let done = 0;
    const failed: string[] = [];

    for (const f of files) {
      setStatus(`Uploading ${done + failed.length + 1} of ${files.length}...`);
      try {
        const r = await uploadImage("gallery", f);
        const res = await addGalleryImage(r.url, "");
        if (!res.ok) throw new Error(res.error);
        done++;
      } catch {
        failed.push(f.name);
      }
    }

    if (failed.length > 0) {
      setError(`Could not upload: ${failed.join(", ")}`);
    }
    setStatus(done > 0 ? `${done} photo(s) uploaded.` : "");
    setBusy(false);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div className="bg-white p-6">
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:opacity-50"
      >
        {busy ? "Uploading..." : "Upload photos"}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        onChange={onFiles}
        className="hidden"
      />
      <p className="mt-3 text-sm text-charcoal/60">
        You can select several photos at once. Large photos are shrunk
        automatically.
      </p>
      {status && (
        <p role="status" className="mt-3 text-sm font-medium text-green-700">
          {status}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-brand">
          {error}
        </p>
      )}
    </div>
  );
}