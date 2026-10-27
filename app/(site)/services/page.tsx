import Link from "next/link";
import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { getServices } from "@/lib/data";

export const metadata = { title: "Our Services" };
export const revalidate = 30;

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHeader
        title="Our Services"
        subtitle="Expert diagnostics, maintenance and repair for your vehicle."
      />

      <section className="bg-offwhite py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          {services.length === 0 ? (
            <p className="text-center text-charcoal/60">
              Our services will be listed here soon.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <article key={s.id} className="group flex flex-col bg-white">
                  <Photo
                    src={s.image_url}
                    alt={s.name}
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="aspect-[4/3]"
                  />
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-bold uppercase tracking-tight">
                      {s.name}
                    </h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal/70">
                      {s.description}
                    </p>
                    {s.price_text && (
                      <p className="mt-4 text-sm font-semibold">
                        {s.price_text}
                      </p>
                    )}
                    <Link
                      href={`/book?service=${s.id}`}
                      className="mt-5 inline-block self-start bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
                    >
                      Book Appointment
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}