"use client";

import type { BoardItem } from "@/lib/types";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 700;

type Draft = {
  id: string | null;
  kind: "image" | "text";
  imageUrl: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number | null;
  rotation: number;
  zIndex: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
};

type Interaction =
  | {
      kind: "drag";
      offsetX: number;
      offsetY: number;
    }
  | {
      kind: "resize";
      startX: number;
      startWidth: number;
    };

function blankDraft(kind: "image" | "text" = "image"): Draft {
  return {
    id: null,
    kind,
    imageUrl: "",
    text: kind === "text" ? "new note" : "",
    x: 80,
    y: 80,
    width: kind === "text" ? 260 : 220,
    height: null,
    rotation: 0,
    zIndex: 10,
    fontFamily: "Verdana",
    fontSize: 28,
    color: "#111111",
    isBold: false,
    isItalic: false,
    isUnderline: false,
  };
}

function draftFromItem(item: BoardItem): Draft {
  return {
    id: item.id,
    kind: item.kind,
    imageUrl: item.image_url ?? "",
    text: item.text ?? "",
    x: Number(item.x),
    y: Number(item.y),
    width: Number(item.width),
    height: item.height === null ? null : Number(item.height),
    rotation: Number(item.rotation),
    zIndex: Number(item.z_index),
    fontFamily: item.font_family ?? "Verdana",
    fontSize: Number(item.font_size ?? 28),
    color: item.color ?? "#111111",
    isBold: Boolean(item.is_bold),
    isItalic: Boolean(item.is_italic),
    isUnderline: Boolean(item.is_underline),
  };
}

async function uploadBoardImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Upload failed");
  }
  return data.url;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number, total: number) {
  return `${(Number(value) / total) * 100}%`;
}

