const DAYS = 90;
const MAX_PIXELS = 5;
const PIXEL_PX = 8;
const GAP_PX = 2;

type Props = {
  countsByDate: Record<string, number>;
};

function buildDayList(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function shortMonth(dateStr: string): string {
  const [, m] = dateStr.split("-");
  return [
    "jan","feb","mar","apr","may","jun",
    "jul","aug","sep","oct","nov","dec",
  ][Number(m) - 1];
}

export function ActivityTimeline({ countsByDate }: Props) {
  const days = buildDayList();
  const totalUploads = Object.values(countsByDate).reduce((a, b) => a + b, 0);

  // Build month label positions
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = "";
  days.forEach((d, i) => {
    const month = d.slice(0, 7);
    if (month !== lastMonth) {
      monthLabels.push({ index: i, label: shortMonth(d) });
      lastMonth = month;
    }
  });

  const colWidth = PIXEL_PX + GAP_PX;

  return (
    <div
      className="border-2 border-border bg-surface"
      style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
    >
      <div
        className="flex items-center justify-between border-b-2 border-border bg-title-bar px-3 py-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        <span className="font-heading text-lg text-title-bar-text">
          upload activity
        </span>
        <span
          className="font-mono text-xs text-title-bar-text opacity-70"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          {totalUploads} total
        </span>
      </div>

      <div className="overflow-x-auto touch-pan-x p-3 pb-2">
        {/* Pixel columns */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: GAP_PX,
            minWidth: days.length * colWidth,
          }}
        >
          {days.map((day) => {
            const count = countsByDate[day] ?? 0;
            const filled = Math.min(MAX_PIXELS, count);
            return (
              <div
                key={day}
                title={count > 0 ? `${day}: ${count} livefeed entr${count !== 1 ? "ies" : "y"}` : day}
                style={{
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: GAP_PX,
                  width: PIXEL_PX,
                }}
              >
                {Array.from({ length: MAX_PIXELS }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      width: PIXEL_PX,
                      height: PIXEL_PX,
                      backgroundColor:
                        i < filled
                          ? "var(--accent)"
                          : "var(--surface-2)",
                      outline: "1px solid var(--border)",
                      outlineOffset: "-1px",
                      opacity: i < filled ? 1 : 0.35,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Month labels */}
        <div
          style={{
            display: "flex",
            position: "relative",
            minWidth: days.length * colWidth,
            height: 14,
            marginTop: 4,
          }}
        >
          {monthLabels.map(({ index, label }) => (
            <span
              key={label + index}
              style={{
                position: "absolute",
                left: index * colWidth,
                fontFamily: "var(--font-mono-chat)",
                fontSize: 9,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-border px-3 py-2">
        <p
          className="font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          last 90 days &middot; each pixel = 1 livefeed entry &middot; max {MAX_PIXELS} shown
        </p>
      </div>
    </div>
  );
}
