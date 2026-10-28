import "server-only";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtDate, fmtTime } from "@/lib/format";

type Booking = {
  id?: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  vehicle_make: string;
  vehicle_model: string;
  registration_number: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  problem_description?: string | null;
};

const FROM = process.env.EMAIL_FROM || "Autofix <onboarding@resend.dev>";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function esc(v: string | null | undefined) {
  return (v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getGarage() {
  const { data } = await createAdminClient()
    .from("garage_settings")
    .select("garage_name, phone, email, address")
    .eq("id", 1)
    .maybeSingle();
  return {
    name: data?.garage_name || "Autofix",
    phone: data?.phone || "",
    email: data?.email || "",
    address: data?.address || "",
  };
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${esc(
    label
  )}</td><td style="padding:6px 0;font-weight:600">${esc(value)}</td></tr>`;
}

function wrap(garageName: string, heading: string, body: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#17191c">
  <div style="background:#17191c;color:#fff;padding:18px 24px;letter-spacing:3px;font-weight:bold;text-transform:uppercase;font-size:14px">${esc(
    garageName
  )}</div>
  <div style="padding:28px 24px">
    <h1 style="font-size:20px;margin:0 0 16px">${esc(heading)}</h1>
    ${body}
  </div>
</div>`;
}

// Returns true only if the email was accepted for delivery.
async function send(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !opts.to) return false;
  try {
    const { error } = await new Resend(key).emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (error) {
      console.error("Email failed:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Email failed:", e);
    return false;
  }
}

// Alert to the garage owner when a customer submits a booking.
export async function notifyOwnerNewBooking(b: Booking) {
  const g = await getGarage();
  const to = process.env.OWNER_EMAIL || g.email;
  if (!to) return;

  const table = `<table style="border-collapse:collapse;font-size:14px">
    ${row("Customer", b.customer_name)}
    ${row("Phone", b.phone)}
    ${b.email ? row("Email", b.email) : ""}
    ${row("Vehicle", `${b.vehicle_make} ${b.vehicle_model} (${b.registration_number})`)}
    ${row("Service", b.service_name)}
    ${row("Requested", `${fmtDate(b.appointment_date)} at ${fmtTime(b.appointment_time)}`)}
    ${b.problem_description ? row("Details", b.problem_description) : ""}
  </table>`;

  const link = b.id
    ? `<p style="margin-top:24px"><a href="${esc(
        `${SITE}/admin/appointments/${b.id}`
      )}" style="background:#17191c;color:#fff;padding:12px 22px;text-decoration:none;font-size:13px;letter-spacing:1px">REVIEW BOOKING</a></p>`
    : "";

  await send({
    to,
    subject: `New booking request: ${b.service_name}, ${fmtDate(b.appointment_date)} ${fmtTime(b.appointment_time)}`,
    html: wrap(g.name, "New booking request", table + link),
  });
}

function customerBlock(b: Booking, g: Awaited<ReturnType<typeof getGarage>>) {
  return `<table style="border-collapse:collapse;font-size:14px">
    ${row("Service", b.service_name)}
    ${row("Date", fmtDate(b.appointment_date))}
    ${row("Time", fmtTime(b.appointment_time))}
    ${row("Vehicle", `${b.vehicle_make} ${b.vehicle_model} (${b.registration_number})`)}
    ${g.address ? row("Location", g.address) : ""}
  </table>
  <p style="margin-top:20px;font-size:14px;color:#444">Need to change something? ${
    g.phone ? `Call or WhatsApp us on <strong>${esc(g.phone)}</strong>.` : "Please contact us."
  }</p>`;
}

// Confirmation to the customer when the owner approves the booking.
export async function sendBookingConfirmed(b: Booking): Promise<boolean> {
  if (!b.email) return false;
  const g = await getGarage();
  return send({
    to: b.email,
    replyTo: g.email || undefined,
    subject: `Your appointment is confirmed: ${fmtDate(b.appointment_date)} at ${fmtTime(b.appointment_time)}`,
    html: wrap(
      g.name,
      "Your appointment is confirmed",
      `<p style="font-size:14px;color:#444">Hello ${esc(
        b.customer_name
      )}, your appointment has been confirmed. We look forward to seeing you.</p>` +
        customerBlock(b, g)
    ),
  });
}

// Notice to the customer when a confirmed appointment is moved.
export async function sendBookingRescheduled(b: Booking): Promise<boolean> {
  if (!b.email) return false;
  const g = await getGarage();
  return send({
    to: b.email,
    replyTo: g.email || undefined,
    subject: `Your appointment has moved to ${fmtDate(b.appointment_date)} at ${fmtTime(b.appointment_time)}`,
    html: wrap(
      g.name,
      "Your appointment has been rescheduled",
      `<p style="font-size:14px;color:#444">Hello ${esc(
        b.customer_name
      )}, we have moved your appointment. Your new date and time are below.</p>` +
        customerBlock(b, g)
    ),
  });
}