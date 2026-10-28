import MonthCalendar from "@/components/admin/MonthCalendar";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { requireOwner } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import {
  addBlockedDate,
  removeBlockedDate,
  saveAvailability,
  saveContact,
} from "./actions";

export const metadata = { title: "Availability & Settings" };

const field =
  "w-full border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-charcoal";
const label = "mb-2 block text-sm font-medium";
const submit =
  "bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand";

const dayOptions = [
  { v: 1, l: "Monday" },
  { v: 2, l: "Tuesday" },
  { v: 3, l: "Wednesday" },
  { v: 4, l: "Thursday" },
  { v: 5, l: "Friday" },
  { v: 6, l: "Saturday" },
  { v: 0, l: "Sunday" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-6 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">
        {title}
      </h2>
      {hint && <p className="mt-2 text-sm text-charcoal/60">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const { data: s } = await supabase
    .from("garage_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (!s) {
    return (
      <p className="bg-white p-8">
        Settings row not found. Re-run the starter data step in Supabase.
      </p>
    );
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Nairobi",
  });
  const [y, m] = today.split("-").map(Number);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const monthStart = `${y}-${String(m).padStart(2, "0")}-01`;

  const { data: booked } = await supabase
    .from("appointments")
    .select("appointment_date")
    .in("status", ["pending", "confirmed", "in_progress"])
    .gte("appointment_date", monthStart);

  const counts: Record<string, number> = {};
  for (const r of booked ?? []) {
    counts[r.appointment_date] = (counts[r.appointment_date] ?? 0) + 1;
  }

  const blocked: string[] = [...(s.blocked_dates ?? [])].sort();
  const showBanner =
    msg && msg.length < 250 && (type === "ok" || type === "error");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold uppercase tracking-tight">
        Availability &amp; Settings
      </h1>

      {showBanner && (
        <p
          role="status"
          className={`mt-5 border-l-4 bg-white p-4 text-sm font-medium ${
            type === "ok"
              ? "border-green-600 text-green-700"
              : "border-brand text-brand"
          }`}
        >
          {msg}
        </p>
      )}

      <div className="mt-8 space-y-8">
        <Section
          title="Booking availability"
          hint="The booking form only offers times that fit these settings."
        >
          <form action={saveAvailability} className="space-y-6">
            <fieldset>
              <legend className={label}>Working days</legend>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {dayOptions.map((d) => (
                  <label key={d.v} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="working_days"
                      value={d.v}
                      defaultChecked={(s.working_days ?? []).includes(d.v)}
                      className="h-4 w-4 accent-charcoal"
                    />
                    {d.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="open_time" className={label}>
                  Opening time
                </label>
                <input id="open_time" name="open_time" type="time" required defaultValue={String(s.open_time).slice(0, 5)} className={field} />
              </div>
              <div>
                <label htmlFor="close_time" className={label}>
                  Closing time
                </label>
                <input id="close_time" name="close_time" type="time" required defaultValue={String(s.close_time).slice(0, 5)} className={field} />
              </div>
              <div>
                <label htmlFor="slot_minutes" className={label}>
                  Appointment length (minutes)
                </label>
                <input id="slot_minutes" name="slot_minutes" type="number" min={15} max={480} step={15} required defaultValue={s.slot_minutes} className={field} />
              </div>
              <div>
                <label htmlFor="capacity_per_slot" className={label}>
                  Maximum appointments per time slot
                </label>
                <input id="capacity_per_slot" name="capacity_per_slot" type="number" min={1} max={50} required defaultValue={s.capacity_per_slot} className={field} />
              </div>
              <div>
                <label htmlFor="max_days_ahead" className={label}>
                  How far ahead customers can book (days)
                </label>
                <input id="max_days_ahead" name="max_days_ahead" type="number" min={1} max={365} required defaultValue={s.max_days_ahead} className={field} />
              </div>
            </div>

            <button type="submit" className={submit}>
              Save availability
            </button>
          </form>
        </Section>

        <Section
          title="Blocked dates"
          hint="Days the garage is closed (holidays, leave). Customers cannot book these dates."
        >
          <form action={addBlockedDate} className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="block-date" className={label}>
                Date to block
              </label>
              <input id="block-date" name="date" type="date" min={today} required className={`${field} sm:w-60`} />
            </div>
            <button type="submit" className={submit}>
              Block date
            </button>
          </form>

          {blocked.length > 0 ? (
            <ul className="mt-6 divide-y divide-black/5 border border-black/10">
              {blocked.map((d) => (
                <li key={d} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                  <span>{fmtDate(d)}</span>
                  <form action={removeBlockedDate}>
                    <input type="hidden" name="date" value={d} />
                    <ConfirmButton
                      message="Open this date for booking again?"
                      className="text-xs font-semibold uppercase tracking-widest text-brand underline underline-offset-4"
                    >
                      Unblock
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-charcoal/50">No blocked dates.</p>
          )}
        </Section>

        <Section title="Booking calendar">
          <div className="grid gap-6 md:grid-cols-2">
            <MonthCalendar year={y} month={m - 1} today={today} counts={counts} />
            <MonthCalendar year={nextY} month={nextM - 1} today={today} counts={counts} />
          </div>
        </Section>

        <Section
          title="Garage details and contact"
          hint="These appear on the website: footer, contact page, WhatsApp button and booking messages."
        >
          <form action={saveContact} className="space-y-5">
            <div>
              <label htmlFor="garage_name" className={label}>
                Garage name
              </label>
              <input id="garage_name" name="garage_name" required maxLength={100} defaultValue={s.garage_name ?? ""} className={field} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className={label}>
                  Phone number
                </label>
                <input id="phone" name="phone" maxLength={30} defaultValue={s.phone ?? ""} placeholder="0712 345 678" className={field} />
              </div>
              <div>
                <label htmlFor="whatsapp" className={label}>
                  WhatsApp number
                </label>
                <input id="whatsapp" name="whatsapp" maxLength={30} defaultValue={s.whatsapp ?? ""} placeholder="0712 345 678" className={field} />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={label}>
                Email address
              </label>
              <input id="email" name="email" type="email" maxLength={200} defaultValue={s.email ?? ""} className={field} />
            </div>

            <div>
              <label htmlFor="address" className={label}>
                Address
              </label>
              <textarea id="address" name="address" rows={3} maxLength={500} defaultValue={s.address ?? ""} className={field} />
            </div>

            <div>
              <label htmlFor="working_hours_text" className={label}>
                Working hours (as shown to customers)
              </label>
              <textarea id="working_hours_text" name="working_hours_text" rows={3} maxLength={500} defaultValue={s.working_hours_text ?? ""} placeholder={"Mon-Fri: 8:00 AM - 5:00 PM\nSat: 8:00 AM - 1:00 PM"} className={field} />
            </div>

            <div>
              <label htmlFor="map_embed_url" className={label}>
                Google Maps embed link
              </label>
              <textarea id="map_embed_url" name="map_embed_url" rows={3} maxLength={1500} defaultValue={s.map_embed_url ?? ""} placeholder="Paste the link or the full iframe code from Google Maps > Share > Embed a map" className={field} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="instagram_url" className={label}>
                  Instagram link
                </label>
                <input id="instagram_url" name="instagram_url" maxLength={300} defaultValue={s.instagram_url ?? ""} placeholder="https://instagram.com/..." className={field} />
              </div>
              <div>
                <label htmlFor="facebook_url" className={label}>
                  Facebook link
                </label>
                <input id="facebook_url" name="facebook_url" maxLength={300} defaultValue={s.facebook_url ?? ""} placeholder="https://facebook.com/..." className={field} />
              </div>
            </div>

            <button type="submit" className={submit}>
              Save garage details
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}