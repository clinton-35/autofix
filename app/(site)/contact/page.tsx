import ContactForm from "@/components/site/ContactForm";
import PageHeader from "@/components/site/PageHeader";
import { getSettings } from "@/lib/data";
import { waLink } from "@/lib/utils";

export const metadata = { title: "Contact Us" };
export const revalidate = 30;

const label =
  "text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/50";

export default async function ContactPage() {
  const s = await getSettings();
  const wa = waLink(s.whatsapp || s.phone);

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Visit us, call us or send a message. We will get back to you."
      />

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2">
          <div className="space-y-8">
            {s.address && (
              <div>
                <p className={label}>Address</p>
                <p className="mt-2 whitespace-pre-line text-lg">{s.address}</p>
              </div>
            )}
            {s.phone && (
              <div>
                <p className={label}>Phone</p>
                <a
                  href={`tel:${s.phone.replace(/\s/g, "")}`}
                  className="mt-2 block text-lg underline decoration-silver underline-offset-4 hover:decoration-charcoal"
                >
                  {s.phone}
                </a>
              </div>
            )}
            {wa && (
              <div>
                <p className={label}>WhatsApp</p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
                >
                  Chat on WhatsApp
                </a>
              </div>
            )}
            {s.email && (
              <div>
                <p className={label}>Email</p>
                <a
                  href={`mailto:${s.email}`}
                  className="mt-2 block text-lg underline decoration-silver underline-offset-4 hover:decoration-charcoal"
                >
                  {s.email}
                </a>
              </div>
            )}
            {s.working_hours_text && (
              <div>
                <p className={label}>Working Hours</p>
                <p className="mt-2 whitespace-pre-line text-lg">
                  {s.working_hours_text}
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-8 text-2xl font-bold uppercase tracking-tight">
              Send us a message
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>

      {s.map_embed_url && (
        <section className="bg-offwhite">
          <iframe
            src={s.map_embed_url}
            title="Garage location on Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-96 w-full border-0"
          />
        </section>
      )}
    </>
  );
}