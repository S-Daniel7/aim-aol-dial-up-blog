"use client";

import { slugify } from "@/lib/slug";
import {
  parseHandleSuggestions,
  serializeChatLines,
  type ChatLineDraft,
} from "@/lib/parseChat";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function advanceTime(last: string): string {
  const m = last.trim().match(/^(\d{1,2}):(\d{2})(\s*[AaPp][Mm])?$/);
  if (!m) return last;
  let h = parseInt(m[1]);
  let min = parseInt(m[2]) + 2;
  const period = m[3]?.trim().toUpperCase();
  if (min >= 60) { min -= 60; h += 1; }
  if (period && h > 12) h -= 12;
  const hhmm = `${h}:${String(min).padStart(2, "0")}`;
  return period ? `${hhmm} ${period}` : hhmm;
}

type PendingImage = {
  id: string;
  url: string;
  caption: string;
  sender: string;
  time_label: string;
};

function newLine(partial?: Partial<ChatLineDraft>): ChatLineDraft & {
  id: string;
} {
  return {
    id: crypto.randomUUID(),
    sender: partial?.sender ?? "",
    time_label: partial?.time_label ?? "",
    body: partial?.body ?? "",
  };
}

export function AdminComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [blurb, setBlurb] = useState("");
  const [myHandle, setMyHandle] = useState("");
  const [handlesHint, setHandlesHint] = useState("alice\nbob");
  const [lines, setLines] = useState(() => [
    newLine({
      sender: "alice",
      time_label: "10:02 PM",
      body: "hey everyone",
    }),
    newLine({
      sender: "bob",
      time_label: "10:03 PM",
      body: "yo whats the vibe",
    }),
    newLine({
      sender: "alice",
      time_label: "10:03 PM",
      body: "just chillin — you can type normally here",
    }),
  ]);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const slugPreview = useMemo(
    () => slugify(slug.trim() || title.trim() || "post"),
    [slug, title],
  );

  const handleOptions = useMemo(
    () => parseHandleSuggestions(handlesHint),
    [handlesHint],
  );

  function updateLine(
    id: string,
    patch: Partial<ChatLineDraft>,
  ) {
    setLines((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function addLine() {
    setLines((prev) => {
      const last = prev.at(-1);
      const nextTime = last?.time_label ? advanceTime(last.time_label) : "";
      const nextSender = handleOptions.length > 0
        ? handleOptions[(handleOptions.indexOf(last?.sender ?? "") + 1) % handleOptions.length] ?? ""
        : "";
      return [...prev, newLine({ time_label: nextTime, sender: nextSender })];
    });
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function moveLine(id: string, dir: "up" | "down") {
    setLines((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? "Upload failed");
    }
    return (data as { url: string }).url;
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setStatus("Uploading…");
    try {
      const url = await uploadFile(file);
      setImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url,
          caption: "",
          sender: "me",
          time_label: new Date().toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    }
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((p) => p.id !== id));
  }

  function updateImage(id: string, patch: Partial<PendingImage>) {
    setImages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    let chatText: string;
    try {
      chatText = serializeChatLines(lines);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Invalid lines");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          blurb: blurb.trim() || null,
          myHandle: myHandle.trim() || null,
          chatText,
          images: images.map((im) => ({
            url: im.url,
            caption: im.caption,
            sender: im.sender,
            time_label: im.time_label,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus((data as { error?: string }).error ?? "Save failed");
        return;
      }
      const s = (data as { slug?: string }).slug;
      setStatus("Saved.");
      if (s) router.push(`/post/${s}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6 border-2 border-border bg-surface p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-muted">
              Slug (optional, auto from title)
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={slugPreview}
              className="mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 text-text"
            />
            <p className="mt-1 text-xs text-muted">
              URL will be <code className="border border-border bg-page-bg px-1">/post/{slugPreview}</code>
            </p>
          </div>
          <div>
            <label className="block text-sm text-muted">Blurb (optional)</label>
            <input
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
              className="mt-1 w-full border-2 border-border bg-page-bg px-3 py-2 text-text"
            />
          </div>
        </div>

        <div className="border-2 border-border bg-page-bg p-4 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-text">
              Names in this chat
            </label>
            <p className="mb-2 text-xs text-muted">
              One per line or comma-separated — these become the sender options for each message.
            </p>
            <textarea
              value={handlesHint}
              onChange={(e) => setHandlesHint(e.target.value)}
              rows={3}
              className="w-full resize-y border-2 border-border bg-surface px-3 py-2 text-sm text-text"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text">
              Your handle <span className="font-normal text-muted">(shown on the right)</span>
            </label>
            <select
              value={myHandle}
              onChange={(e) => setMyHandle(e.target.value)}
              className="mt-1 border-2 border-border bg-surface px-2 py-1.5 text-sm text-text"
            >
              <option value="">— none —</option>
              {handleOptions.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div>
              <label className="block text-sm font-semibold text-text">
                Lines (one message per row)
              </label>
              <p className="text-xs text-muted">
                Set <strong>name</strong>, <strong>time</strong> (optional, defaults to —), and type the{" "}
                <strong>message</strong>. Empty message rows are skipped.
              </p>
            </div>
            <button
              type="button"
              onClick={addLine}
              className="border-2 border-border bg-surface-2 px-3 py-1 text-sm hover:bg-page-bg"
            >
              + add line
            </button>
          </div>

          <div className="space-y-2">
            {lines.map((row, idx) => (
              <div
                key={row.id}
                className="border-2 border-border bg-page-bg"
              >
                {/* Row header: sender + time + controls */}
                <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-2">
                  <select
                    value={row.sender}
                    onChange={(e) => updateLine(row.id, { sender: e.target.value })}
                    className="w-32 border border-border bg-page-bg px-2 py-1 text-sm text-text font-semibold"
                  >
                    {handleOptions.length === 0 && <option value="">sender</option>}
                    {handleOptions.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="text-muted text-xs">at</span>
                  <input
                    value={row.time_label}
                    onChange={(e) => updateLine(row.id, { time_label: e.target.value })}
                    placeholder="10:02 PM"
                    className="w-24 border border-border bg-page-bg px-2 py-1 text-sm text-muted"
                  />
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveLine(row.id, "up")}
                      disabled={idx === 0}
                      title="Move up"
                      className="px-1 text-muted hover:text-text disabled:opacity-20"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveLine(row.id, "down")}
                      disabled={idx === lines.length - 1}
                      title="Move down"
                      className="px-1 text-muted hover:text-text disabled:opacity-20"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(row.id)}
                      disabled={lines.length <= 1}
                      title="Remove"
                      className="px-1 text-accent hover:text-text disabled:opacity-20"
                    >
                      ×
                    </button>
                  </div>
                </div>
                {/* Message body */}
                <textarea
                  value={row.body}
                  onChange={(e) => updateLine(row.id, { body: e.target.value })}
                  rows={2}
                  placeholder="message…"
                  className="w-full resize-y bg-page-bg px-3 py-2 text-sm text-text outline-none placeholder:text-muted"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-border pt-4">
          <p className="mb-2 text-sm font-semibold text-text">Images</p>
          <p className="mb-3 text-xs text-muted">
            Uploads append after chat lines. Add caption / handle / time per image.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="inline-block cursor-pointer border-2 border-border bg-surface-2 px-3 py-2 text-sm hover:bg-page-bg">
              + upload image
              <input type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            </label>
          </div>
          {images.length ? (
            <ul className="mt-4 space-y-4">
              {images.map((im) => (
                <li
                  key={im.id}
                  className="border-2 border-border bg-page-bg p-3"
                >
                  <div className="flex flex-wrap gap-4">
                    <Image
                      src={im.url}
                      alt=""
                      width={200}
                      height={200}
                      className="max-h-40 max-w-[200px] border border-border object-contain"
                    />
                    <div className="min-w-[200px] flex-1 space-y-2">
                      <input
                        placeholder="Caption"
                        value={im.caption}
                        onChange={(e) =>
                          updateImage(im.id, { caption: e.target.value })
                        }
                        className="w-full border-2 border-border bg-page-bg px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          placeholder="Sender"
                          value={im.sender}
                          onChange={(e) =>
                            updateImage(im.id, { sender: e.target.value })
                          }
                          className="w-1/2 border-2 border-border bg-page-bg px-2 py-1 text-sm"
                        />
                        <input
                          placeholder="Time"
                          value={im.time_label}
                          onChange={(e) =>
                            updateImage(im.id, { time_label: e.target.value })
                          }
                          className="w-1/2 border-2 border-border bg-page-bg px-2 py-1 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(im.id)}
                        className="text-sm text-accent underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {status ? <p className="text-sm text-muted">{status}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="border-2 border-border bg-accent px-4 py-2 text-accent-contrast enabled:hover:bg-accent-hover disabled:opacity-50"
          >
            {busy ? "Saving…" : "Publish post"}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => void logout()}
        className="text-sm text-muted underline"
      >
        Log out
      </button>
    </div>
  );
}
