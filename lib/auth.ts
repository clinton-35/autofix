import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Call this at the top of every dashboard page and action.
export async function requireOwner() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: isOwner } = await supabase.rpc("is_owner");
  if (!isOwner) redirect("/admin/login?error=denied");

  return { supabase, user };
}