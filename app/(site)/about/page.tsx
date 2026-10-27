import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { getContent, getSettings } from "@/lib/data";

export const metadata = { title: "About Us" };
export const revalidate = 30;

export default async function AboutPage() {
  const [content, s] = await Promise.all([getContent(), getSettings()]);
  const blank = { heading: "", description: "", image_url: null };
  const history = content["about_history"] ?? blank;
  const mission = content["about_mission"] ?? blank;
  const team = content["about_team"] ?? blank;

  return (
    <>
      <PageHeader title="About Us" subtitle="Who we are and how we work." />

      <section className="grid lg:grid-cols-2">
        <Photo
          src={history.image_url}
          alt=""
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-[340px] lg:min-h-[480px]"
        />
        <div className="flex flex-col justify-center bg-white px-8 py-16 sm:px-16">
          <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {history.heading}
          </h2>
          <p className="mt-6 max-w-lg whitespace-pre-line leading-relaxed text-charcoal/70">
            {history.description}
          </p>
        </div>
      </section>

      <section className="bg-offwhite py-24 sm:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {mission.heading}
          </h2>
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-charcoal/70">
            {mission.description}
          </p>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                {team.heading}
              </h2>
              <p className="mt-6 whitespace-pre-line leading-relaxed text-charcoal/70">
                {team.description}
              </p>
            </div>
            <Photo
              src={team.image_url}
              alt="Our team"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {(s.address || s.map_embed_url) && (
        <section className="bg-charcoal py-24 text-white sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                Find Us
              </h2>
              {s.address && (
                <p className="mt-6 whitespace-pre-line text-white/70">
                  {s.address}
                </p>
              )}
            </div>
            {s.map_embed_url && (
              <iframe
                src={s.map_embed_url}
                title="Garage location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full border-0"
              />
            )}
          </div>
        </section>
      )}
    </>
  );
}