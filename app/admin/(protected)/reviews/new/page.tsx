import Link from "next/link";
import Banner from "@/components/admin/Banner";
import ReviewForm from "@/components/admin/ReviewForm";
import { requireOwner } from "@/lib/auth";

export const metadata = { title: "Add review" };

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { type, msg } = await searchParams;
  await requireOwner();

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
        Add review
      </h1>
      <Banner type={type} msg={msg} />
      <div className="mt-6">
        <ReviewForm today={today} />
      </div>
    </div>
  );
}