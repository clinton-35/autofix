import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireOwner } from "@/lib/auth";
import { logout } from "../actions";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase } = await requireOwner();

  const [pending, unread] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  return (
    <div className="min-h-screen bg-offwhite lg:flex">
      <aside className="bg-charcoal text-white lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="px-6 py-6">
          <p className="text-sm font-bold uppercase tracking-[0.25em]">
            Dashboard
          </p>
        </div>

        <AdminNav pending={pending.count ?? 0} unread={unread.count ?? 0} />

        <div className="flex gap-6 px-6 py-4 text-xs lg:mt-auto lg:flex-col lg:gap-3 lg:border-t lg:border-white/10 lg:py-6">
          <Link
            href="/"
            target="_blank"
            className="text-white/70 hover:text-white"
          >
            View website
          </Link>
          <form action={logout}>
            <button type="submit" className="text-white/70 hover:text-white">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 sm:p-10 lg:ml-64">{children}</main>
    </div>
  );
}