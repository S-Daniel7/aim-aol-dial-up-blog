import Link from "next/link";

type Props = {
  availableDates: string[];
  displayMonth: string | null;
  selectedDate: string | null;
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

function addMonths(year: number, month: number, amount: number) {
  const next = new Date(Date.UTC(year, month - 1 + amount, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() + 1 };
}

function monthName(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getInitialMonth(availableDates: string[], displayMonth: string | null) {
  if (displayMonth) return parseDateKey(displayMonth);
  const latest = [...availableDates].sort().at(-1);
  if (latest) return parseDateKey(latest);
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: 1 };
}

export function LiveFeedCalendar({
  availableDates,
  displayMonth,
  selectedDate,
}: Props) {
  const available = new Set(availableDates);
  const initial = getInitialMonth(availableDates, displayMonth);
  const year = initial.year;
  const month = initial.month;
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <aside
      className="border-2 border-border bg-surface text-sm"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div className="border-b-2 border-border bg-title-bar px-3 py-2 font-heading text-lg text-title-bar-text">
        Live calendar
      </div>
      <div className="space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/live?month=${dateKey(prev.year, prev.month, 1)}`}
            className="border border-border bg-surface-2 px-2 py-1 text-xs no-underline hover:bg-page-bg"
          >
            &lt;
          </Link>
          <p className="font-semibold text-text">{monthName(year, month)}</p>
          <Link
            href={`/live?month=${dateKey(next.year, next.month, 1)}`}
            className="border border-border bg-surface-2 px-2 py-1 text-xs no-underline hover:bg-page-bg"
          >
            &gt;
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase text-muted">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }
            const key = dateKey(year, month, day);
            const hasPosts = available.has(key);
            const isSelected = selectedDate === key;
            return hasPosts ? (
              <Link
                key={key}
                href={`/live?date=${key}`}
                className={[
                  "flex aspect-square items-center justify-center border text-xs no-underline",
                  isSelected
                    ? "border-border bg-accent text-accent-contrast"
                    : "border-border bg-page-bg text-link hover:bg-surface-2",
                ].join(" ")}
              >
                {day}
              </Link>
            ) : (
              <span
                key={key}
                className="flex aspect-square items-center justify-center border border-border bg-surface-2 text-xs text-muted opacity-60"
              >
                {day}
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs">
          <Link href="/live" className="text-link underline">
            show all
          </Link>
          {selectedDate ? (
            <span className="font-mono text-muted">{selectedDate}</span>
          ) : (
            <span className="text-muted">all dates</span>
          )}
        </div>
      </div>
    </aside>
  );
}
