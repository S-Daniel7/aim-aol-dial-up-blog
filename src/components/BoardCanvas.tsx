"use client";

import type { BoardItem } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";

const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 700;

type Props = {
  items: BoardItem[];
};

function pct(value: number, total: number) {
  return `${(Number(value) / total) * 100}%`;
}

export function BoardCanvas({ items }: Props) {
  const [openItem, setOpenItem] = useState<BoardItem | null>(null);

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-border bg-surface px-3 py-2 text-sm"
        style={{ boxShadow: "3px 3px 0 0 var(--border)" }}
      >
        <div className="font-heading text-xl text-accent">board</div>
      </div>

      <div className="board-shell border-2 border-border bg-surface p-3">
        <p
          className="mb-2 font-mono text-[10px] text-muted sm:hidden"
          style={{ fontFamily: "var(--font-mono-chat)" }}
        >
          tip: best explored on desktop · rotate to landscape for more space
        </p>
        <div
          className="board-surface relative overflow-hidden"
          style={{
            backgroundColor: "#b97845",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0 1px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.18) 0 1px, transparent 2px)",
            backgroundSize: "18px 18px, 23px 23px",
            boxShadow: "inset 0 0 0 6px var(--border)",
          }}
        >
          {items.map((item) =>
            item.kind === "image" && item.image_url ? (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpenItem(item)}
                className="absolute block border border-transparent bg-transparent p-0 transition hover:border-border focus:border-border focus:outline-none"
                style={{
                  left: pct(item.x, BOARD_WIDTH),
                  top: pct(item.y, BOARD_HEIGHT),
                  width: pct(item.width, BOARD_WIDTH),
                  zIndex: item.z_index,
                  transform: `rotate(${item.rotation}deg)`,
                }}
                aria-label="Open pinned image"
              >
                <Image
                  src={item.image_url}
                  alt=""
                  width={Math.round(item.width)}
                  height={Math.round(item.height ?? item.width)}
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 768px) 80vw, 520px"
                />
              </button>
            ) : (
              <div
                key={item.id}
                className="absolute whitespace-pre-wrap break-words px-1 py-0.5 text-left"
                style={{
                  left: pct(item.x, BOARD_WIDTH),
                  top: pct(item.y, BOARD_HEIGHT),
                  width: pct(item.width, BOARD_WIDTH),
                  minHeight:
                    item.height === null
                      ? undefined
                      : pct(item.height, BOARD_HEIGHT),
                  zIndex: item.z_index,
                  transform: `rotate(${item.rotation}deg)`,
                  fontFamily: item.font_family ?? "Verdana",
                  fontSize: `clamp(10px, ${(Number(item.font_size ?? 24) / BOARD_WIDTH) * 100}vw, ${item.font_size ?? 24}px)`,
                  fontStyle: item.is_italic ? "italic" : "normal",
                  fontWeight: item.is_bold ? 700 : 400,
                  textDecoration: item.is_underline ? "underline" : "none",
                  color: item.color ?? "var(--text)",
                }}
              >
                {item.text}
              </div>
            ),
          )}
        </div>
      </div>

      {openItem?.image_url ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpenItem(null)}
            className="absolute right-4 top-4 border-2 border-white bg-black px-3 py-1 font-mono text-xl text-white hover:bg-accent"
            aria-label="Close image"
          >
            X
          </button>
          <div
            className="max-h-[86vh] w-full max-w-[min(34rem,92vw)] overflow-auto border-2 border-white bg-page-bg p-2"
            style={{ boxShadow: "6px 6px 0 0 rgba(255,255,255,0.55)" }}
          >
            <Image
              src={openItem.image_url}
              alt=""
              width={900}
              height={900}
              className="h-auto max-h-[80vh] w-full object-contain"
              sizes="min(34rem, 92vw)"
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
