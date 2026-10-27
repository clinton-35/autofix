"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function setRead(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = String(formData.get("id") ?? "");
  const read = formData.get("read") === "true";
  if (!UUID.test(id)) return;

  await supabase.from("enquiries").update({ is_read: read }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteEnquiry(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return;

  await supabase.from("enquiries").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}