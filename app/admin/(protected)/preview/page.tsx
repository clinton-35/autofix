import Link from "next/link";
import Photo from "@/components/ui/Photo";
import { requireOwner } from "@/lib/auth";
import { publishDrafts } from "../content/actions";

export const metadata = { title: "Preview" };

type Item = { heading: string; description: string; image_url: string | null };
const blank: Item = { heading: "", description: "", image_url: null };

const btnPrimary =
  "inline-block bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal";
const h2 = "text-2xl font-bold uppercase tracking-tight sm:text-4xl";

export default async function PreviewPage() {
  const { supabase } = await requireOwner();

  const { data } = await supabase
    .from("site_content_drafts")
    .select("section, heading, description, image_url");

  const c: Record<string, Item> = {};
  for (const r of data ?? []) {
    c[r.section] = {
      heading: r.heading ?? "",
      description: r.description ?? "",
      image_url: r.image_url ?? null,
    };
  }
  const g = (k: string) => c[k] ?? blank;

  const promo = g("promotion");
  const hero = g("home_hero");
  const intro = g("home_intro");
  const expertise = g("home_expertise");
  const cta = g("home_cta");
  const history = g("about_history");
  const mission = g("about_mission");
  const team = g("about_team");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">
          Preview of your saved draft
        </p>
        <p className="mt-1 text-sm text-charcoal/70">
          Nothing below is live until you publish. Services, gallery and
          reviews are not part of the draft, because they go live as soon as
          you save them.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/content"
            className="border border-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] hover:bg-charcoal hover:text-white"
          >
            Back to editing
          </Link>
          <form action={publishDrafts}>
            <button
              type="submit"
              className="bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-brand"
            >
              Publish changes
            </button>
          </form>
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/50">
        Homepage
      </h2>
      <div className="overflow-hidden border border-black/10 bg-white">
        {promo.heading && (
          <div className="bg-brand px-4 py-2.5 text-center text-sm text-white">
            <strong className="font-semibold">{promo.heading}</strong>
            {promo.description && (
              <span className="ml-2">{promo.description}</span>
            )}
          </div>
        )}

        <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-charcoal text-white">
          <div className="absolute inset-0">
            <Photo src={hero.image_url} alt="" label={false} sizes="900px" className="h-full w-full" />
          </div>
          {hero.image_url && <div className="absolute inset-0 bg-black/45" />}
          <div className="relative w-full px-8 pb-12 pt-24">
            <h3 className="max-w-3xl text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
              {hero.heading}
            </h3>
            <p className="mt-5 max-w-xl text-white/80">{hero.description}</p>
            <div className="mt-8">
              <span className={btnPrimary}>Book an Appointment</span>
            </div>
          </div>
        </section>

        <section className="px-8 py-16">
          <h3 className={h2}>{intro.heading}</h3>
          <p className="mt-5 max-w-2xl whitespace-pre-line leading-relaxed text-charcoal/70">
            {intro.description}
          </p>
        </section>

        <section className="grid md:grid-cols-2">
          <Photo src={expertise.image_url} alt="" sizes="450px" className="min-h-[280px]" />
          <div className="flex flex-col justify-center bg-charcoal px-8 py-12 text-white">
            <h3 className={h2}>{expertise.heading}</h3>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-white/70">
              {expertise.description}
            </p>
          </div>
        </section>

        <section className="bg-charcoal px-8 py-16 text-center text-white">
          <h3 className="mx-auto max-w-2xl text-2xl font-bold uppercase tracking-tight sm:text-4xl">
            {cta.heading}
          </h3>
          <div className="mt-8">
            <span className={btnPrimary}>Book an Appointment</span>
          </div>
        </section>
      </div>

      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/50">
        About Us page
      </h2>
      <div className="overflow-hidden border border-black/10 bg-white">
        <section className="grid md:grid-cols-2">
          <Photo src={history.image_url} alt="" sizes="450px" className="min-h-[280px]" />
          <div className="flex flex-col justify-center px-8 py-12">
            <h3 className={h2}>{history.heading}</h3>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-charcoal/70">
              {history.description}
            </p>
          </div>
        </section>

        <section className="bg-offwhite px-8 py-14">
          <h3 className={h2}>{mission.heading}</h3>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-charcoal/70">
            {mission.description}
          </p>
        </section>

        <section className="grid gap-8 px-8 py-14 md:grid-cols-2">
          <div>
            <h3 className={h2}>{team.heading}</h3>
            <p className="mt-5 whitespace-pre-line leading-relaxed text-charcoal/70">
              {team.description}
            </p>
          </div>
          <Photo src={team.image_url} alt="" sizes="450px" className="aspect-[4/3]" />
        </section>
      </div>
    </div>
  );
}