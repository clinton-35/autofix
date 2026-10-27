import PageHeader from "@/components/site/PageHeader";
import Photo from "@/components/ui/Photo";
import { getGallery } from "@/lib/data";

export const metadata = { title: "Gallery" };
export const revalidate = 30;

export default async function GalleryPage() {
  const images = await getGallery();

  return (
    <>
      <PageHeader
        title="Gallery"
        subtitle="Our workshop, our equipment and our completed work."
      />

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6">
          {images.length === 0 ? (
            <p className="text-center text-charcoal/60">
              Photographs will appear here soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
              {images.map((g) => (
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
          )}
        </div>
      </section>
    </>
  );
}