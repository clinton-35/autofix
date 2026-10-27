export default function MonthCalendar({
  year,
  month,
  today,
  counts,
}: {
  year: number;
  month: number; // 0 = January
  today: string; // YYYY-MM-DD
  counts: Record<string, number>;
}) {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const title = new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const key = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="bg-white p-6">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em]">
        {title}
      </h2>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1 font-semibold text-charcoal/50">
            {d}
          </div>
        ))}
        {cells.map((d, i) =>
          d === null ? (
            <div key={`e${i}`} />
          ) : (
            <div
              key={d}
              className={`flex aspect-square flex-col items-center justify-center ${
                key(d) === today
                  ? "bg-charcoal text-white"
                  : counts[key(d)]
                    ? "bg-offwhite"
                    : ""
              }`}
            >
              <span>{d}</span>
              {counts[key(d)] ? (
                <span
                  className={`mt-0.5 px-1.5 text-[10px] font-bold ${
                    key(d) === today ? "bg-white text-charcoal" : "bg-brand text-white"
                  }`}
                >
                  {counts[key(d)]}
                </span>
              ) : null}
            </div>
          )
        )}
      </div>
      <p className="mt-4 text-xs text-charcoal/50">
        Numbers show active bookings (pending, confirmed, in progress).
      </p>
    </div>
  );
}