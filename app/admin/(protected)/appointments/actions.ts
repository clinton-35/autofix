"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { sendBookingConfirmed, sendBookingRescheduled } from "@/lib/email";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const transitions: Record<string, string[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  cancelled: ["pending"],
  rejected: ["pending"],
  completed: [],
};

function back(id: string, type: "ok" | "error", msg: string): never {
  redirect(
    `/admin/appointments/${id}?type=${type}&msg=${encodeURIComponent(msg)}`
  );
}

function cleanId(formData: FormData): string {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/appointments");
  return id;
}

export async function changeStatus(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = cleanId(formData);
  const next = String(formData.get("status") ?? "");

  const { data: current } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!current) back(id, "error", "Appointment not found.");
  if (!transitions[current.status]?.includes(next)) {
    back(id, "error", "That change is not allowed.");
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status: next })
    .eq("id", id);

  if (error) {
    back(
      id,
      "error",
      error.code === "P0001"
        ? error.message
        : "Could not update the appointment. Please try again."
    );
  }

  // Customer confirmation (only if they gave an email address)
  if (next === "confirmed" && current.email) {
    await sendBookingConfirmed(current);
  }

  revalidatePath("/admin", "layout");
  back(
    id,
    "ok",
    next === "confirmed" && current.email
      ? "Approved. A confirmation email was sent to the customer."
      : "Status updated."
  );
}

export async function saveMechanic(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = cleanId(formData);
  const name = String(formData.get("mechanic") ?? "").trim().slice(0, 100);

  const { error } = await supabase
    .from("appointments")
    .update({ assigned_mechanic: name || null })
    .eq("id", id);

  if (error) back(id, "error", "Could not save the mechanic. Please try again.");

  revalidatePath("/admin", "layout");
  back(id, "ok", name ? "Mechanic assigned." : "Mechanic removed.");
}

export async function reschedule(formData: FormData) {
  const { supabase } = await requireOwner();
  const id = cleanId(formData);
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    back(id, "error", "Please choose a date and a time.");
  }

  const { data: current } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!current || !["pending", "confirmed"].includes(current.status)) {
    back(id, "error", "Only pending or confirmed appointments can be rescheduled.");
  }

  const { error } = await supabase
    .from("appointments")
    .update({ appointment_date: date, appointment_time: time })
    .eq("id", id);

  if (error) {
    back(
      id,
      "error",
      error.code === "P0001"
        ? error.message
        : "Could not reschedule. Please try again."
    );
  }

  // Tell the customer only if they were already confirmed
  const notify = current.status === "confirmed" && current.email;
  if (notify) {
    await sendBookingRescheduled({
      ...current,
      appointment_date: date,
      appointment_time: time,
    });
  }

  revalidatePath("/admin", "layout");
  back(
    id,
    "ok",
    notify
      ? "Appointment rescheduled. The customer was notified by email."
      : "Appointment rescheduled."
  );
}