export function AdminBoard() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const draftRef = useRef<Draft>(blankDraft("image"));
  const [items, setItems] = useState<BoardItem[]>([]);
  const [draft, setDraft] = useState<Draft>(() => blankDraft("image"));
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) =>
        a.z_index === b.z_index
          ? a.created_at.localeCompare(b.created_at)
          : a.z_index - b.z_index,
      ),
    [items],
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/board", {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        items?: BoardItem[];
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Could not load board.");
        return;
      }
      setItems(data.items ?? []);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Network error.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateDraft(patch: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  function pointerToBoard(e: React.PointerEvent<HTMLElement>) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: ((e.clientX - rect.left) / rect.width) * BOARD_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * BOARD_HEIGHT,
    };
  }

  async function persistDraft(nextDraft: Draft, clearAfterSave: boolean) {
    setBusy(true);
    try {
      const res = await fetch(
        nextDraft.id ? `/api/board/${nextDraft.id}` : "/api/board",
        {
          method: nextDraft.id ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: nextDraft.kind,
            imageUrl: nextDraft.imageUrl,
            text: nextDraft.text,
            x: nextDraft.x,
            y: nextDraft.y,
            width: nextDraft.width,
            height: nextDraft.height,
            rotation: nextDraft.rotation,
            zIndex: nextDraft.zIndex,
            fontFamily: nextDraft.fontFamily,
            fontSize: nextDraft.fontSize,
            color: nextDraft.color,
            isBold: nextDraft.isBold,
            isItalic: nextDraft.isItalic,
            isUnderline: nextDraft.isUnderline,
          }),
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Save failed");
        return false;
      }
      if (clearAfterSave) {
        setDraft(blankDraft("image"));
        setStatus("Saved to board.");
      } else {
        setStatus("Saved.");
      }
      await load();
      return true;
    } finally {
      setBusy(false);
    }
  }

  function beginDrag(e: React.PointerEvent<HTMLElement>, nextDraft: Draft) {
    const point = pointerToBoard(e);
    if (!point) return;
    e.preventDefault();
    e.stopPropagation();
    setDraft(nextDraft);
    setInteraction({
      kind: "drag",
      offsetX: point.x - nextDraft.x,
      offsetY: point.y - nextDraft.y,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function beginResize(e: React.PointerEvent<HTMLSpanElement>, nextDraft: Draft) {
    const point = pointerToBoard(e);
    if (!point) return;
    e.preventDefault();
    e.stopPropagation();
    setDraft(nextDraft);
    setInteraction({
      kind: "resize",
      startX: point.x,
      startWidth: nextDraft.width,
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moveInteraction(e: React.PointerEvent<HTMLElement>) {
    if (!interaction) return;
    const point = pointerToBoard(e);
    if (!point) return;
    setDraft((prev) => {
      if (interaction.kind === "drag") {
        return {
          ...prev,
          x: Math.round(
            clamp(point.x - interaction.offsetX, 0, BOARD_WIDTH - 20),
          ),
          y: Math.round(
            clamp(point.y - interaction.offsetY, 0, BOARD_HEIGHT - 20),
          ),
        };
      }
      return {
        ...prev,
        width: Math.round(
          clamp(interaction.startWidth + point.x - interaction.startX, 30, 900),
        ),
      };
    });
  }

  function endInteraction(e: React.PointerEvent<HTMLElement>) {
    if (!interaction) return;
    setInteraction(null);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const current = draftRef.current;
    if (current.id) {
      void persistDraft(current, false);
    }
  }

  function addText() {
    const highest = items.reduce(
      (max, item) => Math.max(max, Number(item.z_index)),
      0,
    );
    setDraft({ ...blankDraft("text"), zIndex: highest + 1 });
    setStatus("Text item ready. Drag it into place, then save.");
  }

  async function setImageFile(file: File) {
    setBusy(true);
    setStatus("Uploading image...");
    try {
      const url = await uploadBoardImage(file);
      const highest = items.reduce(
        (max, item) => Math.max(max, Number(item.z_index)),
        0,
      );
      setDraft({
        ...blankDraft("image"),
        imageUrl: url,
        zIndex: highest + 1,
      });
      setStatus("Image ready. Drag it into place, then save.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) await setImageFile(file);
  }

  async function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const file = Array.from(e.clipboardData.files).find((item) =>
      item.type.startsWith("image/"),
    );
    if (file) {
      e.preventDefault();
      await setImageFile(file);
      return;
    }
    setStatus("Paste an image from your clipboard here.");
  }

  async function saveDraft() {
    setStatus(null);
    await persistDraft(draft, true);
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this board item?")) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`/api/board/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Delete failed");
        return;
      }
      if (draft.id === id) setDraft(blankDraft("image"));
      await load();
      setStatus("Deleted.");
    } finally {
      setBusy(false);
    }
  }

  async function shiftLayer(amount: number) {
    const next = {
      ...draft,
      zIndex: Math.round(clamp(draft.zIndex + amount, 0, 9999)),
    };
    setDraft(next);
    if (next.id) {
      await persistDraft(next, false);
    }
  }

  function draftIsVisible() {
    return draft.kind === "text" ? draft.text.trim() : draft.imageUrl.trim();
  }

  function renderDraftPin(nextDraft: Draft, key: string, isSavedItem: boolean) {
    const isSelected =
      (draft.id && draft.id === nextDraft.id) || (!draft.id && !isSavedItem);
    const commonStyle = {
      left: pct(nextDraft.x, BOARD_WIDTH),
      top: pct(nextDraft.y, BOARD_HEIGHT),
      width: pct(nextDraft.width, BOARD_WIDTH),
      zIndex: nextDraft.zIndex,
      transform: `rotate(${nextDraft.rotation}deg)`,
    };

    const resizeHandle = isSelected ? (
      <span
        aria-hidden
        onPointerDown={(e) => beginResize(e, nextDraft)}
        onPointerMove={moveInteraction}
        onPointerUp={endInteraction}
        onPointerCancel={endInteraction}
        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize touch-none border-2 border-border bg-accent"
      />
    ) : null;

    if (nextDraft.kind === "image" && nextDraft.imageUrl) {
      return (
        <button
          key={key}
          type="button"
          onPointerDown={(e) => beginDrag(e, nextDraft)}
          onPointerMove={moveInteraction}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          className={[
            "absolute cursor-move touch-none border border-transparent bg-transparent p-0 hover:border-border focus:border-border focus:outline-none",
            !isSavedItem ? "opacity-90" : "",
          ].join(" ")}
          style={commonStyle}
        >
          <Image
            src={nextDraft.imageUrl}
            alt=""
            width={Math.round(nextDraft.width)}
            height={Math.round(nextDraft.height ?? nextDraft.width)}
            className="h-auto w-full select-none object-contain"
            draggable={false}
          />
          {resizeHandle}
        </button>
      );
    }

    if (nextDraft.kind === "text" && nextDraft.text) {
      return (
        <button
          key={key}
          type="button"
          onPointerDown={(e) => beginDrag(e, nextDraft)}
          onPointerMove={moveInteraction}
          onPointerUp={endInteraction}
          onPointerCancel={endInteraction}
          className={[
            "absolute cursor-move touch-none appearance-none whitespace-pre-wrap break-words border-0 bg-transparent px-1 py-0.5 text-left focus:outline-none",
            !isSavedItem ? "opacity-90" : "",
          ].join(" ")}
          style={{
            ...commonStyle,
            minHeight:
              nextDraft.height === null
                ? undefined
                : pct(nextDraft.height, BOARD_HEIGHT),
            fontFamily: nextDraft.fontFamily,
            fontSize: `clamp(10px, ${(nextDraft.fontSize / BOARD_WIDTH) * 100}vw, ${nextDraft.fontSize}px)`,
            fontStyle: nextDraft.isItalic ? "italic" : "normal",
            fontWeight: nextDraft.isBold ? 700 : 400,
            textDecoration: nextDraft.isUnderline ? "underline" : "none",
            color: nextDraft.color,
          }}
        >
          {nextDraft.text}
          {resizeHandle}
        </button>
      );
    }

    return null;
  }

  return (
    <div className="space-y-6">
      <div className="border-2 border-border bg-surface p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer border-2 border-border bg-surface-2 px-3 py-2 text-sm hover:bg-page-bg">
            upload image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={onPickFile}
            />
          </label>
          <button
            type="button"
            onClick={addText}
            className="border-2 border-border bg-accent px-3 py-2 text-sm text-accent-contrast hover:bg-accent-hover"
          >
            add text
          </button>
          <div
            tabIndex={0}
            onPaste={(e) => void onPaste(e)}
            className="min-w-[220px] border-2 border-dashed border-border bg-page-bg px-3 py-2 text-sm text-muted outline-none focus:bg-surface-2"
          >
            click here, then paste image
          </div>
        </div>
        {status ? (
          <p className="mt-3 border-l-4 border-accent pl-3 text-sm text-muted">
            {status}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="board-shell border-2 border-border bg-surface p-3">
          <div
            ref={boardRef}
            className="board-surface relative overflow-hidden"
            style={{
              backgroundColor: "#b97845",
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0 1px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(0,0,0,0.18) 0 1px, transparent 2px)",
              backgroundSize: "18px 18px, 23px 23px",
              boxShadow: "inset 0 0 0 6px var(--border)",
            }}
          >
            {sortedItems.map((item) =>
              renderDraftPin(
                draft.id === item.id ? draft : draftFromItem(item),
                item.id,
                true,
              ),
            )}
            {!draft.id && draftIsVisible()
              ? renderDraftPin(draft, "new-draft-pin", false)
              : null}
          </div>
        </div>

        <aside
          className="border-2 border-border bg-surface p-4 text-sm"
          style={{ boxShadow: "4px 4px 0 0 var(--border)" }}
        >
          <h2
            className="mb-3 font-heading text-2xl text-accent"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {draft.id ? "edit pin" : "new pin"}
          </h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => updateDraft({ kind: "image" })}
                className={`border-2 border-border px-2 py-1 ${
                  draft.kind === "image"
                    ? "bg-accent text-accent-contrast"
                    : "bg-surface-2"
                }`}
              >
                image
              </button>
              <button
                type="button"
                onClick={() => updateDraft({ kind: "text" })}
                className={`border-2 border-border px-2 py-1 ${
                  draft.kind === "text"
                    ? "bg-accent text-accent-contrast"
                    : "bg-surface-2"
                }`}
              >
                text
              </button>
            </div>

            {draft.kind === "image" ? (
              <>
                <label className="block text-xs text-muted">Image URL</label>
                <input
                  value={draft.imageUrl}
                  onChange={(e) => updateDraft({ imageUrl: e.target.value })}
                  className="w-full border-2 border-border bg-page-bg px-2 py-1 text-text"
                />
                {draft.imageUrl ? (
                  <Image
                    src={draft.imageUrl}
                    alt=""
                    width={240}
                    height={180}
                    className="max-h-40 w-full border border-border object-contain"
                  />
                ) : null}
              </>
            ) : (
              <>
                <label className="block text-xs text-muted">Text</label>
                <textarea
                  value={draft.text}
                  onChange={(e) => updateDraft({ text: e.target.value })}
                  rows={4}
                  className="w-full resize-y border-2 border-border bg-page-bg px-2 py-1 text-text"
                />
                <label className="block text-xs text-muted">Font</label>
                <select
                  value={draft.fontFamily}
                  onChange={(e) => updateDraft({ fontFamily: e.target.value })}
                  className="w-full border-2 border-border bg-page-bg px-2 py-1 text-text"
                >
                  <option value="Verdana">Verdana</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Georgia">Georgia</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="var(--font-heading)">VT323</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-muted">
                    Color
                    <input
                      type="color"
                      value={draft.color}
                      onChange={(e) => updateDraft({ color: e.target.value })}
                      className="mt-1 h-9 w-full border-2 border-border bg-page-bg"
                    />
                  </label>
                  <label className="text-xs text-muted">
                    Size
                    <input
                      type="number"
                      min="8"
                      max="120"
                      value={draft.fontSize}
                      onChange={(e) =>
                        updateDraft({ fontSize: Number(e.target.value) })
                      }
                      className="mt-1 w-full border-2 border-border bg-page-bg px-2 py-1 text-text"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateDraft({ isBold: !draft.isBold })}
                    className={`border-2 border-border px-2 py-1 font-bold ${
                      draft.isBold
                        ? "bg-accent text-accent-contrast"
                        : "bg-surface-2"
                    }`}
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft({ isItalic: !draft.isItalic })
                    }
                    className={`border-2 border-border px-2 py-1 italic ${
                      draft.isItalic
                        ? "bg-accent text-accent-contrast"
                        : "bg-surface-2"
                    }`}
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDraft({ isUnderline: !draft.isUnderline })
                    }
                    className={`border-2 border-border px-2 py-1 underline ${
                      draft.isUnderline
                        ? "bg-accent text-accent-contrast"
                        : "bg-surface-2"
                    }`}
                    title="Underline"
                  >
                    U
                  </button>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => void shiftLayer(-1)}
                className="border-2 border-border bg-surface-2 px-2 py-1 hover:bg-page-bg"
              >
                send back
              </button>
              <button
                type="button"
                onClick={() => void shiftLayer(1)}
                className="border-2 border-border bg-surface-2 px-2 py-1 hover:bg-page-bg"
              >
                bring front
              </button>
            </div>

            <label className="block text-xs text-muted">
              Rotate
              <input
                type="number"
                min="-45"
                max="45"
                value={draft.rotation}
                onChange={(e) =>
                  updateDraft({ rotation: Number(e.target.value) })
                }
                className="mt-1 w-full border-2 border-border bg-page-bg px-2 py-1 text-text"
              />
            </label>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => void saveDraft()}
                className="border-2 border-border bg-accent px-3 py-2 text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
              >
                {busy ? "saving..." : "save pin"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(blankDraft("image"))}
                className="border-2 border-border bg-surface-2 px-3 py-2 hover:bg-page-bg"
              >
                clear
              </button>
              {draft.id ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void deleteItem(draft.id as string)}
                  className="text-accent underline disabled:opacity-50"
                >
                  delete
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
