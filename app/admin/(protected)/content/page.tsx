import Link from "next/link";
import Banner from "@/components/admin/Banner";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ImageField from "@/components/admin/ImageField";
import { requireOwner } from "@/lib/auth";
import { GROUPS, SECTIONS } from "@/lib/content-sections";
import { discardDrafts, publishDrafts, saveDrafts } from "./actions";

export const metadata = { title: "Website Content" };

type Row = {
  section: string;
  heading: string | null;
  description: string | null;
  image_url: string | null;
};

const field =
  "w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-charcoal";
const label = "mb-2 block text-sm font-medium";
const btn =
  "px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const [d, p] = await Promise.all([
    supabase
      .from("site_content_drafts")
      .select("section, heading, description, image_url"),
    supabase
      .from("site_content")
      .select("section, heading, description, image_url"),
  ]);

  const draft = new Map<string, Row>((d.data ?? []).map((r) => [r.section, r]));
  const live = new Map<string, Row>((p.data ?? []).map((r) => [r.section, r]));
  const current = (k: string) => draft.get(k) ?? live.get(k);

  const differs = (k: string) => {
    const a = current(k);
    const b = live.get(k);
    return (
      (a?.heading ?? "") !== (b?.heading ?? "") ||
      (a?.description ?? "") !== (b?.description ?? "") ||
      (a?.image_url ?? null) !== (b?.image_url ?? null)
    );
  };
  const changed = SECTIONS.filter((s) => differs(s.key)).map((s) => s.title);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold uppercase tracking-tight">
        Website Content
      </h1>
      <Banner type={type} msg={msg} />

      <section className="mt-6 bg-white p-6">
        {changed.length > 0 ? (
          <>
            <p className="text-sm font-semibold text-brand">
              Unpublished changes
            </p>
            <p className="mt-1 text-sm text-charcoal/70">
              Saved in your draft but not live yet: {changed.join(", ")}.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-green-700">
              The website is up to date
            </p>
            <p className="mt-1 text-sm text-charcoal/70">
              Nothing waiting to be published.
            </p>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/preview"
            className={`${btn} border border-charcoal hover:bg-charcoal hover:text-white`}
          >
            Preview draft
          </Link>
          {changed.length > 0 && (
            <>
              <form action={publishDrafts}>
                <button
                  type="submit"
                  className={`${btn} bg-charcoal text-white hover:bg-brand`}
                >
                  Publish changes
                </button>
              </form>
              <form action={discardDrafts}>
                <ConfirmButton
                  message="Discard all unpublished changes?"
                  className={`${btn} border border-brand text-brand hover:bg-brand hover:text-white`}
                >
                  Discard draft
                </ConfirmButton>
              </form>
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-charcoal/50">
          Preview and Publish use your <strong>saved</strong> draft. Click
          &quot;Save draft&quot; at the bottom after editing.
        </p>
      </section>

      <form action={saveDrafts} className="mt-8 space-y-10">
        {GROUPS.map((group) => (
          <div key={group}>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-charcoal/50">
              {group}
            </h2>
            <div className="space-y-6">
              {SECTIONS.filter((s) => s.group === group).map((s) => {
                const row = current(s.key);
                return (
                  <section key={s.key} className="bg-white p-6 sm:p-8">
                    <h3 className="text-base font-bold uppercase tracking-tight">
                      {s.title}
                      {differs(s.key) && (
                        <span className="ml-3 bg-amber-100 px-2 py-0.5 text-xs font-semibold normal-case tracking-normal text-amber-800">
                          Changed
                        </span>
                      )}
                    </h3>
                    {s.hint && (
                      <p className="mt-1 text-sm text-charcoal/60">{s.hint}</p>
                    )}

                    <div className="mt-5 space-y-5">
                      <div>
                        <label htmlFor={`heading_${s.key}`} className={label}>
                          {s.headingLabel}
                        </label>
                        <input
                          id={`heading_${s.key}`}
                          name={`heading_${s.key}`}
                          maxLength={200}
                          defaultValue={row?.heading ?? ""}
                          className={field}
                        />
                      </div>

                      {s.descriptionLabel && (
                        <div>
                          <label htmlFor={`description_${s.key}`} className={label}>
                            {s.descriptionLabel}
                          </label>
                          <textarea
                            id={`description_${s.key}`}
                            name={`description_${s.key}`}
                            rows={5}
                            maxLength={4000}
                            defaultValue={row?.description ?? ""}
                            className={field}
                          />
                        </div>
                      )}

                      {s.image && (
                        <div>
                          <p className={label}>{s.image}</p>
                          <ImageField
                            bucket="site"
                            name={`image_${s.key}`}
                            initialUrl={row?.image_url}
                          />
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ))}

        <button
          type="submit"
          className="bg-charcoal px-10 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
        >
          Save draft
        </button>
      </form>
    </div>
  );
}