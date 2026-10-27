"use client";

import { useEffect, useState } from "react";
import { reschedule } from "@/app/admin/(protected)/appointments/actions";
import { fmtTime } from "@/lib/format";

type Slot = { time: string; remaining: number };

export default function RescheduleForm({
  id,
  minDate,
  maxDate,
}: {
  id: string;
  minDate: string;
  maxDate: string;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setSlots(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setTime("");
    fetch(`/api/availability?date=${date}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((j) => setSlots(j.slots ?? []))
      .catch((e) => {
        if (e.name !== "AbortError") setSlots([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [date]);

  return (
    <form action={reschedule} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />

      <div>
        <label htmlFor="new-date" className="mb-2 block text-sm font-medium">
          New date
        </label>
        <input
          id="new-date"
          type="date"
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-black/15 bg-white px-4 py-3 outline-none focus:border-charcoal sm:w-64"
        />
      </div>

      {date && (
        <div>
          <p className="mb-2 text-sm font-medium">New time</p>
          {loading ? (
            <p className="text-sm text-charcoal/60">Checking availability...</p>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => setTime(s.time)}
                  aria-pressed={time === s.time}
                  className={`border px-3 py-2 text-sm transition-colors ${
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
              No free times on this date. Choose another day.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!date || !time}
        className="bg-charcoal px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand disabled:opacity-40"
      >
        Reschedule
      </button>
    </form>
  );
}