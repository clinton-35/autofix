import BookingForm from "@/components/site/BookingForm";
import PageHeader from "@/components/site/PageHeader";
import { getServices, getSettings } from "@/lib/data";
import { createPublicClient } from "@/lib/supabase/public";
import { waLink } from "@/lib/utils";

export const metadata = { title: "Book Appointment" };

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  const [services, settings, cfg] = await Promise.all([
    getServices(),
    getSettings(),
    createPublicClient()
      .from("garage_settings")
      .select("max_days_ahead")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  const days = cfg.data?.max_days_ahead ?? 60;
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const now = new Date();
  const minDate = fmt(now);
  const maxDate = fmt(new Date(now.getTime() + days * 86400000));

  return (
    <>
      <PageHeader
        title="Book Appointment"
        subtitle="Choose a service and a time that suits you. We will confirm your request."
      />
      <section className="bg-offwhite px-6 py-16 sm:py-24">
        <BookingForm
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            price_text: s.price_text,
          }))}
          initialServiceId={service ?? ""}
          minDate={minDate}
          maxDate={maxDate}
          whatsappHref={waLink(settings.whatsapp || settings.phone)}
        />
      </section>
    </>
  );
}