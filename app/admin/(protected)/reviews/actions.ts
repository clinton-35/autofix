"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function go(path: string, type: "ok" | "error", msg: string): never {
  redirect(`${path}?type=${type}&msg=${encodeURIComponent(msg)}`);
}

export async function saveReview(formData: FormData) {
  const { supabase } = await requireOwner();

  const rawId = String(formData.get("id") ?? "");
  const id = UUID.test(rawId) ? rawId : "";
  const here = id ? `/admin/reviews/${id}` : "/admin/reviews/new";

  const name = String(formData.get("customer_name") ?? "").trim().slice(0, 100);
  if (!name) go(here, "error", "Please enter the customer name.");

  const message = String(formData.get("message") ?? "").trim().slice(0, 1500);
  if (!message) go(here, "error", "Please enter the review message.");

  const rating = parseInt(String(formData.get("rating") ?? ""), 10);
  if (!(rating >= 1 && rating <= 5)) {
    go(here, "error", "Please choose a rating from 1 to 5.");
  }

  const values: Record<string, unknown> = {
    customer_name: name,
    rating,
    message,
    approved: formData.get("approved") === "on",
  };

  const date = String(formData.get("date") ?? "");
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    values.created_at = `${date}T12:00:00+03:00`;
  }

  const { error } = id
    ? await supabase.from("reviews").update(values).eq("id", id)
    : await supabase.from("reviews").insert(values);
  if (error) go(here, "error", "Could not save. Please try again.");

  revalidatePath("/", "layout");
  go("/admin/reviews", "ok", "Review saved.");
}

export async function setApproved(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;

  await supabase
    .from("reviews")
    .update({ approved: formData.get("approved") === "true" })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function deleteReview(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;

  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/", "layout");
}