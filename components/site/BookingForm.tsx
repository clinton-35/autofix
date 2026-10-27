"use client";

import { useEffect, useState } from "react";

type Service = { id: string; name: string; price_text: string | null };
type Slot = { time: string; remaining: number };

type Props = {
  services: Service[];
  initialServiceId: string;
  minDate: string;
  maxDate: string;
  whatsappHref: string | null;
};

const field =
  "w-full border border-black/15 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-charcoal";
const labelClass = "mb-2 block text-sm font-medium";

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StepTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-6 flex items-center gap-4 text-lg font-bold uppercase tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center bg-charcoal text-sm text-white">
        {n}
      </span>
      {children}
    </h2>
  );
}

export default function BookingForm({
  services,
  initialServiceId,
  minDate,
  maxDate,
  whatsappHref,
}: Props) {
  const [serviceId, setServiceId] = useState(
    services.some((s) => s.id === initialServiceId) ? initialServiceId : ""
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{
    service: string;
    date: string;
    time: string;
  } | null>(null);

  useEffect(() => {
    if (!date) {
      setSlots(null);
      return;
    }
    const ctrl = new AbortController();
    setLoadingSlots(true);
    setTime("");
    fetch(`/api/availability?date=${date}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setSlots(j.slots ?? []))
      .catch((e) => {
        if (e.name !== "AbortError") setSlots([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoadingSlots(false);
      });
    return () => ctrl.abort();
  }, [date, refresh]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!serviceId) return setError("Please select a service.");
    if (!date) return setError("Please choose a date.");
    if (!time) return setError("Please choose a time.");

    const form = e.currentTarget;
    const fd = Object.fromEntries(new FormData(form)) as Record<string, string>;

    setSending(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fd,
          service_id: serviceId,
          appointment_date: date,
          appointment_time: time,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        if (res.status === 409) setRefresh((n) => n + 1); // reload free slots
        setSending(false);
        return;
      }

      setDone({
        service: json.service ?? "",
        date,
        time,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSending(false);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl bg-white p-8 text-center sm:p-12">
        <h2 className="text-2xl font-bold uppercase tracking-tight sm:text-3xl">
          Request received
        </h2>
        <p className="mt-5 text-charcoal/70">
          Thank you. We have received your appointment request for
        </p>
        <p className="mt-3 text-lg font-semibold">{done.service}</p>
        <p className="text-lg">
          {fmtDate(done.date)} at {fmtTime(done.time)}
        </p>
        <p className="mt-5 text-sm text-charcoal/70">
          Your request is <strong>pending approval</strong>. We will confirm your
          appointment shortly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              Message us on WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setDate("");
              setTime("");
              setServiceId("");
            }}
            className="border border-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Book another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-14">
      {/* 1. Service */}
      <section>
        <StepTitle n={1}>Select a service</StepTitle>
        <label htmlFor="service" className="sr-only">
          Service required
        </label>
        <select
          id="service"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
          className={field}
        >
          <option value="">Choose a service...</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.price_text ? ` (${s.price_text})` : ""}
            </option>
          ))}
        </select>
      </section>

      {/* 2. Date and time */}
      <section>
        <StepTitle n={2}>Choose date and time</StepTitle>
        <label htmlFor="date" className={labelClass}>
          Preferred date
        </label>
        <input
          id="date"
          type="date"
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={field}
        />

        {date && (
          <div className="mt-6">
            <p className={labelClass}>Preferred time</p>
            {loadingSlots ? (
              <p className="text-sm text-charcoal/60">Checking availability...</p>
            ) : slots && slots.length > 0 ? (
              <div
                role="radiogroup"
                aria-label="Available times"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
              >
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    role="radio"
                    aria-checked={time === s.time}
                    onClick={() => setTime(s.time)}
                    className={`border px-4 py-3 text-sm font-medium transition-colors ${
                      time === s.time
                        ? "border-charcoal bg-charcoal text-white"
                        : "border-black/15 bg-white hover:border-charcoal"
                    }`}
                  >
                    {fmtTime(s.time)}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-brand">
                No times are available on this date. Please choose another day.
              </p>
            )}
          </div>
        )}
      </section>

      {/* 3. Your details */}
      <section>
        <StepTitle n={3}>Your details</StepTitle>
        <div className="space-y-5">
          <div>
            <label htmlFor="customer_name" className={labelClass}>
              Full name
            </label>
            <input id="customer_name" name="customer_name" required minLength={2} maxLength={100} autoComplete="name" placeholder="John Kamau" className={field} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone number
            </label>
            <input id="phone" name="phone" type="tel" required maxLength={20} autoComplete="tel" placeholder="0712 345 678" className={field} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email <span className="text-charcoal/50">(optional, for confirmation)</span>
            </label>
            <input id="email" name="email" type="email" maxLength={200} autoComplete="email" className={field} />
          </div>
        </div>
      </section>

      {/* 4. Vehicle */}
      <section>
        <StepTitle n={4}>Your vehicle</StepTitle>
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="vehicle_make" className={labelClass}>
                Make
              </label>
              <input id="vehicle_make" name="vehicle_make" required maxLength={50} placeholder="Toyota" className={field} />
            </div>
            <div>
              <label htmlFor="vehicle_model" className={labelClass}>
                Model
              </label>
              <input id="vehicle_model" name="vehicle_model" required maxLength={50} placeholder="Prado" className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="registration_number" className={labelClass}>
              Registration number
            </label>
            <input id="registration_number" name="registration_number" required minLength={3} maxLength={15} placeholder="KXX 123X" className={`${field} uppercase`} />
          </div>
          <div>
            <label htmlFor="problem_description" className={labelClass}>
              Additional information <span className="text-charcoal/50">(optional)</span>
            </label>
            <textarea id="problem_description" name="problem_description" rows={4} maxLength={2000} placeholder="Check engine light is on" className={field} />
          </div>
        </div>
      </section>

      {/* Spam trap, hidden from people */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div>
        {error && (
          <p role="alert" className="mb-5 border-l-4 border-brand bg-white p-4 text-sm font-medium text-brand">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-charcoal px-8 py-5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-brand disabled:opacity-60"
        >
          {sending ? "Sending request..." : "Submit Booking Request"}
        </button>
        <p className="mt-4 text-center text-xs text-charcoal/50">
          Your request will be reviewed and confirmed by our team.
        </p>
      </div>
    </form>
  );
}