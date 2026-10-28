import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyOwnerNewBooking } from "@/lib/email";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your details." },
      { status: 400 }
    );
  }

  const d = parsed.data;

  // Spam trap: real visitors never fill this field. Pretend success.
  if (d.website) return NextResponse.json({ ok: true });

  const admin = createAdminClient();

  const { data: service } = await admin
    .from("services")
    .select("id, name")
    .eq("id", d.service_id)
    .eq("active", true)
    .maybeSingle();

  if (!service) {
    return NextResponse.json(
      { error: "Please select a valid service." },
      { status: 400 }
    );
  }

  const record = {
    customer_name: d.customer_name,
    phone: d.phone,
    email: d.email || null,
    vehicle_make: d.vehicle_make,
    vehicle_model: d.vehicle_model,
    registration_number: d.registration_number.toUpperCase(),
    service_id: service.id,
    service_name: service.name,
    appointment_date: d.appointment_date,
    appointment_time: d.appointment_time,
    problem_description: d.problem_description || null,
    status: "pending",
  };

  const { data, error } = await admin
    .from("appointments")
    .insert(record)
    .select("id")
    .single();

  if (error) {
    // P0001 = a booking rule in the database said no (slot full, closed day, etc.)
    if (error.code === "P0001") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Booking insert failed:", error.message);
    return NextResponse.json(
      { error: "We could not save your booking. Please try again." },
      { status: 500 }
    );
  }

  // Never blocks the booking: failures are only logged.
  await notifyOwnerNewBooking({ id: data.id, ...record });

  return NextResponse.json({ ok: true, id: data.id, service: service.name });
}