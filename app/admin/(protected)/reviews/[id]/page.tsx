import Link from "next/link";
import { notFound } from "next/navigation";
import Banner from "@/components/admin/Banner";
import ReviewForm from "@/components/admin/ReviewForm";
import { requireOwner } from "@/lib/auth";

export const metadata = { title: "Edit review" };

export default async function EditReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { id } = await params;
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const { data: review } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, message, approved, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!review) notFound();

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/reviews"
        className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
      >
        &larr; All reviews
      </Link>
      <h1 className="mt-5 text-2xl font-bold uppercase tracking-tight">
        Edit review
      </h1>
      <Banner type={type} msg={msg} />
      <div className="mt-6">
        <ReviewForm review={review} today={today} />
      </div>
    </div>
  );
}