import Link from "next/link";
import Banner from "@/components/admin/Banner";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Stars from "@/components/ui/Stars";
import { requireOwner } from "@/lib/auth";
import { deleteReview, setApproved } from "./actions";

export const metadata = { title: "Reviews" };

const tabs = [
  { key: "all", label: "All" },
  { key: "visible", label: "Visible" },
  { key: "hidden", label: "Hidden" },
];

const small =
  "px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors";

export default async function ReviewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; type?: string; msg?: string }>;
}) {
  const { filter: raw, type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const filter = tabs.some((t) => t.key === raw) ? raw! : "all";

  let q = supabase
    .from("reviews")
    .select("id, customer_name, rating, message, approved, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filter === "visible") q = q.eq("approved", true);
  if (filter === "hidden") q = q.eq("approved", false);

  const { data } = await q;
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Reviews</h1>
        <Link
          href="/admin/reviews/new"
          className="bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
        >
          Add review
        </Link>
      </div>

      <Banner type={type} msg={msg} />

      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/reviews" : `/admin/reviews?filter=${t.key}`}
            className={`${small} ${filter === t.key ? "bg-charcoal text-white" : "bg-white hover:bg-black/5"}`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {rows.length === 0 && (
          <p className="bg-white p-8 text-center text-sm text-charcoal/60">
            No reviews in this view.
          </p>
        )}

        {rows.map((r) => (
          <article key={r.id} className="bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{r.customer_name}</p>
                <div className="mt-1">
                  <Stars n={r.rating} />
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2.5 py-1 text-xs font-semibold ${
                    r.approved ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {r.approved ? "Visible" : "Hidden"}
                </span>
                <p className="mt-2 text-xs text-charcoal/50">
                  {new Date(r.created_at).toLocaleDateString("en-GB", {
                    timeZone: "Africa/Nairobi",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal/80">
              {r.message}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <form action={setApproved}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="approved" value={r.approved ? "false" : "true"} />
                <button
                  type="submit"
                  className={`${small} ${
                    r.approved
                      ? "border border-charcoal hover:bg-charcoal hover:text-white"
                      : "bg-charcoal text-white hover:bg-brand"
                  }`}
                >
                  {r.approved ? "Hide" : "Approve"}
                </button>
              </form>
              <Link
                href={`/admin/reviews/${r.id}`}
                className={`${small} border border-charcoal hover:bg-charcoal hover:text-white`}
              >
                Edit
              </Link>
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <ConfirmButton
                  message="Delete this review permanently?"
                  className={`${small} border border-brand text-brand hover:bg-brand hover:text-white`}
                >
                  Delete
                </ConfirmButton>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}