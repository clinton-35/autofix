"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { cleanImageUrl, storagePath } from "@/lib/storage";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function go(path: string, type: "ok" | "error", msg: string): never {
  redirect(
    `${path}${path.includes("?") ? "&" : "?"}type=${type}&msg=${encodeURIComponent(msg)}`
  );
}

export async function saveService(formData: FormData) {
  const { supabase } = await requireOwner();

  const rawId = String(formData.get("id") ?? "");
  const id = UUID.test(rawId) ? rawId : "";
  const here = id ? `/admin/services/${id}` : "/admin/services/new";

  const name = String(formData.get("name") ?? "").trim().slice(0, 100);
  if (!name) go(here, "error", "Please enter a service name.");

  const sort = parseInt(String(formData.get("sort_order") ?? "0"), 10);
  const image = cleanImageUrl(String(formData.get("image_url") ?? ""), "services");

  const values = {
    name,
    description: String(formData.get("description") ?? "").trim().slice(0, 1000),
    price_text:
      String(formData.get("price_text") ?? "").trim().slice(0, 100) || null,
    sort_order: Number.isFinite(sort) ? sort : 0,
    active: formData.get("active") === "on",
    image_url: image,
  };

  if (id) {
    const { data: old } = await supabase
      .from("services")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("services").update(values).eq("id", id);
    if (error) go(here, "error", "Could not save. Please try again.");

    const oldPath = storagePath(old?.image_url ?? null, "services");
    if (oldPath && old?.image_url !== image) {
      await supabase.storage.from("services").remove([oldPath]);
    }
  } else {
    const { error } = await supabase.from("services").insert(values);
    if (error) go(here, "error", "Could not save. Please try again.");
  }

  revalidatePath("/", "layout");
  go("/admin/services", "ok", "Service saved.");
}

export async function deleteService(formData: FormData) {
  const { supabase } = await requireOwner();

  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) go("/admin/services", "error", "Invalid service.");

  const { data: old } = await supabase
    .from("services")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) go(`/admin/services/${id}`, "error", "Could not delete. Please try again.");

  const oldPath = storagePath(old?.image_url ?? null, "services");
  if (oldPath) await supabase.storage.from("services").remove([oldPath]);

  revalidatePath("/", "layout");
  go("/admin/services", "ok", "Service deleted.");
}