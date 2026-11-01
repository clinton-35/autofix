import Link from "next/link";

type Item = { heading: string; description: string };

export default function OfferBand({
  content,
}: {
  content: Record<string, Item | undefined>;
}) {
  const house = content["home_housecalls"];
  const parts = content["home_parts"];
  if (!house?.heading && !parts?.heading) return null;

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2">
        {house?.heading && (
          <article className="bg-offwhite p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/50">
              House calls
            </p>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
              {house.heading}
            </h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-charcoal/70">
              {house.description}
            </p>
            <Link
              href="/book"
              className="mt-8 inline-block bg-charcoal px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand"
            >
              Book a house call
            </Link>
          </article>
        )}

        {parts?.heading && (
          <article className="bg-charcoal p-8 text-white sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-silver">
              Parts
            </p>
            <h2 className="mt-4 text-2xl font-bold uppercase tracking-tight sm:text-4xl">
              {parts.heading}
            </h2>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-white/70">
              {parts.description}
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-block bg-white px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-charcoal transition-colors hover:bg-silver"
            >
              Ask about parts
            </Link>
          </article>
        )}
      </div>
    </section>
  );
}