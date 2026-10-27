import Link from "next/link";
import { notFound } from "next/navigation";
import RescheduleForm from "@/components/admin/RescheduleForm";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireOwner } from "@/lib/auth";
import { fmtDate, fmtDateTime, fmtTime } from "@/lib/format";
import { waLink } from "@/lib/utils";
import { changeStatus, saveMechanic } from "../actions";

export const metadata = { title: "Appointment" };

type Btn = { status: string; label: string; style: "primary" | "plain" | "danger" };

const actionsByStatus: Record<string, Btn[]> = {
  pending: [
    { status: "confirmed", label: "Approve", style: "primary" },
    { status: "rejected", label: "Reject", style: "danger" },
  ],
  confirmed: [
    { status: "in_progress", label: "Start work", style: "primary" },
    { status: "completed", label: "Mark completed", style: "plain" },
    { status: "cancelled", label: "Cancel", style: "danger" },
  ],
  in_progress: [
    { status: "completed", label: "Mark completed", style: "primary" },
    { status: "cancelled", label: "Cancel", style: "danger" },
  ],
  cancelled: [{ status: "pending", label: "Reopen as pending", style: "plain" }],
  rejected: [{ status: "pending", label: "Reopen as pending", style: "plain" }],
  completed: [],
};

const btnStyle = {
  primary: "bg-charcoal text-white hover:bg-brand",
  plain: "border border-charcoal hover:bg-charcoal hover:text-white",
  danger: "border border-brand text-brand hover:bg-brand hover:text-white",
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-charcoal/50">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-xs text-charcoal/50">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

export default async function AppointmentDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; msg?: string }>;
}) {
  const { id } = await params;
  const { type, msg } = await searchParams;
  const { supabase } = await requireOwner();

  const [{ data: a }, { data: cfg }] = await Promise.all([
    supabase.from("appointments").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("garage_settings")
      .select("garage_name, max_days_ahead")
      .eq("id", 1)
      .maybeSingle(),
  ]);

  if (!a) notFound();

  const garage = cfg?.garage_name ?? "the garage";
  const wa = waLink(
    a.phone,
    `Hello ${a.customer_name}, this is ${garage} about your ${a.service_name} appointment on ${fmtDate(
      a.appointment_date
    )} at ${fmtTime(a.appointment_time)}.`
  );

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: "Africa/Nairobi" });
  const now = new Date();
  const minDate = fmt(now);
  const maxDate = fmt(
    new Date(now.getTime() + (cfg?.max_days_ahead ?? 60) * 86400000)
  );

  const actions = actionsByStatus[a.status] ?? [];
  const showBanner = msg && msg.length < 200 && (type === "ok" || type === "error");

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/appointments"
        className="text-xs font-semibold uppercase tracking-widest underline underline-offset-4"
      >
        &larr; All appointments
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight">
          {a.customer_name}
        </h1>
        <StatusBadge status={a.status} />
      </div>

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

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card title="Customer">
          <Row label="Phone">
            <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
              {a.phone}
            </a>
          </Row>
          {a.email && (
            <Row label="Email">
              <a href={`mailto:${a.email}`} className="break-all underline underline-offset-4">
                {a.email}
              </a>
            </Row>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block bg-[#25D366] px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:opacity-90"
            >
              Contact on WhatsApp
            </a>
          )}
        </Card>

        <Card title="Vehicle and service">
          <Row label="Vehicle">
            {a.vehicle_make} {a.vehicle_model}
          </Row>
          <Row label="Registration">
            <span className="uppercase">{a.registration_number}</span>
          </Row>
          <Row label="Service">{a.service_name}</Row>
        </Card>

        <Card title="Appointment">
          <Row label="Date">{fmtDate(a.appointment_date)}</Row>
          <Row label="Time">{fmtTime(a.appointment_time)}</Row>
          <Row label="Requested on">{fmtDateTime(a.created_at)}</Row>
          <Row label="Problem description">
            {a.problem_description ? (
              <span className="whitespace-pre-line font-normal">
                {a.problem_description}
              </span>
            ) : (
              <span className="font-normal text-charcoal/40">None given</span>
            )}
          </Row>
        </Card>

        <Card title="Assigned mechanic">
          <form action={saveMechanic} className="flex gap-2">
            <input type="hidden" name="id" value={a.id} />
            <label htmlFor="mechanic" className="sr-only">
              Mechanic name
            </label>
            <input
              id="mechanic"
              name="mechanic"
              defaultValue={a.assigned_mechanic ?? ""}
              maxLength={100}
              placeholder="Mechanic name"
              className="min-w-0 flex-1 border border-black/15 px-4 py-3 text-sm outline-none focus:border-charcoal"
            />
            <button
              type="submit"
              className="bg-charcoal px-5 text-xs font-semibold uppercase tracking-[0.15em] text-white hover:bg-brand"
            >
              Save
            </button>
          </form>
        </Card>
      </div>

      {actions.length > 0 && (
        <div className="mt-6">
          <Card title="Actions">
            <div className="flex flex-wrap gap-3">
              {actions.map((b) => (
                <form key={b.status} action={changeStatus}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="status" value={b.status} />
                  <button
                    type="submit"
                    className={`px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${btnStyle[b.style]}`}
                  >
                    {b.label}
                  </button>
                </form>
              ))}
            </div>
          </Card>
        </div>
      )}

      {["pending", "confirmed"].includes(a.status) && (
        <div className="mt-6">
          <Card title="Reschedule">
            <RescheduleForm id={a.id} minDate={minDate} maxDate={maxDate} />
          </Card>
        </div>
      )}
    </div>
  );
}