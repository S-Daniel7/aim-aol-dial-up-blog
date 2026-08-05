"use client";

import { GadgetWindow } from "@/components/gadgets/GadgetWindow";
import type { VisitorCount } from "@/lib/visitors-db";
import { useEffect, useState } from "react";

// Approximate lat/lon for common visitor countries (equirectangular plot).
const COORDS: Record<string, [number, number]> = {
  US: [39, -98], CA: [56, -106], MX: [23, -102], BR: [-10, -55], AR: [-38, -63],
  GB: [54, -2], IE: [53, -8], FR: [46, 2], ES: [40, -4], PT: [39, -8],
  DE: [51, 10], NL: [52, 5], BE: [50, 4], IT: [42, 12], CH: [47, 8],
  SE: [62, 15], NO: [61, 8], FI: [64, 26], DK: [56, 9], PL: [52, 19],
  RU: [61, 90], UA: [49, 32], TR: [39, 35], GR: [39, 22], RO: [46, 25],
  IN: [22, 79], CN: [35, 104], JP: [36, 138], KR: [37, 128], ID: [-2, 118],
  PH: [13, 122], TH: [15, 101], VN: [16, 108], SG: [1, 104], MY: [4, 102],
  AU: [-25, 134], NZ: [-42, 173], ZA: [-30, 25], EG: [26, 30], NG: [9, 8],
  AE: [24, 54], IL: [31, 35], SA: [24, 45],
};

function flagEmoji(cc: string): string {
  if (!/^[A-Za-z]{2}$/.test(cc)) return "🏳️";
  return String.fromCodePoint(
    ...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)),
  );
}

function project(lat: number, lon: number): [number, number] {
  return [((lon + 180) / 360) * 100, ((90 - lat) / 180) * 50];
}

export function VisitorMap({ initial }: { initial: VisitorCount[] }) {
  const [counts, setCounts] = useState<VisitorCount[]>(initial);

  useEffect(() => {
    let cancelled = false;
    // Record this visit (server derives country from edge headers), then refresh.
    fetch("/api/visitors", { method: "POST" })
      .then(() => fetch("/api/visitors"))
      .then((r) => r.json())
      .then((d: { counts?: VisitorCount[] }) => {
        if (!cancelled && d.counts) setCounts(d.counts);
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);

  const total = counts.reduce((s, c) => s + Number(c.count), 0);
  const top = counts.slice(0, 5);

  return (
    <GadgetWindow title="visitors">
      <div className="p-2">
        <svg
          viewBox="0 0 100 50"
          className="w-full border border-border"
          style={{ background: "var(--surface-2)" }}
          role="img"
          aria-label="world map of visitor locations"
        >
          <defs>
            <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="0.5" cy="0.5" r="0.25" fill="var(--border)" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="50" fill="url(#grid)" />
          {counts.map((c) => {
            const coord = COORDS[c.country_code];
            if (!coord) return null;
            const [x, y] = project(coord[0], coord[1]);
            return (
              <circle key={c.country_code} cx={x} cy={y} r="1.4" fill="var(--accent)">
                <title>{`${c.country_code}: ${c.count}`}</title>
              </circle>
            );
          })}
        </svg>

        <p
          className="mt-2 px-1 font-mono text-[10px] text-muted"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          {total > 0
            ? `${total} visitor${total === 1 ? "" : "s"} from ${counts.length} countr${counts.length === 1 ? "y" : "ies"}`
            : "waiting for visitors…"}
        </p>

        {top.length > 0 && (
          <ul className="mt-1 space-y-0.5 px-1">
            {top.map((c) => (
              <li
                key={c.country_code}
                className="flex items-center justify-between font-mono text-[10px] text-text"
                style={{ fontFamily: "var(--font-mono-chat)" }}
              >
                <span>
                  {flagEmoji(c.country_code)} {c.country_code}
                </span>
                <span className="text-muted tabular-nums">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GadgetWindow>
  );
}
