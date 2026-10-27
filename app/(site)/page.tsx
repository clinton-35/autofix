import Link from "next/link";
import Photo from "@/components/ui/Photo";
import { getContent, getGallery, getReviews, getServices } from "@/lib/data";

export const revalidate = 30;

const btnPrimary =
  "inline-block bg-white px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-silver";
const btnOutline =
  "inline-block border border-white/70 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-charcoal";
const linkClass =
  "text-xs font-semibold uppercase tracking-[0.2em] underline decoration-silver underline-offset-8 transition-colors hover:decoration-charcoal";
const h2Class = "text-3xl font-bold uppercase tracking-tight sm:text-5xl";

function Stars({ n }: { n: number }) {
  return (
    <div className="text-lg tracking-widest" aria-label={`${n} out of 5 stars`}>
      <span className="text-charcoal">{"★".repeat(n)}</span>
      <span className="text-silver/50">{"★".repeat(5 - n)}</span>
    </div>
  );
}

export default async function HomePage() {
  const [content, services, gallery, reviews] = await Promise.all([
    getContent(),
    getServices(3),
    getGallery(6),
    getReviews(3),
  ]);

  const pick = (k: string) =>
    content[k] ?? { heading: "", description: "", image_url: null };
  const hero = pick("home_hero");
  const intro = pick("home_intro");
  const expertise = pick("home_expertise");
  const cta = pick("home_cta");
  const promo = pick("promotion");
  const [featured, ...others] = reviews;

  return (
    <>
      {promo.heading && (
        <div className="bg-brand px-4 py-2.5 text-center text-sm text-white">
          <strong className="font-semibold">{promo.heading}</strong>
          {promo.description && <span className="ml-2">{promo.description}</span>}
        </div>
      )}

      <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-charcoal text-white">
        <div className="absolute inset-0">
          <Photo
            src={hero.image_url}
            alt=""
            priority
            sizes="100vw"
            label={false}
            className="h-full w-full"
          />
        </div>
        {hero.image_url && <div className="absolute inset-0 bg-black/45" />}
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-40 sm:pb-28">
          <h1 className="max-w-4xl text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            {hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/80">
            {hero.description}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/book" className={btnPrimary}>
              Book an Appointment
            </Link>
            <Link href="/services" className={btnOutline}>
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className={h2Class}>{intro.heading}</h2>
          <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-charcoal/70">
            {intro.description}
          </p>
        </div>
      </section>

      {services.length > 0 && (
        <section className="bg-offwhite py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex items-end justify-between gap-6">
              <h2 className={h2Class}>Our Services</h2>
              <Link href="/services" className={linkClass}>
                View all
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <article key={s.id} className="group bg-white">
                  <Photo
                    src={s.image_url}
                    alt={s.name}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="aspect-[4/3]"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-bold uppercase tracking-tight">
                      {s.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-charcoal/70">
                      {s.description}
                    </p>
                    {s.price_text && (
                      <p className="mt-3 text-sm font-semibold">{s.price_text}</p>
                    )}
                    <Link
                      href={`/book?service=${s.id}`}
                      className={`${linkClass} mt-5 inline-block`}
                    >
                      Book this service
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="grid lg:grid-cols-2">
        <Photo
          src={expertise.image_url}
          alt=""
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-[360px] lg:min-h-[520px]"
        />
        <div className="flex flex-col justify-center bg-charcoal px-8 py-16 text-white sm:px-16">
          <h2 className={h2Class}>{expertise.heading}</h2>
          <p className="mt-6 max-w-md whitespace-pre-line leading-relaxed text-white/70">
            {expertise.description}
          </p>
          <Link
            href="/about"
            className="mt-8 inline-block self-start text-xs font-semibold uppercase tracking-[0.2em] underline decoration-silver underline-offset-8 transition-colors hover:decoration-white"
          >
            About us
          </Link>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 flex items-end justify-between gap-6">
              <h2 className={h2Class}>The Workshop</h2>
              <Link href="/gallery" className={linkClass}>
                View gallery
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
              {gallery.map((g) => (
                <figure key={g.id} className="group">
                  <Photo
                    src={g.image_url}
                    alt={g.title || "Workshop photograph"}
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="aspect-[4/3]"
                  />
                  {g.title && (
                    <figcaption className="mt-2 text-xs uppercase tracking-widest text-charcoal/60">
                      {g.title}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured && (
        <section className="bg-offwhite py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-6">
            <span
              className="block text-8xl font-bold leading-none text-silver"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <blockquote>
              <p className="text-2xl font-medium leading-snug tracking-tight sm:text-4xl">
                {featured.message}
              </p>
              <footer className="mt-8 flex flex-wrap items-center gap-4">
                <Stars n={featured.rating} />
                <span className="text-sm font-semibold uppercase tracking-widest">
                  {featured.customer_name}
                </span>
              </footer>
            </blockquote>

            {others.length > 0 && (
              <div className="mt-16 grid gap-10 border-t border-black/10 pt-12 md:grid-cols-2">
                {others.map((r) => (
                  <blockquote key={r.id}>
                    <Stars n={r.rating} />
                    <p className="mt-3 text-charcoal/80">{r.message}</p>
                    <footer className="mt-3 text-sm font-semibold uppercase tracking-widest">
                      {r.customer_name}
                    </footer>
                  </blockquote>
                ))}
              </div>
            )}

            <div className="mt-12">
              <Link href="/reviews" className={linkClass}>
                Read all reviews
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-charcoal px-6 py-24 text-center text-white sm:py-32">
        <h2 className="mx-auto max-w-3xl text-3xl font-bold uppercase tracking-tight sm:text-5xl">
          {cta.heading}
        </h2>
        <div className="mt-10">
          <Link href="/book" className={btnPrimary}>
            Book an Appointment
          </Link>
        </div>
      </section>
    </>
  );
}