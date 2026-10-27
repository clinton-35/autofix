"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { SECTIONS } from "@/lib/content-sections";
import { cleanImageUrl, storagePath } from "@/lib/storage";

function go(type: "ok" | "error", msg: string): never {
  redirect(`/admin/content?type=${type}&msg=${encodeURIComponent(msg)}`);
}

function text(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export async function saveDrafts(formData: FormData) {
  const { supabase } = await requireOwner();

  const rows = SECTIONS.map((s) => ({
    section: s.key,
    heading: text(formData, `heading_${s.key}`, 200),
    description: s.descriptionLabel
      ? text(formData, `description_${s.key}`, 4000)
      : "",
    image_url: s.image
      ? cleanImageUrl(String(formData.get(`image_${s.key}`) ?? ""), "site")
      : null,
  }));

  const { error } = await supabase
    .from("site_content_drafts")
    .upsert(rows, { onConflict: "section" });
  if (error) go("error", "Could not save the draft. Please try again.");

  revalidatePath("/admin", "layout");
  go("ok", "Draft saved. The live website has not changed yet. Preview it, then publish.");
}

export async function publishDrafts() {
  const { supabase } = await requireOwner();

  const [{ data: drafts }, { data: oldPublished }] = await Promise.all([
    supabase
      .from("site_content_drafts")
      .select("section, heading, description, image_url"),
    supabase.from("site_content").select("image_url"),
  ]);

  if (!drafts || drafts.length === 0) {
    go("error", "There is no draft to publish.");
  }

  const { error } = await supabase
    .from("site_content")
    .upsert(drafts, { onConflict: "section" });
  if (error) go("error", "Could not publish. Please try again.");

  // Remove photos that are no longer used anywhere
  const stillUsed = new Set(drafts.map((d) => d.image_url).filter(Boolean));
  const unused = (oldPublished ?? [])
    .map((r) => r.image_url as string | null)
    .filter((u): u is string => !!u && !stillUsed.has(u))
    .map((u) => storagePath(u, "site"))
    .filter((p): p is string => !!p);
  if (unused.length > 0) await supabase.storage.from("site").remove(unused);

  revalidatePath("/", "layout");
  go("ok", "Published. Your changes are now live on the website.");
}

export async function discardDrafts() {
  const { supabase } = await requireOwner();

  const { data: published } = await supabase
    .from("site_content")
    .select("section, heading, description, image_url");

  if (published && published.length > 0) {
    const { error } = await supabase
      .from("site_content_drafts")
      .upsert(published, { onConflict: "section" });
    if (error) go("error", "Could not discard the draft. Please try again.");
  }

  revalidatePath("/admin", "layout");
  go("ok", "Draft discarded. The editor now matches the live website.");
}