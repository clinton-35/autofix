import { createClient } from "@/lib/supabase/client";

export type Bucket = "services" | "gallery" | "site";

async function resize(file: File, maxSize = 1920): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not process the image."))),
      "image/jpeg",
      0.85
    )
  );
}

export async function uploadImage(bucket: Bucket, file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("That image is too large (maximum 25 MB).");
  }

  let blob: Blob;
  try {
    blob = await resize(file);
  } catch {
    throw new Error("Could not read this image. Please try a JPG or PNG.");
  }

  const path = `${crypto.randomUUID()}.jpg`;
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw new Error("Upload failed. Please try again.");

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}