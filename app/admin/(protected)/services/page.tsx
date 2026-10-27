import Link from "next/link";
import Banner from "@/components/admin/Banner";
import { requireOwner } from "@/lib/auth";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const { data } = await supabase
    .from("services")
    .select("id, name, price_text, image_url, active, sort_order")
    .order("sort_order")
    .order("created_at");
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Services</h1>
        <Link
          href="/admin/services/new"
          className="bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
        >
          Add service
        </Link>
      </div>

      <Banner type={type} msg={msg} />

      <div className="mt-6 bg-white">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-charcoal/60">
            No services yet.
          </p>
        ) : (
          <ul>
            {rows.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-4 border-b border-black/5 p-4 last:border-0"
              >
                {s.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image_url} alt="" className="h-16 w-24 shrink-0 object-cover" />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center bg-black/5 text-[10px] uppercase tracking-widest text-charcoal/40">
                    No image
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{s.name}</p>
                  <p className="text-xs text-charcoal/60">
                    {s.price_text || "No price shown"}
                  </p>
                </div>
                <span
                  className={`hidden px-2.5 py-1 text-xs font-semibold sm:inline-block ${
                    s.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {s.active ? "Visible" : "Hidden"}
                </span>
                <Link
                  href={`/admin/services/${s.id}`}
                  className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}