import Link from "next/link";
import MonthCalendar from "@/components/admin/MonthCalendar";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireOwner } from "@/lib/auth";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { supabase } = await requireOwner();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });
  const [year, month] = today.split("-").map(Number);

  const [all, recent, enquiries, unread] = await Promise.all([
    supabase.from("appointments").select("status, appointment_date"),
    supabase
      .from("appointments")
      .select(
        "id, customer_name, service_name, appointment_date, appointment_time, status"
      )
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("enquiries")
      .select("id, customer_name, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const rows = all.data ?? [];
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const upcoming = rows.filter(
    (r) => r.status === "confirmed" && r.appointment_date >= today
  ).length;

  const calendarCounts: Record<string, number> = {};
  for (const r of rows) {
    if (["pending", "confirmed", "in_progress"].includes(r.status)) {
      calendarCounts[r.appointment_date] =
        (calendarCounts[r.appointment_date] ?? 0) + 1;
    }
  }

  const stats = [
    { label: "Total Appointments", value: rows.length, href: "/admin/appointments" },
    { label: "Pending", value: count("pending"), href: "/admin/appointments?status=pending" },
    { label: "Confirmed", value: count("confirmed"), href: "/admin/appointments?status=confirmed" },
    { label: "Completed", value: count("completed"), href: "/admin/appointments?status=completed" },
    { label: "Cancelled", value: count("cancelled"), href: "/admin/appointments?status=cancelled" },
    { label: "Upcoming (confirmed)", value: upcoming, href: "/admin/appointments?status=confirmed" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold uppercase tracking-tight">Overview</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-charcoal/60">
              {s.label}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Recent Appointments
            </h2>
            <Link
              href="/admin/appointments"
              className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto bg-white">
            {recent.data && recent.data.length > 0 ? (
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-black/10 text-xs uppercase tracking-widest text-charcoal/50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">When</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.data.map((a) => (
                    <tr key={a.id} className="border-b border-black/5 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/appointments/${a.id}`}
                          className="font-medium underline-offset-4 hover:underline"
                        >
                          {a.customer_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{a.service_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmtDate(a.appointment_date)}, {fmtTime(a.appointment_time)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-sm text-charcoal/60">
                No appointments yet.
              </p>
            )}
          </div>

          <div className="mb-4 mt-10 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
              Recent Enquiries
              {(unread.count ?? 0) > 0 && (
                <span className="ml-2 bg-brand px-2 py-0.5 text-xs text-white">
                  {unread.count} new
                </span>
              )}
            </h2>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
            >
              View all
            </Link>
          </div>

          <div className="bg-white">
            {enquiries.data && enquiries.data.length > 0 ? (
              <ul>
                {enquiries.data.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 border-b border-black/5 p-4 last:border-0"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        e.is_read ? "bg-transparent" : "bg-brand"
                      }`}
                      aria-label={e.is_read ? "Read" : "Unread"}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {e.customer_name}
                        <span className="ml-2 text-xs font-normal text-charcoal/50">
                          {fmtDateTime(e.created_at)}
                        </span>
                      </p>
                      <p className="mt-1 truncate text-sm text-charcoal/70">
                        {e.message}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-6 text-sm text-charcoal/60">No enquiries yet.</p>
            )}
          </div>
        </section>

        <MonthCalendar
          year={year}
          month={month - 1}
          today={today}
          counts={calendarCounts}
        />
      </div>
    </div>
  );
}