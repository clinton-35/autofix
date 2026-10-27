import ImageField from "@/components/admin/ImageField";
import { saveService } from "@/app/admin/(protected)/services/actions";

type Service = {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  price_text: string | null;
  sort_order: number;
  active: boolean;
};

const field =
  "w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-charcoal";
const label = "mb-2 block text-sm font-medium";

export default function ServiceForm({ service }: { service?: Service }) {
  return (
    <form action={saveService} className="space-y-6 bg-white p-6 sm:p-8">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div>
        <label htmlFor="name" className={label}>
          Service name
        </label>
        <input id="name" name="name" required maxLength={100} defaultValue={service?.name ?? ""} placeholder="Engine Diagnostics" className={field} />
      </div>

      <div>
        <label htmlFor="description" className={label}>
          Short description
        </label>
        <textarea id="description" name="description" rows={4} maxLength={1000} defaultValue={service?.description ?? ""} className={field} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price_text" className={label}>
            Price <span className="text-charcoal/50">(optional)</span>
          </label>
          <input id="price_text" name="price_text" maxLength={100} defaultValue={service?.price_text ?? ""} placeholder="From KES 3,500" className={field} />
        </div>
        <div>
          <label htmlFor="sort_order" className={label}>
            Display order <span className="text-charcoal/50">(1 shows first)</span>
          </label>
          <input id="sort_order" name="sort_order" type="number" defaultValue={service?.sort_order ?? 0} className={field} />
        </div>
      </div>

      <div>
        <p className={label}>Image</p>
        <ImageField bucket="services" initialUrl={service?.image_url} />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" name="active" defaultChecked={service ? service.active : true} className="h-4 w-4 accent-charcoal" />
        Show this service on the website
      </label>

      <button
        type="submit"
        className="bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand"
      >
        Save service
      </button>
    </form>
  );
}