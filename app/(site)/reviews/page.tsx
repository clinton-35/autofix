import PageHeader from "@/components/site/PageHeader";
import Stars from "@/components/ui/Stars";
import { getReviews } from "@/lib/data";

export const metadata = { title: "Reviews" };
export const revalidate = 30;

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <>
      <PageHeader
        title="Reviews"
        subtitle="What our customers say about us."
      />

      <section className="bg-offwhite py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          {reviews.length === 0 ? (
            <p className="text-center text-charcoal/60">
              Customer reviews will appear here soon.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <blockquote key={r.id} className="bg-white p-8">
                  <Stars n={r.rating} />
                  <p className="mt-4 leading-relaxed text-charcoal/80">
                    &ldquo;{r.message}&rdquo;
                  </p>
                  <footer className="mt-6">
                    <p className="text-sm font-semibold uppercase tracking-widest">
                      {r.customer_name}
                    </p>
                    <p className="mt-1 text-xs text-charcoal/50">
                      {new Date(r.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}