import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { getSettings } from "@/lib/data";
import { waLink } from "@/lib/utils";

export const revalidate = 30;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar name={settings.garage_name} logoUrl={settings.logo_url} />
      <main className="flex-1">{children}</main>
      <Footer s={settings} />
      <WhatsAppButton href={waLink(settings.whatsapp || settings.phone)} />
    </div>
  );
}
