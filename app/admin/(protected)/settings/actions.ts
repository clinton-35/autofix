"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";

function back(type: "ok" | "error", msg: string): never {
  redirect(`/admin/settings?type=${type}&msg=${encodeURIComponent(msg)}`);
}

function text(fd: FormData, key: string, max: number) {
  return String(fd.get(key) ?? "").trim().slice(0, max);
}

export async function saveContact(formData: FormData) {
  const { supabase } = await requireOwner();

  const garage_name = text(formData, "garage_name", 100);
  if (!garage_name) back("error", "Please enter the garage name.");

  const email = text(formData, "email", 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    back("error", "Please enter a valid email address.");
  }

  // Accept either the bare link or the full <iframe ...> code from Google Maps
  let map = text(formData, "map_embed_url", 1500);
  const found = map.match(/src="([^"]+)"/);
  if (found) map = found[1];
  if (map && !map.startsWith("https://www.google.com/maps/embed")) {
    back(
      "error",
      "The map must be the Google Maps embed link (it starts with https://www.google.com/maps/embed)."
    );
  }

  const instagram_url = text(formData, "instagram_url", 300);
  const facebook_url = text(formData, "facebook_url", 300);
  for (const u of [instagram_url, facebook_url]) {
    if (u && !u.startsWith("https://")) {
      back("error", "Social media links must start with https://");
    }
  }

  const { error } = await supabase
    .from("garage_settings")
    .update({
      garage_name,
      phone: text(formData, "phone", 30),
      whatsapp: text(formData, "whatsapp", 30),
      email,
      address: text(formData, "address", 500),
      working_hours_text: text(formData, "working_hours_text", 500),
      map_embed_url: map,
      instagram_url,
      facebook_url,
    })
    .eq("id", 1);

  if (error) back("error", "Could not save. Please try again.");

  revalidatePath("/", "layout");
  back("ok", "Garage details saved.");
}

export async function saveAvailability(formData: FormData) {
  const { supabase } = await requireOwner();

  const days = Array.from(
    new Set(
      formData
        .getAll("working_days")
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    )
  ).sort();
  if (days.length === 0) back("error", "Please select at least one working day.");

  const open = text(formData, "open_time", 5);
  const close = text(formData, "close_time", 5);
  if (!/^\d{2}:\d{2}$/.test(open) || !/^\d{2}:\d{2}$/.test(close)) {
    back("error", "Please enter valid opening and closing times.");
  }
  if (close <= open) back("error", "Closing time must be after opening time.");

  const slot = parseInt(text(formData, "slot_minutes", 4), 10);
  if (!(slot >= 15 && slot <= 480)) {
    back("error", "Appointment length must be between 15 and 480 minutes.");
  }

  const capacity = parseInt(text(formData, "capacity_per_slot", 3), 10);
  if (!(capacity >= 1 && capacity <= 50)) {
    back("error", "Appointments per time slot must be between 1 and 50.");
  }

  const ahead = parseInt(text(formData, "max_days_ahead", 4), 10);
  if (!(ahead >= 1 && ahead <= 365)) {
    back("error", "Booking window must be between 1 and 365 days.");
  }

  const { error } = await supabase
    .from("garage_settings")
    .update({
      working_days: days,
      open_time: open,
      close_time: close,
      slot_minutes: slot,
      capacity_per_slot: capacity,
      max_days_ahead: ahead,
    })
    .eq("id", 1);

  if (error) back("error", "Could not save. Please try again.");

  revalidatePath("/admin", "layout");
  back("ok", "Availability saved. The booking form now uses these settings.");
}

export async function addBlockedDate(formData: FormData) {
  const { supabase } = await requireOwner();

  const date = text(formData, "date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) back("error", "Please choose a date.");

  const { data: s } = await supabase
    .from("garage_settings")
    .select("blocked_dates")
    .eq("id", 1)
    .maybeSingle();

  const list = Array.from(new Set([...(s?.blocked_dates ?? []), date])).sort();

  const { error } = await supabase
    .from("garage_settings")
    .update({ blocked_dates: list })
    .eq("id", 1);
  if (error) back("error", "Could not block that date. Please try again.");

  const { count } = await supabase
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("appointment_date", date)
    .in("status", ["pending", "confirmed", "in_progress"]);

  revalidatePath("/admin", "layout");
  back(
    "ok",
    count && count > 0
      ? `Date blocked. Note: ${count} existing booking(s) on that date still need your attention.`
      : "Date blocked."
  );
}

export async function removeBlockedDate(formData: FormData) {
  const { supabase } = await requireOwner();

  const date = text(formData, "date", 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) back("error", "Invalid date.");

  const { data: s } = await supabase
    .from("garage_settings")
    .select("blocked_dates")
    .eq("id", 1)
    .maybeSingle();

  const list = (s?.blocked_dates ?? []).filter((d: string) => d !== date);

  const { error } = await supabase
    .from("garage_settings")
    .update({ blocked_dates: list })
    .eq("id", 1);
  if (error) back("error", "Could not unblock that date. Please try again.");

  revalidatePath("/admin", "layout");
  back("ok", "Date is open for booking again.");
}