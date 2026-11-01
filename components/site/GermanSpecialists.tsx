import Image from "next/image";

// Each logo file lives in public/brands/. If a file is not available yet,
// delete its logo line and the tile will show the brand name only.
const brands: { name: string; logo?: string }[] = [
  { name: "Mercedes-Benz", logo: "/brands/mercedes-benz.svg" },
  { name: "BMW", logo: "/brands/bmw.svg" },
  { name: "Audi", logo: "/brands/audi.png" },
  { name: "Volkswagen", logo: "/brands/volkswagen.png" },
];

export default function GermanSpecialists() {
  return (
    <section className="bg-offwhite py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/50">
          Brands we work on
        </p>
        <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight sm:text-5xl">
          German Vehicle Specialists
        </h2>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-charcoal/70">
          We provide professional diagnostics, servicing and repair solutions
          for a wide range of German automotive brands.
        </p>

        <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {brands.map((b) => (
            <li
              key={b.name}
              className="flex min-h-40 flex-col items-center justify-center gap-4 border border-black/10 bg-white px-4 py-8"
            >
              {b.logo && (
                <Image
                  src={b.logo}
                  alt=""
                  width={160}
                  height={80}
                  className="h-16 w-auto max-w-[8rem] object-contain"
                />
              )}
              <span
                className={
                  b.logo
                    ? "text-xs font-semibold uppercase tracking-[0.2em] text-charcoal/70"
                    : "text-sm font-bold uppercase tracking-[0.2em]"
                }
              >
                {b.name}
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-3xl text-xs leading-relaxed text-charcoal/50">
          Disclaimer: Autofix is an independent garage and is not affiliated
          with, authorised by or endorsed by Mercedes-Benz, BMW, Audi or
          Volkswagen. All brand names and logos are trademarks of their
          respective owners and are used for identification only.
        </p>
      </div>
    </section>
  );
}