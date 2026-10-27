import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check your details." },
      { status: 400 }
    );
  }

  const { name, contact, message, website } = parsed.data;

  // Spam trap: real visitors never fill this field. Pretend success.
  if (website) return NextResponse.json({ ok: true });

  const { error } = await createAdminClient()
    .from("enquiries")
    .insert({ customer_name: name, contact, message });

  if (error) {
    console.error("Enquiry insert failed:", error.message);
    return NextResponse.json(
      { error: "We could not send your message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}