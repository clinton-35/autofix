import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }

  const { data, error } = await createAdminClient().rpc("get_available_slots", {
    p_date: date,
  });

  if (error) {
    console.error("Availability error:", error.message);
    return NextResponse.json({ error: "Could not load times." }, { status: 500 });
  }

  const slots = (data ?? []).map((r: { slot: string; remaining: number }) => ({
    time: String(r.slot).slice(0, 5),
    remaining: r.remaining,
  }));

  return NextResponse.json(
    { slots },
    { headers: { "Cache-Control": "no-store" } }
  );
}