"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { cleanImageUrl, storagePath } from "@/lib/storage";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function go(type: "ok" | "error", msg: string): never {
  redirect(`/admin/gallery?type=${type}&msg=${encodeURIComponent(msg)}`);
}

// Called by the upload button after a photo has been uploaded to storage.
export async function addGalleryImage(url: string, title: string) {
  const { supabase } = await requireOwner();

  const clean = cleanImageUrl(String(url ?? ""), "gallery");
  if (!clean) return { ok: false, error: "Invalid image." };

  const { error } = await supabase.from("gallery_images").insert({
    image_url: clean,
    storage_path: storagePath(clean, "gallery"),
    title: String(title ?? "").trim().slice(0, 150),
  });
  if (error) return { ok: false, error: "Could not save the image." };

  revalidatePath("/", "layout");
  return { ok: true, error: "" };
}

export async function updateGalleryImage(formData: FormData) {
  const { supabase } = await requireOwner();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) go("error", "Invalid photo.");

  const { error } = await supabase
    .from("gallery_images")
    .update({
      title: String(formData.get("title") ?? "").trim().slice(0, 150),
      description: String(formData.get("description") ?? "").trim().slice(0, 500),
    })
    .eq("id", id);
  if (error) go("error", "Could not save. Please try again.");

  revalidatePath("/", "layout");
  go("ok", "Photo details saved.");
}

export async function deleteGalleryImage(formData: FormData) {
  const { supabase } = await requireOwner();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) go("error", "Invalid photo.");

  const { data: row } = await supabase
    .from("gallery_images")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) go("error", "Could not delete. Please try again.");

  const path = storagePath(row?.image_url ?? null, "gallery");
  if (path) await supabase.storage.from("gallery").remove([path]);

  revalidatePath("/", "layout");
  go("ok", "Photo deleted.");
}