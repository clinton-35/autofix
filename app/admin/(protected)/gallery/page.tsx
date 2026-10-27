import Banner from "@/components/admin/Banner";
import ConfirmButton from "@/components/admin/ConfirmButton";
import GalleryUploader from "@/components/admin/GalleryUploader";
import { requireOwner } from "@/lib/auth";
import { deleteGalleryImage, updateGalleryImage } from "./actions";

export const metadata = { title: "Gallery" };

const field =
  "w-full border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-charcoal";

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const { data } = await supabase
    .from("gallery_images")
    .select("id, image_url, title, description")
    .order("created_at", { ascending: false });
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold uppercase tracking-tight">Gallery</h1>
      <Banner type={type} msg={msg} />

      <div className="mt-6">
        <GalleryUploader />
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 bg-white p-8 text-center text-sm text-charcoal/60">
          No photos yet. Upload your first photos above.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((g) => (
            <article key={g.id} className="bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.image_url}
                alt={g.title || "Gallery photo"}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="space-y-3 p-4">
                <form action={updateGalleryImage} className="space-y-3">
                  <input type="hidden" name="id" value={g.id} />
                  <div>
                    <label htmlFor={`t-${g.id}`} className="sr-only">
                      Title
                    </label>
                    <input id={`t-${g.id}`} name="title" defaultValue={g.title ?? ""} maxLength={150} placeholder="Title (optional)" className={field} />
                  </div>
                  <div>
                    <label htmlFor={`d-${g.id}`} className="sr-only">
                      Description
                    </label>
                    <textarea id={`d-${g.id}`} name="description" defaultValue={g.description ?? ""} maxLength={500} rows={2} placeholder="Description (optional)" className={field} />
                  </div>
                  <button
                    type="submit"
                    className="bg-charcoal px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-brand"
                  >
                    Save
                  </button>
                </form>

                <form action={deleteGalleryImage}>
                  <input type="hidden" name="id" value={g.id} />
                  <ConfirmButton
                    message="Delete this photo permanently?"
                    className="text-xs font-semibold uppercase tracking-widest text-brand underline underline-offset-4"
                  >
                    Delete photo
                  </ConfirmButton>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}