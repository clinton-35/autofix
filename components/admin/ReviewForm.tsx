import { saveReview } from "@/app/admin/(protected)/reviews/actions";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  message: string;
  approved: boolean;
  created_at: string;
};

const field =
  "w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-charcoal";
const label = "mb-2 block text-sm font-medium";

export default function ReviewForm({
  review,
  today,
}: {
  review?: Review;
  today: string;
}) {
  const date = review
    ? new Date(review.created_at).toLocaleDateString("en-CA", {
        timeZone: "Africa/Nairobi",
      })
    : today;

  return (
    <form action={saveReview} className="space-y-6 bg-white p-6 sm:p-8">
      {review && <input type="hidden" name="id" value={review.id} />}

      <div>
        <label htmlFor="customer_name" className={label}>
          Customer name
        </label>
        <input id="customer_name" name="customer_name" required maxLength={100} defaultValue={review?.customer_name ?? ""} className={field} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="rating" className={label}>
            Star rating
          </label>
          <select id="rating" name="rating" defaultValue={review?.rating ?? 5} className={field}>
            <option value={5}>5 stars</option>
            <option value={4}>4 stars</option>
            <option value={3}>3 stars</option>
            <option value={2}>2 stars</option>
            <option value={1}>1 star</option>
          </select>
        </div>
        <div>
          <label htmlFor="date" className={label}>
            Date of review
          </label>
          <input id="date" name="date" type="date" defaultValue={date} className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={label}>
          Review message
        </label>
        <textarea id="message" name="message" required rows={5} maxLength={1500} defaultValue={review?.message ?? ""} className={field} />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="approved" defaultChecked={review ? review.approved : true} className="h-4 w-4 accent-charcoal" />
        Show this review on the website
      </label>

      <button
        type="submit"
        className="bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
      >
        Save review
      </button>
    </form>
  );
}