import Link from "next/link";
import { notFound } from "next/navigation";
import Banner from "@/components/admin/Banner";
import ConfirmButton from "@/components/admin/ConfirmButton";
import ServiceForm from "@/components/admin/ServiceForm";
import { requireOwner } from "@/lib/auth";
import { deleteService } from "../actions";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { id } = await params;
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const { data: service } = await supabase
    .from("services")
    .select("id, name, description, image_url, price_text, sort_order, active")
    .eq("id", id)
    .maybeSingle();

  if (!service) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/services"
        className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
      >
        &larr; All services
      </Link>
      <h1 className="mt-5 text-2xl font-bold uppercase tracking-tight">
        Edit service
      </h1>
      <Banner type={type} msg={msg} />
      <div className="mt-6">
        <ServiceForm service={service} />
      </div>

      <form action={deleteService} className="mt-8">
        <input type="hidden" name="id" value={service.id} />
        <ConfirmButton
          message="Delete this service permanently? Past bookings keep the service name."
          className="border border-brand px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Delete service
        </ConfirmButton>
      </form>
    </div>
  );
}