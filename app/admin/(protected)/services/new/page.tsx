import Link from "next/link";
import Banner from "@/components/admin/Banner";
import ServiceForm from "@/components/admin/ServiceForm";
import { requireOwner } from "@/lib/auth";

export const metadata = { title: "Add service" };

export default async function NewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { type, msg } = await searchParams;
  await requireOwner();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/services"
        className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
      >
        &larr; All services
      </Link>
      <h1 className="mt-5 text-2xl font-bold uppercase tracking-tight">
        Add service
      </h1>
      <Banner type={type} msg={msg} />
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}